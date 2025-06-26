import { NextRequest, NextResponse } from 'next/server';
import { getActiveBidsForOwner } from '@/lib/blockchain/bidAggregation';

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

    console.log(`[BLOCKCHAIN_ACTIVE_BIDS] Fetching blockchain-based active bids for user: ${user_address}`);

    // Use blockchain-based bid aggregation
    const activeBids = await getActiveBidsForOwner(user_address);

    console.log(`[BLOCKCHAIN_ACTIVE_BIDS] Found ${activeBids.length} active bids on tokens owned by user`);
    console.log(`[BLOCKCHAIN_ACTIVE_BIDS] Active bids details:`, activeBids.map(bid => ({
      id: bid.id,
      token_id: bid.tokenId,
      bid_amount: bid.bidAmount,
      bid_status: bid.bidStatus,
      current_owner: bid.currentOwner,
      bidder: bid.bidder.evmAddress
    })));

    // Format response for frontend compatibility
    const formattedBids = activeBids.map(bid => ({
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

    return NextResponse.json({
      success: true,
      bids: formattedBids,
      metadata: {
        total_active_bids: formattedBids.length,
        user_address,
        data_source: 'blockchain',
        note: 'Ownership verified via blockchain data'
      }
    });

  } catch (error) {
    console.error('[BLOCKCHAIN_ACTIVE_BIDS] Error fetching blockchain-based active bids:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch blockchain-based active bids',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 