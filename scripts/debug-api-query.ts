import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugApiQuery() {
  console.log('🔍 Debugging API query for user-owned collections...');
  console.log('');

  const userAddress = '0x6BE90E278ff81b25e2E48351c346886F8F50e99e';

  // Step 1: Find user IDs
  const users = await prisma.user.findMany({
    where: {
      evmAddress: {
        equals: userAddress,
        mode: 'insensitive'
      }
    }
  });

  console.log('👤 USERS FOUND:');
  console.log('===============');
  users.forEach(user => {
    console.log(`ID: ${user.id}, Username: ${user.username}, Address: ${user.evmAddress}`);
  });
  console.log('');

  const userIds = users.map(user => user.id);

  // Step 2: Check owned tokens query (this is what the API uses)
  console.log('🏷️ OWNED TOKENS QUERY:');
  console.log('======================');
  
  const ownedTokens = await prisma.evmCollectionToken.findMany({
    where: {
      ownerAddress: {
        equals: userAddress,
        mode: 'insensitive'
      },
      mintStatus: 'COMPLETED'
    },
    include: {
      landListing: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              evmAddress: true
            }
          }
        }
      }
    },
    orderBy: [
      { landListingId: 'asc' },
      { tokenId: 'asc' }
    ]
  });

  console.log(`Found ${ownedTokens.length} owned tokens:`);
  ownedTokens.forEach(token => {
    console.log(`   Token ${token.tokenId} in collection ${token.landListing?.collectionId}: Owner=${token.ownerAddress}`);
  });
  console.log('');

  // Step 3: Check owned collection listings query
  console.log('🏠 OWNED COLLECTION LISTINGS QUERY:');
  console.log('===================================');
  
  const ownedCollectionListings = await prisma.landListing.findMany({
    where: {
      userId: {
        in: userIds
      },
      collectionId: {
        not: null
      }
    },
    include: {
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

  console.log(`Found ${ownedCollectionListings.length} owned collection listings:`);
  ownedCollectionListings.forEach(listing => {
    console.log(`   Collection ${listing.collectionId}: Listing ID=${listing.id}, Owner=${listing.user?.username}`);
  });
  console.log('');

  // Step 4: Check specific tokens in collection 16
  console.log('🔍 COLLECTION 16 TOKENS:');
  console.log('========================');
  
  const collection16Tokens = await prisma.evmCollectionToken.findMany({
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

  console.log(`Found ${collection16Tokens.length} tokens in collection 16:`);
  collection16Tokens.forEach(token => {
    console.log(`   Token ${token.tokenId}: Owner=${token.ownerAddress}, MintStatus=${token.mintStatus}`);
  });
  console.log('');

  // Step 5: Check if the issue is with the mintStatus
  console.log('🔍 MINT STATUS CHECK:');
  console.log('=====================');
  
  const collection16TokensWithUser = await prisma.evmCollectionToken.findMany({
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
          collectionId: true
        }
      }
    }
  });

  console.log(`Tokens in collection 16 owned by user (no mintStatus filter): ${collection16TokensWithUser.length}`);
  collection16TokensWithUser.forEach(token => {
    console.log(`   Token ${token.tokenId}: Owner=${token.ownerAddress}, MintStatus=${token.mintStatus}`);
  });
  console.log('');

  const collection16TokensCompleted = await prisma.evmCollectionToken.findMany({
    where: {
      ownerAddress: {
        equals: userAddress,
        mode: 'insensitive'
      },
      landListing: {
        collectionId: '16'
      },
      mintStatus: 'COMPLETED'
    }
  });

  console.log(`Tokens in collection 16 owned by user (with COMPLETED mintStatus): ${collection16TokensCompleted.length}`);
  collection16TokensCompleted.forEach(token => {
    console.log(`   Token ${token.tokenId}: Owner=${token.ownerAddress}, MintStatus=${token.mintStatus}`);
  });

  await prisma.$disconnect();
}

// Run the debug
if (require.main === module) {
  debugApiQuery().catch(console.error);
} 