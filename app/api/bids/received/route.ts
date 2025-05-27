import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('userAddress');

    if (!userAddress) {
      return NextResponse.json(
        { success: false, error: 'User address is required' },
        { status: 400 }
      );
    }

    console.log(`[RECEIVED BIDS] Fetching completed/resolved bids for user: ${userAddress}`);

    // Find the user by EVM address
    const user = await prisma.user.findFirst({
      where: {
        evmAddress: {
          equals: userAddress,
          mode: 'insensitive'
        }
      }
    });

    if (!user) {
      console.log(`[RECEIVED BIDS] User not found for address: ${userAddress}`);
      return NextResponse.json({
        success: true,
        bids: [],
        message: 'User not found'
      });
    }

    console.log(`[RECEIVED BIDS] Found user: ${user.id} (${user.username})`);

    // Find only bids received on listings owned by this user (not bids they made)
    // Excludes ACTIVE bids (those are shown in the Active Bids section)
    const resolvedBids = await prisma.nftBid.findMany({
      where: {
        bidStatus: {
          in: ['ACCEPTED', 'REJECTED', 'WITHDRAWN', 'OUTBID']
        },
        // Only bids received on listings owned by this user
        landListing: {
          user: {
            evmAddress: {
              equals: userAddress,
              mode: 'insensitive'
            }
          }
        }
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
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`[RECEIVED BIDS] Found ${resolvedBids.length} resolved bids received by user`);

    // Format the response - these are all bids received on user's listings
    const formattedBids = resolvedBids.map(bid => ({
      id: bid.id,
      bidAmount: bid.bidAmount,
      bidStatus: bid.bidStatus,
      transactionHash: bid.transactionHash || '',
      createdAt: bid.createdAt.toISOString(),
      bidder: {
        id: bid.bidder.id,
        username: bid.bidder.username,
        evmAddress: bid.bidder.evmAddress
      },
      landListing: {
        id: bid.landListing.id,
        nftTitle: bid.landListing.nftTitle,
        collectionId: bid.landListing.collectionId,
        nftImageFileRef: bid.landListing.nftImageFileRef,
        owner: {
          id: bid.landListing.user.id,
          username: bid.landListing.user.username,
          evmAddress: bid.landListing.user.evmAddress
        }
      }
    }));
    
    const statusCounts = formattedBids.reduce((acc, bid) => {
      acc[bid.bidStatus] = (acc[bid.bidStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log(`[RECEIVED BIDS] User received ${formattedBids.length} resolved bids on their listings`);

    return NextResponse.json({
      success: true,
      bids: formattedBids,
      metadata: {
        userFound: !!user,
        totalReceivedBids: formattedBids.length,
        statusBreakdown: statusCounts
      }
    });

  } catch (error) {
    console.error('[RECEIVED BIDS] Error fetching received bids:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch received bids',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 