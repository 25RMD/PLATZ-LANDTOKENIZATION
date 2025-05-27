import { aggregateBidsForUser, getActiveBidsForOwner } from '../lib/blockchain/bidAggregation';

async function testBlockchainBids() {
  try {
    console.log('🧪 Testing Blockchain-Based Bid System...\n');

    // Test with the minter wallet that owns tokens
    const testAddress = '0x3ec4bfe3167ba77A5906C034AABE5537BA7c4B07';
    
    console.log(`📍 Testing with address: ${testAddress}`);
    console.log('   (This should be the minter wallet that owns tokens)\n');

    // Test 1: Get comprehensive bid aggregation
    console.log('1️⃣ Testing comprehensive bid aggregation...');
    const aggregation = await aggregateBidsForUser(testAddress);
    
    console.log('📊 Bid Aggregation Results:');
    console.log(`   Total bids made by user: ${aggregation.summary.totalBidsMade}`);
    console.log(`   Total bids received on user's tokens: ${aggregation.summary.totalBidsReceived}`);
    console.log(`   Active bids made by user: ${aggregation.summary.activeBidsMade}`);
    console.log(`   Active bids received on user's tokens: ${aggregation.summary.activeBidsReceived}\n`);

    // Test 2: Get active bids received on tokens owned by user
    console.log('2️⃣ Testing active bids for token owner...');
    const activeBids = await getActiveBidsForOwner(testAddress);
    
    console.log(`🎯 Active Bids on User's Tokens: ${activeBids.length}`);
    
    if (activeBids.length > 0) {
      console.log('   📝 Active Bid Details:');
      activeBids.forEach((bid, index) => {
        console.log(`   ${index + 1}. Bid ${bid.id}:`);
        console.log(`      Amount: ${bid.bidAmount} ETH`);
        console.log(`      Token: ${bid.tokenId} in collection ${bid.collectionId}`);
        console.log(`      Current Owner: ${bid.currentOwner}`);
        console.log(`      Bidder: ${bid.bidder.evmAddress}`);
        console.log(`      Collection: ${bid.landListing.nftTitle || 'Untitled'}`);
        console.log('');
      });
    } else {
      console.log('   ⚠️  No active bids found on tokens owned by this address');
    }

    // Test 3: Test API endpoints
    console.log('3️⃣ Testing API endpoints...');
    
    try {
      // Test blockchain-active endpoint
      const activeResponse = await fetch(`http://localhost:3000/api/bids/blockchain-active?userAddress=${testAddress}`);
      
      if (activeResponse.ok) {
        const activeData = await activeResponse.json();
        console.log(`✅ blockchain-active API: Found ${activeData.bids?.length || 0} active bids`);
      } else {
        console.log('❌ blockchain-active API failed');
      }

      // Test blockchain-received endpoint
      const receivedResponse = await fetch(`http://localhost:3000/api/bids/blockchain-received?userAddress=${testAddress}`);
      
      if (receivedResponse.ok) {
        const receivedData = await receivedResponse.json();
        console.log(`✅ blockchain-received API: Found ${receivedData.bids?.length || 0} received bids`);
      } else {
        console.log('❌ blockchain-received API failed');
      }

      // Test blockchain-user endpoint
      const userResponse = await fetch(`http://localhost:3000/api/bids/blockchain-user?userAddress=${testAddress}`);
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log(`✅ blockchain-user API: Found ${userData.bids?.length || 0} user bids`);
      } else {
        console.log('❌ blockchain-user API failed');
      }
    } catch (apiError) {
      console.error('❌ API test failed:', apiError);
    }

    console.log('\n4️⃣ Summary:');
    if (aggregation.summary.totalBidsReceived > 0 || aggregation.summary.totalBidsMade > 0) {
      console.log('✅ SUCCESS: Blockchain-based bid system is working!');
      console.log('   The system correctly identifies bids based on actual token ownership.');
    } else {
      console.log('⚠️  INFO: No bids found for this address.');
      console.log('   This could be normal if no bids have been placed on/by this address.');
    }

    // Test with a different address that might have placed bids
    console.log('\n5️⃣ Testing with a different address...');
    
    // You can modify this to test with the address that placed the bid
    const bidderAddress = '0x742d35Cc6634C0532925a3b8d27ba6A74B8E2e5C'; // Example bidder address
    console.log(`📍 Testing bidder address: ${bidderAddress}`);
    
    const bidderAggregation = await aggregateBidsForUser(bidderAddress);
    console.log('📊 Bidder Results:');
    console.log(`   Bids made: ${bidderAggregation.summary.totalBidsMade}`);
    console.log(`   Bids received: ${bidderAggregation.summary.totalBidsReceived}`);

  } catch (error) {
    console.error('❌ Error during blockchain bid test:', error);
  }
}

// Run the test
testBlockchainBids().catch(console.error); 