import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Define types for our queries to avoid 'any'
type NftBidWithDetails = Prisma.nft_bidsGetPayload<{
  include: {
    land_listings: {
      select: {
        id: true,
        nft_title: true,
        collection_id: true,
        nft_image_file_ref: true
      }
    }
  }
}>;

type ReceivedBidWithDetails = Prisma.nft_bidsGetPayload<{
  include: {
    users: { // bidder
      select: {
        id: true,
        username: true,
        evm_address: true
      }
    },
    land_listings: {
      select: {
        id: true,
        nft_title: true,
        collection_id: true,
        nft_image_file_ref: true
      }
    }
  }
}>;

type BidTransactionWithDetails = Prisma.nft_transactionsGetPayload<{
  include: {
    land_listings: {
      select: {
        id: true,
        nft_title: true,
        collection_id: true,
        nft_image_file_ref: true
      }
    }
  }
}>;


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

    console.log(`Fetching bid history for user: ${user_address}`);

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
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get all bids made by the user (both active and historical)
    const userBids: NftBidWithDetails[] = await prisma.nft_bids.findMany({
      where: {
        bidder_user_id: user.id
      },
      include: {
        land_listings: {
          select: {
            id: true,
            nft_title: true,
            collection_id: true,
            nft_image_file_ref: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Get all transactions where user was involved in bid-related activities
    const bidTransactions: BidTransactionWithDetails[] = await prisma.nft_transactions.findMany({
      where: {
        OR: [
          {
            from_address: {
              equals: user_address,
              mode: 'insensitive'
            },
            transaction_type: {
              in: ['BID_ACCEPTED', 'BID_PLACED']
            }
          },
          {
            to_address: {
              equals: user_address,
              mode: 'insensitive'
            },
            transaction_type: {
              in: ['BID_ACCEPTED', 'BID_PLACED']
            }
          }
        ]
      },
      include: {
        land_listings: {
          select: {
            id: true,
            nft_title: true,
            collection_id: true,
            nft_image_file_ref: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Get bids received on user's listings
    const receivedBids: ReceivedBidWithDetails[] = await prisma.nft_bids.findMany({
      where: {
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
        users: { // bidder
          select: {
            id: true,
            username: true,
            evm_address: true
          }
        },
        land_listings: {
          select: {
            id: true,
            nft_title: true,
            collection_id: true,
            nft_image_file_ref: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Combine and format all history items with deduplication
    const historyItems: any[] = [];
    const processedBids = new Set<string>();
    const processedTransactions = new Set<string>();

    // Add user's bids (only if not already processed via transactions)
    userBids.forEach(bid => {
      const bidKey = `bid-${bid.id}`;
      if (!processedBids.has(bidKey)) {
        processedBids.add(bidKey);
        
        let description = `You placed a bid of ${bid.bid_amount} ETH`;
        let type = 'BID_PLACED';
        
        // If bid is accepted, show it as accepted rather than just placed
        if (bid.bid_status === 'ACCEPTED') {
          description = `Your bid of ${bid.bid_amount} ETH was accepted`;
          type = 'BID_ACCEPTED';
        }
        
        historyItems.push({
          id: bidKey,
          type,
          status: bid.bid_status,
          amount: bid.bid_amount,
          transaction_hash: bid.transaction_hash,
          created_at: bid.created_at.toISOString(),
          updated_at: bid.updated_at.toISOString(),
          description,
          land_listing: bid.land_listings,
          is_user_action: true,
          bid_id: bid.id
        });
      }
    });

    // Add received bids (only if not already processed)
    receivedBids.forEach(bid => {
      const bidKey = `received-bid-${bid.id}`;
      if (!processedBids.has(bidKey)) {
        processedBids.add(bidKey);
        
        let description = `${bid.users.username || 'Anonymous'} placed a bid of ${bid.bid_amount} ETH on your listing`;
        let type = 'BID_RECEIVED';
        
        // If bid is accepted, show it as accepted
        if (bid.bid_status === 'ACCEPTED') {
          description = `You accepted a bid of ${bid.bid_amount} ETH from ${bid.users.username || 'Anonymous'}`;
          type = 'BID_ACCEPTED';
        }
        
        historyItems.push({
          id: bidKey,
          type,
          status: bid.bid_status,
          amount: bid.bid_amount,
          transaction_hash: bid.transaction_hash,
          created_at: bid.created_at.toISOString(),
          updated_at: bid.updated_at.toISOString(),
          description,
          land_listing: bid.land_listings,
          is_user_action: false,
          bidder: bid.users,
          bid_id: bid.id
        });
      }
    });

    // Add bid-related transactions (only unique ones not covered by bids)
    bidTransactions.forEach(transaction => {
      const transactionKey = `transaction-${transaction.id}`;
      if (!processedTransactions.has(transactionKey)) {
        processedTransactions.add(transactionKey);
        
        const isUserSender = transaction.from_address.toLowerCase() === user_address.toLowerCase();
        const isUserReceiver = transaction.to_address.toLowerCase() === user_address.toLowerCase();
        
        let description = '';
        let shouldInclude = true;
        
        if (transaction.transaction_type === 'BID_ACCEPTED') {
          // Only include BID_ACCEPTED transactions if they're not already covered by bid status
          const correspondingBid = [...userBids, ...receivedBids].find(bid => 
            bid.land_listing_id === transaction.land_listing_id && 
            bid.bid_amount === transaction.price &&
            bid.bid_status === 'ACCEPTED'
          );
          
          if (!correspondingBid) {
            if (isUserSender) {
              description = `You accepted a bid of ${transaction.price} ETH`;
            } else {
              description = `Your bid of ${transaction.price} ETH was accepted`;
            }
          } else {
            shouldInclude = false; // Skip as it's already covered by the bid entry
          }
        } else if (transaction.transaction_type === 'BID_PLACED') {
          // Only include BID_PLACED transactions if they're not already covered by bids
          const correspondingBid = userBids.find(bid => 
            bid.land_listing_id === transaction.land_listing_id && 
            bid.bid_amount === transaction.price &&
            bid.transaction_hash === transaction.transaction_hash
          );
          
          if (!correspondingBid) {
            description = `Bid placed for ${transaction.price} ETH`;
          } else {
            shouldInclude = false; // Skip as it's already covered by the bid entry
          }
        }

        if (shouldInclude && description) {
          historyItems.push({
            id: transactionKey,
            type: transaction.transaction_type,
            status: 'COMPLETED',
            amount: transaction.price,
            transaction_hash: transaction.transaction_hash,
            created_at: transaction.created_at.toISOString(),
            updated_at: transaction.created_at.toISOString(),
            description,
            land_listing: transaction.land_listings,
            is_user_action: isUserSender,
            from_address: transaction.from_address,
            to_address: transaction.to_address
          });
        }
      }
    });

    // Sort all items by creation date (newest first)
    historyItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    console.log(`Found ${historyItems.length} history items for user ${user_address}`);

    return NextResponse.json({
      success: true,
      history: historyItems,
      summary: {
        total_bids_placed: userBids.length,
        total_bids_received: receivedBids.length,
        total_transactions: bidTransactions.length,
        active_bids: userBids.filter(bid => bid.bid_status === 'ACTIVE').length,
        accepted_bids: userBids.filter(bid => bid.bid_status === 'ACCEPTED').length,
        withdrawn_bids: userBids.filter(bid => bid.bid_status === 'WITHDRAWN').length
      }
    });

  } catch (error) {
    console.error('Error fetching bid history:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch bid history',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
