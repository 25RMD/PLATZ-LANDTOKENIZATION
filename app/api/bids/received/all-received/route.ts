import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_address = searchParams.get('user_address');

    if (!user_address) {
      return NextResponse.json(
        { success: false, error: 'User address is required' },
        { status: 400 }
      );
    }

    console.log(`[ALL_BIDS] Fetching all resolved bids for user: ${user_address}`);

    // Find the user by EVM address
    const user = await prisma.users.findFirst({
      where: {
        evm_address: {
          equals: user_address,
          mode: 'insensitive'
        }
      }
    });

    if (!user) {
      console.log(`[ALL_BIDS] User not found for address: ${user_address}`);
      return NextResponse.json({
        success: true,
        bids: [],
        message: 'User not found'
      });
    }

    console.log(`[ALL_BIDS] Found user: ${user.id} (${user.username})`);

    // Find all completed/resolved bids where this user was involved (either as bidder or listing owner)
    // Excludes ACTIVE bids
    const resolvedBids = await prisma.nft_bids.findMany({
      where: {
        bid_status: {
          in: ['ACCEPTED', 'REJECTED', 'WITHDRAWN', 'OUTBID']
        },
        OR: [
          // Bids made by this user (they were the bidder)
          {
            users: {
              evm_address: {
                equals: user_address,
                mode: 'insensitive'
              }
            }
          },
          // Bids received on listings owned by this user (they were the listing owner)
          {
            land_listings: {
              users: {
                evm_address: {
                  equals: user_address,
                  mode: 'insensitive'
                }
              }
            }
          }
        ]
      },
      include: {
        users: { // Bidder
          select: {
            id: true,
            username: true,
            evm_address: true
          }
        },
        land_listings: {
          include: {
            users: { // Owner
              select: {
                id: true,
                username: true,
                evm_address: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    console.log(`[ALL_BIDS] Found ${resolvedBids.length} resolved bids involving user`);

    // Format the response with additional context about the user's role
    const formatted_bids = resolvedBids.map(bid => {
      const is_bidder = bid.users.evm_address?.toLowerCase() === user_address.toLowerCase();

      return {
        id: bid.id,
        bid_amount: bid.bid_amount,
        bid_status: bid.bid_status,
        transaction_hash: bid.transaction_hash || '',
        created_at: bid.created_at.toISOString(),
        user_role: is_bidder ? 'bidder' : 'listing_owner',
        bidder: {
          id: bid.users.id,
          username: bid.users.username,
          evm_address: bid.users.evm_address
        },
        land_listing: {
          id: bid.land_listings.id,
          nft_title: bid.land_listings.nft_title,
          collection_id: bid.land_listings.collection_id,
          nft_image_file_ref: bid.land_listings.nft_image_file_ref,
          owner: {
            id: bid.land_listings.users.id,
            username: bid.land_listings.users.username,
            evm_address: bid.land_listings.users.evm_address
          }
        }
      };
    });

    // Separate bids by user role for better organization
    const bids_made = formatted_bids.filter(bid => bid.user_role === 'bidder');
    const bids_received = formatted_bids.filter(bid => bid.user_role === 'listing_owner');
    
    const status_counts = formatted_bids.reduce((acc, bid) => {
      acc[bid.bid_status] = (acc[bid.bid_status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log(`[ALL_BIDS] User made ${bids_made.length} resolved bids, received ${bids_received.length} resolved bids`);

    return NextResponse.json({
      success: true,
      bids: formatted_bids,
      metadata: {
        user_found: !!user,
        total_resolved_bids: formatted_bids.length,
        bids_made: bids_made.length,
        bids_received: bids_received.length,
        status_breakdown: status_counts
      }
    });

  } catch (error) {
    console.error('[ALL_BIDS] Error fetching all resolved bids:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch all resolved bids',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 