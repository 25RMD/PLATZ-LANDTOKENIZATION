const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log("Checking database for latest collections...");
  
  // Get the latest collections
  const collections = await prisma.landListing.findMany({
    where: {
      AND: [
        { status: 'APPROVED' },
        { collectionId: { not: null } },
        { 
          OR: [
            { mintStatus: 'COMPLETED' },
            { mintStatus: 'COMPLETED_COLLECTION' },
            { mintStatus: 'SUCCESS' }
          ]
        }
      ]
    },
    select: {
      id: true,
      collectionId: true,
      nftTitle: true,
      contractAddress: true,
      marketplaceListingId: true,
      marketplaceTransactionHash: true,
      listingPrice: true,
      isListedForSale: true,
      status: true,
      mintStatus: true,
      createdAt: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 5
  });
  
  console.log(`Found ${collections.length} collections:`);
  collections.forEach((c, i) => {
    console.log(`${i+1}. Collection ID: ${c.collectionId}`);
    console.log(`   Title: ${c.nftTitle}`);
    console.log(`   Contract: ${c.contractAddress}`);
    console.log(`   Marketplace Listing ID: ${c.marketplaceListingId}`);
    console.log(`   Marketplace Tx Hash: ${c.marketplaceTransactionHash}`);
    console.log(`   Listed for Sale: ${c.isListedForSale}`);
    console.log(`   Listing Price: ${c.listingPrice}`);
    console.log(`   Status: ${c.status}`);
    console.log(`   Mint Status: ${c.mintStatus}`);
    console.log(`   Created: ${c.createdAt}`);
    console.log('');
  });
  
  // Check specifically for marketplace-listed collections
  const marketplaceListings = await prisma.landListing.findMany({
    where: {
      marketplaceListingId: { not: null }
    },
    select: {
      collectionId: true,
      nftTitle: true,
      marketplaceListingId: true,
      marketplaceTransactionHash: true,
      status: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  console.log(`Collections with marketplace listing IDs: ${marketplaceListings.length}`);
  marketplaceListings.forEach((c, i) => {
    console.log(`${i+1}. Collection ${c.collectionId}: ${c.nftTitle} (Marketplace ID: ${c.marketplaceListingId})`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
