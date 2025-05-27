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

    // Find all completed/resolved bids where this user was involved (either as bidder or listing owner)
    // Excludes ACTIVE bids (those are shown in the Active Bids section)
    const resolvedBids = await prisma.nftBid.findMany({
      where: {
        bidStatus: {
          in: ['ACCEPTED', 'REJECTED', 'WITHDRAWN', 'OUTBID']
        },
        OR: [
          // Bids made by this user (they were the bidder)
          {
            bidder: {
              evmAddress: {
                equals: userAddress,
                mode: 'insensitive'
              }
            }
          },
          // Bids received on listings owned by this user (they were the listing owner)
          {
            landListing: {
              user: {
                evmAddress: {
                  equals: userAddress,
                  mode: 'insensitive'
                }
              }
            }
          }
        ]
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

    console.log(`[RECEIVED BIDS] Found ${resolvedBids.length} resolved bids involving user`);

    // Format the response with additional context about the user's role
    const formattedBids = resolvedBids.map(bid => {
      const isBidder = bid.bidder.evmAddress?.toLowerCase() === userAddress.toLowerCase();
      const isListingOwner = bid.landListing.user.evmAddress?.toLowerCase() === userAddress.toLowerCase();

      return {
        id: bid.id,
        bidAmount: bid.bidAmount,
        bidStatus: bid.bidStatus,
        transactionHash: bid.transactionHash || '',
        createdAt: bid.createdAt.toISOString(),
        userRole: isBidder ? 'bidder' : 'listing_owner', // User's role in this bid
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
      };
    });

    // Separate bids by user role and status for better organization
    const bidsMade = formattedBids.filter(bid => bid.userRole === 'bidder');
    const bidsReceived = formattedBids.filter(bid => bid.userRole === 'listing_owner');
    
    const statusCounts = formattedBids.reduce((acc, bid) => {
      acc[bid.bidStatus] = (acc[bid.bidStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log(`[RECEIVED BIDS] User made ${bidsMade.length} resolved bids, received ${bidsReceived.length} resolved bids`);

    return NextResponse.json({
      success: true,
      bids: formattedBids,
      metadata: {
        userFound: !!user,
        totalResolvedBids: formattedBids.length,
        bidsMade: bidsMade.length,
        bidsReceived: bidsReceived.length,
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