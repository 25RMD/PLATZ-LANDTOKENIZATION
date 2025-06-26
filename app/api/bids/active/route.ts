import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_address = searchParams.get('user_address');

    if (!user_address) {
      return NextResponse.json(
        { success: false, error: 'user_address is required' },
        { status: 400 }
      );
    }

    console.log(`[ACTIVE BIDS] Fetching active bids for user: ${user_address}`);

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
      console.log(`[ACTIVE BIDS] User not found for address: ${user_address}`);
      return NextResponse.json({
        success: true,
        bids: [],
        message: 'User not found'
      });
    }

    console.log(`[ACTIVE BIDS] Found user: ${user.id} (${user.username})`);

    // Find all ACTIVE bids where this user is involved (either as bidder or listing owner)
    const activeBids = await prisma.nft_bids.findMany({
      where: {
        bid_status: 'ACTIVE',
        OR: [
          // Bids made by this user (they are the bidder)
          {
            users: {
              evm_address: {
                equals: user_address,
                mode: 'insensitive'
              }
            }
          },
          // Bids received on listings owned by this user (they are the listing owner)
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
        users: {
          select: {
            id: true,
            username: true,
            evm_address: true
          }
        },
        land_listings: {
          include: {
            users: {
              select: {
                id: true,
                username: true,
                evm_address: true
              }
            }
          }
        }
      },
      orderBy: [
        {
          bid_amount: 'desc' // Highest bids first
        },
        {
          created_at: 'desc'
        }
      ]
    });

    console.log(`[ACTIVE BIDS] Found ${activeBids.length} active bids involving user`);

    // Format the response with additional context about the user's role
    const formattedBids = activeBids.map(bid => {
      const isBidder = bid.users.evm_address?.toLowerCase() === user_address.toLowerCase();
      const isListingOwner = bid.land_listings.users.evm_address?.toLowerCase() === user_address.toLowerCase();

      return {
        id: bid.id,
        bid_amount: bid.bid_amount,
        bid_status: bid.bid_status as 'ACTIVE',
        transaction_hash: bid.transaction_hash || '',
        created_at: bid.created_at.toISOString(),
        user_role: isBidder ? 'bidder' : 'listing_owner', // User's role in this bid
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
    const bidsMade = formattedBids.filter(bid => bid.user_role === 'bidder');
    const bidsReceived = formattedBids.filter(bid => bid.user_role === 'listing_owner');

    console.log(`[ACTIVE BIDS] User made ${bidsMade.length} active bids, received ${bidsReceived.length} active bids`);

    return NextResponse.json({
      success: true,
      bids: formattedBids,
      metadata: {
        user_found: !!user,
        total_active_bids: formattedBids.length,
        bids_made: bidsMade.length,
        bids_received: bidsReceived.length
      }
    });

  } catch (error) {
    console.error('[ACTIVE BIDS] Error fetching active bids:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch active bids',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );

} 