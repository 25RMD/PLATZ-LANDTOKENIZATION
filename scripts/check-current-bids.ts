import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCurrentBids() {
  try {
    console.log('🔍 Checking current bids in database...\n');

    const allBids = await prisma.nftBid.findMany({
      include: {
        bidder: {
          select: {
            username: true,
            evmAddress: true
          }
        },
        landListing: {
          select: {
            collectionId: true,
            nftTitle: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${allBids.length} total bids:\n`);

    allBids.forEach((bid, index) => {
      console.log(`${index + 1}. Bid ${bid.id}:`);
      console.log(`   Token ID: ${bid.tokenId}`);
      console.log(`   Amount: ${bid.bidAmount} ETH`);
      console.log(`   Status: ${bid.bidStatus}`);
      console.log(`   Collection: ${bid.landListing.collectionId}`);
      console.log(`   Bidder: ${bid.bidder.username} (${bid.bidder.evmAddress})`);
      console.log(`   Created: ${bid.createdAt}`);
      console.log('');
    });

    // Count by tokenId
    const validBids = allBids.filter(bid => bid.tokenId && bid.tokenId > 0);
    const legacyBids = allBids.filter(bid => !bid.tokenId || bid.tokenId === 0);

    console.log(`📊 Summary:`);
    console.log(`   Total bids: ${allBids.length}`);
    console.log(`   Valid bids (tokenId > 0): ${validBids.length}`);
    console.log(`   Legacy bids (tokenId = 0): ${legacyBids.length}`);

    if (validBids.length > 0) {
      console.log(`\n✅ Valid bids:`);
      validBids.forEach(bid => {
        console.log(`   - Bid ${bid.id}: ${bid.bidAmount} ETH on token ${bid.tokenId} in collection ${bid.landListing.collectionId}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking bids:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentBids().catch(console.error); 