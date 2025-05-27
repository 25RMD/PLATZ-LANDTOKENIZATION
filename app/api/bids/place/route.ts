import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { validateBidPlacement } from '@/lib/bidValidation';

const prisma = new PrismaClient();

// Schema for validation
const placeBidSchema = z.object({
  landListingId: z.string().min(1),
  tokenId: z.number().int().min(0),
  bidAmount: z.number().positive(),
  bidderAddress: z.string().min(1),
  transactionHash: z.string().min(1)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = placeBidSchema.parse(body);

    console.log(`[BID_PLACEMENT] Validating bid placement for token ${validatedData.tokenId}`);

    // Validate the bid placement using our enhanced validation system
    const validationResult = await validateBidPlacement(
      validatedData.landListingId,
      validatedData.tokenId,
      validatedData.bidderAddress
    );

    if (!validationResult.isValid) {
      console.log(`[BID_PLACEMENT] Validation failed: ${validationResult.error}`);
      return NextResponse.json(
        { success: false, message: validationResult.error },
        { status: 400 }
      );
    }

    // Find the bidder user
    const bidder = await prisma.user.findFirst({
      where: {
        evmAddress: {
          equals: validatedData.bidderAddress,
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
    const existingBid = await prisma.nftBid.findFirst({
      where: {
        landListingId: validatedData.landListingId,
        tokenId: validatedData.tokenId,
        bidderUserId: bidder.id,
        bidStatus: 'ACTIVE'
      }
    });

    if (existingBid) {
      // Update existing bid instead of creating a new one
      const updatedBid = await prisma.nftBid.update({
        where: { id: existingBid.id },
        data: {
          bidAmount: validatedData.bidAmount,
          transactionHash: validatedData.transactionHash,
          updatedAt: new Date()
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

      console.log(`[BID_PLACEMENT] Updated existing bid ${existingBid.id} with new amount ${validatedData.bidAmount} ETH`);

      return NextResponse.json({
        success: true,
        bid: updatedBid,
        message: 'Bid updated successfully',
        isUpdate: true
      });
    }

    // Create new bid
    const newBid = await prisma.nftBid.create({
      data: {
        landListingId: validatedData.landListingId,
        tokenId: validatedData.tokenId,
        bidderUserId: bidder.id,
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

    console.log(`[BID_PLACEMENT] Created new bid ${newBid.id} for ${validatedData.bidAmount} ETH on token ${validatedData.tokenId}`);

    // Mark any lower bids from other users as OUTBID
    await prisma.nftBid.updateMany({
      where: {
        landListingId: validatedData.landListingId,
        tokenId: validatedData.tokenId,
        bidAmount: {
          lt: validatedData.bidAmount
        },
        bidStatus: 'ACTIVE',
        id: {
          not: newBid.id
        }
      },
      data: {
        bidStatus: 'OUTBID'
      }
    });

    return NextResponse.json({
      success: true,
      bid: newBid,
      message: 'Bid placed successfully',
      currentOwner: validationResult.currentOwner
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
  } finally {
    await prisma.$disconnect();
  }
} 