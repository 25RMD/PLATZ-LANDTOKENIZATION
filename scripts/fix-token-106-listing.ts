import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixToken106Listing() {
  console.log('🔧 Fixing token 106 listing association...');
  
  try {
    // Find collection 16 listing
    const collection16Listing = await prisma.landListing.findFirst({
      where: {
        collectionId: '16'
      },
      include: {
        evmCollectionTokens: {
          orderBy: { tokenId: 'asc' }
        }
      }
    });

    if (!collection16Listing) {
      console.log('❌ No listing found for collection 16');
      return;
    }

    console.log(`Found collection 16 listing: ${collection16Listing.nftTitle || 'Untitled'}`);
    console.log(`Listing ID: ${collection16Listing.id}`);
    console.log(`Main Token ID: ${collection16Listing.mainTokenId}`);
    console.log(`Current tokens: ${collection16Listing.evmCollectionTokens.map(t => t.tokenId).join(', ')}`);

    // Check if token 106 already exists
    const hasToken106 = collection16Listing.evmCollectionTokens.some(t => t.tokenId === 106);
    
    if (hasToken106) {
      console.log('✅ Token 106 already exists in collection 16');
      return;
    }

    // Look at existing tokens to understand the tokenURI pattern
    if (collection16Listing.evmCollectionTokens.length > 0) {
      console.log('\nExisting token URI patterns:');
      collection16Listing.evmCollectionTokens.slice(0, 3).forEach(token => {
        console.log(`  Token ${token.tokenId}: ${token.tokenURI}`);
      });
    }

    // Generate tokenURI for token 106 (following the pattern)
    const tokenURI = `https://platz.land/api/metadata/16/${106}`;
    
    console.log(`\n🔧 Adding token 106 with URI: ${tokenURI}`);
    
    await prisma.evmCollectionToken.create({
      data: {
        tokenId: 106,
        landListingId: collection16Listing.id,
        tokenURI: tokenURI
      }
    });
    
    console.log('✅ Successfully added token 106 to collection 16');

    // Verify the addition
    const updatedListing = await prisma.landListing.findUnique({
      where: { id: collection16Listing.id },
      include: {
        evmCollectionTokens: {
          where: { tokenId: 106 }
        }
      }
    });

    if (updatedListing?.evmCollectionTokens.length === 1) {
      console.log('✅ Verification successful - token 106 is now in the database');
    } else {
      console.log('❌ Verification failed - token 106 not found after creation');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixToken106Listing()
  .then(() => {
    console.log('\n🎉 Fix completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }); 