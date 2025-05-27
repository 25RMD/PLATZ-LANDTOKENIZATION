import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('userAddress');

    if (!userAddress) {
      return NextResponse.json({
        success: false,
        error: 'User address is required'
      }, { status: 400 });
    }

    console.log(`[API] Fetching owned collections for user: ${userAddress}`);

    // Find all users with matching EVM address (ignoring case)
    const users = await prisma.user.findMany({
      where: {
        evmAddress: {
          equals: userAddress,
          mode: 'insensitive'
        }
      }
    });

    if (!users || users.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    const userIds = users.map(user => user.id);
    console.log(`[API] Found ${users.length} user records for address ${userAddress}: ${userIds.join(', ')}`);

    // Use the first user for metadata, but search across all user IDs
    const primaryUser = users[0];

    // APPROACH 1: Get all tokens owned by the user across all collections
    const ownedTokens = await prisma.evmCollectionToken.findMany({
      where: {
        ownerAddress: {
          equals: userAddress,
          mode: 'insensitive'
        },
        mintStatus: 'COMPLETED'
      },
      include: {
        landListing: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                evmAddress: true
              }
            }
          }
        }
      },
      orderBy: [
        { landListingId: 'asc' },
        { tokenId: 'asc' }
      ]
    });

    console.log(`[API] Found ${ownedTokens.length} owned tokens for user ${userAddress}`);

    // APPROACH 2: Get collections where user owns the main listing (collection creator/owner)
    const ownedCollectionListings = await prisma.landListing.findMany({
      where: {
        userId: {
          in: userIds
        },
        collectionId: {
          not: null
        }
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            evmAddress: true
          }
        }
      },
      orderBy: {
        collectionId: 'asc'
      }
    });

    console.log(`[API] Found ${ownedCollectionListings.length} collection listings owned by user ${userAddress}`);

    // Group by collection and build collection details
    const collectionsMap = new Map();

    // Process owned tokens first (higher priority)
    ownedTokens.forEach(token => {
      const listing = token.landListing;
      if (!listing || !listing.collectionId) return;

      const collectionId = listing.collectionId;
      
      if (!collectionsMap.has(collectionId)) {
        collectionsMap.set(collectionId, {
          collectionId,
          name: listing.nftTitle || `Collection ${collectionId}`,
          description: listing.nftDescription || '',
          image: listing.nftImageFileRef || '',
          totalSupply: listing.nftCollectionSize || 1,
          itemsOwned: 0,
          listedItems: 0,
          unlistedItems: 0,
          listings: [],
          mainTokenId: listing.mainTokenId,
          contractAddress: listing.contractAddress,
          createdAt: listing.createdAt,
          owner: listing.user,
          floorPrice: null,
          totalValue: 0,
          tokens: [],
          ownershipType: 'TOKEN_OWNER' // User owns individual tokens
        });
      }

      const collection = collectionsMap.get(collectionId);
      collection.itemsOwned += 1;
      
      // Track individual tokens
      collection.tokens.push({
        id: token.id,
        tokenId: token.tokenId,
        isListed: token.isListed,
        listingPrice: token.listingPrice || 0,
        tokenURI: token.tokenURI,
        ownerAddress: token.ownerAddress,
        createdAt: token.createdAt
      });

      // Add to listings array for backward compatibility
      collection.listings.push({
        id: token.id,
        mainTokenId: token.tokenId.toString(),
        isListed: token.isListed,
        listingPrice: token.listingPrice || 0,
        createdAt: token.createdAt
      });

      // Count listed/unlisted items
      if (token.isListed) {
        collection.listedItems += 1;
      } else {
        collection.unlistedItems += 1;
      }

      // Calculate floor price (lowest listing price)
      if (token.isListed && token.listingPrice && token.listingPrice > 0) {
        if (collection.floorPrice === null || token.listingPrice < collection.floorPrice) {
          collection.floorPrice = token.listingPrice;
        }
        collection.totalValue += token.listingPrice;
      }
    });

    // Process collection listings owned by user (collection creator/owner)
    ownedCollectionListings.forEach(listing => {
      const collectionId = listing.collectionId!;
      
      if (!collectionsMap.has(collectionId)) {
        collectionsMap.set(collectionId, {
          collectionId,
          name: listing.nftTitle || `Collection ${collectionId}`,
          description: listing.nftDescription || '',
          image: listing.nftImageFileRef || '',
          totalSupply: listing.nftCollectionSize || 1,
          itemsOwned: 1, // User owns the collection itself
          listedItems: listing.status === 'LISTED' ? 1 : 0,
          unlistedItems: listing.status !== 'LISTED' ? 1 : 0,
          listings: [],
          mainTokenId: listing.mainTokenId,
          contractAddress: listing.contractAddress,
          createdAt: listing.createdAt,
          owner: listing.user,
          floorPrice: listing.listingPrice || null,
          totalValue: listing.listingPrice || 0,
          tokens: [],
          ownershipType: 'COLLECTION_OWNER' // User owns the collection
        });
      }

      const collection = collectionsMap.get(collectionId);
      
      // Add to listings array
      collection.listings.push({
        id: listing.id,
        mainTokenId: listing.mainTokenId,
        isListed: listing.status === 'LISTED',
        listingPrice: listing.listingPrice || 0,
        createdAt: listing.createdAt
      });

      // Update floor price if this listing has a lower price
      if (listing.listingPrice && listing.listingPrice > 0) {
        if (collection.floorPrice === null || listing.listingPrice < collection.floorPrice) {
          collection.floorPrice = listing.listingPrice;
        }
        if (listing.status === 'LISTED') {
          collection.totalValue += listing.listingPrice;
        }
      }
    });

    // Convert map to array and prepare final response
    const ownedCollections = Array.from(collectionsMap.values()).map(collection => ({
      collectionId: collection.collectionId,
      mainTokenId: collection.mainTokenId,
      name: collection.name,
      description: collection.description,
      image: collection.image,
      totalSupply: collection.totalSupply,
      itemsOwned: collection.itemsOwned,
      listedItems: collection.listedItems,
      unlistedItems: collection.unlistedItems,
      floorPrice: collection.floorPrice,
      totalValue: collection.totalValue,
      contractAddress: collection.contractAddress,
      createdAt: collection.createdAt,
      owner: collection.owner,
      listings: collection.listings,
      tokens: collection.tokens,
      ownershipType: collection.ownershipType // Include ownership type for debugging
    }));

    console.log(`[API] Found ${ownedCollections.length} owned collections for user ${userAddress}`);

    return NextResponse.json({
      success: true,
      collections: ownedCollections,
      metadata: {
        totalCollections: ownedCollections.length,
        totalItemsOwned: ownedCollections.reduce((sum, col) => sum + col.itemsOwned, 0),
        totalListedItems: ownedCollections.reduce((sum, col) => sum + col.listedItems, 0),
        totalUnlistedItems: ownedCollections.reduce((sum, col) => sum + col.unlistedItems, 0),
        totalValue: ownedCollections.reduce((sum, col) => sum + col.totalValue, 0),
        tokenOwnershipCount: ownedCollections.filter(c => c.ownershipType === 'TOKEN_OWNER').length,
        collectionOwnershipCount: ownedCollections.filter(c => c.ownershipType === 'COLLECTION_OWNER').length
      }
    });

  } catch (error) {
    console.error('[API] Error fetching user owned collections:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch owned collections',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 