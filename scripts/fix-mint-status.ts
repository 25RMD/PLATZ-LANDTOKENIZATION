import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixMintStatus() {
  console.log('🔧 Fixing mint status for collection 16 tokens...');
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
            collectionId: true
          }
        }
      },
      orderBy: {
        tokenId: 'asc'
      }
    });

    console.log(`📋 Found ${tokens.length} tokens in collection 16:`);
    tokens.forEach(token => {
      console.log(`   Token ${token.tokenId}: Owner=${token.ownerAddress}, MintStatus=${token.mintStatus}`);
    });
    console.log('');

    // Update all tokens to COMPLETED status
    console.log('🔄 Updating mint status to COMPLETED...');
    
    for (const token of tokens) {
      try {
        await prisma.evmCollectionToken.update({
          where: { id: token.id },
          data: { mintStatus: 'COMPLETED' }
        });
        console.log(`   ✅ Token ${token.tokenId}: Updated to COMPLETED`);
      } catch (error) {
        console.log(`   ❌ Failed to update token ${token.tokenId}:`, error);
      }
    }

    console.log('');
    console.log('✅ Mint status updates completed!');
    
    // Test the API query again
    console.log('');
    console.log('🧪 Testing API query after mint status fix...');
    
    const ownedTokensAfterFix = await prisma.evmCollectionToken.findMany({
      where: {
        ownerAddress: {
          equals: '0x6BE90E278ff81b25e2E48351c346886F8F50e99e',
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

    console.log(`Found ${ownedTokensAfterFix.length} owned tokens with COMPLETED status:`);
    ownedTokensAfterFix.forEach(token => {
      console.log(`   Token ${token.tokenId} in collection ${token.landListing?.collectionId}`);
    });

  } catch (error) {
    console.error('❌ Error fixing mint status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
if (require.main === module) {
  fixMintStatus().catch(console.error);
} 