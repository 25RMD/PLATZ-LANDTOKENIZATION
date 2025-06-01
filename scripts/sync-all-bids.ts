import { PrismaClient } from '@prisma/client';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { LandMarketplaceABI } from '../contracts/LandMarketplaceABI';
import { LAND_MARKETPLACE_ADDRESS, PLATZ_LAND_NFT_ADDRESS } from '../config/contracts';
import { getBlockchainBid, syncBidWithDatabase } from '../lib/bidSync';

const prisma = new PrismaClient();

async function syncAllBids() {
  console.log('🔄 Starting comprehensive bid synchronization...');
  
  try {
    // Get all land listings with their tokens
    const landListings = await prisma.landListing.findMany({
      include: {
        evmCollectionTokens: true
      }
    });

    console.log(`📋 Found ${landListings.length} land listings to check`);

    let totalSynced = 0;
    let totalChecked = 0;

    for (const listing of landListings) {
      console.log(`\n🏠 Checking listing: ${listing.nftTitle} (ID: ${listing.id})`);
      
      // Check main token if it exists
      if (listing.mainTokenId) {
        const mainTokenId = parseInt(listing.mainTokenId);
        console.log(`  🔍 Checking main token ${mainTokenId}...`);
        
        const blockchainBid = await getBlockchainBid(mainTokenId);
        totalChecked++;
        
        if (blockchainBid) {
          const amountEth = Number(blockchainBid.amount) / 1e18;
          console.log(`    💰 Found blockchain bid: ${amountEth} ETH from ${blockchainBid.bidder}`);
          
          const synced = await syncBidWithDatabase(mainTokenId, blockchainBid);
          if (synced) {
            totalSynced++;
            console.log(`    ✅ Synced bid for token ${mainTokenId}`);
          } else {
            console.log(`    ❌ Failed to sync bid for token ${mainTokenId}`);
          }
        } else {
          console.log(`    📭 No blockchain bid found for token ${mainTokenId}`);
        }
      }

      // Check collection tokens
      for (const token of listing.evmCollectionTokens) {
        console.log(`  🔍 Checking collection token ${token.tokenId}...`);
        
        const blockchainBid = await getBlockchainBid(token.tokenId);
        totalChecked++;
        
        if (blockchainBid) {
          const amountEth = Number(blockchainBid.amount) / 1e18;
          console.log(`    💰 Found blockchain bid: ${amountEth} ETH from ${blockchainBid.bidder}`);
          
          const synced = await syncBidWithDatabase(token.tokenId, blockchainBid);
          if (synced) {
            totalSynced++;
            console.log(`    ✅ Synced bid for token ${token.tokenId}`);
          } else {
            console.log(`    ❌ Failed to sync bid for token ${token.tokenId}`);
          }
        } else {
          console.log(`    📭 No blockchain bid found for token ${token.tokenId}`);
        }
      }
    }

    console.log(`\n📊 Synchronization Summary:`);
    console.log(`   Total tokens checked: ${totalChecked}`);
    console.log(`   Total bids synced: ${totalSynced}`);
    console.log(`   Success rate: ${totalChecked > 0 ? ((totalSynced / totalChecked) * 100).toFixed(1) : 0}%`);

    // Show current database state
    const allBids = await prisma.nftBid.findMany({
      where: { bidStatus: 'ACTIVE' },
      include: {
        bidder: { select: { evmAddress: true } }
      },
      orderBy: { bidAmount: 'desc' }
    });

    console.log(`\n💾 Current database state:`);
    console.log(`   Total active bids in database: ${allBids.length}`);
    
    if (allBids.length > 0) {
      console.log(`   Active bids by token:`);
      const bidsByToken = allBids.reduce((acc, bid) => {
        if (!acc[bid.tokenId]) acc[bid.tokenId] = [];
        acc[bid.tokenId].push(bid);
        return acc;
      }, {} as Record<number, typeof allBids>);

      Object.entries(bidsByToken).forEach(([tokenId, bids]) => {
        const highestBid = bids[0];
        console.log(`     Token ${tokenId}: ${highestBid.bidAmount} ETH (${bids.length} total bids)`);
      });
    }

  } catch (error) {
    console.error('❌ Error during bid synchronization:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the sync
syncAllBids()
  .then(() => {
    console.log('\n🎉 Bid synchronization completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }); 