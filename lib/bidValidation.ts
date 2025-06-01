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
async function getDatabaseTokenOwner(tokenId: number): Promise<string | null> {
  try {
    // First check evmCollectionTokens table for individual token ownership
    const token = await prisma.evmCollectionToken.findFirst({
      where: { tokenId },
      select: { ownerAddress: true }
    });

    if (token?.ownerAddress) {
      console.log(`[BID_VALIDATION] Found individual token owner for token ${tokenId}: ${token.ownerAddress}`);
      return token.ownerAddress;
    }

    // Fallback: check land listing ownership (collection-level)
    const listing = await prisma.landListing.findFirst({
      where: {
        evmCollectionTokens: {
          some: { tokenId }
        }
      },
      include: {
        user: {
          select: { evmAddress: true }
        }
      }
    });

    if (listing?.user?.evmAddress) {
      console.log(`[BID_VALIDATION] Found collection owner for token ${tokenId}: ${listing.user.evmAddress}`);
      return listing.user.evmAddress;
    }

    console.warn(`[BID_VALIDATION] No owner found for token ${tokenId} in database`);
    return null;
  } catch (error) {
    console.error(`[BID_VALIDATION] Database owner lookup failed for token ${tokenId}:`, error);
    return null;
  }
}

/**
 * Get token owner from blockchain with timeout handling
 */
async function getBlockchainTokenOwner(tokenId: number): Promise<string | null> {
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
        args: [BigInt(tokenId)]
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Blockchain timeout')), 5000)
      )
    ]) as string;

    return owner;
  } catch (error) {
    console.warn(`[BID_VALIDATION] Blockchain owner lookup failed for token ${tokenId}:`, error);
    return null;
  }
}

/**
 * Validates if a bid can be placed on a token (individual token ownership based)
 */
export async function validateBidPlacement(
  landListingId: string,
  tokenId: number,
  bidderAddress: string
): Promise<BidValidationResult> {
  try {
    console.log(`[BID_VALIDATION] Validating bid placement for token ${tokenId} by ${bidderAddress}`);
    
    // 1. Get the land listing with current owner information
    const landListing = await prisma.landListing.findUnique({
      where: { id: landListingId },
      include: {
        user: {
          select: {
            evmAddress: true,
            username: true
          }
        },
        evmCollectionTokens: {
          where: {
            tokenId: tokenId
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
    let currentOwner = await getDatabaseTokenOwner(tokenId);
    let source: 'database' | 'blockchain' | 'fallback' = 'database';

    if (!currentOwner) {
      console.log(`[BID_VALIDATION] No database owner for token ${tokenId}, trying blockchain...`);
      currentOwner = await getBlockchainTokenOwner(tokenId);
      source = 'blockchain';
    }

    if (!currentOwner) {
      // Final fallback: use listing owner (collection-level)
      currentOwner = landListing.user?.evmAddress || null;
      source = 'fallback';
      console.warn(`[BID_VALIDATION] Using collection owner as fallback for token ${tokenId}: ${currentOwner}`);
      
      if (!currentOwner) {
        return {
          isValid: false,
          error: `Token ${tokenId} owner could not be determined`,
          tokenExists: false,
          source
        };
      }
    }

    // 3. Prevent self-bidding (case-insensitive comparison)
    if (currentOwner.toLowerCase() === bidderAddress.toLowerCase()) {
      console.log(`[BID_VALIDATION] Self-bidding detected: ${bidderAddress} trying to bid on their own token ${tokenId}`);
      return {
        isValid: false,
        error: 'You cannot bid on a token you already own',
        currentOwner,
        source
      };
    }

    // 4. If we got blockchain data and it differs from database, sync the individual token ownership
    if (source === 'blockchain') {
      const tokenRecord = landListing.evmCollectionTokens.find(t => t.tokenId === tokenId);
      if (tokenRecord && tokenRecord.ownerAddress?.toLowerCase() !== currentOwner.toLowerCase()) {
        console.warn(`[BID_VALIDATION] Individual token ownership mismatch for token ${tokenId}:`);
        console.warn(`  Database token owner: ${tokenRecord.ownerAddress}`);
        console.warn(`  Blockchain token owner: ${currentOwner}`);
        
        // Auto-heal individual token ownership
        try {
          await prisma.evmCollectionToken.updateMany({
            where: { 
              tokenId: tokenId,
              landListingId: landListing.id
            },
            data: { ownerAddress: currentOwner }
          });
          console.log(`[BID_VALIDATION] Auto-healed individual token ownership for token ${tokenId}`);
        } catch (healError) {
          console.error(`[BID_VALIDATION] Failed to auto-heal token ownership:`, healError);
        }
      }
    }

    console.log(`[BID_VALIDATION] Bid validation successful for token ${tokenId}. Owner: ${currentOwner}, Bidder: ${bidderAddress}`);
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
    const bid = await prisma.nftBid.findUnique({
      where: { id: bidId },
      include: {
        bidder: {
          select: {
            evmAddress: true,
            username: true
          }
        },
        landListing: {
          include: {
            user: {
              select: {
                evmAddress: true,
                username: true
              }
            },
            evmCollectionTokens: {
              where: {
                tokenId: { equals: 0 } // Will be updated below
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

    if (bid.bidStatus !== 'ACTIVE') {
      return {
        isValid: false,
        error: `Bid is not active (current status: ${bid.bidStatus})`,
        source: 'database'
      };
    }

    // 2. Get current token owner (prioritize individual token ownership)
    let currentOwner = await getDatabaseTokenOwner(bid.tokenId);
    let source: 'database' | 'blockchain' | 'fallback' = 'database';

    if (!currentOwner) {
      console.log(`[BID_VALIDATION] No database owner for token ${bid.tokenId}, trying blockchain...`);
      currentOwner = await getBlockchainTokenOwner(bid.tokenId);
      source = 'blockchain';
    }

    if (!currentOwner) {
      // Final fallback: use listing owner (collection-level)
      currentOwner = bid.landListing.user?.evmAddress || null;
      source = 'fallback';
      console.warn(`[BID_VALIDATION] Using collection owner as fallback for token ${bid.tokenId}: ${currentOwner}`);
      
      if (!currentOwner) {
        return {
          isValid: false,
          error: `Token ${bid.tokenId} owner could not be determined`,
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
        error: `Only the current token owner can accept bids. You need to own token #${bid.tokenId} to accept this bid.`,
        currentOwner,
        source
      };
    }

    // 4. Prevent accepting your own bid (self-bidding check)
    if (bid.bidder.evmAddress?.toLowerCase() === currentOwner.toLowerCase()) {
      console.log(`[BID_VALIDATION] Self-bid acceptance detected: ${currentOwner} trying to accept their own bid`);
      return {
        isValid: false,
        error: 'You cannot accept your own bid',
        currentOwner,
        source
      };
    }

    console.log(`[BID_VALIDATION] Bid acceptance validation successful for token ${bid.tokenId}. Owner: ${currentOwner}, Bidder: ${bid.bidder.evmAddress}`);
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
  landListingId: string,
  tokenId: number
): Promise<{ isDuplicate: boolean; lastSaleDate?: Date; transactionHash?: string }> {
  try {
    // Check for recent accepted bids on this token
    const recentAcceptedBid = await prisma.nftBid.findFirst({
      where: {
        landListingId,
        tokenId,
        bidStatus: 'ACCEPTED'
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    if (recentAcceptedBid) {
      // Check if this was recent (within last hour to allow for blockchain delays)
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      if (recentAcceptedBid.updatedAt > oneHourAgo) {
        return {
          isDuplicate: true,
          lastSaleDate: recentAcceptedBid.updatedAt,
          transactionHash: recentAcceptedBid.transactionHash
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
  landListingId: string,
  tokenId: number
): Promise<{ success: boolean; newOwner?: string; error?: string }> {
  try {
    console.log(`[BID_VALIDATION] Syncing ownership for token ${tokenId} with blockchain...`);
    
    const blockchainOwner = await getBlockchainTokenOwner(tokenId);
    
    if (!blockchainOwner) {
      return {
        success: false,
        error: 'Could not determine blockchain owner'
      };
    }

    console.log(`[BID_VALIDATION] Blockchain owner for token ${tokenId}: ${blockchainOwner}`);

    // Update individual token ownership in database
    const updateResult = await prisma.evmCollectionToken.updateMany({
      where: { 
        tokenId,
        landListingId 
      },
      data: { ownerAddress: blockchainOwner }
    });

    console.log(`[BID_VALIDATION] Updated ${updateResult.count} token records for token ${tokenId}`);

    // Note: We don't update the listing ownership here as that's collection-level
    // Individual tokens can have different owners than the collection creator
    
    return {
      success: true,
      newOwner: blockchainOwner
    };

  } catch (error) {
    console.error('[BID_VALIDATION] Error syncing ownership with blockchain:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 