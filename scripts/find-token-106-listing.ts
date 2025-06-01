import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findToken106Listing() {
  console.log('🔍 Searching for land listing that should contain token 106...');
  
  try {
    // 1. Check all land listings
    const allListings = await prisma.landListing.findMany({
      include: {
        evmCollectionTokens: true
      }
    });

    console.log(`\nFound ${allListings.length} total land listings:`);
    
    for (const listing of allListings) {
      console.log(`\n📋 Listing: ${listing.nftTitle} (ID: ${listing.id})`);
      console.log(`   Collection ID: ${listing.collectionId}`);
      console.log(`   Main Token ID: ${listing.mainTokenId}`);
      console.log(`   EVM Collection Tokens: ${listing.evmCollectionTokens.length}`);
      
      if (listing.evmCollectionTokens.length > 0) {
        const tokenIds = listing.evmCollectionTokens.map(t => t.tokenId).sort((a, b) => a - b);
        const minToken = Math.min(...tokenIds);
        const maxToken = Math.max(...tokenIds);
        console.log(`   Token range: ${minToken} - ${maxToken}`);
        
        // Check if token 106 should be in this range
        if (106 >= minToken && 106 <= maxToken) {
          console.log(`   🎯 Token 106 should be in this listing!`);
          
          // Check if it's actually there
          const hasToken106 = listing.evmCollectionTokens.some(t => t.tokenId === 106);
          console.log(`   Token 106 present: ${hasToken106 ? '✅ YES' : '❌ NO'}`);
          
          if (!hasToken106) {
            console.log(`   🔧 Need to add token 106 to this listing`);
          }
        }
      }
    }

    // 2. Check if there are any orphaned collection tokens
    console.log(`\n🔍 Checking for orphaned collection tokens around 106...`);
    
    const nearbyTokens = await prisma.evmCollectionToken.findMany({
      where: {
        tokenId: {
          gte: 100,
          lte: 110
        }
      },
      include: {
        landListing: {
          select: {
            id: true,
            nftTitle: true,
            collectionId: true
          }
        }
      },
      orderBy: {
        tokenId: 'asc'
      }
    });

    console.log(`Found ${nearbyTokens.length} tokens in range 100-110:`);
    nearbyTokens.forEach(token => {
      console.log(`   Token ${token.tokenId}: ${token.landListing ? `Listing ${token.landListing.id} (${token.landListing.nftTitle})` : 'NO LISTING'}`);
    });

    // 3. Check collection 16 specifically (from the error context)
    console.log(`\n🔍 Checking collection 16 specifically...`);
    
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

    if (collection16Listing) {
      console.log(`Found collection 16 listing: ${collection16Listing.nftTitle}`);
      console.log(`Tokens: ${collection16Listing.evmCollectionTokens.map(t => t.tokenId).join(', ')}`);
      
      const hasToken106 = collection16Listing.evmCollectionTokens.some(t => t.tokenId === 106);
      console.log(`Contains token 106: ${hasToken106 ? '✅ YES' : '❌ NO'}`);
      
      if (!hasToken106) {
        console.log(`\n🔧 Adding token 106 to collection 16...`);
        
        await prisma.evmCollectionToken.create({
          data: {
            tokenId: 106,
            landListingId: collection16Listing.id
          }
        });
        
        console.log(`✅ Added token 106 to collection 16 listing`);
      }
    } else {
      console.log(`❌ No listing found for collection 16`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findToken106Listing()
  .then(() => {
    console.log('\n🎉 Search completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }); 