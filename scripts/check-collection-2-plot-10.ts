import { PrismaClient } from '@prisma/client';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { PLATZ_LAND_NFT_ADDRESS } from '../config/contracts';

const prisma = new PrismaClient();

// Create public client for blockchain calls
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http()
});

async function checkCollection2Plot10() {
  console.log('🔍 Checking Plot 10 in Collection 2: Zularich Garden 2.0');
  console.log('=====================================================');
  
  try {
    // Find Collection 2 specifically
    const collection = await prisma.landListing.findFirst({
      where: {
        collectionId: '2'
      },
      include: {
        evmCollectionTokens: {
          orderBy: { tokenId: 'asc' }
        },
        user: {
          select: {
            id: true,
            username: true,
            evmAddress: true
          }
        }
      }
    });

    if (!collection) {
      console.log('❌ Collection 2 not found!');
      return;
    }

    console.log(`\n🏠 Collection Details:`);
    console.log(`   Collection ID: ${collection.collectionId}`);
    console.log(`   Title: ${collection.nftTitle}`);
    console.log(`   Description: ${collection.nftDescription || 'No description'}`);
    console.log(`   Collection Owner: ${collection.user?.username || 'Unknown'} (${collection.user?.evmAddress})`);
    console.log(`   Total Tokens: ${collection.evmCollectionTokens.length}`);
    console.log(`   Collection Size: ${collection.nftCollectionSize}`);
    console.log(`   Created: ${collection.createdAt}`);
    
    if (collection.evmCollectionTokens.length >= 10) {
      // Plot 10 = index 9 (since plot numbers start from 1)
      const plot10Token = collection.evmCollectionTokens[9];
      
      console.log(`\n📍 Plot 10 Token Details:`);
      console.log(`   Token ID: ${plot10Token.tokenId}`);
      console.log(`   Database Owner: ${plot10Token.ownerAddress || 'Not set'}`);
      console.log(`   Is Listed for Sale: ${plot10Token.isListed}`);
      console.log(`   Listing Price: ${plot10Token.listingPrice || 'Not listed'} ETH`);
      console.log(`   Token URI: ${plot10Token.tokenURI || 'Not set'}`);
      
      // Find who owns this address in our user database
      if (plot10Token.ownerAddress) {
        const ownerUser = await prisma.user.findFirst({
          where: {
            evmAddress: {
              equals: plot10Token.ownerAddress,
              mode: 'insensitive'
            }
          },
          select: {
            id: true,
            username: true,
            evmAddress: true,
            email: true
          }
        });
        
        if (ownerUser) {
          console.log(`\n👤 Owner Details:`);
          console.log(`   Username: ${ownerUser.username}`);
          console.log(`   Email: ${ownerUser.email || 'Not provided'}`);
          console.log(`   Wallet Address: ${ownerUser.evmAddress}`);
          console.log(`   User ID: ${ownerUser.id}`);
        } else {
          console.log(`\n❓ Owner address ${plot10Token.ownerAddress} not found in user database`);
        }
      }
      
      // Check for any bids on this token
      const bids = await prisma.nftBid.findMany({
        where: {
          tokenId: parseInt(plot10Token.tokenId)
        },
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
      
      if (bids.length > 0) {
        console.log(`\n💰 Bids on Plot 10 (Token ${plot10Token.tokenId}):`);
        bids.forEach((bid, index) => {
          console.log(`   ${index + 1}. ${bid.bidAmount} ETH by ${bid.bidder.username} (${bid.bidStatus}) - ${bid.createdAt.toISOString()}`);
        });
      } else {
        console.log(`\n💰 No bids found on Plot 10 (Token ${plot10Token.tokenId})`);
      }
      
      // Try to check blockchain ownership (might fail due to network issues)
      console.log(`\n🔗 Attempting blockchain verification...`);
      try {
        const blockchainOwner = await publicClient.readContract({
          address: PLATZ_LAND_NFT_ADDRESS,
          abi: [{ 
            "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
            "name": "ownerOf",
            "outputs": [{"internalType": "address", "name": "", "type": "address"}],
            "stateMutability": "view",
            "type": "function"
          }],
          functionName: 'ownerOf',
          args: [BigInt(plot10Token.tokenId)]
        }) as string;
        
        console.log(`   Blockchain Owner: ${blockchainOwner}`);
        
        // Check if database matches blockchain
        const dbOwnerLower = plot10Token.ownerAddress?.toLowerCase();
        const blockchainOwnerLower = blockchainOwner.toLowerCase();
        
        if (dbOwnerLower === blockchainOwnerLower) {
          console.log(`   ✅ Database and blockchain ownership match`);
        } else {
          console.log(`   ⚠️  MISMATCH: Database says ${dbOwnerLower || 'null'}, blockchain says ${blockchainOwnerLower}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Cannot verify blockchain ownership due to network issues`);
        console.log(`   📝 Using database information as source of truth`);
      }
      
    } else {
      console.log(`\n❌ Collection only has ${collection.evmCollectionTokens.length} tokens, no Plot 10 exists`);
    }
    
    // Show all tokens in this collection for context
    console.log(`\n📋 All Tokens in Collection 2:`);
    collection.evmCollectionTokens.forEach((token, index) => {
      const plotNumber = index + 1;
      console.log(`   Plot ${plotNumber}: Token ID ${token.tokenId} - Owner: ${token.ownerAddress?.substring(0, 10)}... (Listed: ${token.isListed})`);
    });

  } catch (error) {
    console.error('❌ Error checking Collection 2 Plot 10:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCollection2Plot10(); 