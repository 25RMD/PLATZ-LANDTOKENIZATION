import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { trackBidEvent } from '@/lib/priceTracking';
import { randomUUID } from 'crypto';
import { validateBidAmount, validateBidAmountFast } from '@/lib/bidSync';

// Schema for POST request validation
const createBidSchema = z.object({
  collection_id: z.string().min(1),
  token_id: z.string().min(1),
  bid_amount: z.number().positive(),
  transaction_hash: z.string().min(1),
  bidder_address: z.string().min(1) // EVM address of the bidder
});

// Schema for GET request query validation
const getBidsSchema = z.object({
  collection_id: z.string().nullable().optional(),
  token_id: z.string().nullable().optional(),
  user_address: z.string().nullable().optional(),
  status: z.enum(['ACTIVE', 'ACCEPTED', 'WITHDRAWN', 'OUTBID']).nullable().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createBidSchema.parse(body);

    // Validate bid amount against database state (fast validation)
    const tokenId = parseInt(validatedData.token_id);
    console.log(`🔍 [BID_API] Starting bid validation for token ${tokenId}...`);
    
    const bidValidation = await validateBidAmountFast(tokenId, validatedData.bid_amount);
    console.log(`[BID_API] Validation result:`, bidValidation);
    
    if (!bidValidation.valid) {
      console.log(`[BID_API] Bid rejected: ${bidValidation.message}`);
      return NextResponse.json(
        { 
          success: false, 
          message: bidValidation.message,
          current_bid: bidValidation.currentBid,
          minimum_bid: bidValidation.minimumBid
        },
        { status: 400 }
      );
    }

    console.log(`[BID_API] Bid validation passed, proceeding with creation...`);

    // Find user by EVM address
    const user = await prisma.users.findFirst({
      where: { evm_address: validatedData.bidder_address },
      select: { id: true }
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found. Please ensure you have an account with this wallet address.' },
        { status: 404 }
      );
    }
    
    const userId = user.id;

    // Find the land listing
    const landListing = await prisma.land_listings.findFirst({
      where: {
        collection_id: validatedData.collection_id
      }
    });

    if (!landListing) {
      return NextResponse.json(
        { success: false, message: 'Collection not found' },
        { status: 404 }
      );
    }

    // Mark any previous bids from this user as OUTBID
    const previousBidsUpdate = await prisma.nft_bids.updateMany({
      where: {
        land_listing_id: landListing.id,
        bidder_user_id: userId,
        bid_status: 'ACTIVE'
      },
      data: {
        bid_status: 'OUTBID'
      }
    });

    // Mark any lower bids as OUTBID
    const lowerBidsUpdate = await prisma.nft_bids.updateMany({
      where: {
        land_listing_id: landListing.id,
        bid_amount: {
          lt: validatedData.bid_amount
        },
        bid_status: 'ACTIVE'
      },
      data: {
        bid_status: 'OUTBID'
      }
    });

    // Create the new bid
    const bid = await prisma.nft_bids.create({
      data: {
        id: randomUUID(),
        land_listing_id: landListing.id,
        token_id: parseInt(validatedData.token_id),
        bidder_user_id: userId,
        bid_amount: validatedData.bid_amount,
        bid_status: 'ACTIVE',
        transaction_hash: validatedData.transaction_hash
      },
      include: {
        users: {
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
            collection_id: true
          }
        }
      }
    });

    // Track the bid placement event for price analytics
    await trackBidEvent(landListing.id, bid.id, validatedData.bid_amount, 'BID_PLACED');

    return NextResponse.json({
      success: true,
      bid
    });

  } catch (error) {
    console.error('Error creating bid:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid bid data', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );

}

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

    // First find the user by EVM address
    const user = await prisma.users.findFirst({
      where: {
        evm_address: {
          equals: user_address,
          mode: 'insensitive'
        }
      }
    });

    if (!user) {
      return NextResponse.json({
        success: true,
        bids: []
      });
    }

    // Fetch bids for the user
    const bids = await prisma.nft_bids.findMany({
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

    console.log(`Found ${bids.length} bids for user ${userAddress}`);

    return NextResponse.json({
      success: true,
      bids: bids
    });

  } catch (error) {
    console.error('Error fetching user bids:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bids' },
      { status: 500 }
    );
  }
} 