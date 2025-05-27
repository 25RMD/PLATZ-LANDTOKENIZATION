import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log(`[RAW_BID_TEST] Testing raw Prisma query...`);

    // Get the raw result without any transformation
    const rawBids = await prisma.nftBid.findMany({
      take: 1,
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`[RAW_BID_TEST] Raw Prisma result:`, rawBids);

    if (rawBids.length > 0) {
      const firstBid = rawBids[0];
      console.log(`[RAW_BID_TEST] First bid fields:`, Object.keys(firstBid));
      console.log(`[RAW_BID_TEST] First bid tokenId:`, firstBid.tokenId);
    }

    return NextResponse.json({
      success: true,
      count: rawBids.length,
      rawBids,
      firstBidKeys: rawBids.length > 0 ? Object.keys(rawBids[0]) : []
    });

  } catch (error) {
    console.error('[RAW_BID_TEST] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 