import { PrismaClient } from '@prisma/client';
import { getBlockchainBid } from '../lib/bidSync';

const prisma = new PrismaClient();

async function fixAllMissingTokens() {
  console.log('🔍 Checking for tokens with blockchain bids but missing database associations...');
  
  try {
    // Get all land listings with their token ranges
    const allListings = await prisma.landListing.findMany({
      where: {
        collectionId: { not: null }
      },
      include: {
        evmCollectionTokens: true
      }
    });

    console.log(`Found ${allListings.length} collections to check`);

    let totalFixed = 0;
    let totalChecked = 0;

    for (const listing of allListings) {
      if (!listing.collectionId || !listing.mainTokenId) continue;

      const collectionId = parseInt(listing.collectionId);
      const mainTokenId = parseInt(listing.mainTokenId);
      
      console.log(`\n📋 Checking collection ${collectionId} (${listing.nftTitle || 'Untitled'})`);
      console.log(`   Main token: ${mainTokenId}`);
      console.log(`   Current tokens in DB: ${listing.evmCollectionTokens.length}`);

      // Check a range around the main token ID (assuming collections have 10 tokens)
      const startToken = mainTokenId;
      const endToken = mainTokenId + 9;

      console.log(`   Checking token range: ${startToken} - ${endToken}`);

      for (let tokenId = startToken; tokenId <= endToken; tokenId++) {
        totalChecked++;
        
        // Check if token exists in database
        const existsInDb = listing.evmCollectionTokens.some(t => t.tokenId === tokenId);
        
        if (existsInDb) {
          continue; // Token already in database
        }

        // Check if token has blockchain bid
        const blockchainBid = await getBlockchainBid(tokenId);
        
        if (blockchainBid) {
          const amountEth = Number(blockchainBid.amount) / 1e18;
          console.log(`   🎯 Token ${tokenId}: Found blockchain bid (${amountEth} ETH) but missing from DB`);
          
          try {
            // Add token to database
            const tokenURI = `https://platz.land/api/metadata/${collectionId}/${tokenId}`;
            
            await prisma.evmCollectionToken.create({
              data: {
                tokenId: tokenId,
                landListingId: listing.id,
                tokenURI: tokenURI
              }
            });
            
            console.log(`   ✅ Added token ${tokenId} to collection ${collectionId}`);
            totalFixed++;
            
          } catch (error) {
            console.log(`   ❌ Failed to add token ${tokenId}:`, error);
          }
        }
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Total tokens checked: ${totalChecked}`);
    console.log(`   Total tokens fixed: ${totalFixed}`);

    if (totalFixed > 0) {
      console.log(`\n🔄 Running sync for all fixed tokens...`);
      
      // Import and run the sync script
      const { execSync } = require('child_process');
      execSync('npx tsx scripts/sync-all-bids.ts', { stdio: 'inherit' });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllMissingTokens()
  .then(() => {
    console.log('\n🎉 Fix completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }); 