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

    console.log(`[RECEIVED BIDS] Fetching completed/resolved bids for user: ${user_address}`);

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
      console.log(`[RECEIVED BIDS] User not found for address: ${user_address}`);
      return NextResponse.json({
        success: true,
        bids: [],
        message: 'User not found'
      });
    }

    console.log(`[RECEIVED BIDS] Found user: ${user.id} (${user.username})`);

    // Find only bids received on listings owned by this user (not bids they made)
    // Excludes ACTIVE bids (those are shown in the Active Bids section)
    const resolvedBids = await prisma.nft_bids.findMany({
      where: {
        bid_status: {
          in: ['ACCEPTED', 'REJECTED', 'WITHDRAWN', 'OUTBID']
        },
        // Only bids received on listings owned by this user
        land_listings: {
          users: {
            evm_address: {
              equals: user_address,
              mode: 'insensitive'
            }
          }
        }
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

    console.log(`[RECEIVED BIDS] Found ${resolvedBids.length} resolved bids received by user`);

    // Format the response - these are all bids received on user's listings
    const formatted_bids = resolvedBids.map(bid => ({
      id: bid.id,
      bid_amount: bid.bid_amount,
      bid_status: bid.bid_status,
      transaction_hash: bid.transaction_hash || '',
      created_at: bid.created_at.toISOString(),
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
    }));
    
    const status_counts = formatted_bids.reduce((acc, bid) => {
      acc[bid.bid_status] = (acc[bid.bid_status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log(`[RECEIVED BIDS] User received ${formatted_bids.length} resolved bids on their listings`);

    return NextResponse.json({
      success: true,
      bids: formatted_bids,
      metadata: {
        user_found: !!user,
        total_received_bids: formatted_bids.length,
        status_breakdown: status_counts
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
  }
} 