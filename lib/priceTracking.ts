import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type PriceTrackingEvent = 
  | 'FLOOR_PRICE' 
  | 'AVG_PRICE' 
  | 'BID_PLACED' 
  | 'BID_ACCEPTED' 
  | 'BID_REJECTED' 
  | 'SALE';

interface PriceTrackingData {
  landListingId: string;
  priceType: PriceTrackingEvent;
  price: number;
  bidId?: string;
  transactionId?: string;
  metadata?: any;
}

/**
 * Records a price tracking event for a collection
 */
export async function trackPriceEvent(data: PriceTrackingData): Promise<void> {
  try {
    // Get the previous price for this collection and price type
    const lastPriceRecord = await prisma.collectionPriceHistory.findFirst({
      where: {
        landListingId: data.landListingId,
        priceType: data.priceType,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const previousPrice = lastPriceRecord?.price || null;
    const changePercentage = previousPrice 
      ? ((data.price - previousPrice) / previousPrice) * 100 
      : null;

    // Create new price history record
    await prisma.collectionPriceHistory.create({
      data: {
        landListingId: data.landListingId,
        priceType: data.priceType,
        price: data.price,
        previousPrice,
        changePercentage,
        bidId: data.bidId,
        transactionId: data.transactionId,
        metadata: data.metadata,
      }
    });

    console.log(`[PriceTracking] Recorded ${data.priceType} event for collection ${data.landListingId}: ${data.price} ETH`);
  } catch (error) {
    console.error('[PriceTracking] Error tracking price event:', error);
  }
}

/**
 * Updates collection floor price based on current listings
 */
export async function updateFloorPrice(landListingId: string): Promise<void> {
  try {
    const landListing = await prisma.landListing.findUnique({
      where: { id: landListingId },
      include: {
        evmCollectionTokens: {
          where: {
            isListed: true,
            listingPrice: { gt: 0 }
          }
        }
      }
    });

    if (!landListing) return;

    let floorPrice = 0;
    
    // Calculate floor price from individual token listings
    const tokenPrices = landListing.evmCollectionTokens
      .map(token => token.listingPrice)
      .filter(price => price && price > 0) as number[];
    
    if (tokenPrices.length > 0) {
      floorPrice = Math.min(...tokenPrices);
    } else if (landListing.listingPrice && landListing.listingPrice > 0) {
      // Fallback to collection listing price
      floorPrice = landListing.listingPrice;
    }

    if (floorPrice > 0) {
      await trackPriceEvent({
        landListingId,
        priceType: 'FLOOR_PRICE',
        price: floorPrice,
        metadata: {
          tokenCount: tokenPrices.length,
          source: tokenPrices.length > 0 ? 'individual_tokens' : 'collection_listing'
        }
      });
    }
  } catch (error) {
    console.error('[PriceTracking] Error updating floor price:', error);
  }
}

/**
 * Calculates and tracks average price based on recent sales/bids
 */
export async function updateAveragePrice(landListingId: string): Promise<void> {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // Get recent sales
    const recentSales = await prisma.nftTransaction.findMany({
      where: {
        landListingId,
        transactionType: 'SALE',
        createdAt: { gte: sevenDaysAgo }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Get recent accepted bids
    const recentAcceptedBids = await prisma.nftBid.findMany({
      where: {
        landListingId,
        bidStatus: 'ACCEPTED',
        updatedAt: { gte: sevenDaysAgo }
      },
      orderBy: { updatedAt: 'desc' },
      take: 10
    });

    const allPrices = [
      ...recentSales.map(sale => sale.price),
      ...recentAcceptedBids.map(bid => bid.bidAmount)
    ];

    if (allPrices.length > 0) {
      const averagePrice = allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length;
      
      await trackPriceEvent({
        landListingId,
        priceType: 'AVG_PRICE',
        price: averagePrice,
        metadata: {
          sampleSize: allPrices.length,
          salesCount: recentSales.length,
          acceptedBidsCount: recentAcceptedBids.length,
          timeframe: '7_days'
        }
      });
    }
  } catch (error) {
    console.error('[PriceTracking] Error updating average price:', error);
  }
}

/**
 * Tracks bid-related price events
 */
export async function trackBidEvent(
  landListingId: string, 
  bidId: string, 
  bidAmount: number, 
  eventType: 'BID_PLACED' | 'BID_ACCEPTED' | 'BID_REJECTED'
): Promise<void> {
  await trackPriceEvent({
    landListingId,
    priceType: eventType,
    price: bidAmount,
    bidId,
    metadata: { bidId, eventType }
  });

  // Update other price metrics when significant events occur
  if (eventType === 'BID_ACCEPTED') {
    await updateFloorPrice(landListingId);
    await updateAveragePrice(landListingId);
  }
}

/**
 * Tracks sale events
 */
export async function trackSaleEvent(
  landListingId: string,
  transactionId: string,
  salePrice: number
): Promise<void> {
  await trackPriceEvent({
    landListingId,
    priceType: 'SALE',
    price: salePrice,
    transactionId,
    metadata: { transactionId }
  });

  // Update other price metrics after a sale
  await updateFloorPrice(landListingId);
  await updateAveragePrice(landListingId);
}

/**
 * Gets 24h price statistics for a collection
 */
export async function get24hPriceStats(landListingId: string) {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Get price history from last 24 hours
    const priceHistory = await prisma.collectionPriceHistory.findMany({
      where: {
        landListingId,
        createdAt: { gte: twentyFourHoursAgo }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get sales and accepted bids from last 24 hours (both count as completed purchases)
    const completedSales = priceHistory.filter(p => 
      p.priceType === 'SALE' || p.priceType === 'BID_ACCEPTED'
    );
    const sales24h = completedSales.length;
    const volume24h = completedSales.reduce((sum, p) => sum + p.price, 0);

    // Get current floor price
    const latestFloorPrice = await prisma.collectionPriceHistory.findFirst({
      where: {
        landListingId,
        priceType: 'FLOOR_PRICE'
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get floor price from 24h ago for change calculation
    const floorPrice24hAgo = await prisma.collectionPriceHistory.findFirst({
      where: {
        landListingId,
        priceType: 'FLOOR_PRICE',
        createdAt: { lte: twentyFourHoursAgo }
      },
      orderBy: { createdAt: 'desc' }
    });

    const currentFloorPrice = latestFloorPrice?.price || 0;
    const previousFloorPrice = floorPrice24hAgo?.price || currentFloorPrice;
    const priceChange24h = previousFloorPrice > 0 
      ? ((currentFloorPrice - previousFloorPrice) / previousFloorPrice) * 100 
      : 0;

    // Get top offer (highest active bid)
    const topOffer = await prisma.nftBid.findFirst({
      where: {
        landListingId,
        bidStatus: 'ACTIVE'
      },
      orderBy: { bidAmount: 'desc' }
    });

    return {
      floorPrice: currentFloorPrice,
      volume24h,
      sales24h,
      priceChange24h: Number(priceChange24h.toFixed(2)),
      topOffer: topOffer?.bidAmount || 0
    };
  } catch (error) {
    console.error('[PriceTracking] Error getting 24h price stats:', error);
    return {
      floorPrice: 0,
      volume24h: 0,
      sales24h: 0,
      priceChange24h: 0,
      topOffer: 0
    };
  }
}

/**
 * Gets price history for charting
 */
export async function getPriceHistory(
  landListingId: string, 
  timeframe: '24h' | '7d' | '30d' = '7d'
): Promise<any[]> {
  try {
    const now = new Date();
    let startDate: Date;
    
    switch (timeframe) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    const priceHistory = await prisma.collectionPriceHistory.findMany({
      where: {
        landListingId,
        priceType: { in: ['FLOOR_PRICE', 'SALE', 'BID_ACCEPTED'] },
        createdAt: { gte: startDate }
      },
      orderBy: { createdAt: 'asc' }
    });

    return priceHistory.map(record => ({
      timestamp: record.createdAt,
      price: record.price,
      priceType: record.priceType,
      changePercentage: record.changePercentage
    }));
  } catch (error) {
    console.error('[PriceTracking] Error getting price history:', error);
    return [];
  }
} 