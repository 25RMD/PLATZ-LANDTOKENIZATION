import { PrismaClient } from '@prisma/client';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { PLATZ_LAND_NFT_ADDRESS } from '../config/contracts';

const prisma = new PrismaClient();

// Create public client for blockchain calls
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http()
});

async function checkPlotOwnership() {
  console.log('🔍 Checking Plot 10 Ownership');
  console.log('=============================');
  
  try {
    // First, let's find all collections and their tokens to understand the mapping
    const collections = await prisma.landListing.findMany({
      where: {
        collectionId: { not: null },
        OR: [
          { mintStatus: 'COMPLETED' },
          { mintStatus: 'COMPLETED_COLLECTION' },
          { mintStatus: 'SUCCESS' }
        ]
      },
      include: {
        evmCollectionTokens: {
          orderBy: { tokenId: 'asc' }
        },
        user: {
          select: {
            id: true,
            username: true,
            evmAddress: true
          }
        }
      },
      orderBy: { collectionId: 'asc' }
    });

    console.log(`\n📋 Found ${collections.length} collections. Let's check Plot 10 in each:\n`);

    for (const collection of collections) {
      console.log(`🏠 Collection ${collection.collectionId}:`);
      console.log(`   Title: ${collection.nftTitle}`);
      console.log(`   Owner: ${collection.user?.username || 'Unknown'} (${collection.user?.evmAddress})`);
      console.log(`   Tokens: ${collection.evmCollectionTokens.length}`);
      
      if (collection.evmCollectionTokens.length >= 10) {
        // Plot 10 = index 9 (since plot numbers start from 1)
        const plot10Token = collection.evmCollectionTokens[9];
        
        console.log(`\n   📍 Plot 10 Details:`);
        console.log(`      Token ID: ${plot10Token.tokenId}`);
        console.log(`      Database Owner: ${plot10Token.ownerAddress || 'Not set'}`);
        console.log(`      Is Listed: ${plot10Token.isListed}`);
        console.log(`      Listing Price: ${plot10Token.listingPrice || 'Not listed'}`);
        
        // Check blockchain ownership
        try {
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
            args: [BigInt(plot10Token.tokenId)]
          }) as string;
          
          console.log(`      Blockchain Owner: ${blockchainOwner}`);
          
          // Find the user who owns this address
          const ownerUser = await prisma.user.findFirst({
            where: {
              evmAddress: {
                equals: blockchainOwner,
                mode: 'insensitive'
              }
            },
            select: {
              username: true,
              evmAddress: true
            }
          });
          
          if (ownerUser) {
            console.log(`      ✅ Owner: ${ownerUser.username} (${ownerUser.evmAddress})`);
          } else {
            console.log(`      ❓ Owner address not found in user database: ${blockchainOwner}`);
          }
          
          // Check if database matches blockchain
          const dbOwnerLower = plot10Token.ownerAddress?.toLowerCase();
          const blockchainOwnerLower = blockchainOwner.toLowerCase();
          
          if (dbOwnerLower === blockchainOwnerLower) {
            console.log(`      ✅ Database and blockchain ownership match`);
          } else {
            console.log(`      ⚠️  MISMATCH: DB says ${dbOwnerLower || 'null'}, blockchain says ${blockchainOwnerLower}`);
          }
          
        } catch (error) {
          console.log(`      ❌ Error checking blockchain ownership: ${error}`);
        }
        
      } else {
        console.log(`   ❌ Collection only has ${collection.evmCollectionTokens.length} tokens, no Plot 10`);
      }
      
      console.log(''); // Empty line for readability
    }
    
    // Also check for any recent activity on tokens that could be Plot 10
    console.log('\n🔍 Checking recent bids and transactions on potential Plot 10 tokens...\n');
    
    // Find all tokens at index 9 (Plot 10) across collections
    for (const collection of collections) {
      if (collection.evmCollectionTokens.length >= 10) {
        const plot10Token = collection.evmCollectionTokens[9];
        
        // Check recent bids
        const recentBids = await prisma.nftBid.findMany({
          where: {
            tokenId: parseInt(plot10Token.tokenId)
          },
          include: {
            bidder: {
              select: {
                username: true,
                evmAddress: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 3
        });
        
        if (recentBids.length > 0) {
          console.log(`💰 Recent bids on Plot 10 (Token ${plot10Token.tokenId}) in Collection ${collection.collectionId}:`);
          recentBids.forEach((bid, index) => {
            console.log(`   ${index + 1}. ${bid.bidAmount} ETH by ${bid.bidder.username} (${bid.bidStatus}) - ${bid.createdAt.toISOString()}`);
          });
          console.log('');
        }
      }
    }

  } catch (error) {
    console.error('❌ Error checking plot ownership:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPlotOwnership(); 