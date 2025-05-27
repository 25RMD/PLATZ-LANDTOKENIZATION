import { PrismaClient } from '@prisma/client';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { PLATZ_LAND_NFT_ADDRESS } from '@/config/contracts';

const prisma = new PrismaClient();

// Initialize blockchain client for ownership verification
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http()
});

export interface BidValidationResult {
  isValid: boolean;
  error?: string;
  currentOwner?: string;
  tokenExists?: boolean;
}

/**
 * Validates if a bid can be placed on a token
 */
export async function validateBidPlacement(
  landListingId: string,
  tokenId: number,
  bidderAddress: string
): Promise<BidValidationResult> {
  try {
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
        error: 'Land listing not found'
      };
    }

    // 2. Get current owner from blockchain (source of truth)
    let currentOwner: string;
    try {
      currentOwner = await publicClient.readContract({
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
      }) as string;
    } catch (error) {
      return {
        isValid: false,
        error: `Token ${tokenId} does not exist or cannot be queried from blockchain`,
        tokenExists: false
      };
    }

    // 3. Prevent self-bidding
    if (currentOwner.toLowerCase() === bidderAddress.toLowerCase()) {
      return {
        isValid: false,
        error: 'Cannot bid on your own token',
        currentOwner
      };
    }

    // 4. Verify the database owner matches blockchain owner (data consistency check)
    const databaseOwner = landListing.user?.evmAddress;
    if (databaseOwner && databaseOwner.toLowerCase() !== currentOwner.toLowerCase()) {
      console.warn(`[BID_VALIDATION] Database ownership mismatch for token ${tokenId}:`);
      console.warn(`  Database owner: ${databaseOwner}`);
      console.warn(`  Blockchain owner: ${currentOwner}`);
      
      // Update database to match blockchain (auto-heal)
      try {
        const correctOwner = await prisma.user.findFirst({
          where: {
            evmAddress: {
              equals: currentOwner,
              mode: 'insensitive'
            }
          }
        });

        if (correctOwner) {
          await prisma.landListing.update({
            where: { id: landListingId },
            data: { userId: correctOwner.id }
          });
          console.log(`[BID_VALIDATION] Auto-healed ownership for listing ${landListingId}`);
        }
      } catch (healError) {
        console.error(`[BID_VALIDATION] Failed to auto-heal ownership:`, healError);
      }
    }

    return {
      isValid: true,
      currentOwner,
      tokenExists: true
    };

  } catch (error) {
    console.error('[BID_VALIDATION] Error validating bid placement:', error);
    return {
      isValid: false,
      error: 'Internal validation error'
    };
  }
}

/**
 * Validates if a bid can be accepted
 */
export async function validateBidAcceptance(
  bidId: string,
  accepterAddress: string
): Promise<BidValidationResult> {
  try {
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
            }
          }
        }
      }
    });

    if (!bid) {
      return {
        isValid: false,
        error: 'Bid not found'
      };
    }

    if (bid.bidStatus !== 'ACTIVE') {
      return {
        isValid: false,
        error: `Bid is not active (current status: ${bid.bidStatus})`
      };
    }

    // 2. Get current owner from blockchain
    let currentOwner: string;
    try {
      currentOwner = await publicClient.readContract({
        address: PLATZ_LAND_NFT_ADDRESS,
        abi: [{ 
          "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
          "name": "ownerOf",
          "outputs": [{"internalType": "address", "name": "", "type": "address"}],
          "stateMutability": "view",
          "type": "function"
        }],
        functionName: 'ownerOf',
        args: [BigInt(bid.tokenId)]
      }) as string;
    } catch (error) {
      return {
        isValid: false,
        error: `Token ${bid.tokenId} does not exist or cannot be queried from blockchain`,
        tokenExists: false
      };
    }

    // 3. Verify the accepter is the current owner
    if (currentOwner.toLowerCase() !== accepterAddress.toLowerCase()) {
      return {
        isValid: false,
        error: 'Only the current token owner can accept bids',
        currentOwner
      };
    }

    // 4. Prevent accepting bids on tokens you don't own (double-check)
    if (bid.bidder.evmAddress?.toLowerCase() === currentOwner.toLowerCase()) {
      return {
        isValid: false,
        error: 'Cannot accept your own bid',
        currentOwner
      };
    }

    return {
      isValid: true,
      currentOwner,
      tokenExists: true
    };

  } catch (error) {
    console.error('[BID_VALIDATION] Error validating bid acceptance:', error);
    return {
      isValid: false,
      error: 'Internal validation error'
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
 * Updates database ownership to match blockchain reality
 */
export async function syncOwnershipWithBlockchain(
  landListingId: string,
  tokenId: number
): Promise<{ success: boolean; newOwner?: string; error?: string }> {
  try {
    // Get current owner from blockchain
    const currentOwner = await publicClient.readContract({
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
    }) as string;

    // Find the user with this address
    const newOwnerUser = await prisma.user.findFirst({
      where: {
        evmAddress: {
          equals: currentOwner,
          mode: 'insensitive'
        }
      }
    });

    if (!newOwnerUser) {
      return {
        success: false,
        error: `No user found for blockchain owner ${currentOwner}`
      };
    }

    // Update the land listing ownership
    await prisma.landListing.update({
      where: { id: landListingId },
      data: {
        userId: newOwnerUser.id,
        status: 'OWNED'
      }
    });

    // Update EVM collection token if it exists
    const evmToken = await prisma.evmCollectionToken.findFirst({
      where: {
        landListingId,
        tokenId
      }
    });

    if (evmToken) {
      await prisma.evmCollectionToken.update({
        where: { id: evmToken.id },
        data: {
          ownerAddress: currentOwner,
          isListed: false,
          listingPrice: null
        }
      });
    }

    return {
      success: true,
      newOwner: currentOwner
    };

  } catch (error) {
    console.error('[BID_VALIDATION] Error syncing ownership:', error);
    return {
      success: false,
      error: 'Failed to sync ownership with blockchain'
    };
  }
} 