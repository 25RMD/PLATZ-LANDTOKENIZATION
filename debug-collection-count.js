const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCollectionCounts() {
  try {
    // Get collections with token counts
    const collections = await prisma.landListing.findMany({
      where: {
        collectionId: { not: null }
      },
      select: {
        id: true,
        collectionId: true,
        mainTokenId: true,
        nftCollectionSize: true,
        nftTitle: true,
        evmCollectionTokens: {
          select: {
            tokenId: true,
            isMainToken: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    console.log('Collection Token Count Analysis:');
    console.log('===============================');
    
    collections.forEach(collection => {
      const totalTokens = collection.evmCollectionTokens.length;
      const mainTokens = collection.evmCollectionTokens.filter(t => t.isMainToken).length;
      const childTokens = collection.evmCollectionTokens.filter(t => !t.isMainToken).length;
      
      console.log(`\nCollection: ${collection.nftTitle || 'Unnamed'}`);
      console.log(`  Database ID: ${collection.id}`);
      console.log(`  Collection ID: ${collection.collectionId}`);
      console.log(`  Expected Size: ${collection.nftCollectionSize}`);
      console.log(`  Actual Total: ${totalTokens}`);
      console.log(`  Main Tokens: ${mainTokens}`);
      console.log(`  Child Tokens: ${childTokens}`);
      console.log(`  Status: ${totalTokens === collection.nftCollectionSize ? '✅ CORRECT' : '❌ MISMATCH'}`);
      
      if (totalTokens !== collection.nftCollectionSize) {
        console.log(`  Expected: ${collection.nftCollectionSize}, Got: ${totalTokens} (Difference: ${totalTokens - collection.nftCollectionSize})`);
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCollectionCounts(); 