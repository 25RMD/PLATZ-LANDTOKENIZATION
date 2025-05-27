import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixTestBid() {
  try {
    console.log('🔧 Fixing test bid to use a valid token...\n');

    // Delete the invalid bid on token 104
    try {
      await prisma.nftBid.delete({
        where: { id: 'cmb5w2elv0001cz87is1pjkhl' }
      });
      console.log('✅ Deleted invalid bid on token 104');
    } catch (error) {
      console.log('ℹ️  Previous bid already deleted or not found');
    }

    // Find the bidder user
    const bidderUser = await prisma.user.findFirst({
      where: {
        evmAddress: '0x6BE90E278ff81b25e2E48351c346886F8F50e99e'
      }
    });

    if (!bidderUser) {
      console.log('❌ Bidder user not found');
      return;
    }

    // Find collection 16
    const collection = await prisma.landListing.findFirst({
      where: {
        collectionId: '16'
      }
    });

    if (!collection) {
      console.log('❌ Collection 16 not found');
      return;
    }

    // Create a bid on token 1 (main token) which should exist on blockchain
    const newBid = await prisma.nftBid.create({
      data: {
        landListingId: collection.id,
        tokenId: 1, // Main token - this should exist on blockchain
        bidderUserId: bidderUser.id,
        bidAmount: 0.05,
        bidStatus: 'ACTIVE',
        transactionHash: '0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef1'
      }
    });

    console.log('\n✅ Created new test bid:');
    console.log(`   Bid ID: ${newBid.id}`);
    console.log(`   Amount: ${newBid.bidAmount} ETH`);
    console.log(`   Token ID: ${newBid.tokenId} (main token)`);
    console.log(`   Collection: ${collection.collectionId}`);
    console.log(`   Status: ${newBid.bidStatus}`);

    console.log('\n🎯 This bid is on token 1 which should exist on the blockchain!');
    console.log('   The blockchain-based system should now detect it correctly.');

  } catch (error) {
    console.error('❌ Error fixing test bid:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTestBid().catch(console.error); 