import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkListingOwnership() {
  try {
    console.log('🔍 Checking land listing ownership for collection 16\n');

    // Check the land listing for collection 16
    const landListings = await prisma.landListing.findMany({
      where: {
        collectionId: '16'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            evmAddress: true
          }
        },
        evmCollectionTokens: {
          select: {
            id: true,
            tokenId: true,
            ownerAddress: true,
            isListed: true,
            listingPrice: true
          }
        }
      }
    });

    console.log(`📋 Found ${landListings.length} land listings for collection 16:`);
    
    landListings.forEach((listing, index) => {
      console.log(`\n   ${index + 1}. Listing ID: ${listing.id}`);
      console.log(`      Collection ID: ${listing.collectionId}`);
      console.log(`      Token ID: ${listing.tokenId}`);
      console.log(`      Title: ${listing.nftTitle}`);
      console.log(`      Status: ${listing.status}`);
      console.log(`      Created: ${listing.createdAt.toISOString()}`);
      console.log(`      Updated: ${listing.updatedAt.toISOString()}`);
      
      console.log(`      Database Owner (user):`);
      console.log(`         ID: ${listing.user?.id}`);
      console.log(`         Username: ${listing.user?.username || 'Not set'}`);
      console.log(`         EVM Address: ${listing.user?.evmAddress}`);
      
      if (listing.evmCollectionTokens && listing.evmCollectionTokens.length > 0) {
        console.log(`      EVM Collection Tokens (${listing.evmCollectionTokens.length}):`);
        listing.evmCollectionTokens.forEach((token, tokenIndex) => {
          console.log(`         ${tokenIndex + 1}. Token ID: ${token.tokenId}`);
          console.log(`            Owner Address: ${token.ownerAddress}`);
          console.log(`            Is Listed: ${token.isListed}`);
          console.log(`            Listing Price: ${token.listingPrice}`);
        });
      } else {
        console.log(`      ❌ No EVM collection tokens found`);
      }
    });

    // Check all users with these addresses
    console.log('\n📋 Checking user records:');
    const addresses = [
      '0x3ec4bfe3167ba77A5906C034AABE5537BA7c4B07',
      '0x6BE90E278ff81b25e2E48351c346886F8F50e99e'
    ];

    for (const address of addresses) {
      const user = await prisma.user.findFirst({
        where: {
          evmAddress: {
            equals: address,
            mode: 'insensitive'
          }
        }
      });

      console.log(`\n   Address: ${address}`);
      if (user) {
        console.log(`      ✅ User found:`);
        console.log(`         ID: ${user.id}`);
        console.log(`         Username: ${user.username || 'Not set'}`);
        console.log(`         EVM Address: ${user.evmAddress}`);
      } else {
        console.log(`      ❌ No user record found`);
      }
    }

    // Check recent bids for collection 16
    console.log('\n📋 Checking recent bids for collection 16:');
    const recentBids = await prisma.nftBid.findMany({
      where: {
        landListing: {
          collectionId: '16'
        }
      },
      include: {
        bidder: {
          select: {
            id: true,
            username: true,
            evmAddress: true
          }
        },
        landListing: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                evmAddress: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    console.log(`   Found ${recentBids.length} recent bids:`);
    recentBids.forEach((bid, index) => {
      console.log(`\n   ${index + 1}. Bid ID: ${bid.id}`);
      console.log(`      Status: ${bid.bidStatus}`);
      console.log(`      Amount: ${bid.bidAmount} ETH`);
      console.log(`      Created: ${bid.createdAt.toISOString()}`);
      console.log(`      Updated: ${bid.updatedAt.toISOString()}`);
      console.log(`      Bidder: ${bid.bidder.evmAddress} (${bid.bidder.username || 'Anonymous'})`);
      console.log(`      Listing Owner: ${bid.landListing.user?.evmAddress} (${bid.landListing.user?.username || 'Anonymous'})`);
      console.log(`      Transaction: ${bid.transactionHash}`);
    });

  } catch (error) {
    console.error('❌ Error checking listing ownership:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkListingOwnership(); 