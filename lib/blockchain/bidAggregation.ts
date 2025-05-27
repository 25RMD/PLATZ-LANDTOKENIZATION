import { PrismaClient } from '@prisma/client';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { PlatzLandNFTABI } from '@/contracts/PlatzLandNFTABI';
import { PLATZ_LAND_NFT_ADDRESS } from '@/config/contracts';

const prisma = new PrismaClient();

// Initialize blockchain client
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http()
});

export interface BlockchainBid {
  id: string;
  bidAmount: number;
  bidStatus: 'ACTIVE' | 'ACCEPTED' | 'WITHDRAWN' | 'OUTBID';
  transactionHash: string;
  createdAt: string;
  tokenId: number;
  collectionId: string;
  currentOwner: string; // From blockchain
  userRole: 'bidder' | 'token_owner';
  bidder: {
    id: string;
    username: string | null;
    evmAddress: string | null;
  };
  landListing: {
    id: string;
    nftTitle: string | null;
    collectionId: string;
    nftImageFileRef: string | null;
  };
  tokenMetadata?: {
    name?: string;
    description?: string;
    image?: string;
  };
}

export interface BidAggregationResult {
  userBids: BlockchainBid[]; // Bids made by the user
  receivedBids: BlockchainBid[]; // Bids received on tokens owned by the user
  allBids: BlockchainBid[]; // All bids involving the user
  summary: {
    totalBidsMade: number;
    totalBidsReceived: number;
    activeBidsMade: number;
    activeBidsReceived: number;
  };
}

/**
 * Get current token owner from blockchain
 */
async function getCurrentTokenOwner(tokenId: bigint): Promise<string | null> {
  try {
    const owner = await publicClient.readContract({
      address: PLATZ_LAND_NFT_ADDRESS,
      abi: PlatzLandNFTABI,
      functionName: 'ownerOf',
      args: [tokenId]
    });
    return owner as string;
  } catch (error) {
    console.error(`Error getting owner for token ${tokenId}:`, error);
    return null;
  }
}

/**
 * Get token ownership data from user-owned collections API (optimized)
 */
async function getTokenOwnershipOptimized(userAddress: string): Promise<Map<string, string>> {
  const tokenOwnership = new Map<string, string>();
  
  try {
    // Use the existing user-owned collections API which is already optimized
    const response = await fetch(`http://localhost:3000/api/collections/user-owned?userAddress=${userAddress}`);
    
    if (!response.ok) {
      console.warn('[BidAggregation] Could not fetch user collections, falling back to direct blockchain queries');
      return await getAllTokenOwnership();
    }
    
    const data = await response.json();
    
    if (data.success && data.collections) {
      // Process collections owned by this user
      for (const collection of data.collections) {
        // Get all tokens in this collection with their current ownership
        const collectionResponse = await fetch(`http://localhost:3000/api/collections/${collection.collectionId}`);
        
        if (collectionResponse.ok) {
          const collectionData = await collectionResponse.json();
          
          if (collectionData.evmCollectionTokens) {
            for (const token of collectionData.evmCollectionTokens) {
              const key = `${collection.collectionId}-${token.tokenId}`;
              tokenOwnership.set(key, token.ownerAddress.toLowerCase());
            }
          }
        }
      }
    }

    // For other tokens not owned by this user, we need to fetch them separately
    // This is still more efficient than fetching ALL tokens for ALL users
    console.log(`[BidAggregation] Loaded ownership for ${tokenOwnership.size} tokens (optimized)`);
    return tokenOwnership;
  } catch (error) {
    console.error('[BidAggregation] Error in optimized ownership loading, falling back:', error);
    return await getAllTokenOwnership();
  }
}

/**
 * Get all collections and their tokens with current blockchain owners (fallback)
 */
async function getAllTokenOwnership(): Promise<Map<string, string>> {
  const tokenOwnership = new Map<string, string>();
  
  try {
    // Get all collections with their tokens
    const collections = await prisma.landListing.findMany({
      where: {
        collectionId: { not: null }
      },
      include: {
        evmCollectionTokens: {
          select: {
            tokenId: true,
            ownerAddress: true // Use cached ownership if available
          }
        }
      }
    });

    // Use cached ownership data first, then fetch from blockchain if needed
    for (const collection of collections) {
      for (const token of collection.evmCollectionTokens) {
        const key = `${collection.collectionId}-${token.tokenId}`;
        
        if (token.ownerAddress) {
          // Use cached ownership
          tokenOwnership.set(key, token.ownerAddress.toLowerCase());
        } else {
          // Fetch from blockchain as fallback
          const tokenIdBigInt = BigInt(token.tokenId);
          const currentOwner = await getCurrentTokenOwner(tokenIdBigInt);
          
          if (currentOwner) {
            tokenOwnership.set(key, currentOwner.toLowerCase());
          }
        }
      }
    }

    console.log(`[BidAggregation] Loaded ownership for ${tokenOwnership.size} tokens (fallback)`);
    return tokenOwnership;
  } catch (error) {
    console.error('[BidAggregation] Error loading token ownership:', error);
    return tokenOwnership;
  }
}

/**
 * Aggregate all bids using blockchain ownership data (optimized)
 */
export async function aggregateBidsForUser(userAddress: string): Promise<BidAggregationResult> {
  try {
    console.log(`[BidAggregation] Aggregating bids for user: ${userAddress}`);
    
    // Get all bids involving this user (either as bidder or potentially as token owner)
    const allBids = await prisma.nftBid.findMany({
      where: {
        bidStatus: { in: ['ACTIVE', 'ACCEPTED', 'WITHDRAWN', 'OUTBID'] }
      },
      include: {
        bidder: {
          select: {
            id: true,
            username: true,
            evmAddress: true
          }
        },
        landListing: {
          select: {
            id: true,
            nftTitle: true,
            collectionId: true,
            nftImageFileRef: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`[BidAggregation] Found ${allBids.length} potential bids involving user`);

    // Get unique collection-token pairs that need ownership checking
    const tokensToCheck = new Set<string>();
    const bidsByToken = new Map<string, typeof allBids[0][]>();
    
    for (const bid of allBids) {
      // Skip bids with invalid tokenId (legacy collection-level bids)
      if (!bid.tokenId || bid.tokenId === 0) {
        console.warn(`[BidAggregation] Skipping bid ${bid.id} with invalid tokenId: ${bid.tokenId}`);
        continue;
      }
      
      const tokenKey = `${bid.landListing.collectionId}-${bid.tokenId}`;
      tokensToCheck.add(tokenKey);
      
      if (!bidsByToken.has(tokenKey)) {
        bidsByToken.set(tokenKey, []);
      }
      bidsByToken.get(tokenKey)!.push(bid);
    }

    console.log(`[BidAggregation] Need to check ownership for ${tokensToCheck.size} unique tokens`);

    // Check ownership only for tokens that have bids
    const tokenOwnership = new Map<string, string>();
    
    for (const tokenKey of tokensToCheck) {
      const [collectionId, tokenId] = tokenKey.split('-');
      
      // Validate tokenId before processing
      if (!tokenId || tokenId === 'undefined' || tokenId === 'null' || isNaN(parseInt(tokenId))) {
        console.warn(`[BidAggregation] Skipping invalid tokenKey: ${tokenKey}`);
        continue;
      }
      
      try {
        // Get token ownership directly from database instead of API calls
        const tokenIdNumber = parseInt(tokenId);
        const collectionListing = await prisma.landListing.findFirst({
          where: { collectionId },
          include: {
            evmCollectionTokens: {
              where: { tokenId: tokenIdNumber }
            }
          }
        });

        if (collectionListing && collectionListing.evmCollectionTokens.length > 0) {
          const token = collectionListing.evmCollectionTokens[0];
          if (token.ownerAddress) {
            tokenOwnership.set(tokenKey, token.ownerAddress.toLowerCase());
          }
        }
        
        // If not found in database, try direct blockchain call
        if (!tokenOwnership.has(tokenKey)) {
          const tokenIdNumber = parseInt(tokenId);
          if (!isNaN(tokenIdNumber) && tokenIdNumber > 0) {
            const currentOwner = await getCurrentTokenOwner(BigInt(tokenIdNumber));
            if (currentOwner) {
              tokenOwnership.set(tokenKey, currentOwner.toLowerCase());
            }
          }
        }
      } catch (error) {
        console.warn(`[BidAggregation] Error checking ownership for ${tokenKey}:`, error);
      }
    }

    console.log(`[BidAggregation] Loaded ownership for ${tokenOwnership.size} tokens`);

    // Process bids and determine user relationship
    const processedBids: BlockchainBid[] = [];
    
    for (const bid of allBids) {
      // Skip bids with invalid tokenId (legacy collection-level bids)
      if (!bid.tokenId || bid.tokenId === 0) {
        console.warn(`[BidAggregation] Skipping processing of bid ${bid.id} with invalid tokenId: ${bid.tokenId}`);
        continue;
      }
      
      const tokenKey = `${bid.landListing.collectionId}-${bid.tokenId}`;
      const currentOwner = tokenOwnership.get(tokenKey);
      
      if (!currentOwner) {
        console.warn(`[BidAggregation] No current owner found for token ${bid.tokenId} in collection ${bid.landListing.collectionId}`);
        continue;
      }

      // Determine user's role in this bid
      const isBidder = bid.bidder.evmAddress?.toLowerCase() === userAddress.toLowerCase();
      const isTokenOwner = currentOwner === userAddress.toLowerCase();
      
      // Only include bids where user is involved
      if (!isBidder && !isTokenOwner) {
        continue;
      }

      const processedBid: BlockchainBid = {
        id: bid.id,
        bidAmount: bid.bidAmount,
        bidStatus: bid.bidStatus as any,
        transactionHash: bid.transactionHash || '',
        createdAt: bid.createdAt.toISOString(),
        tokenId: bid.tokenId,
        collectionId: bid.landListing.collectionId || '',
        currentOwner,
        userRole: isBidder ? 'bidder' : 'token_owner',
        bidder: bid.bidder,
        landListing: bid.landListing
      };

      processedBids.push(processedBid);
    }

    console.log(`[BidAggregation] Processed ${processedBids.length} relevant bids for user`);

    // Separate bids by user role
    const userBids = processedBids.filter(bid => bid.userRole === 'bidder');
    const receivedBids = processedBids.filter(bid => bid.userRole === 'token_owner');

    // Calculate summary
    const summary = {
      totalBidsMade: userBids.length,
      totalBidsReceived: receivedBids.length,
      activeBidsMade: userBids.filter(bid => bid.bidStatus === 'ACTIVE').length,
      activeBidsReceived: receivedBids.filter(bid => bid.bidStatus === 'ACTIVE').length
    };

    console.log(`[BidAggregation] User made ${summary.totalBidsMade} bids, received ${summary.totalBidsReceived} bids`);
    console.log(`[BidAggregation] Active: ${summary.activeBidsMade} made, ${summary.activeBidsReceived} received`);

    return {
      userBids,
      receivedBids,
      allBids: processedBids,
      summary
    };

  } catch (error) {
    console.error('[BidAggregation] Error aggregating bids:', error);
    return {
      userBids: [],
      receivedBids: [],
      allBids: [],
      summary: {
        totalBidsMade: 0,
        totalBidsReceived: 0,
        activeBidsMade: 0,
        activeBidsReceived: 0
      }
    };
  }
}

/**
 * Get active bids received on tokens owned by user (blockchain-based)
 */
export async function getActiveBidsForOwner(userAddress: string): Promise<BlockchainBid[]> {
  const result = await aggregateBidsForUser(userAddress);
  return result.receivedBids.filter(bid => bid.bidStatus === 'ACTIVE');
}

/**
 * Get all bids made by user (blockchain-verified)
 */
export async function getBidsByUser(userAddress: string): Promise<BlockchainBid[]> {
  const result = await aggregateBidsForUser(userAddress);
  return result.userBids;
}

/**
 * Get all bids received by user on their owned tokens (blockchain-verified)
 */
export async function getAllBidsReceivedByOwner(userAddress: string): Promise<BlockchainBid[]> {
  const result = await aggregateBidsForUser(userAddress);
  return result.receivedBids;
} 