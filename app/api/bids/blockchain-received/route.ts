import { NextRequest, NextResponse } from 'next/server';
import { getAllBidsReceivedByOwner } from '@/lib/blockchain/bidAggregation';

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

    console.log(`[BLOCKCHAIN_RECEIVED_BIDS] Fetching blockchain-based received bids for user: ${userAddress}`);

    // Use blockchain-based bid aggregation
    const receivedBids = await getAllBidsReceivedByOwner(userAddress);

    console.log(`[BLOCKCHAIN_RECEIVED_BIDS] Found ${receivedBids.length} bids received on tokens owned by user`);

    // Format response for frontend compatibility
    const formattedBids = receivedBids.map(bid => ({
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

    // Calculate analytics
    const analytics = {
      totalReceived: formattedBids.length,
      activeReceived: formattedBids.filter(bid => bid.bidStatus === 'ACTIVE').length,
      acceptedReceived: formattedBids.filter(bid => bid.bidStatus === 'ACCEPTED').length,
      withdrawnReceived: formattedBids.filter(bid => bid.bidStatus === 'WITHDRAWN').length,
      outbidReceived: formattedBids.filter(bid => bid.bidStatus === 'OUTBID').length,
      totalValue: formattedBids.reduce((sum, bid) => sum + bid.bidAmount, 0),
      averageBidValue: formattedBids.length > 0 ? formattedBids.reduce((sum, bid) => sum + bid.bidAmount, 0) / formattedBids.length : 0,
      uniqueBidders: new Set(formattedBids.map(bid => bid.bidder.evmAddress).filter(Boolean)).size
    };

    return NextResponse.json({
      success: true,
      bids: formattedBids,
      analytics,
      metadata: {
        totalReceivedBids: formattedBids.length,
        userAddress,
        dataSource: 'blockchain',
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