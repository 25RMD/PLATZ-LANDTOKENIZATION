import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Schema for POST request validation
const createTransactionSchema = z.object({
  transactionType: z.enum(['PURCHASE', 'SALE', 'TRANSFER', 'BID_ACCEPTED', 'BID_PLACED']),
  tokenId: z.string().min(1),
  collectionId: z.string().min(1),
  fromAddress: z.string().min(1),
  toAddress: z.string().min(1),
  price: z.number().positive(),
  currency: z.string().default('ETH'),
  transactionHash: z.string().min(1),
  blockNumber: z.number().optional(),
  gasUsed: z.number().optional(),
  gasPrice: z.number().optional()
});

// Schema for GET request query validation
const getTransactionsSchema = z.object({
  collectionId: z.string().optional(),
  tokenId: z.string().optional(),
  userAddress: z.string().optional(),
  type: z.enum(['PURCHASE', 'SALE', 'TRANSFER', 'BID_ACCEPTED', 'BID_PLACED']).optional(),
  limit: z.string().transform(val => parseInt(val)).default('50'),
  offset: z.string().transform(val => parseInt(val)).default('0')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createTransactionSchema.parse(body);

    // Find the land listing for this collection
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

    // Create the transaction record
    const transaction = await prisma.nftTransaction.create({
      data: {
        landListingId: landListing.id,
        transactionType: validatedData.transactionType,
        tokenId: parseInt(validatedData.tokenId),
        fromAddress: validatedData.fromAddress,
        toAddress: validatedData.toAddress,
        price: validatedData.price,

        transactionHash: validatedData.transactionHash
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
      }
    });

    // Update collection statistics if this is a sale
    if (validatedData.transactionType === 'PURCHASE' || validatedData.transactionType === 'SALE') {
      // Update last sale price and volume
      await prisma.landListing.update({
        where: { id: landListing.id },
        data: {
          // You might want to track last sale price here
          updatedAt: new Date()
        }
      });
    }

    return NextResponse.json({
      success: true,
      transaction
    });

  } catch (error) {
    console.error('Error creating transaction:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid transaction data', errors: error.errors },
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
    const query = {
      collectionId: searchParams.get('collectionId'),
      tokenId: searchParams.get('tokenId'),
      userAddress: searchParams.get('userAddress'),
      type: searchParams.get('type'),
      limit: searchParams.get('limit') || '50',
      offset: searchParams.get('offset') || '0'
    };

    const validatedQuery = getTransactionsSchema.parse(query);

    // Build where clause based on query parameters
    const whereClause: any = {};

    if (validatedQuery.collectionId) {
      const landListing = await prisma.landListing.findFirst({
        where: { collectionId: validatedQuery.collectionId }
      });
      
      if (landListing) {
        whereClause.landListingId = landListing.id;
      } else {
        return NextResponse.json({
          success: true,
          transactions: [],
          total: 0
        });
      }
    }

    if (validatedQuery.tokenId) {
      whereClause.tokenId = validatedQuery.tokenId;
    }

    if (validatedQuery.userAddress) {
      whereClause.OR = [
        { fromAddress: validatedQuery.userAddress },
        { toAddress: validatedQuery.userAddress }
      ];
    }

    if (validatedQuery.type) {
      whereClause.transactionType = validatedQuery.type;
    }

    // Get total count
    const total = await prisma.nftTransaction.count({
      where: whereClause
    });

    // Fetch transactions with related data
    const transactions = await prisma.nftTransaction.findMany({
      where: whereClause,
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
      },
      take: validatedQuery.limit,
      skip: validatedQuery.offset
    });

    return NextResponse.json({
      success: true,
      transactions,
      total,
      limit: validatedQuery.limit,
      offset: validatedQuery.offset
    });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid query parameters', errors: error.errors },
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