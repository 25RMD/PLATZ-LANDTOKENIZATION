import { PrismaClient } from '@prisma/client';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { PLATZ_LAND_NFT_ADDRESS } from '../config/contracts';

const prisma = new PrismaClient();

// Create public client for blockchain calls
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http('https://sepolia.infura.io/v3/YOUR_INFURA_KEY') // This will use the default RPC
});

async function syncCollection16Ownership() {
  console.log('🔄 Syncing ownership data for collection 16 tokens...');
  console.log('');

  try {
    // Get all tokens in collection 16
    const tokens = await prisma.evmCollectionToken.findMany({
      where: {
        landListing: {
          collectionId: '16'
        }
      },
      include: {
        landListing: {
          select: {
            id: true,
            collectionId: true,
            nftTitle: true
          }
        }
      },
      orderBy: {
        tokenId: 'asc'
      }
    });

    console.log(`📋 Found ${tokens.length} tokens in collection 16:`);
    tokens.forEach(token => {
      console.log(`   Token ${token.tokenId}: Current owner in DB = ${token.ownerAddress || 'null'}`);
    });
    console.log('');

    // Check blockchain ownership for each token
    console.log('🔍 Checking blockchain ownership...');
    const ownershipUpdates = [];

    for (const token of tokens) {
      try {
        console.log(`   Checking token ${token.tokenId}...`);
        
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
          args: [BigInt(token.tokenId)]
        }) as string;

        console.log(`      Blockchain owner: ${blockchainOwner}`);
        
        // Check if we need to update
        const currentDbOwner = token.ownerAddress?.toLowerCase();
        const blockchainOwnerLower = blockchainOwner.toLowerCase();
        
        if (currentDbOwner !== blockchainOwnerLower) {
          console.log(`      ⚠️  Ownership mismatch! DB: ${currentDbOwner || 'null'} vs Blockchain: ${blockchainOwnerLower}`);
          ownershipUpdates.push({
            tokenId: token.tokenId,
            tokenDbId: token.id,
            currentDbOwner: currentDbOwner,
            blockchainOwner: blockchainOwnerLower
          });
        } else {
          console.log(`      ✅ Ownership matches`);
        }

      } catch (error) {
        console.log(`      ❌ Error checking token ${token.tokenId}:`, error);
      }
    }

    console.log('');
    console.log(`📊 Summary: ${ownershipUpdates.length} tokens need ownership updates`);
    
    if (ownershipUpdates.length > 0) {
      console.log('');
      console.log('🔄 Updating ownership data...');
      
      for (const update of ownershipUpdates) {
        try {
          await prisma.evmCollectionToken.update({
            where: { id: update.tokenDbId },
            data: { ownerAddress: update.blockchainOwner }
          });
          
          console.log(`   ✅ Updated token ${update.tokenId}: ${update.currentDbOwner || 'null'} → ${update.blockchainOwner}`);
        } catch (error) {
          console.log(`   ❌ Failed to update token ${update.tokenId}:`, error);
        }
      }
      
      console.log('');
      console.log('✅ Ownership sync completed!');
      
      // Now check the user-owned collections API again
      console.log('');
      console.log('🔍 Testing user-owned collections API after sync...');
      
      const testUsers = [
        '0x6BE90E278ff81b25e2E48351c346886F8F50e99e',
        '0x3ec4bfe3167ba77A5906C034AABE5537BA7c4B07'
      ];
      
      for (const userAddress of testUsers) {
        console.log(`\n   Testing user: ${userAddress}`);
        
        // Check what tokens they own now
        const userTokens = await prisma.evmCollectionToken.findMany({
          where: {
            ownerAddress: {
              equals: userAddress,
              mode: 'insensitive'
            },
            landListing: {
              collectionId: '16'
            }
          }
        });
        
        console.log(`      Owns ${userTokens.length} tokens in collection 16: [${userTokens.map(t => t.tokenId).join(', ')}]`);
        
        // Check land listing ownership
        const user = await prisma.user.findFirst({
          where: {
            evmAddress: {
              equals: userAddress,
              mode: 'insensitive'
            }
          }
        });
        
        if (user) {
          const ownedListings = await prisma.landListing.count({
            where: {
              userId: user.id,
              collectionId: '16'
            }
          });
          
          console.log(`      Owns ${ownedListings} land listings in collection 16`);
          
          // Determine expected ownership type
          const expectedOwnershipType = userTokens.length > 0 ? 'TOKEN_OWNER' : 
                                       ownedListings > 0 ? 'COLLECTION_OWNER' : 
                                       'NONE';
          console.log(`      Expected ownership type: ${expectedOwnershipType}`);
        }
      }
      
    } else {
      console.log('✅ All ownership data is already up to date!');
    }

  } catch (error) {
    console.error('❌ Error syncing ownership:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the sync
if (require.main === module) {
  syncCollection16Ownership().catch(console.error);
} 