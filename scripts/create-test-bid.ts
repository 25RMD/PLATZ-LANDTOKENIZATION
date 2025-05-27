import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestBid() {
  try {
    console.log('🔧 Creating test bid for blockchain system testing...\n');

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

    // Find a collection to bid on
    const collection = await prisma.landListing.findFirst({
      where: {
        collectionId: '16'
      }
    });

    if (!collection) {
      console.log('❌ Collection 16 not found');
      return;
    }

    console.log(`✅ Found collection: ${collection.nftTitle}`);
    console.log(`   Collection ID: ${collection.collectionId}`);

    // Create a test bid on token 104
    const testBid = await prisma.nftBid.create({
      data: {
        landListingId: collection.id,
        tokenId: 104, // Specific token ID
        bidderUserId: bidderUser.id,
        bidAmount: 0.05,
        bidStatus: 'ACTIVE',
        transactionHash: '0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0'
      },
      include: {
        bidder: {
          select: {
            username: true,
            evmAddress: true
          }
        },
        landListing: {
          select: {
            nftTitle: true,
            collectionId: true
          }
        }
      }
    });

    console.log('\n✅ Created test bid:');
    console.log(`   Bid ID: ${testBid.id}`);
    console.log(`   Amount: ${testBid.bidAmount} ETH`);
    console.log(`   Token ID: ${testBid.tokenId}`);
    console.log(`   Collection: ${testBid.landListing.collectionId}`);
    console.log(`   Bidder: ${testBid.bidder.username} (${testBid.bidder.evmAddress})`);
    console.log(`   Status: ${testBid.bidStatus}`);

    console.log('\n🎯 This bid should now appear in the blockchain-based bid system for token owners!');

  } catch (error) {
    console.error('❌ Error creating test bid:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestBid().catch(console.error); 