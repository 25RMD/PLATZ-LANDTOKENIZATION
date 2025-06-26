import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { validateBidPlacement } from '@/lib/bidValidation';

// Schema for validation
const placeBidSchema = z.object({
  land_listing_id: z.string().min(1),
  token_id: z.number().int().min(0),
  bid_amount: z.number().positive(),
  bidder_address: z.string().min(1),
  transaction_hash: z.string().min(1)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = placeBidSchema.parse(body);

    console.log(`[BID_PLACEMENT] Validating bid placement for token ${validatedData.token_id}`);

    // Validate the bid placement using our enhanced validation system
    const validationResult = await validateBidPlacement(
      validatedData.land_listing_id,
      validatedData.token_id,
      validatedData.bidder_address
    );

    if (!validationResult.isValid) {
      console.log(`[BID_PLACEMENT] Validation failed: ${validationResult.error}`);
      return NextResponse.json(
        { success: false, message: validationResult.error },
        { status: 400 }
      );
    }

    // Find the bidder user
    const bidder = await prisma.users.findFirst({
      where: {
        evm_address: {
          equals: validatedData.bidder_address,
          mode: 'insensitive'
        }
      }
    });

    if (!bidder) {
      return NextResponse.json(
        { success: false, message: 'Bidder user not found. Please ensure you have an account.' },
        { status: 400 }
      );
    }

    // Check for existing active bid from this user on this token
    const existingBid = await prisma.nft_bids.findFirst({
      where: {
        land_listing_id: validatedData.land_listing_id,
        token_id: validatedData.token_id,
        bidder_user_id: bidder.id,
        bid_status: 'ACTIVE'
      }
    });

    if (existingBid) {
      // Update existing bid instead of creating a new one
      const updatedBid = await prisma.nft_bids.update({
        where: { id: existingBid.id },
        data: {
          bid_amount: validatedData.bid_amount,
          transaction_hash: validatedData.transaction_hash,
          updated_at: new Date()
        },
        include: {
          users: { // Corresponds to 'bidder'
            select: {
              id: true,
              username: true,
              evm_address: true
            }
          },
          land_listings: { // Corresponds to 'landListing'
            select: {
              id: true,
              nft_title: true,
              collection_id: true
            }
          }
        }
      });

      console.log(`[BID_PLACEMENT] Updated existing bid ${existingBid.id} with new amount ${validatedData.bid_amount} ETH`);

      return NextResponse.json({
        success: true,
        bid: updatedBid,
        message: 'Bid updated successfully',
        is_update: true
      });
    }

    // Create new bid
    const newBid = await prisma.nft_bids.create({
      data: {
        land_listing_id: validatedData.land_listing_id,
        token_id: validatedData.token_id,
        bidder_user_id: bidder.id,
        bid_amount: validatedData.bid_amount,
        bid_status: 'ACTIVE',
        transaction_hash: validatedData.transaction_hash
      },
      include: {
        users: { // Corresponds to 'bidder'
          select: {
            id: true,
            username: true,
            evm_address: true
          }
        },
        land_listings: { // Corresponds to 'landListing'
          select: {
            id: true,
            nft_title: true,
            collection_id: true
          }
        }
      }
    });

    console.log(`[BID_PLACEMENT] Created new bid ${newBid.id} for ${validatedData.bid_amount} ETH on token ${validatedData.token_id}`);

    // Mark any lower bids from other users as OUTBID
    await prisma.nft_bids.updateMany({
      where: {
        land_listing_id: validatedData.land_listing_id,
        token_id: validatedData.token_id,
        bid_amount: {
          lt: validatedData.bid_amount
        },
        bid_status: 'ACTIVE',
        id: {
          not: newBid.id
        }
      },
      data: {
        bid_status: 'OUTBID'
      }
    });

    return NextResponse.json({
      success: true,
      bid: newBid,
      message: 'Bid placed successfully',
      current_owner: validationResult.currentOwner
    });

  } catch (error) {
    console.error('Error placing bid:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid request data', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 