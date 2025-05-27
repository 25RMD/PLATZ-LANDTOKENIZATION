import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collectionId: string }> }
) {
  try {
    const resolvedParams = await params;
    const collectionId = resolvedParams.collectionId;
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '24h'; // 24h, 7d, 30d, all

    // Calculate date range based on timeframe
    const now = new Date();
    let startDate: Date;
    
    switch (timeframe) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
      default: // 24h
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Generate mock price history data
    const mockSales = [];
    const basePrice = 0.1; // Base price of 0.1 ETH
    
    // Generate mock price history for the timeframe
    const hoursInTimeframe = timeframe === '24h' ? 24 : timeframe === '7d' ? 168 : timeframe === '30d' ? 720 : 8760;
    const dataPoints = Math.min(hoursInTimeframe / 4, 50); // Max 50 data points
    
    for (let i = 0; i < dataPoints; i++) {
      const timestamp = new Date(startDate.getTime() + (i * (now.getTime() - startDate.getTime()) / dataPoints));
      const priceVariation = (Math.random() - 0.5) * 0.2; // ±10% variation
      const price = basePrice * (1 + priceVariation);
      
      mockSales.push({
        timestamp: timestamp.toISOString(),
        price: Math.max(0.01, price), // Minimum price of 0.01 ETH
        tokenName: `Token #${Math.floor(Math.random() * 100)}`,
        tokenId: Math.floor(Math.random() * 100)
      });
    }

    // Mock current listings
    const currentListings = [
      { price: 0.08, nftTitle: 'Land Plot #1', tokenId: 1 },
      { price: 0.12, nftTitle: 'Land Plot #2', tokenId: 2 },
      { price: 0.15, nftTitle: 'Land Plot #3', tokenId: 3 }
    ];

    // Calculate statistics
    const prices = mockSales.map(sale => sale.price);
    
    const stats = {
      totalSales: mockSales.length,
      totalVolume: prices.reduce((sum, price) => sum + price, 0),
      averagePrice: prices.length > 0 ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0,
      floorPrice: currentListings.length > 0 ? currentListings[0].price : 0,
      highestSale: prices.length > 0 ? Math.max(...prices) : 0,
      lowestSale: prices.length > 0 ? Math.min(...prices) : 0,
      priceChange24h: 0,
      volumeChange24h: 0
    };

    // Calculate 24h price change
    if (mockSales.length >= 2) {
      const firstSale = mockSales[0];
      const lastSale = mockSales[mockSales.length - 1];
      const priceChange = ((lastSale.price - firstSale.price) / firstSale.price) * 100;
      stats.priceChange24h = priceChange;
    }

    return NextResponse.json({
      success: true,
      data: {
        collectionId,
        timeframe,
        stats,
        priceHistory: mockSales,
        currentListings: currentListings.slice(0, 10) // Top 10 cheapest listings
      }
    });

  } catch (error) {
    console.error('Error fetching price history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch price history' },
      { status: 500 }
    );
  }
} 