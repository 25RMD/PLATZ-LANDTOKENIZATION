import { NextRequest, NextResponse } from 'next/server';
import { getAllBidsReceivedByOwner } from '@/lib/blockchain/bidAggregation';

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

    console.log(`[BLOCKCHAIN_RECEIVED_BIDS] Fetching blockchain-based received bids for user: ${user_address}`);

    // Use blockchain-based bid aggregation
    const receivedBids = await getAllBidsReceivedByOwner(user_address);

    console.log(`[BLOCKCHAIN_RECEIVED_BIDS] Found ${receivedBids.length} bids received on tokens owned by user`);

    // Format response for frontend compatibility
    const formattedBids = receivedBids.map(bid => ({
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
      total_received: formattedBids.length,
      active_received: formattedBids.filter(bid => bid.bid_status === 'ACTIVE').length,
      accepted_received: formattedBids.filter(bid => bid.bid_status === 'ACCEPTED').length,
      withdrawn_received: formattedBids.filter(bid => bid.bid_status === 'WITHDRAWN').length,
      outbid_received: formattedBids.filter(bid => bid.bid_status === 'OUTBID').length,
      total_value: formattedBids.reduce((sum, bid) => sum + bid.bid_amount, 0),
      average_bid_value: formattedBids.length > 0 ? formattedBids.reduce((sum, bid) => sum + bid.bid_amount, 0) / formattedBids.length : 0,
      unique_bidders: new Set(formattedBids.map(bid => bid.bidder.evmAddress).filter(Boolean)).size
    };

    return NextResponse.json({
      success: true,
      bids: formattedBids,
      analytics,
      metadata: {
        total_received_bids: formattedBids.length,
        user_address,
        data_source: 'blockchain',
        note: 'Ownership verified via blockchain data'
      }
    });

  } catch (error) {
    console.error('[BLOCKCHAIN_RECEIVED_BIDS] Error fetching blockchain-based received bids:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch blockchain-based received bids',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 