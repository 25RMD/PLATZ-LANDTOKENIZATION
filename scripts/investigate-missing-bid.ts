import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function investigateMissingBid() {
  try {
    console.log('🔍 Investigating missing bid for wallet: 0x3ec4bfe3167ba77A5906C034AABE5537BA7c4B07\n');

    const targetAddress = '0x3ec4bfe3167ba77A5906C034AABE5537BA7c4B07';

    // 1. Check all bids involving this address (as bidder)
    console.log('📋 1. Checking bids made BY this address:');
    const bidsAsBidder = await prisma.nftBid.findMany({
      where: {
        bidder: {
          evmAddress: {
            equals: targetAddress,
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
          select: {
            id: true,
            nftTitle: true,
            collectionId: true,
            tokenId: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (bidsAsBidder.length > 0) {
      console.log(`   Found ${bidsAsBidder.length} bids made by this address:`);
      bidsAsBidder.forEach((bid, index) => {
        console.log(`   ${index + 1}. Bid ID: ${bid.id}`);
        console.log(`      Status: ${bid.bidStatus}`);
        console.log(`      Amount: ${bid.bidAmount} ETH`);
        console.log(`      Token: ${bid.landListing.tokenId} in collection ${bid.landListing.collectionId}`);
        console.log(`      Created: ${bid.createdAt.toISOString()}`);
        console.log(`      Updated: ${bid.updatedAt.toISOString()}`);
        console.log(`      Transaction: ${bid.transactionHash}`);
        console.log('');
      });
    } else {
      console.log('   ❌ No bids found made by this address');
    }

    // 2. Check all bids received on tokens owned by this address
    console.log('📋 2. Checking bids received ON tokens owned by this address:');
    const bidsReceived = await prisma.nftBid.findMany({
      where: {
        landListing: {
          user: {
            evmAddress: {
              equals: targetAddress,
              mode: 'insensitive'
            }
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
          select: {
            id: true,
            nftTitle: true,
            collectionId: true,
            tokenId: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (bidsReceived.length > 0) {
      console.log(`   Found ${bidsReceived.length} bids received on tokens owned by this address:`);
      bidsReceived.forEach((bid, index) => {
        console.log(`   ${index + 1}. Bid ID: ${bid.id}`);
        console.log(`      Status: ${bid.bidStatus}`);
        console.log(`      Amount: ${bid.bidAmount} ETH`);
        console.log(`      From: ${bid.bidder.evmAddress} (${bid.bidder.username || 'Anonymous'})`);
        console.log(`      Token: ${bid.landListing.tokenId} in collection ${bid.landListing.collectionId}`);
        console.log(`      Created: ${bid.createdAt.toISOString()}`);
        console.log(`      Updated: ${bid.updatedAt.toISOString()}`);
        console.log(`      Transaction: ${bid.transactionHash}`);
        console.log('');
      });
    } else {
      console.log('   ❌ No bids found received on tokens owned by this address');
    }

    // 3. Check recent bid status changes
    console.log('📋 3. Checking recent bid status changes (last 24 hours):');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const recentBidChanges = await prisma.nftBid.findMany({
      where: {
        updatedAt: {
          gte: yesterday
        },
        OR: [
          {
            bidder: {
              evmAddress: {
                equals: targetAddress,
                mode: 'insensitive'
              }
            }
          },
          {
            landListing: {
              user: {
                evmAddress: {
                  equals: targetAddress,
                  mode: 'insensitive'
                }
              }
            }
          }
        ]
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
          select: {
            id: true,
            nftTitle: true,
            collectionId: true,
            tokenId: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    if (recentBidChanges.length > 0) {
      console.log(`   Found ${recentBidChanges.length} recent bid changes:`);
      recentBidChanges.forEach((bid, index) => {
        console.log(`   ${index + 1}. Bid ID: ${bid.id}`);
        console.log(`      Status: ${bid.bidStatus}`);
        console.log(`      Amount: ${bid.bidAmount} ETH`);
        console.log(`      Bidder: ${bid.bidder.evmAddress}`);
        console.log(`      Token: ${bid.landListing.tokenId} in collection ${bid.landListing.collectionId}`);
        console.log(`      Created: ${bid.createdAt.toISOString()}`);
        console.log(`      Updated: ${bid.updatedAt.toISOString()}`);
        console.log(`      Transaction: ${bid.transactionHash}`);
        console.log('');
      });
    } else {
      console.log('   ❌ No recent bid changes found');
    }

    // 4. Check for any transactions involving this address
    console.log('📋 4. Checking NFT transactions involving this address:');
    const transactions = await prisma.nftTransaction.findMany({
      where: {
        OR: [
          {
            fromAddress: {
              equals: targetAddress,
              mode: 'insensitive'
            }
          },
          {
            toAddress: {
              equals: targetAddress,
              mode: 'insensitive'
            }
          }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // Last 10 transactions
    });

    if (transactions.length > 0) {
      console.log(`   Found ${transactions.length} recent transactions:`);
      transactions.forEach((tx, index) => {
        console.log(`   ${index + 1}. Transaction: ${tx.transactionHash}`);
        console.log(`      Type: ${tx.transactionType}`);
        console.log(`      From: ${tx.fromAddress}`);
        console.log(`      To: ${tx.toAddress}`);
        console.log(`      Price: ${tx.price} ETH`);
        console.log(`      Token: ${tx.tokenId} in listing ${tx.landListingId}`);
        console.log(`      Created: ${tx.createdAt.toISOString()}`);
        console.log('');
      });
    } else {
      console.log('   ❌ No transactions found involving this address');
    }

    // 5. Check user record
    console.log('📋 5. Checking user record:');
    const user = await prisma.user.findFirst({
      where: {
        evmAddress: {
          equals: targetAddress,
          mode: 'insensitive'
        }
      }
    });

    if (user) {
      console.log(`   ✅ User found:`);
      console.log(`      ID: ${user.id}`);
      console.log(`      Username: ${user.username || 'Not set'}`);
      console.log(`      EVM Address: ${user.evmAddress}`);
      console.log(`      Created: ${user.createdAt.toISOString()}`);
      console.log(`      Updated: ${user.updatedAt.toISOString()}`);
    } else {
      console.log('   ❌ No user record found for this address');
    }

  } catch (error) {
    console.error('❌ Error investigating missing bid:', error);
  } finally {
    await prisma.$disconnect();
  }
}

investigateMissingBid(); 