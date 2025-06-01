import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { createPublicClient, http, getContract } from 'viem';
import { sepolia } from 'viem/chains';
import { PlatzLandNFTABI } from '@/contracts/PlatzLandNFTABI';
import { PLATZ_LAND_NFT_ADDRESS } from '@/config/contracts';

/**
 * GET /api/collections/user-owned?userAddress=ADDRESS
 * 
 * Returns collections where the user either:
 * 1. Owns individual tokens in the collection, OR
 * 2. Created the collection (is the original creator)
 * This endpoint scans the blockchain for actual token ownership and checks database for created collections
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('userAddress');

    if (!userAddress) {
      return NextResponse.json({
        success: false,
        error: 'userAddress parameter is required'
      }, { status: 400 });
    }

    console.log(`[API /api/collections/user-owned] Fetching collections for user: ${userAddress}`);

    // Create public client for blockchain queries
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY')
    });

    // Get all collections from database
    const allCollections = await prisma.landListing.findMany({
      where: {
        AND: [
          { collectionId: { not: null } },
          { 
            OR: [
              { mintStatus: 'COMPLETED' },
              { mintStatus: 'COMPLETED_COLLECTION' },
              { mintStatus: 'SUCCESS' }
            ]
          }
        ]
      },
      select: {
        id: true,
        collectionId: true,
        mainTokenId: true,
        nftTitle: true,
        nftDescription: true,
        nftImageFileRef: true,
        nftCollectionSize: true,
        listingPrice: true,
        priceCurrency: true,
        country: true,
        state: true,
        localGovernmentArea: true,
        propertyAreaSqm: true,
        latitude: true,
        longitude: true,
        contractAddress: true,
        mintTransactionHash: true,
        mintTimestamp: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            username: true,
            evmAddress: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`[API /api/collections/user-owned] Found ${allCollections.length} total collections`);

    // Check ownership for each collection
    const userOwnedCollections = [];
    
    for (const collection of allCollections) {
      try {
        if (!collection.collectionId) continue;

        let userTokenCount = 0;
        let totalTokens = 0;
        let ownershipType: 'TOKEN_OWNER' | 'COLLECTION_CREATOR' | 'BOTH' = 'TOKEN_OWNER';

        // Check if user is the collection creator
        const isCreator = collection.user?.evmAddress?.toLowerCase() === userAddress.toLowerCase();

        try {
          // Get the contract instance
          const contract = getContract({
            address: PLATZ_LAND_NFT_ADDRESS as `0x${string}`,
            abi: PlatzLandNFTABI,
            client: publicClient
          });

          // Get all token IDs in this collection
          const tokenIds = await contract.read.getTokensInCollection([BigInt(collection.collectionId)]) as bigint[];
          totalTokens = tokenIds.length;
          
          // Check ownership of each token
          for (const tokenId of tokenIds) {
            try {
              const owner = await contract.read.ownerOf([tokenId]) as string;
              if (owner.toLowerCase() === userAddress.toLowerCase()) {
                userTokenCount++;
              }
            } catch (error) {
              // Token might not exist or other error, skip
              console.warn(`[API /api/collections/user-owned] Error checking ownership of token ${tokenId}:`, error);
            }
          }
        } catch (contractError) {
          console.error(`[API /api/collections/user-owned] Error accessing contract for collection ${collection.collectionId}:`, contractError);
          // If we can't check blockchain, but user is creator, still include it
          if (isCreator) {
            totalTokens = collection.nftCollectionSize || 0;
          }
        }

        // Determine ownership type
        if (isCreator && userTokenCount > 0) {
          ownershipType = 'BOTH';
        } else if (isCreator) {
          ownershipType = 'COLLECTION_CREATOR';
        } else if (userTokenCount > 0) {
          ownershipType = 'TOKEN_OWNER';
        }

        // Include collection if user is creator OR owns tokens
        if (isCreator || userTokenCount > 0) {
          userOwnedCollections.push({
            ...collection,
            userTokenCount,
            totalTokens,
            ownershipType,
            // Transform for frontend compatibility
            name: collection.nftTitle || `Collection ${collection.collectionId}`,
            description: collection.nftDescription || '',
            image: collection.nftImageFileRef || '',
            totalSupply: totalTokens,
            itemsOwned: userTokenCount,
            listedItems: collection.listingPrice && collection.listingPrice > 0 ? 1 : 0,
            unlistedItems: totalTokens - (collection.listingPrice && collection.listingPrice > 0 ? 1 : 0),
            floorPrice: collection.listingPrice ? parseFloat(collection.listingPrice.toString()) : null,
            totalValue: userTokenCount * (collection.listingPrice ? parseFloat(collection.listingPrice.toString()) : 0),
            owner: collection.user || { id: '', username: null, evmAddress: null },
            listings: [{
              id: collection.id,
              mainTokenId: collection.mainTokenId,
              isListed: !!(collection.listingPrice && collection.listingPrice > 0),
              listingPrice: collection.listingPrice ? parseFloat(collection.listingPrice.toString()) : 0,
              createdAt: collection.createdAt
            }]
          });
          
          console.log(`[API /api/collections/user-owned] User ${ownershipType.toLowerCase()} for collection ${collection.collectionId}: owns ${userTokenCount}/${totalTokens} tokens`);
        }

      } catch (error) {
        console.error(`[API /api/collections/user-owned] Error checking collection ${collection.collectionId}:`, error);
        // Continue with next collection
      }
    }

    console.log(`[API /api/collections/user-owned] User has ownership in ${userOwnedCollections.length} collections`);

    return NextResponse.json({
      success: true,
      collections: userOwnedCollections,
      count: userOwnedCollections.length,
      userAddress
    });

  } catch (error: any) {
    console.error('[API /api/collections/user-owned] Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch user-owned collections',
      details: error.message
    }, { status: 500 });
  }
} 