import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateBidAcceptance } from '@/lib/bidValidation';
import { randomUUID } from 'crypto';

export async function POST(
  request: NextRequest,
  { params }: { params: { bidId: string } }
) {
  try {
    const { bidId } = params;
    const { user_address } = await request.json();

    if (!user_address) {
      return NextResponse.json(
        { success: false, error: 'User address is required' },
        { status: 400 }
      );
    }

    // Get the bid details
    const bid = await prisma.nft_bids.findUnique({
      where: { id: bidId },
      include: {
        land_listings: true,
        users: true
      }
    });

    if (!bid) {
      return NextResponse.json(
        { success: false, error: 'Bid not found' },
        { status: 404 }
      );
    }

    if (bid.bid_status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Only active bids can be rejected' },
        { status: 400 }
      );
    }

    // Validate that the user can reject this bid (must be token owner)
    const validationResult = await validateBidAcceptance(bidId, user_address);
    if (!validationResult.isValid) {
      return NextResponse.json(
        { success: false, error: validationResult.error },
        { status: 400 }
      );
    }

    // Update bid status to REJECTED
    const updatedBid = await prisma.nft_bids.update({
      where: { id: bidId },
      data: {
        bid_status: 'REJECTED',
        updated_at: new Date()
      },
      include: {
        land_listings: true,
        users: true
      }
    });

    // Track the bid rejection event for price analytics
    await prisma.collection_price_histories.create({
            data: {
        id: randomUUID(),
        land_listing_id: bid.land_listing_id,
        price_type: 'BID_REJECTED',
        price: bid.bid_amount,
        bid_id: bidId,
        metadata: {
          rejected_by: user_address,
          bidder_address: bid.users.evm_address,
          token_id: bid.token_id,
          transaction_hash: bid.transaction_hash
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Bid rejected successfully',
      bid: {
        id: updatedBid.id,
        bid_amount: updatedBid.bid_amount,
        bid_status: updatedBid.bid_status,
        transaction_hash: updatedBid.transaction_hash,
        token_title: updatedBid.land_listings.nft_title,
        token_id: updatedBid.token_id,
        bidder_address: updatedBid.users.evm_address,
        bidder_username: updatedBid.users.username
      }
    });

  } catch (error) {
    console.error('Error rejecting bid:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reject bid' },
      { status: 500 }
    );
  }
} 