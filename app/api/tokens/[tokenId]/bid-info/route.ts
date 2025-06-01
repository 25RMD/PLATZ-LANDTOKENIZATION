import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { tokenId: string } }
) {
  try {
    const resolvedParams = await params;
    const tokenId = parseInt(resolvedParams.tokenId);
    
    if (isNaN(tokenId)) {
      return NextResponse.json(
        { error: 'Invalid token ID' },
        { status: 400 }
      );
    }

    // Get current highest bid from database (reliable source)
    const dbBid = await prisma.nftBid.findFirst({
      where: {
        tokenId: tokenId,
        bidStatus: 'ACTIVE'
      },
      orderBy: {
        bidAmount: 'desc'
      },
      include: {
        bidder: {
          select: {
            evmAddress: true,
            username: true
          }
        }
      }
    });

    let currentBid: number | null = null;
    let bidder: any = null;
    
    if (dbBid) {
      currentBid = dbBid.bidAmount;
      bidder = {
        address: dbBid.bidder.evmAddress,
        username: dbBid.bidder.username
      };
    }

    // Calculate minimum bid
    const minimumBid = currentBid ? currentBid + 0.001 : 0.001;

    return NextResponse.json({
      tokenId,
      currentBid,
      minimumBid,
      bidder,
      hasActiveBid: currentBid !== null,
      source: 'database',
      lastUpdated: dbBid?.updatedAt || null,
      // Provide clear guidance for frontend
      status: currentBid ? 'has_bids' : 'no_bids',
      message: currentBid 
        ? `Current highest bid: ${currentBid} ETH. Minimum bid: ${minimumBid} ETH`
        : `No bids yet. Minimum bid: ${minimumBid} ETH`
    });

  } catch (error) {
    console.error(`Error getting bid info for token:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 