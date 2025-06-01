import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkToken104Ownership() {
  console.log('🔍 Checking Token 104 Ownership Status');
  console.log('=====================================');
  
  // Get token 104 details
  const token = await prisma.evmCollectionToken.findFirst({
    where: { tokenId: 104 },
    include: {
      landListing: {
        include: {
          user: {
            select: {
              username: true,
              evmAddress: true
            }
          }
        }
      }
    }
  });
  
  if (token) {
    console.log('Token 104 Details:');
    console.log('- Token ID:', token.tokenId);
    console.log('- Current Owner (individual):', token.ownerAddress);
    console.log('- Collection Owner:', token.landListing.user.evmAddress);
    console.log('- Collection Owner Username:', token.landListing.user.username);
    console.log('');
    
    // Check who's trying to accept the bid
    const bid = await prisma.nftBid.findFirst({
      where: { 
        tokenId: 104,
        bidStatus: 'ACTIVE'
      },
      include: {
        bidder: {
          select: {
            username: true,
            evmAddress: true
          }
        }
      }
    });
    
    if (bid) {
      console.log('Active Bid Details:');
      console.log('- Bidder:', bid.bidder.username, '(' + bid.bidder.evmAddress + ')');
      console.log('- Bid Amount:', bid.bidAmount, 'ETH');
      console.log('');
      
      console.log('Ownership Analysis:');
      console.log('- Token Owner:', token.ownerAddress);
      console.log('- Bid Accepter Trying:', '0x6BE90E278ff81b25e2E48351c346886F8F50e99e');
      console.log('- Can Accept?', token.ownerAddress?.toLowerCase() === '0x6BE90E278ff81b25e2E48351c346886F8F50e99e'.toLowerCase() ? 'YES' : 'NO');
      
      if (token.ownerAddress?.toLowerCase() !== '0x6BE90E278ff81b25e2E48351c346886F8F50e99e'.toLowerCase()) {
        console.log('');
        console.log('❌ ISSUE: You are trying to accept a bid on a token you do not own!');
        console.log('');
        console.log('SOLUTION OPTIONS:');
        console.log('1. The current token owner (' + token.ownerAddress + ') needs to accept the bid');
        console.log('2. OR: If ownership is incorrect, we need to sync with blockchain');
        
        // Check if there are any recent transactions that might have changed ownership
        console.log('');
        console.log('🔍 Checking Recent Transactions for Token 104:');
        
        const recentTransactions = await prisma.nftTransaction.findMany({
          where: {
            tokenId: '104'
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        });
        
        if (recentTransactions.length > 0) {
          console.log('Recent transactions:');
          recentTransactions.forEach((tx, index) => {
            console.log(`${index + 1}. ${tx.transactionType}: ${tx.fromAddress} → ${tx.toAddress} (${tx.createdAt})`);
          });
        } else {
          console.log('No recent transactions found for token 104');
        }
      }
    } else {
      console.log('No active bid found for token 104');
    }
  } else {
    console.log('Token 104 not found');
  }
  
  await prisma.$disconnect();
}

checkToken104Ownership().catch(console.error); 