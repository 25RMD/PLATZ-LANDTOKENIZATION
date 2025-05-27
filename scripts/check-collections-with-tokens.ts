import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCollectionsWithTokens() {
  try {
    console.log('🔍 Checking collections with tokens...\n');

    const collections = await prisma.landListing.findMany({
      where: {
        collectionId: { not: null }
      },
      include: {
        evmCollectionTokens: true
      },
      orderBy: {
        collectionId: 'asc'
      }
    });

    console.log(`Found ${collections.length} collections:\n`);

    collections.forEach((collection, index) => {
      console.log(`${index + 1}. Collection ${collection.collectionId}:`);
      console.log(`   Title: ${collection.nftTitle || 'Untitled'}`);
      console.log(`   Tokens: ${collection.evmCollectionTokens.length}`);
      
      if (collection.evmCollectionTokens.length > 0) {
        console.log(`   Token IDs: ${collection.evmCollectionTokens.slice(0, 5).map(t => t.tokenId).join(', ')}${collection.evmCollectionTokens.length > 5 ? '...' : ''}`);
        
        // Show ownership of first few tokens
        const ownedTokens = collection.evmCollectionTokens.filter(t => 
          t.ownerAddress?.toLowerCase() === '0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07'
        );
        if (ownedTokens.length > 0) {
          console.log(`   ✅ User owns ${ownedTokens.length} tokens in this collection`);
        }
      }
      console.log('');
    });

    // Find the best collection for testing
    const collectionsWithTokens = collections.filter(c => c.evmCollectionTokens.length > 0);
    
    if (collectionsWithTokens.length > 0) {
      const bestCollection = collectionsWithTokens[0];
      const firstToken = bestCollection.evmCollectionTokens[0];
      
      console.log('🎯 Best collection for testing:');
      console.log(`   Collection ID: ${bestCollection.collectionId}`);
      console.log(`   First Token ID: ${firstToken.tokenId}`);
      console.log(`   Owner: ${firstToken.ownerAddress}`);
    } else {
      console.log('❌ No collections with tokens found');
    }

  } catch (error) {
    console.error('❌ Error checking collections:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCollectionsWithTokens().catch(console.error); 