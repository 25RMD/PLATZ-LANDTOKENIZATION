import { NextRequest, NextResponse } from 'next/server';
import { getBidsByUser } from '@/lib/blockchain/bidAggregation';

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

    console.log(`[BLOCKCHAIN_USER_BIDS] Fetching blockchain-based user bids for user: ${userAddress}`);

    // Use blockchain-based bid aggregation
    const userBids = await getBidsByUser(userAddress);

    console.log(`[BLOCKCHAIN_USER_BIDS] Found ${userBids.length} bids made by user`);

    // Format response for frontend compatibility
    const formattedBids = userBids.map(bid => ({
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
      totalBids: formattedBids.length,
      activeBids: formattedBids.filter(bid => bid.bidStatus === 'ACTIVE').length,
      acceptedBids: formattedBids.filter(bid => bid.bidStatus === 'ACCEPTED').length,
      withdrawnBids: formattedBids.filter(bid => bid.bidStatus === 'WITHDRAWN').length,
      outbidCount: formattedBids.filter(bid => bid.bidStatus === 'OUTBID').length,
      totalBidAmount: formattedBids.reduce((sum, bid) => sum + bid.bidAmount, 0),
      averageBidAmount: formattedBids.length > 0 ? formattedBids.reduce((sum, bid) => sum + bid.bidAmount, 0) / formattedBids.length : 0,
      successRate: formattedBids.length > 0 ? (formattedBids.filter(bid => bid.bidStatus === 'ACCEPTED').length / formattedBids.length) * 100 : 0
    };

    return NextResponse.json({
      success: true,
      bids: formattedBids,
      analytics,
      metadata: {
        totalUserBids: formattedBids.length,
        userAddress,
        dataSource: 'blockchain',
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