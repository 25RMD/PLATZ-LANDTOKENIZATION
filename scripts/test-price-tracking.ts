import { PrismaClient } from '@prisma/client';
import { 
  trackBidEvent, 
  updateFloorPrice, 
  updateAveragePrice, 
  get24hPriceStats,
  getPriceHistory 
} from '../lib/priceTracking';

const prisma = new PrismaClient();

async function testPriceTracking() {
  try {
    console.log('🧪 Testing Price Tracking System...\n');

    // Get a test collection
    const testCollection = await prisma.landListing.findFirst({
      where: {
        collectionId: { not: null }
      },
      include: {
        evmCollectionTokens: true,
        nftBids: true
      }
    });

    if (!testCollection) {
      console.log('❌ No test collection found');
      return;
    }

    console.log(`📊 Testing with collection: ${testCollection.nftTitle}`);
    console.log(`🆔 Collection ID: ${testCollection.collectionId}`);
    console.log(`💰 Current listing price: ${testCollection.listingPrice} ETH\n`);

    // Test 1: Update floor price
    console.log('1️⃣ Testing floor price update...');
    await updateFloorPrice(testCollection.id);
    console.log('✅ Floor price updated\n');

    // Test 2: Update average price
    console.log('2️⃣ Testing average price update...');
    await updateAveragePrice(testCollection.id);
    console.log('✅ Average price updated\n');

    // Test 3: Track a bid event
    console.log('3️⃣ Testing bid tracking...');
    await trackBidEvent(testCollection.id, 'test-bid-id', 0.5, 'BID_PLACED');
    console.log('✅ Bid event tracked\n');

    // Test 4: Get 24h stats
    console.log('4️⃣ Testing 24h statistics...');
    const stats = await get24hPriceStats(testCollection.id);
    console.log('📈 24h Statistics:');
    console.log(`   Floor Price: ${stats.floorPrice} ETH`);
    console.log(`   Volume 24h: ${stats.volume24h} ETH`);
    console.log(`   Sales 24h: ${stats.sales24h}`);
    console.log(`   Price Change 24h: ${stats.priceChange24h}%`);
    console.log(`   Top Offer: ${stats.topOffer} ETH\n`);

    // Test 5: Get price history
    console.log('5️⃣ Testing price history...');
    const history = await getPriceHistory(testCollection.id, '7d');
    console.log(`📊 Price history (7 days): ${history.length} records`);
    if (history.length > 0) {
      console.log('   Recent entries:');
      history.slice(-3).forEach((entry, index) => {
        console.log(`   ${index + 1}. ${entry.priceType}: ${entry.price} ETH (${entry.timestamp.toISOString()})`);
      });
    }
    console.log();

    // Test 6: Check database records
    console.log('6️⃣ Checking database records...');
    const priceHistoryCount = await prisma.collectionPriceHistory.count({
      where: { landListingId: testCollection.id }
    });
    console.log(`📝 Total price history records: ${priceHistoryCount}\n`);

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testPriceTracking(); 