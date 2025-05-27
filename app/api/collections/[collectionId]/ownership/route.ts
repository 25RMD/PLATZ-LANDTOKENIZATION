import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collectionId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('userAddress');

    if (!userAddress) {
      return NextResponse.json({
        success: false,
        error: 'User address is required'
      }, { status: 400 });
    }

    const resolvedParams = await params;
    const collectionId = resolvedParams.collectionId;
    console.log(`[TOKEN OWNERSHIP] Checking individual token ownership for collection ${collectionId} and user ${userAddress}`);

    // Find the collection to get collection details
    const collection = await prisma.landListing.findFirst({
      where: {
        collectionId: collectionId
      },
      include: {
        evmCollectionTokens: {
          where: {
            mintStatus: 'COMPLETED'
          },
          orderBy: {
            tokenId: 'asc'
          }
        }
      }
    });

    if (!collection) {
      return NextResponse.json({
        success: false,
        error: 'Collection not found'
      }, { status: 404 });
    }

    // Check ownership for each token in the collection
    const ownedTokens = await prisma.evmCollectionToken.findMany({
      where: {
        landListingId: collection.id,
        ownerAddress: {
          equals: userAddress,
          mode: 'insensitive'
        },
        mintStatus: 'COMPLETED'
      },
      select: {
        id: true,
        tokenId: true,
        ownerAddress: true,
        isListed: true,
        listingPrice: true,
        tokenURI: true,
        createdAt: true
      },
      orderBy: {
        tokenId: 'asc'
      }
    });

    console.log(`[TOKEN OWNERSHIP] Found ${ownedTokens.length} tokens owned by user in collection ${collectionId}`);

    // Get all tokens in the collection for context
    const allTokens = collection.evmCollectionTokens.map(token => ({
      tokenId: token.tokenId,
      isOwned: ownedTokens.some(owned => owned.tokenId === token.tokenId),
      ownerAddress: token.ownerAddress,
      isListed: token.isListed,
      listingPrice: token.listingPrice || 0
    }));

    return NextResponse.json({
      success: true,
      data: {
        collectionId: collectionId,
        collectionName: collection.nftTitle,
        totalTokens: collection.evmCollectionTokens.length,
        ownedTokens: ownedTokens.map(token => ({
          tokenId: token.tokenId,
          ownerAddress: token.ownerAddress,
          isListed: token.isListed,
          listingPrice: token.listingPrice || 0,
          tokenURI: token.tokenURI,
          createdAt: token.createdAt
        })),
        allTokens: allTokens,
        ownership: {
          totalOwned: ownedTokens.length,
          totalInCollection: collection.evmCollectionTokens.length,
          ownershipPercentage: collection.evmCollectionTokens.length > 0 
            ? (ownedTokens.length / collection.evmCollectionTokens.length) * 100 
            : 0,
          ownedTokenIds: ownedTokens.map(token => token.tokenId.toString())
        }
      }
    });

  } catch (error) {
    console.error('[TOKEN OWNERSHIP] Error checking token ownership:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check token ownership',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 