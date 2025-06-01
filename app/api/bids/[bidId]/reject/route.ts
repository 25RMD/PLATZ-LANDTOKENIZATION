import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { validateBidAcceptance } from '@/lib/bidValidation';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { bidId: string } }
) {
  try {
    const { bidId } = params;
    const { userAddress } = await request.json();

    if (!userAddress) {
      return NextResponse.json(
        { success: false, error: 'User address is required' },
        { status: 400 }
      );
    }

    // Get the bid details
    const bid = await prisma.nftBid.findUnique({
      where: { id: bidId },
      include: {
        landListing: true,
        bidder: true
      }
    });

    if (!bid) {
      return NextResponse.json(
        { success: false, error: 'Bid not found' },
        { status: 404 }
      );
    }

    if (bid.bidStatus !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Only active bids can be rejected' },
        { status: 400 }
      );
    }

    // Validate that the user can reject this bid (must be token owner)
    const validationResult = await validateBidAcceptance(bidId, userAddress);
    if (!validationResult.isValid) {
      return NextResponse.json(
        { success: false, error: validationResult.error },
        { status: 400 }
      );
    }

    // Update bid status to REJECTED
    const updatedBid = await prisma.nftBid.update({
      where: { id: bidId },
      data: {
        bidStatus: 'REJECTED',
        updatedAt: new Date()
      },
      include: {
        landListing: true,
        bidder: true
      }
    });

    // Track the bid rejection event for price analytics
    await prisma.collectionPriceHistory.create({
      data: {
        landListingId: bid.landListingId,
        priceType: 'BID_REJECTED',
        price: bid.bidAmount,
        bidId: bidId,
        metadata: {
          rejectedBy: userAddress,
          bidderAddress: bid.bidder.evmAddress,
          tokenId: bid.tokenId,
          transactionHash: bid.transactionHash
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Bid rejected successfully',
      bid: {
        id: updatedBid.id,
        bidAmount: updatedBid.bidAmount,
        bidStatus: updatedBid.bidStatus,
        transactionHash: updatedBid.transactionHash,
        tokenTitle: updatedBid.landListing.nftTitle,
        tokenId: updatedBid.tokenId,
        bidderAddress: updatedBid.bidder.evmAddress,
        bidderUsername: updatedBid.bidder.username
      }
    });

  } catch (error) {
    console.error('Error rejecting bid:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reject bid' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 