import { PrismaClient } from '@prisma/client';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { PLATZ_LAND_NFT_ADDRESS } from '@/config/contracts';

const prisma = new PrismaClient();

// Initialize blockchain client for ownership verification with timeout
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com', {
    timeout: 5000 // 5 second timeout
  })
});

export interface BidValidationResult {
  isValid: boolean;
  error?: string;
  currentOwner?: string;
  tokenExists?: boolean;
  source?: 'database' | 'blockchain' | 'fallback';
}

/**
 * Get token owner from database (fast, reliable) - prioritizes individual token ownership
 */
async function getDatabaseTokenOwner(token_id: number): Promise<string | null> {
  try {
    // First check evmCollectionTokens table for individual token ownership
    const token = await prisma.evm_collection_tokens.findFirst({
      where: { token_id },
      select: { owner_address: true }
    });

    if (token?.owner_address) {
      console.log(`[BID_VALIDATION] Found individual token owner for token ${token_id}: ${token.owner_address}`);
      return token.owner_address;
    }

    // Fallback: check land listing ownership (collection-level)
    const listing = await prisma.land_listings.findFirst({
      where: {
        evm_collection_tokens: {
          some: { token_id }
        }
      },
      include: {
        users: {
          select: { evm_address: true }
        }
      }
    });

    if (listing?.users?.evm_address) {
      console.log(`[BID_VALIDATION] Found collection owner for token ${token_id}: ${listing.users.evm_address}`);
      return listing.users.evm_address;
    }

    console.warn(`[BID_VALIDATION] No owner found for token ${token_id} in database`);
    return null;
  } catch (error) {
    console.error(`[BID_VALIDATION] Database owner lookup failed for token ${token_id}:`, error);
    return null;
  }
}

/**
 * Get token owner from blockchain with timeout handling
 */
async function getBlockchainTokenOwner(token_id: number): Promise<string | null> {
  try {
    const owner = await Promise.race([
      publicClient.readContract({
        address: PLATZ_LAND_NFT_ADDRESS,
        abi: [{ 
          "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
          "name": "ownerOf",
          "outputs": [{"internalType": "address", "name": "", "type": "address"}],
          "stateMutability": "view",
          "type": "function"
        }],
        functionName: 'ownerOf',
        args: [BigInt(token_id)]
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Blockchain timeout')), 5000)
      )
    ]) as string;

    return owner;
  } catch (error) {
    console.warn(`[BID_VALIDATION] Blockchain owner lookup failed for token ${token_id}:`, error);
    return null;
  }
}

/**
 * Validates if a bid can be placed on a token (individual token ownership based)
 */
export async function validateBidPlacement(
  land_listing_id: string,
  token_id: number,
  bidderAddress: string
): Promise<BidValidationResult> {
  try {
    console.log(`[BID_VALIDATION] Validating bid placement for token ${token_id} by ${bidderAddress}`);
    
    // 1. Get the land listing with current owner information
    const landListing = await prisma.land_listings.findUnique({
      where: { id: land_listing_id },
      include: {
        users: {
          select: {
            evm_address: true,
            username: true
          }
        },
        evm_collection_tokens: {
          where: {
            token_id: token_id
          }
        }
      }
    });

    if (!landListing) {
      return {
        isValid: false,
        error: 'Land listing not found',
        source: 'database'
      };
    }

    // 2. Get current token owner (prioritize individual token ownership)
    let currentOwner = await getDatabaseTokenOwner(token_id);
    let source: 'database' | 'blockchain' | 'fallback' = 'database';

    if (!currentOwner) {
      console.log(`[BID_VALIDATION] No database owner for token ${token_id}, trying blockchain...`);
      currentOwner = await getBlockchainTokenOwner(token_id);
      source = 'blockchain';
    }

    if (!currentOwner) {
      // Final fallback: use listing owner (collection-level)
      currentOwner = landListing.users?.evm_address || null;
      source = 'fallback';
      console.warn(`[BID_VALIDATION] Using collection owner as fallback for token ${token_id}: ${currentOwner}`);
      
      if (!currentOwner) {
        return {
          isValid: false,
          error: `Token ${token_id} owner could not be determined`,
          tokenExists: false,
          source
        };
      }
    }

    // 3. Prevent self-bidding (case-insensitive comparison)
    if (currentOwner.toLowerCase() === bidderAddress.toLowerCase()) {
      console.log(`[BID_VALIDATION] Self-bidding detected: ${bidderAddress} trying to bid on their own token ${token_id}`);
      return {
        isValid: false,
        error: 'You cannot bid on a token you already own',
        currentOwner,
        source
      };
    }

    // 4. If we got blockchain data and it differs from database, sync the individual token ownership
    if (source === 'blockchain') {
      const tokenRecord = landListing.evm_collection_tokens.find(t => t.token_id === token_id);
      if (tokenRecord && tokenRecord.owner_address?.toLowerCase() !== currentOwner.toLowerCase()) {
        console.warn(`[BID_VALIDATION] Individual token ownership mismatch for token ${token_id}:`);
        console.warn(`  Database token owner: ${tokenRecord.owner_address}`);
        console.warn(`  Blockchain token owner: ${currentOwner}`);
        
        // Auto-heal individual token ownership
        try {
          await prisma.evm_collection_tokens.updateMany({
            where: { 
              token_id: token_id,
              land_listing_id: land_listing_id
            },
            data: { owner_address: currentOwner }
          });
          console.log(`[BID_VALIDATION] Auto-healed individual token ownership for token ${token_id}`);
        } catch (healError) {
          console.error(`[BID_VALIDATION] Failed to auto-heal token ownership:`, healError);
        }
      }
    }

    console.log(`[BID_VALIDATION] Bid validation successful for token ${token_id}. Owner: ${currentOwner}, Bidder: ${bidderAddress}`);
    return {
      isValid: true,
      currentOwner,
      tokenExists: true,
      source
    };

  } catch (error) {
    console.error('[BID_VALIDATION] Error validating bid placement:', error);
    return {
      isValid: false,
      error: 'Internal validation error',
      source: 'fallback'
    };
  }
}

/**
 * Validates if a bid can be accepted (individual token ownership based)
 */
export async function validateBidAcceptance(
  bidId: string,
  accepterAddress: string
): Promise<BidValidationResult> {
  try {
    console.log(`[BID_VALIDATION] Validating bid acceptance for bid ${bidId} by ${accepterAddress}`);
    
    // 1. Get the bid with all related information
    const bid = await prisma.nft_bids.findUnique({
      where: { id: bidId },
      include: {
        users: {
          select: {
            evm_address: true,
            username: true
          }
        },
        land_listings: {
          include: {
            users: {
              select: {
                evm_address: true,
                username: true
              }
            },
            evm_collection_tokens: {
              where: {
                token_id: { equals: 0 } // Will be updated below
              }
            }
          }
        }
      }
    });

    if (!bid) {
      return {
        isValid: false,
        error: 'Bid not found',
        source: 'database'
      };
    }

    if (bid.bid_status !== 'ACTIVE') {
      return {
        isValid: false,
        error: `Bid is not active (current status: ${bid.bid_status})`,
        source: 'database'
      };
    }

    // 2. Get current token owner (prioritize individual token ownership)
    let currentOwner = await getDatabaseTokenOwner(bid.token_id);
    let source: 'database' | 'blockchain' | 'fallback' = 'database';

    if (!currentOwner) {
      console.log(`[BID_VALIDATION] No database owner for token ${bid.token_id}, trying blockchain...`);
      currentOwner = await getBlockchainTokenOwner(bid.token_id);
      source = 'blockchain';
    }

    if (!currentOwner) {
      // Final fallback: use listing owner (collection-level)
      currentOwner = bid.land_listings.users?.evm_address || null;
      source = 'fallback';
      console.warn(`[BID_VALIDATION] Using collection owner as fallback for token ${bid.token_id}: ${currentOwner}`);
      
      if (!currentOwner) {
        return {
          isValid: false,
          error: `Token ${bid.token_id} owner could not be determined`,
          tokenExists: false,
          source
        };
      }
    }

    // 3. Verify the accepter is the current token owner (case-insensitive)
    if (currentOwner.toLowerCase() !== accepterAddress.toLowerCase()) {
      console.log(`[BID_VALIDATION] Ownership mismatch: current owner ${currentOwner} vs accepter ${accepterAddress}`);
      
      return {
        isValid: false,
        error: `Only the current token owner can accept bids. You need to own token #${bid.token_id} to accept this bid.`,
        currentOwner,
        source
      };
    }

    // 4. Prevent accepting your own bid (self-bidding check)
    if (bid.users.evm_address?.toLowerCase() === currentOwner.toLowerCase()) {
      console.log(`[BID_VALIDATION] Self-bid acceptance detected: ${currentOwner} trying to accept their own bid`);
      return {
        isValid: false,
        error: 'You cannot accept your own bid',
        currentOwner,
        source
      };
    }

    console.log(`[BID_VALIDATION] Bid acceptance validation successful for token ${bid.token_id}. Owner: ${currentOwner}, Bidder: ${bid.users.evm_address}`);
    return {
      isValid: true,
      currentOwner,
      tokenExists: true,
      source
    };

  } catch (error) {
    console.error('[BID_VALIDATION] Error validating bid acceptance:', error);
    return {
      isValid: false,
      error: 'Internal validation error',
      source: 'fallback'
    };
  }
}

/**
 * Prevents duplicate bid acceptances by checking if token was already sold
 */
export async function checkForDuplicateSale(
  land_listing_id: string,
  token_id: number
): Promise<{ isDuplicate: boolean; lastSaleDate?: Date; transactionHash?: string }> {
  try {
    // Check for recent accepted bids on this token
    const recentAcceptedBid = await prisma.nft_bids.findFirst({
      where: {
        land_listing_id,
        token_id,
        bid_status: 'ACCEPTED'
      },
      orderBy: {
        updated_at: 'desc'
      }
    });

    if (recentAcceptedBid) {
      // Check if this was recent (within last hour to allow for blockchain delays)
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      if (recentAcceptedBid.updated_at > oneHourAgo) {
        return {
          isDuplicate: true,
          lastSaleDate: recentAcceptedBid.updated_at,
          transactionHash: recentAcceptedBid.transaction_hash || undefined
        };
      }
    }

    return { isDuplicate: false };

  } catch (error) {
    console.error('[BID_VALIDATION] Error checking for duplicate sale:', error);
    return { isDuplicate: false };
  }
}

/**
 * Sync individual token ownership with blockchain and update database
 */
export async function syncOwnershipWithBlockchain(
  land_listing_id: string,
  token_id: number
): Promise<{ success: boolean; newOwner?: string; error?: string }> {
  try {
    console.log(`[BID_VALIDATION] Syncing ownership for token ${token_id} with blockchain...`);
    
    const blockchainOwner = await getBlockchainTokenOwner(token_id);
    
    if (!blockchainOwner) {
      return {
        success: false,
        error: 'Could not determine blockchain owner'
      };
    }

    console.log(`[BID_VALIDATION] Blockchain owner for token ${token_id}: ${blockchainOwner}`);

    // Update individual token ownership in database
    const updateResult = await prisma.evm_collection_tokens.updateMany({
      where: { 
        token_id,
        land_listing_id 
      },
      data: { owner_address: blockchainOwner }
    });

    console.log(`[BID_VALIDATION] Updated ${updateResult.count} token records for token ${token_id}`);

    // Note: We don't update the listing ownership here as that's collection-level
    // Individual tokens can have different owners than the collection creator
    
    return {
      success: true,
      newOwner: blockchainOwner
    };

  } catch (error) {
    console.error(`[BID_VALIDATION] Error syncing ownership for token ${token_id}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 