import { aggregateBidsForUser } from '../lib/blockchain/bidAggregation';

async function debugActiveBids() {
  try {
    console.log('🔍 Debugging Active Bids Filtering...\n');

    const testAddress = '0x3ec4bfe3167ba77A5906C034AABE5537BA7c4B07';
    
    console.log(`Testing with address: ${testAddress}\n`);

    // Get the full aggregation result
    const result = await aggregateBidsForUser(testAddress);
    
    console.log('📊 Aggregation Result:');
    console.log(`   User bids: ${result.userBids.length}`);
    console.log(`   Received bids: ${result.receivedBids.length}`);
    console.log(`   All bids: ${result.allBids.length}\n`);

    if (result.receivedBids.length > 0) {
      console.log('📝 Received Bids Details:');
      result.receivedBids.forEach((bid, index) => {
        console.log(`   ${index + 1}. Bid ${bid.id}:`);
        console.log(`      Status: "${bid.bidStatus}" (type: ${typeof bid.bidStatus})`);
        console.log(`      Amount: ${bid.bidAmount} ETH`);
        console.log(`      Token: ${bid.tokenId} in collection ${bid.collectionId}`);
        console.log(`      Current Owner: ${bid.currentOwner}`);
        console.log(`      User Role: ${bid.userRole}`);
        console.log('');
      });

      // Test the filtering manually
      console.log('🔍 Testing Active Filtering:');
      const activeBids = result.receivedBids.filter(bid => {
        const isActive = bid.bidStatus === 'ACTIVE';
        console.log(`   Bid ${bid.id}: bidStatus="${bid.bidStatus}" === "ACTIVE" = ${isActive}`);
        return isActive;
      });

      console.log(`\n✅ Active bids after filtering: ${activeBids.length}`);
      
      if (activeBids.length > 0) {
        console.log('   Active bid details:');
        activeBids.forEach((bid, index) => {
          console.log(`   ${index + 1}. ${bid.id}: ${bid.bidAmount} ETH on token ${bid.tokenId}`);
        });
      }
    } else {
      console.log('❌ No received bids found');
    }

  } catch (error) {
    console.error('❌ Error during debug:', error);
  }
}

debugActiveBids().catch(console.error); 