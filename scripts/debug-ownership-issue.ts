import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugOwnershipIssue() {
  console.log('🔍 Debugging ownership issue for collection 16');
  console.log('User: 0x6BE90E278ff81b25e2E48351c346886F8F50e99e');
  console.log('');

  const userAddress = '0x6BE90E278ff81b25e2E48351c346886F8F50e99e';

  // 1. Find the user record
  const user = await prisma.user.findFirst({
    where: {
      evmAddress: {
        equals: userAddress,
        mode: 'insensitive'
      }
    }
  });

  console.log('👤 USER RECORD:');
  console.log('===============');
  if (user) {
    console.log(`ID: ${user.id}`);
    console.log(`Username: ${user.username}`);
    console.log(`EVM Address: ${user.evmAddress}`);
  } else {
    console.log('❌ No user record found');
    return;
  }
  console.log('');

  // 2. Check land listings owned by this user in collection 16
  const ownedListings = await prisma.landListing.findMany({
    where: {
      userId: user.id,
      collectionId: '16'
    },
    include: {
      evmCollectionTokens: {
        select: {
          id: true,
          tokenId: true,
          ownerAddress: true,
          isListed: true,
          listingPrice: true
        }
      }
    }
  });

  console.log('🏠 LAND LISTINGS OWNED BY USER:');
  console.log('===============================');
  console.log(`Found ${ownedListings.length} listings owned by user in collection 16:`);
  ownedListings.forEach((listing, index) => {
    console.log(`${index + 1}. Listing ID: ${listing.id}`);
    console.log(`   Collection ID: ${listing.collectionId}`);
    console.log(`   Token ID: ${listing.tokenId}`);
    console.log(`   Title: ${listing.nftTitle}`);
    console.log(`   Status: ${listing.status}`);
    console.log(`   Main Token ID: ${listing.mainTokenId}`);
    console.log(`   EVM Collection Tokens: ${listing.evmCollectionTokens.length}`);
    listing.evmCollectionTokens.forEach((token, tokenIndex) => {
      console.log(`      ${tokenIndex + 1}. Token ${token.tokenId}: Owner=${token.ownerAddress}, Listed=${token.isListed}`);
    });
    console.log('');
  });

  // 3. Check EVM collection tokens owned by this user in collection 16
  const ownedTokens = await prisma.evmCollectionToken.findMany({
    where: {
      ownerAddress: {
        equals: userAddress,
        mode: 'insensitive'
      },
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
    }
  });

  console.log('🏷️ EVM COLLECTION TOKENS OWNED BY USER:');
  console.log('=======================================');
  console.log(`Found ${ownedTokens.length} tokens owned by user in collection 16:`);
  ownedTokens.forEach((token, index) => {
    console.log(`${index + 1}. Token ID: ${token.tokenId}`);
    console.log(`   Owner Address: ${token.ownerAddress}`);
    console.log(`   Is Listed: ${token.isListed}`);
    console.log(`   Listing Price: ${token.listingPrice}`);
    console.log(`   Land Listing ID: ${token.landListingId}`);
    console.log(`   Collection: ${token.landListing?.collectionId} - ${token.landListing?.nftTitle}`);
    console.log('');
  });

  // 4. Check all land listings in collection 16 to see who owns them
  const allListingsInCollection = await prisma.landListing.findMany({
    where: {
      collectionId: '16'
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          evmAddress: true
        }
      },
      evmCollectionTokens: {
        select: {
          tokenId: true,
          ownerAddress: true
        }
      }
    }
  });

  console.log('📋 ALL LAND LISTINGS IN COLLECTION 16:');
  console.log('======================================');
  console.log(`Found ${allListingsInCollection.length} total listings in collection 16:`);
  allListingsInCollection.forEach((listing, index) => {
    console.log(`${index + 1}. Listing ID: ${listing.id}`);
    console.log(`   Owner: ${listing.user?.username} (${listing.user?.evmAddress})`);
    console.log(`   Token ID: ${listing.tokenId}`);
    console.log(`   Main Token ID: ${listing.mainTokenId}`);
    console.log(`   Status: ${listing.status}`);
    console.log(`   EVM Tokens: ${listing.evmCollectionTokens.length}`);
    listing.evmCollectionTokens.forEach((token) => {
      console.log(`      Token ${token.tokenId}: Owner=${token.ownerAddress}`);
    });
    console.log('');
  });

  // 5. Check why the API thinks this user is a COLLECTION_OWNER
  console.log('🔍 OWNERSHIP TYPE ANALYSIS:');
  console.log('===========================');
  
  const isTokenOwner = ownedTokens.length > 0;
  const isCollectionOwner = ownedListings.length > 0;
  
  console.log(`Token Owner (owns individual tokens): ${isTokenOwner} (${ownedTokens.length} tokens)`);
  console.log(`Collection Owner (owns land listings): ${isCollectionOwner} (${ownedListings.length} listings)`);
  
  if (isCollectionOwner && !isTokenOwner) {
    console.log('✅ User is marked as COLLECTION_OWNER because they own land listings but no individual tokens');
  } else if (isTokenOwner && !isCollectionOwner) {
    console.log('✅ User should be marked as TOKEN_OWNER because they own individual tokens');
  } else if (isTokenOwner && isCollectionOwner) {
    console.log('✅ User should be marked as TOKEN_OWNER (priority over COLLECTION_OWNER)');
  } else {
    console.log('❌ User should not appear in owned collections at all');
  }

  await prisma.$disconnect();
}

// Run the debug
if (require.main === module) {
  debugOwnershipIssue().catch(console.error);
} 