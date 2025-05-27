import { NextRequest, NextResponse } from 'next/server';
import { getActiveBidsForOwner } from '@/lib/blockchain/bidAggregation';

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

    console.log(`[BLOCKCHAIN_ACTIVE_BIDS] Fetching blockchain-based active bids for user: ${userAddress}`);

    // Use blockchain-based bid aggregation
    const activeBids = await getActiveBidsForOwner(userAddress);

    console.log(`[BLOCKCHAIN_ACTIVE_BIDS] Found ${activeBids.length} active bids on tokens owned by user`);
    console.log(`[BLOCKCHAIN_ACTIVE_BIDS] Active bids details:`, activeBids.map(bid => ({
      id: bid.id,
      tokenId: bid.tokenId,
      bidAmount: bid.bidAmount,
      bidStatus: bid.bidStatus,
      currentOwner: bid.currentOwner,
      bidder: bid.bidder.evmAddress
    })));

    // Format response for frontend compatibility
    const formattedBids = activeBids.map(bid => ({
      id: bid.id,
      bidAmount: bid.bidAmount,
      bidStatus: bid.bidStatus,
      transactionHash: bid.transactionHash,
      createdAt: bid.createdAt,
      userRole: bid.userRole,
      tokenId: bid.tokenId,
      currentOwner: bid.currentOwner,
      bidder: bid.bidder,
      landListing: bid.landListing
    }));

    return NextResponse.json({
      success: true,
      bids: formattedBids,
      metadata: {
        totalActiveBids: formattedBids.length,
        userAddress,
        dataSource: 'blockchain',
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