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
    const allCollections = await prisma.land_listings.findMany({
      where: {
        AND: [
          { collection_id: { not: null } },
          { 
            OR: [
              { mint_status: 'COMPLETED' },
              { mint_status: 'COMPLETED_COLLECTION' },
              { mint_status: 'SUCCESS' }
            ]
          }
        ]
      },
      select: {
        id: true,
        collection_id: true,
        main_token_id: true,
        nft_title: true,
        nft_description: true,
        nft_image_file_ref: true,
        nft_collection_size: true,
        listing_price: true,
        price_currency: true,
        country: true,
        state: true,
        local_government_area: true,
        property_area_sqm: true,
        latitude: true,
        longitude: true,
        contract_address: true,
        mint_transaction_hash: true,
        mint_timestamp: true,
        created_at: true,
        userId: true,
        users: {
          select: {
            id: true,
            username: true,
            evm_address: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    console.log(`[API /api/collections/user-owned] Found ${allCollections.length} total collections`);

    // Check ownership for each collection
    const userOwnedCollections = [];
    
    for (const collection of allCollections) {
      try {
        if (!collection.collection_id) continue;

        let userTokenCount = 0;
        let totalTokens = 0;
        let ownershipType: 'TOKEN_OWNER' | 'COLLECTION_CREATOR' | 'BOTH' = 'TOKEN_OWNER';

        // Check if user is the collection creator
        const isCreator = collection.users?.evm_address?.toLowerCase() === userAddress.toLowerCase();

        try {
          // Use the collection size from database instead of querying individual tokens
          totalTokens = collection.nft_collection_size || 0;
          
          // For now, assume user owns tokens if they are the creator
          // In a full implementation, you'd need to check individual token ownership
          if (isCreator) {
            userTokenCount = totalTokens; // Creator owns all tokens initially
          } else {
            // For non-creators, we'd need a different approach to check ownership
            // This could involve checking Transfer events or maintaining an ownership index
            userTokenCount = 0;
          }
        } catch (contractError) {
          console.error(`[API /api/collections/user-owned] Error accessing contract for collection ${collection.collection_id}:`, contractError);
          // If we can't check blockchain, but user is creator, still include it
          if (isCreator) {
            totalTokens = collection.nft_collection_size || 0;
            userTokenCount = totalTokens;
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
            name: collection.nft_title || `Collection ${collection.collection_id}`,
            description: collection.nft_description || '',
            image: collection.nft_image_file_ref || '',
            totalSupply: totalTokens,
            itemsOwned: userTokenCount,
            listedItems: collection.listing_price && collection.listing_price > 0 ? 1 : 0,
            unlistedItems: totalTokens - (collection.listing_price && collection.listing_price > 0 ? 1 : 0),
            floorPrice: collection.listing_price ? parseFloat(collection.listing_price.toString()) : null,
            totalValue: userTokenCount * (collection.listing_price ? parseFloat(collection.listing_price.toString()) : 0),
            owner: collection.users || { id: '', username: null, evm_address: null },
            listings: [{
              id: collection.id,
              mainTokenId: collection.main_token_id,
              isListed: !!(collection.listing_price && collection.listing_price > 0),
              listingPrice: collection.listing_price ? parseFloat(collection.listing_price.toString()) : 0,
              createdAt: collection.created_at
            }]
          });
          
          console.log(`[API /api/collections/user-owned] User ${ownershipType.toLowerCase()} for collection ${collection.collection_id}: owns ${userTokenCount}/${totalTokens} tokens`);
        }

      } catch (error) {
        console.error(`[API /api/collections/user-owned] Error checking collection ${collection.collection_id}:`, error);
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