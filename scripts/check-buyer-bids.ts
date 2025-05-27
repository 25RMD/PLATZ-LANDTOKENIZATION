import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkBuyerBids() {
  try {
    console.log('🔍 Checking bids from buyer address: 0x6BE90E278ff81b25e2E48351c346886F8F50e99e\n');

    const buyerAddress = '0x6BE90E278ff81b25e2E48351c346886F8F50e99e';
    const sellerAddress = '0x3ec4bfe3167ba77A5906C034AABE5537BA7c4B07';

    // Check all bids made by the buyer
    const buyerBids = await prisma.nftBid.findMany({
      where: {
        bidder: {
          evmAddress: {
            equals: buyerAddress,
            mode: 'insensitive'
          }
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
      }
    });

    console.log(`📋 Found ${buyerBids.length} bids made by buyer address:`);
    
    if (buyerBids.length > 0) {
      buyerBids.forEach((bid, index) => {
        console.log(`   ${index + 1}. Bid ID: ${bid.id}`);
        console.log(`      Status: ${bid.bidStatus}`);
        console.log(`      Amount: ${bid.bidAmount} ETH`);
        console.log(`      Token: ${bid.landListing.tokenId} in collection ${bid.landListing.collectionId}`);
        console.log(`      Listing Owner: ${bid.landListing.user?.evmAddress} (${bid.landListing.user?.username || 'Anonymous'})`);
        console.log(`      Created: ${bid.createdAt.toISOString()}`);
        console.log(`      Updated: ${bid.updatedAt.toISOString()}`);
        console.log(`      Transaction: ${bid.transactionHash}`);
        
        // Check if this bid was on a token owned by our target seller
        if (bid.landListing.user?.evmAddress?.toLowerCase() === sellerAddress.toLowerCase()) {
          console.log(`      🎯 THIS BID WAS ON A TOKEN OWNED BY ${sellerAddress}!`);
        }
        console.log('');
      });

      // Check for accepted bids specifically
      const acceptedBids = buyerBids.filter(bid => bid.bidStatus === 'ACCEPTED');
      if (acceptedBids.length > 0) {
        console.log(`\n✅ Found ${acceptedBids.length} ACCEPTED bids:`);
        acceptedBids.forEach((bid, index) => {
          console.log(`   ${index + 1}. Accepted Bid ID: ${bid.id}`);
          console.log(`      Amount: ${bid.bidAmount} ETH`);
          console.log(`      Token: ${bid.landListing.tokenId} in collection ${bid.landListing.collectionId}`);
          console.log(`      Seller: ${bid.landListing.user?.evmAddress}`);
          console.log(`      Accepted at: ${bid.updatedAt.toISOString()}`);
        });
      }
    }

    // Also check recent transactions between these two addresses
    console.log('\n📋 Checking recent transactions between buyer and seller:');
    const recentTransactions = await prisma.nftTransaction.findMany({
      where: {
        AND: [
          {
            fromAddress: {
              equals: sellerAddress,
              mode: 'insensitive'
            }
          },
          {
            toAddress: {
              equals: buyerAddress,
              mode: 'insensitive'
            }
          }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    if (recentTransactions.length > 0) {
      console.log(`   Found ${recentTransactions.length} transactions from seller to buyer:`);
      recentTransactions.forEach((tx, index) => {
        console.log(`   ${index + 1}. Transaction: ${tx.transactionHash}`);
        console.log(`      Type: ${tx.transactionType}`);
        console.log(`      Price: ${tx.price} ETH`);
        console.log(`      Token: ${tx.tokenId} in listing ${tx.landListingId}`);
        console.log(`      Created: ${tx.createdAt.toISOString()}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error checking buyer bids:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBuyerBids(); 