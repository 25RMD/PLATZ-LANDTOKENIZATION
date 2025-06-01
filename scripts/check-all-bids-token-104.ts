import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllBidsForToken104() {
  console.log('🔍 Checking All Bids for Token 104');
  console.log('=================================');
  
  const allBids = await prisma.nftBid.findMany({
    where: { tokenId: 104 },
    include: {
      bidder: {
        select: {
          username: true,
          evmAddress: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  console.log('Found', allBids.length, 'bids for token 104:');
  allBids.forEach((bid, index) => {
    console.log(`${index + 1}. ${bid.bidder.username} (${bid.bidder.evmAddress})`);
    console.log(`   Amount: ${bid.bidAmount} ETH`);
    console.log(`   Status: ${bid.bidStatus}`);
    console.log(`   Created: ${bid.createdAt}`);
    console.log(`   Updated: ${bid.updatedAt}`);
    console.log('');
  });
  
  // Also check the current token ownership
  const token = await prisma.evmCollectionToken.findFirst({
    where: { tokenId: 104 }
  });
  
  if (token) {
    console.log('Current Token 104 Ownership:');
    console.log('- Owner Address:', token.ownerAddress);
    console.log('- Last Updated:', token.updatedAt);
  }
  
  await prisma.$disconnect();
}

checkAllBidsForToken104().catch(console.error); 