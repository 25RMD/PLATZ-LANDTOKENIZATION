import { PrismaClient } from '@prisma/client';
import { get24hPriceStats, trackBidEvent } from '../lib/priceTracking';

const prisma = new PrismaClient();

async function testCollectionStatsUpdate() {
  try {
    console.log('🧪 Testing Collection Stats Update After Purchase...\n');

    // Find a test collection with some data
    const testCollection = await prisma.landListing.findFirst({
      where: {
        collectionId: { not: null }
      },
      include: {
        evmCollectionTokens: true,
        nftBids: {
          where: {
            bidStatus: 'ACTIVE'
          },
          orderBy: {
            bidAmount: 'desc'
          },
          take: 1
        }
      }
    });

    if (!testCollection) {
      console.log('❌ No test collection found');
      return;
    }

    console.log(`📊 Testing with collection: ${testCollection.nftTitle}`);
    console.log(`🆔 Collection ID: ${testCollection.collectionId}`);
    console.log(`💰 Current listing price: ${testCollection.listingPrice} ETH`);
    
    // Check if there are any active bids
    if (testCollection.nftBids.length === 0) {
      console.log('⚠️  No active bids found. Looking for existing users...\n');
      
      // Find an existing user to create a test bid
      const existingUser = await prisma.user.findFirst({
        select: { id: true, username: true, evmAddress: true }
      });
      
      if (existingUser) {
        // Create a mock bid for testing
        const testBid = await prisma.nftBid.create({
          data: {
            landListingId: testCollection.id,
            tokenId: 1,
            bidderUserId: existingUser.id,
            bidAmount: 0.5,
            bidStatus: 'ACTIVE',
            transactionHash: '0xtest123'
          }
        });
        
        console.log(`✅ Created test bid: ${testBid.bidAmount} ETH from user ${existingUser.username || existingUser.evmAddress}\n`);
      } else {
        console.log('⚠️  No existing users found. Skipping bid creation test.\n');
      }
    }

    // Get initial stats
    console.log('1️⃣ Getting initial collection stats...');
    const initialStats = await get24hPriceStats(testCollection.id);
    console.log('📈 Initial Stats:');
    console.log(`   Floor Price: ${initialStats.floorPrice} ETH`);
    console.log(`   24h Volume: ${initialStats.volume24h} ETH`);
    console.log(`   24h Sales: ${initialStats.sales24h}`);
    console.log(`   Top Offer: ${initialStats.topOffer} ETH\n`);

    // Simulate bid acceptance (purchase)
    console.log('2️⃣ Simulating bid acceptance (purchase completion)...');
    await trackBidEvent(testCollection.id, 'test-bid-acceptance', 0.5, 'BID_ACCEPTED');
    console.log('✅ Bid acceptance tracked\n');

    // Get updated stats
    console.log('3️⃣ Getting updated collection stats...');
    const updatedStats = await get24hPriceStats(testCollection.id);
    console.log('📈 Updated Stats:');
    console.log(`   Floor Price: ${updatedStats.floorPrice} ETH`);
    console.log(`   24h Volume: ${updatedStats.volume24h} ETH`);
    console.log(`   24h Sales: ${updatedStats.sales24h}`);
    console.log(`   Top Offer: ${updatedStats.topOffer} ETH\n`);

    // Compare changes
    console.log('4️⃣ Analyzing changes...');
    const volumeChange = updatedStats.volume24h - initialStats.volume24h;
    const salesChange = updatedStats.sales24h - initialStats.sales24h;
    
    console.log('📊 Changes detected:');
    console.log(`   Volume change: +${volumeChange} ETH`);
    console.log(`   Sales change: +${salesChange} sales`);
    
    if (volumeChange > 0 && salesChange > 0) {
      console.log('✅ SUCCESS: Collection stats properly updated after purchase!');
    } else {
      console.log('❌ WARNING: Stats may not be updating properly');
    }

    // Test API endpoint
    console.log('\n5️⃣ Testing API endpoint...');
    const apiResponse = await fetch(`http://localhost:3000/api/collections/${testCollection.collectionId}/stats`);
    
    if (apiResponse.ok) {
      const apiData = await apiResponse.json();
      console.log('🌐 API Response:');
      console.log(`   Floor Price: ${apiData.stats.floorPrice} ETH`);
      console.log(`   24h Volume: ${apiData.stats.volume24h} ETH`);
      console.log(`   24h Sales: ${apiData.stats.sales24h}`);
      console.log(`   Top Offer: ${apiData.stats.topOffer} ETH`);
      console.log('✅ API endpoint working correctly');
    } else {
      console.log('❌ API endpoint failed');
    }

    // Clean up test data
    console.log('\n6️⃣ Cleaning up test data...');
    await prisma.nftBid.deleteMany({
      where: {
        transactionHash: '0xtest123'
      }
    });
    console.log('✅ Test data cleaned up');

  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testCollectionStatsUpdate().catch(console.error); 