import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('userAddress') || '0x3ec4bfe3167ba77A5906C034AABE5537BA7c4B07';

    console.log(`[TEST_BIDS] Testing with user: ${userAddress}`);

    // Test 1: Get all bids
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
      }
    });

    console.log(`[TEST_BIDS] Found ${allBids.length} total bids`);

    // Test 2: Filter for valid tokenIds
    const validBids = allBids.filter(bid => bid.tokenId && bid.tokenId > 0);
    console.log(`[TEST_BIDS] Found ${validBids.length} bids with valid tokenIds`);

    // Test 3: Check a specific token
    const testToken = await prisma.evmCollectionToken.findFirst({
      where: {
        tokenId: 104,
        landListing: {
          collectionId: '16'
        }
      },
      include: {
        landListing: {
          select: {
            collectionId: true
          }
        }
      }
    });

    console.log(`[TEST_BIDS] Test token 104 in collection 16:`, testToken ? {
      tokenId: testToken.tokenId,
      ownerAddress: testToken.ownerAddress,
      collectionId: testToken.landListing?.collectionId
    } : 'Not found');

    return NextResponse.json({
      success: true,
      data: {
        totalBids: allBids.length,
        validBids: validBids.length,
        testToken: testToken ? {
          tokenId: testToken.tokenId,
          ownerAddress: testToken.ownerAddress,
          collectionId: testToken.landListing?.collectionId
        } : null,
        bids: validBids.map(bid => ({
          id: bid.id,
          tokenId: bid.tokenId,
          bidStatus: bid.bidStatus,
          bidAmount: bid.bidAmount,
          collectionId: bid.landListing.collectionId,
          bidder: bid.bidder.evmAddress
        }))
      }
    });

  } catch (error) {
    console.error('[TEST_BIDS] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 