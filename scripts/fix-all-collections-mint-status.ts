import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixAllCollectionsMintStatus() {
  console.log('🔧 Fixing mint status for all collections with ownership issues...');
  console.log('');

  try {
    // Get all collections that have tokens
    const collections = await prisma.landListing.findMany({
      where: {
        collectionId: {
          not: null
        }
      },
      include: {
        evmCollectionTokens: {
          select: {
            id: true,
            tokenId: true,
            ownerAddress: true,
            mintStatus: true
          }
        },
        user: {
          select: {
            username: true,
            evmAddress: true
          }
        }
      },
      orderBy: {
        collectionId: 'asc'
      }
    });

    console.log(`📋 Found ${collections.length} collections:`);
    
    for (const collection of collections) {
      console.log(`\n🏠 Collection ${collection.collectionId} (${collection.nftTitle}):`);
      console.log(`   Owner: ${collection.user?.username} (${collection.user?.evmAddress})`);
      console.log(`   Tokens: ${collection.evmCollectionTokens.length}`);
      
      if (collection.evmCollectionTokens.length > 0) {
        const mintStatuses = collection.evmCollectionTokens.reduce((acc, token) => {
          acc[token.mintStatus] = (acc[token.mintStatus] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        console.log(`   Mint Status Distribution:`, mintStatuses);
        
        // Check if any tokens need mint status updates
        const tokensNeedingUpdate = collection.evmCollectionTokens.filter(
          token => token.mintStatus !== 'COMPLETED'
        );
        
        if (tokensNeedingUpdate.length > 0) {
          console.log(`   🔄 Updating ${tokensNeedingUpdate.length} tokens to COMPLETED status...`);
          
          for (const token of tokensNeedingUpdate) {
            try {
              await prisma.evmCollectionToken.update({
                where: { id: token.id },
                data: { mintStatus: 'COMPLETED' }
              });
              console.log(`      ✅ Token ${token.tokenId}: ${token.mintStatus} → COMPLETED`);
            } catch (error) {
              console.log(`      ❌ Failed to update token ${token.tokenId}:`, error);
            }
          }
        } else {
          console.log(`   ✅ All tokens already have COMPLETED status`);
        }
        
        // Show ownership distribution
        const ownershipDistribution = collection.evmCollectionTokens.reduce((acc, token) => {
          const owner = token.ownerAddress || 'null';
          acc[owner] = (acc[owner] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        console.log(`   👥 Ownership Distribution:`, ownershipDistribution);
      }
    }

    console.log('\n✅ Mint status updates completed for all collections!');
    
    // Test the API for both users
    console.log('\n🧪 Testing user-owned collections API after fixes...');
    
    const testUsers = [
      { name: 'bidder_user', address: '0x6BE90E278ff81b25e2E48351c346886F8F50e99e' },
      { name: 'admin', address: '0x3ec4bfe3167ba77A5906C034AABE5537BA7c4B07' }
    ];
    
    for (const testUser of testUsers) {
      console.log(`\n   Testing ${testUser.name} (${testUser.address}):`);
      
      // Check owned tokens with COMPLETED status
      const ownedTokens = await prisma.evmCollectionToken.findMany({
        where: {
          ownerAddress: {
            equals: testUser.address,
            mode: 'insensitive'
          },
          mintStatus: 'COMPLETED'
        },
        include: {
          landListing: {
            select: {
              collectionId: true
            }
          }
        }
      });
      
      // Group by collection
      const tokensByCollection = ownedTokens.reduce((acc, token) => {
        const collectionId = token.landListing?.collectionId || 'unknown';
        if (!acc[collectionId]) acc[collectionId] = [];
        acc[collectionId].push(token.tokenId);
        return acc;
      }, {} as Record<string, number[]>);
      
      console.log(`      Owned tokens by collection:`, tokensByCollection);
      
      // Check owned land listings
      const user = await prisma.user.findFirst({
        where: {
          evmAddress: {
            equals: testUser.address,
            mode: 'insensitive'
          }
        }
      });
      
      if (user) {
        const ownedListings = await prisma.landListing.findMany({
          where: {
            userId: user.id,
            collectionId: {
              not: null
            }
          },
          select: {
            collectionId: true
          }
        });
        
        console.log(`      Owned land listings: [${ownedListings.map(l => l.collectionId).join(', ')}]`);
      }
    }

  } catch (error) {
    console.error('❌ Error fixing mint status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
if (require.main === module) {
  fixAllCollectionsMintStatus().catch(console.error);
} 