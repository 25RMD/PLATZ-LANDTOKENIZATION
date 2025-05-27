import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { trackBidEvent } from '@/lib/priceTracking';

const prisma = new PrismaClient();

// Schema for POST request validation
const createBidSchema = z.object({
  collectionId: z.string().min(1),
  tokenId: z.string().min(1),
  bidAmount: z.number().positive(),
  transactionHash: z.string().min(1),
  bidderAddress: z.string().min(1) // EVM address of the bidder
});

// Schema for GET request query validation
const getBidsSchema = z.object({
  collectionId: z.string().nullable().optional(),
  tokenId: z.string().nullable().optional(),
  userAddress: z.string().nullable().optional(),
  status: z.enum(['ACTIVE', 'ACCEPTED', 'WITHDRAWN', 'OUTBID']).nullable().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createBidSchema.parse(body);

    // Find user by EVM address
    const user = await prisma.user.findFirst({
      where: { evmAddress: validatedData.bidderAddress },
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
    const landListing = await prisma.landListing.findFirst({
      where: {
        collectionId: validatedData.collectionId
      }
    });

    if (!landListing) {
      return NextResponse.json(
        { success: false, message: 'Collection not found' },
        { status: 404 }
      );
    }

    // Mark any previous bids from this user as OUTBID
    await prisma.nftBid.updateMany({
      where: {
        landListingId: landListing.id,
        bidderUserId: userId,
        bidStatus: 'ACTIVE'
      },
      data: {
        bidStatus: 'OUTBID'
      }
    });

    // Mark any lower bids as OUTBID
    await prisma.nftBid.updateMany({
      where: {
        landListingId: landListing.id,
        bidAmount: {
          lt: validatedData.bidAmount
        },
        bidStatus: 'ACTIVE'
      },
      data: {
        bidStatus: 'OUTBID'
      }
    });

    // Create the new bid
    const bid = await prisma.nftBid.create({
      data: {
        landListingId: landListing.id,
        tokenId: parseInt(validatedData.tokenId),
        bidderUserId: userId,
        bidAmount: validatedData.bidAmount,
        bidStatus: 'ACTIVE',
        transactionHash: validatedData.transactionHash
      },
      include: {
        bidder: {
          select: {
            id: true,
            username: true,
            evmAddress: true
          }
        },
        landListing: {
          select: {
            id: true,
            nftTitle: true,
            collectionId: true
          }
        }
      }
    });

    // Track the bid placement event for price analytics
    await trackBidEvent(landListing.id, bid.id, validatedData.bidAmount, 'BID_PLACED');

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
  } finally {
    await prisma.$disconnect();
  }
}

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

    // First find the user by EVM address
    const user = await prisma.user.findFirst({
      where: {
        evmAddress: {
          equals: userAddress,
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
    const bids = await prisma.nftBid.findMany({
      where: {
        bidderUserId: user.id
      },
      include: {
        landListing: {
          select: {
            id: true,
            nftTitle: true,
            collectionId: true,
            nftImageFileRef: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
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
  } finally {
    await prisma.$disconnect();
  }
} 