import { getActiveBidsForOwner } from '../lib/blockchain/bidAggregation';

async function testApiFunction() {
  try {
    console.log('🔍 Testing getActiveBidsForOwner function directly...\n');

    const testAddress = '0x3ec4bfe3167ba77A5906C034AABE5537BA7c4B07';
    
    console.log(`Testing with address: ${testAddress}\n`);

    // Call the exact same function that the API uses
    const activeBids = await getActiveBidsForOwner(testAddress);
    
    console.log(`📊 Result from getActiveBidsForOwner: ${activeBids.length} active bids\n`);

    if (activeBids.length > 0) {
      console.log('📝 Active Bids Details:');
      activeBids.forEach((bid, index) => {
        console.log(`   ${index + 1}. Bid ${bid.id}:`);
        console.log(`      Status: "${bid.bidStatus}"`);
        console.log(`      Amount: ${bid.bidAmount} ETH`);
        console.log(`      Token: ${bid.tokenId} in collection ${bid.collectionId}`);
        console.log(`      Bidder: ${bid.bidder.evmAddress}`);
        console.log('');
      });
    } else {
      console.log('❌ No active bids returned from getActiveBidsForOwner');
    }

    // Also test if there's a difference in the API simulation
    console.log('🌐 Simulating API response format...');
    const formattedBids = activeBids.map(bid => ({
      id: bid.id,
      bidAmount: bid.bidAmount,
      bidStatus: bid.bidStatus,
      transactionHash: bid.transactionHash,
      createdAt: bid.createdAt,
      userRole: bid.userRole,
      tokenId: bid.tokenId,
      currentOwner: bid.currentOwner,
      bidder: bid.bidder,
      landListing: bid.landListing
    }));

    console.log(`   Formatted bids count: ${formattedBids.length}`);

  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

testApiFunction().catch(console.error); 