import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { get24hPriceStats, updateFloorPrice, updateAveragePrice } from '@/lib/priceTracking';

const prisma = new PrismaClient();

// Schema for validation
const paramsSchema = z.object({
  collectionId: z.string().min(1)
});

// Function to calculate real price statistics from database and blockchain data
async function calculatePriceStatistics(collectionId: string) {
  try {
    // Get the land listing for this collection
    const landListing = await prisma.landListing.findFirst({
      where: {
        collectionId: collectionId
      }
    });

    if (!landListing) {
      // Return default stats if collection not found
      return {
        floorPrice: 0,
        averagePrice: 0,
        volume24h: 0,
        priceChange24h: 0,
        sales24h: 0,
        topOffer: 0
      };
    }

    // Update current floor price and average price
    await updateFloorPrice(landListing.id);
    await updateAveragePrice(landListing.id);

    // Get 24h statistics using the new price tracking system
    const stats = await get24hPriceStats(landListing.id);

    // Calculate average price from recent price history
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentPriceHistory = await prisma.collectionPriceHistory.findMany({
      where: {
        landListingId: landListing.id,
        priceType: { in: ['SALE', 'BID_ACCEPTED'] },
        createdAt: { gte: sevenDaysAgo }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const averagePrice = recentPriceHistory.length > 0
      ? recentPriceHistory.reduce((sum, p) => sum + p.price, 0) / recentPriceHistory.length
      : stats.floorPrice;

    return {
      floorPrice: Number(stats.floorPrice.toFixed(4)),
      averagePrice: Number(averagePrice.toFixed(4)),
      volume24h: Number(stats.volume24h.toFixed(4)),
      priceChange24h: stats.priceChange24h,
      sales24h: stats.sales24h,
      topOffer: Number(stats.topOffer.toFixed(4))
    };

  } catch (error) {
    console.error('Error calculating price statistics:', error);
    return {
      floorPrice: 0,
      averagePrice: 0,
      volume24h: 0,
      priceChange24h: 0,
      sales24h: 0,
      topOffer: 0
    };
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collectionId: string }> }
) {
  try {
    // Validate parameters
    const resolvedParams = await params;
    const validatedParams = paramsSchema.parse(resolvedParams);
    const { collectionId } = validatedParams;

    // Calculate price statistics
    const stats = await calculatePriceStatistics(collectionId);

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error in price statistics API:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid collection ID' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 