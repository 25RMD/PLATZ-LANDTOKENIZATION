import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTokenOwnership() {
  console.log('🔍 Checking token 104 ownership and listing details...');
  
  // Find the land listing for token 104
  const listing = await prisma.landListing.findFirst({
    where: {
      evmCollectionTokens: {
        some: { tokenId: 104 }
      }
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
        where: { tokenId: 104 }
      }
    }
  });
  
  if (listing) {
    console.log('📋 LISTING DETAILS:');
    console.log('===================');
    console.log(`Listing ID: ${listing.id}`);
    console.log(`Collection ID: ${listing.collectionId}`);
    console.log(`Owner: ${listing.user.username} (${listing.user.evmAddress})`);
    console.log('');
    
    if (listing.evmCollectionTokens.length > 0) {
      const token = listing.evmCollectionTokens[0];
      console.log('🏷️ TOKEN DETAILS:');
      console.log('=================');
      console.log(`Token ID: ${token.tokenId}`);
      console.log(`Owner Address: ${token.ownerAddress || 'NULL'}`);
    }
  } else {
    console.log('❌ No listing found for token 104');
  }
  
  // Check all bids on token 104
  const bids = await prisma.nftBid.findMany({
    where: { tokenId: 104 },
    include: {
      bidder: {
        select: {
          username: true,
          evmAddress: true
        }
      }
    },
    orderBy: { bidAmount: 'desc' }
  });
  
  console.log('');
  console.log('💰 ALL BIDS ON TOKEN 104:');
  console.log('=========================');
  bids.forEach(bid => {
    console.log(`- ${bid.bidAmount} ETH by ${bid.bidder.username} (${bid.bidder.evmAddress}) - Status: ${bid.bidStatus}`);
  });
  
  await prisma.$disconnect();
}

// Run the check
if (require.main === module) {
  checkTokenOwnership().catch(console.error);
} 