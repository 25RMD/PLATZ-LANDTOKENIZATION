import { NextRequest, NextResponse } from 'next/server';
import { getBidsByUser } from '@/lib/blockchain/bidAggregation';

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

    console.log(`[BLOCKCHAIN_USER_BIDS] Fetching blockchain-based user bids for user: ${user_address}`);

    // Use blockchain-based bid aggregation
    const userBids = await getBidsByUser(user_address);

    console.log(`[BLOCKCHAIN_USER_BIDS] Found ${userBids.length} bids made by user`);

    // Format response for frontend compatibility
    const formattedBids = userBids.map(bid => ({
      id: bid.id,
      bid_amount: bid.bidAmount,
      bid_status: bid.bidStatus,
      transaction_hash: bid.transactionHash,
      created_at: bid.createdAt,
      user_role: bid.userRole,
      token_id: bid.tokenId,
      current_owner: bid.currentOwner,
      bidder: bid.bidder,
      land_listing: bid.landListing
    }));

    // Calculate analytics
    const analytics = {
      total_bids: formattedBids.length,
      active_bids: formattedBids.filter(bid => bid.bid_status === 'ACTIVE').length,
      accepted_bids: formattedBids.filter(bid => bid.bid_status === 'ACCEPTED').length,
      withdrawn_bids: formattedBids.filter(bid => bid.bid_status === 'WITHDRAWN').length,
      outbid_count: formattedBids.filter(bid => bid.bid_status === 'OUTBID').length,
      total_bid_amount: formattedBids.reduce((sum, bid) => sum + bid.bid_amount, 0),
      average_bid_amount: formattedBids.length > 0 ? formattedBids.reduce((sum, bid) => sum + bid.bid_amount, 0) / formattedBids.length : 0,
      success_rate: formattedBids.length > 0 ? (formattedBids.filter(bid => bid.bid_status === 'ACCEPTED').length / formattedBids.length) * 100 : 0
    };

    return NextResponse.json({
      success: true,
      bids: formattedBids,
      analytics,
      metadata: {
        total_user_bids: formattedBids.length,
        user_address,
        data_source: 'blockchain',
        note: 'Token ownership verified via blockchain data'
      }
    });

  } catch (error) {
    console.error('[BLOCKCHAIN_USER_BIDS] Error fetching blockchain-based user bids:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch blockchain-based user bids',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 