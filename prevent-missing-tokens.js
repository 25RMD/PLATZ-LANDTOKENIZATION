const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function preventMissingTokens() {
  console.log('🛡️ Preventing Missing Token Issues');
  console.log('==================================');
  
  try {
    // Get all collections that should have tokens
    const collections = await prisma.landListing.findMany({
      where: {
        AND: [
          { collectionId: { not: null } },
          { mainTokenId: { not: null } },
          { nftCollectionSize: { not: null } },
          { 
            OR: [
              { mintStatus: 'COMPLETED' },
              { mintStatus: 'COMPLETED_COLLECTION' },
              { mintStatus: 'SUCCESS' }
            ]
          }
        ]
      },
      include: {
        evmCollectionTokens: true,
        user: {
          select: {
            id: true,
            username: true,
            evmAddress: true
          }
        }
      },
      orderBy: {
        collectionId: 'asc'
      }
    });
    
    console.log(`📊 Found ${collections.length} minted collections to check`);
    console.log('');
    
    let collectionsToFix = [];
    
    // Check each collection for missing tokens
    for (const collection of collections) {
      const expectedTokens = collection.nftCollectionSize || 0;
      const actualTokens = collection.evmCollectionTokens.length;
      
      const status = actualTokens === expectedTokens ? '✅' : '❌';
      console.log(`${status} Collection ${collection.collectionId}: ${actualTokens}/${expectedTokens} tokens`);
      
      if (actualTokens < expectedTokens) {
        collectionsToFix.push(collection);
        console.log(`   ⚠️  Missing ${expectedTokens - actualTokens} tokens`);
      }
    }
    
    console.log('');
    
    if (collectionsToFix.length === 0) {
      console.log('✅ All collections have the correct number of tokens!');
      return;
    }
    
    console.log(`🔧 Found ${collectionsToFix.length} collections with missing tokens:`);
    collectionsToFix.forEach(collection => {
      const missing = collection.nftCollectionSize - collection.evmCollectionTokens.length;
      console.log(`   - Collection ${collection.collectionId}: Missing ${missing} tokens`);
    });
    
    console.log('');
    console.log('🚀 Fixing missing tokens...');
    
    for (const collection of collectionsToFix) {
      console.log('');
      console.log(`🔧 Fixing Collection ${collection.collectionId}:`);
      
      const creatorAddress = collection.evmOwnerAddress || collection.user?.evmAddress;
      
      if (!creatorAddress) {
        console.log(`   ❌ No creator address found, skipping`);
        continue;
      }
      
      const mainTokenId = parseInt(collection.mainTokenId);
      const collectionSize = collection.nftCollectionSize;
      
      // Get existing transactions to determine ownership
      const transactions = await prisma.nftTransaction.findMany({
        where: {
          landListingId: collection.id
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      // Build ownership map
      const tokenOwnership = new Map();
      
      // Initialize all tokens as owned by creator
      for (let i = 0; i < collectionSize; i++) {
        const tokenId = mainTokenId + i;
        tokenOwnership.set(tokenId, creatorAddress);
      }
      
      // Apply transactions
      transactions.forEach(tx => {
        const tokenId = tx.tokenId;
        if (tokenId >= mainTokenId && tokenId < mainTokenId + collectionSize) {
          tokenOwnership.set(tokenId, tx.toAddress);
        }
      });
      
      // Get existing tokens to avoid duplicates
      const existingTokenIds = new Set(collection.evmCollectionTokens.map(t => t.tokenId));
      
      // Create missing tokens
      const tokensToCreate = [];
      for (let i = 0; i < collectionSize; i++) {
        const tokenId = mainTokenId + i;
        
        if (!existingTokenIds.has(tokenId)) {
          const ownerAddress = tokenOwnership.get(tokenId);
          const isMainToken = i === 0;
          
          tokensToCreate.push({
            landListingId: collection.id,
            tokenId: tokenId,
            ownerAddress: ownerAddress,
            isMainToken: isMainToken,
            isListed: false,
            listingPrice: null,
            tokenURI: '',
            mintStatus: 'COMPLETED'
          });
          
          console.log(`   ✅ Will create Token ${tokenId} → ${ownerAddress.substring(0, 8)}...${ownerAddress.substring(38)} ${isMainToken ? '(Main)' : ''}`);
        }
      }
      
      if (tokensToCreate.length > 0) {
        await prisma.$transaction(async (tx) => {
          for (const tokenData of tokensToCreate) {
            await tx.evmCollectionToken.create({
              data: tokenData
            });
          }
        });
        
        console.log(`   ✅ Created ${tokensToCreate.length} missing tokens`);
      } else {
        console.log(`   ℹ️  No tokens to create`);
      }
    }
    
    console.log('');
    console.log('✅ Missing token prevention completed successfully!');
    
    // Run verification
    console.log('');
    console.log('🔍 Final verification:');
    
    const updatedCollections = await prisma.landListing.findMany({
      where: {
        id: { in: collectionsToFix.map(c => c.id) }
      },
      include: {
        evmCollectionTokens: true
      }
    });
    
    updatedCollections.forEach(collection => {
      const expectedTokens = collection.nftCollectionSize || 0;
      const actualTokens = collection.evmCollectionTokens.length;
      const status = actualTokens === expectedTokens ? '✅' : '❌';
      console.log(`   ${status} Collection ${collection.collectionId}: ${actualTokens}/${expectedTokens} tokens`);
    });
    
  } catch (error) {
    console.error('❌ Error in missing token prevention:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Export the function for use in other scripts or as part of a maintenance routine
module.exports = { preventMissingTokens };

// Run if called directly
if (require.main === module) {
  preventMissingTokens();
} 