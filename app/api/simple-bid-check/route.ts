import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log(`[SIMPLE_BID_CHECK] Fetching raw bid data...`);

    const allBids = await prisma.nftBid.findMany({
      include: {
        bidder: {
          select: {
            username: true,
            evmAddress: true
          }
        },
        landListing: {
          select: {
            collectionId: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`[SIMPLE_BID_CHECK] Raw bids:`, allBids);

    return NextResponse.json({
      success: true,
      count: allBids.length,
      bids: allBids.map(bid => ({
        id: bid.id,
        tokenId: bid.tokenId,
        tokenIdType: typeof bid.tokenId,
        bidAmount: bid.bidAmount,
        bidStatus: bid.bidStatus,
        isTokenIdValid: bid.tokenId && bid.tokenId > 0,
        collectionId: bid.landListing.collectionId,
        bidder: bid.bidder.evmAddress,
        createdAt: bid.createdAt
      }))
    });

  } catch (error) {
    console.error('[SIMPLE_BID_CHECK] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 