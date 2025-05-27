import { PrismaClient } from '@prisma/client';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
const PLATZ_LAND_NFT_ADDRESS = '0xc2Fba30e5d703c237C7fE94E861E34ffA1536b36';

const prisma = new PrismaClient();

// Initialize blockchain client
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http()
});

async function fixBidDataConsistency() {
  try {
    console.log('🔧 Starting bid data consistency fix...\n');

    // Step 1: Find and fix self-bidding issues
    console.log('📋 1. Identifying self-bidding issues:');
    
    const selfBids = await prisma.nftBid.findMany({
      where: {
        bidStatus: 'ACTIVE'
      },
      include: {
        bidder: {
          select: {
            evmAddress: true,
            username: true
          }
        },
        landListing: {
          include: {
            user: {
              select: {
                evmAddress: true,
                username: true
              }
            }
          }
        }
      }
    });

    const selfBidIssues = selfBids.filter(bid => 
      bid.bidder.evmAddress?.toLowerCase() === bid.landListing.user?.evmAddress?.toLowerCase()
    );

    if (selfBidIssues.length > 0) {
      console.log(`   Found ${selfBidIssues.length} self-bidding issues:`);
      
      for (const bid of selfBidIssues) {
        console.log(`   - Bid ${bid.id}: User ${bid.bidder.username} bidding on their own token`);
        
        // Cancel self-bids
        await prisma.nftBid.update({
          where: { id: bid.id },
          data: {
            bidStatus: 'CANCELLED',
            updatedAt: new Date()
          }
        });
        
        console.log(`     ✅ Cancelled self-bid ${bid.id}`);
      }
    } else {
      console.log('   ✅ No self-bidding issues found');
    }

    // Step 2: Sync ownership with blockchain for all active listings
    console.log('\n📋 2. Syncing ownership with blockchain:');
    
    const activeListings = await prisma.landListing.findMany({
      where: {
        status: 'OWNED'
      },
      include: {
        user: {
          select: {
            id: true,
            evmAddress: true,
            username: true
          }
        }
      }
    });

    let ownershipFixed = 0;
    let ownershipErrors = 0;

    for (const listing of activeListings) {
      if (!listing.tokenId) {
        console.log(`   ⚠️  Skipping listing ${listing.id} - no tokenId`);
        continue;
      }

      try {
        // Get current owner from blockchain
        const blockchainOwner = await publicClient.readContract({
          address: PLATZ_LAND_NFT_ADDRESS,
          abi: [{ 
            "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
            "name": "ownerOf",
            "outputs": [{"internalType": "address", "name": "", "type": "address"}],
            "stateMutability": "view",
            "type": "function"
          }],
          functionName: 'ownerOf',
          args: [BigInt(listing.tokenId)]
        }) as string;

        const databaseOwner = listing.user?.evmAddress;

        if (!databaseOwner || databaseOwner.toLowerCase() !== blockchainOwner.toLowerCase()) {
          console.log(`   🔄 Ownership mismatch for token ${listing.tokenId}:`);
          console.log(`      Database: ${databaseOwner || 'null'}`);
          console.log(`      Blockchain: ${blockchainOwner}`);

          // Find the correct user
          const correctUser = await prisma.user.findFirst({
            where: {
              evmAddress: {
                equals: blockchainOwner,
                mode: 'insensitive'
              }
            }
          });

          if (correctUser) {
            // Update listing ownership
            await prisma.landListing.update({
              where: { id: listing.id },
              data: { userId: correctUser.id }
            });

            // Update EVM collection token if exists
            const evmToken = await prisma.evmCollectionToken.findFirst({
              where: {
                landListingId: listing.id,
                tokenId: listing.tokenId
              }
            });

            if (evmToken) {
              await prisma.evmCollectionToken.update({
                where: { id: evmToken.id },
                data: {
                  ownerAddress: blockchainOwner,
                  isListed: false,
                  listingPrice: null
                }
              });
            }

            console.log(`      ✅ Fixed ownership for token ${listing.tokenId} -> ${correctUser.username || correctUser.evmAddress}`);
            ownershipFixed++;
          } else {
            console.log(`      ❌ No user found for blockchain owner ${blockchainOwner}`);
            ownershipErrors++;
          }
        }

      } catch (error) {
        console.log(`   ❌ Error checking token ${listing.tokenId}:`, error);
        ownershipErrors++;
      }
    }

    console.log(`   📊 Ownership sync results: ${ownershipFixed} fixed, ${ownershipErrors} errors`);

    // Step 3: Clean up duplicate accepted bids
    console.log('\n📋 3. Cleaning up duplicate accepted bids:');
    
    const duplicateAcceptedBids = await prisma.nftBid.groupBy({
      by: ['landListingId', 'tokenId'],
      where: {
        bidStatus: 'ACCEPTED'
      },
      having: {
        landListingId: {
          _count: {
            gt: 1
          }
        }
      }
    });

    if (duplicateAcceptedBids.length > 0) {
      console.log(`   Found ${duplicateAcceptedBids.length} tokens with multiple accepted bids`);
      
      for (const group of duplicateAcceptedBids) {
        const acceptedBids = await prisma.nftBid.findMany({
          where: {
            landListingId: group.landListingId,
            tokenId: group.tokenId,
            bidStatus: 'ACCEPTED'
          },
          orderBy: {
            updatedAt: 'desc'
          }
        });

        // Keep the most recent accepted bid, mark others as OUTBID
        const [mostRecent, ...older] = acceptedBids;
        
        if (older.length > 0) {
          await prisma.nftBid.updateMany({
            where: {
              id: {
                in: older.map(bid => bid.id)
              }
            },
            data: {
              bidStatus: 'OUTBID'
            }
          });
          
          console.log(`   ✅ Fixed ${older.length} duplicate accepted bids for token ${group.tokenId}`);
        }
      }
    } else {
      console.log('   ✅ No duplicate accepted bids found');
    }

    // Step 4: Validate all active bids
    console.log('\n📋 4. Validating all active bids:');
    
    const activeBids = await prisma.nftBid.findMany({
      where: {
        bidStatus: 'ACTIVE'
      },
      include: {
        bidder: {
          select: {
            evmAddress: true,
            username: true
          }
        },
        landListing: {
          include: {
            user: {
              select: {
                evmAddress: true,
                username: true
              }
            }
          }
        }
      }
    });

    let validBids = 0;
    let invalidBids = 0;

    for (const bid of activeBids) {
      if (!bid.landListing.tokenId) {
        console.log(`   ⚠️  Skipping bid ${bid.id} - no tokenId in listing`);
        continue;
      }

      try {
        // Check if token still exists and get current owner
        const currentOwner = await publicClient.readContract({
          address: PLATZ_LAND_NFT_ADDRESS,
          abi: [{ 
            "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
            "name": "ownerOf",
            "outputs": [{"internalType": "address", "name": "", "type": "address"}],
            "stateMutability": "view",
            "type": "function"
          }],
          functionName: 'ownerOf',
          args: [BigInt(bid.landListing.tokenId)]
        }) as string;

        // Check if bidder is trying to bid on their own token
        if (bid.bidder.evmAddress?.toLowerCase() === currentOwner.toLowerCase()) {
          await prisma.nftBid.update({
            where: { id: bid.id },
            data: {
              bidStatus: 'CANCELLED',
              updatedAt: new Date()
            }
          });
          
          console.log(`   ❌ Cancelled invalid self-bid ${bid.id}`);
          invalidBids++;
        } else {
          validBids++;
        }

      } catch (error) {
        console.log(`   ❌ Error validating bid ${bid.id}:`, error);
        invalidBids++;
      }
    }

    console.log(`   📊 Bid validation results: ${validBids} valid, ${invalidBids} invalid/cancelled`);

    // Step 5: Summary
    console.log('\n📊 Data consistency fix summary:');
    console.log(`   - Self-bids cancelled: ${selfBidIssues.length}`);
    console.log(`   - Ownership records fixed: ${ownershipFixed}`);
    console.log(`   - Ownership errors: ${ownershipErrors}`);
    console.log(`   - Duplicate accepted bids cleaned: ${duplicateAcceptedBids.length}`);
    console.log(`   - Active bids validated: ${validBids} valid, ${invalidBids} invalid`);
    
    console.log('\n✅ Data consistency fix completed!');

  } catch (error) {
    console.error('❌ Error during data consistency fix:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixBidDataConsistency(); 