import { PrismaClient } from '@prisma/client';
import { getBlockchainBid, getCurrentBidWithSync, validateBidAmount } from '../lib/bidSync';

const prisma = new PrismaClient();

async function debugToken106() {
  const tokenId = 106;
  console.log(`🔍 Debugging Token ${tokenId}`);
  console.log('='.repeat(50));

  try {
    // 1. Check database state
    console.log('\n1. DATABASE STATE:');
    const dbBids = await prisma.nftBid.findMany({
      where: {
        tokenId: tokenId,
        bidStatus: 'ACTIVE'
      },
      include: {
        bidder: { select: { evmAddress: true } }
      },
      orderBy: { bidAmount: 'desc' }
    });

    console.log(`   Found ${dbBids.length} active bids in database:`);
    dbBids.forEach((bid, index) => {
      console.log(`   ${index + 1}. ${bid.bidAmount} ETH from ${bid.bidder.evmAddress} (ID: ${bid.id})`);
    });

    // 2. Check blockchain state
    console.log('\n2. BLOCKCHAIN STATE:');
    const blockchainBid = await getBlockchainBid(tokenId);
    
    if (blockchainBid) {
      const amountEth = Number(blockchainBid.amount) / 1e18;
      console.log(`   Current blockchain bid: ${amountEth} ETH from ${blockchainBid.bidder}`);
      console.log(`   Timestamp: ${new Date(Number(blockchainBid.timestamp) * 1000).toISOString()}`);
    } else {
      console.log(`   No active bid found on blockchain`);
    }

    // 3. Test sync function
    console.log('\n3. SYNC FUNCTION TEST:');
    const syncResult = await getCurrentBidWithSync(tokenId);
    console.log(`   Sync result:`, syncResult);

    // 4. Test different bid amounts
    console.log('\n4. BID VALIDATION TESTS:');
    const testAmounts = [0.001, 0.01, 0.1, 0.5, 1.0];
    
    for (const amount of testAmounts) {
      const validation = await validateBidAmount(tokenId, amount);
      console.log(`   ${amount} ETH: ${validation.valid ? '✅ VALID' : '❌ INVALID'} - ${validation.message || 'OK'}`);
    }

    // 5. Check land listing
    console.log('\n5. LAND LISTING CHECK:');
    const landListing = await prisma.landListing.findFirst({
      where: {
        OR: [
          { mainTokenId: tokenId.toString() },
          { evmCollectionTokens: { some: { tokenId: tokenId } } }
        ]
      },
      include: {
        evmCollectionTokens: {
          where: { tokenId: tokenId }
        }
      }
    });

    if (landListing) {
      console.log(`   Found land listing: ${landListing.nftTitle} (ID: ${landListing.id})`);
      console.log(`   Collection ID: ${landListing.collectionId}`);
      console.log(`   Main Token ID: ${landListing.mainTokenId}`);
      console.log(`   Collection tokens for this ID: ${landListing.evmCollectionTokens.length}`);
    } else {
      console.log(`   ❌ No land listing found for token ${tokenId}`);
    }

  } catch (error) {
    console.error('❌ Error during debugging:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the debug
debugToken106()
  .then(() => {
    console.log('\n🎉 Debug completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }); 