import { PrismaClient } from '@prisma/client';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { PLATZ_LAND_NFT_ADDRESS } from '../config/contracts';

const prisma = new PrismaClient();

// Initialize blockchain client
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com')
});

async function testIndividualTokenOwnership() {
  console.log('🧪 Testing Individual Token Ownership System');
  console.log('===========================================');
  
  try {
    // Test 1: Check database token ownership records
    console.log('\n📊 Test 1: Database Token Ownership Records');
    console.log('-------------------------------------------');
    
    const tokensWithOwners = await prisma.evmCollectionToken.findMany({
      where: {
        ownerAddress: {
          not: null
        }
      },
      include: {
        landListing: {
          select: {
            collectionId: true,
            nftTitle: true,
            user: {
              select: {
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

    console.log(`Found ${tokensWithOwners.length} tokens with individual ownership records`);
    
    // Group by collection
    const collectionGroups = new Map<string, typeof tokensWithOwners>();
    tokensWithOwners.forEach(token => {
      const collectionId = token.landListing.collectionId;
      if (!collectionGroups.has(collectionId)) {
        collectionGroups.set(collectionId, []);
      }
      collectionGroups.get(collectionId)!.push(token);
    });

    for (const [collectionId, tokens] of collectionGroups) {
      console.log(`\nCollection ${collectionId} (${tokens[0].landListing.nftTitle}):`);
      console.log(`  Collection Owner: ${tokens[0].landListing.user.username} (${tokens[0].landListing.user.evmAddress})`);
      
      const ownershipMap = new Map<string, number>();
      tokens.forEach(token => {
        const owner = token.ownerAddress!.toLowerCase();
        ownershipMap.set(owner, (ownershipMap.get(owner) || 0) + 1);
      });

      console.log(`  Individual Token Ownership:`);
      for (const [owner, count] of ownershipMap) {
        const isCollectionOwner = owner === tokens[0].landListing.user.evmAddress?.toLowerCase();
        console.log(`    ${owner}: ${count} tokens ${isCollectionOwner ? '(Collection Owner)' : '(Different Owner)'}`);
      }
    }

    // Test 2: Check for self-bidding issues
    console.log('\n🚫 Test 2: Self-Bidding Detection');
    console.log('--------------------------------');
    
    const activeBids = await prisma.nftBid.findMany({
      where: {
        bidStatus: 'ACTIVE'
      },
      include: {
        bidder: {
          select: {
            evmAddress: true,
            username: true
          }
        },
        landListing: {
          include: {
            evmCollectionTokens: {
              where: {
                tokenId: { equals: 0 } // Will be updated in the loop
              }
            }
          }
        }
      }
    });

    console.log(`Checking ${activeBids.length} active bids for self-bidding issues...`);
    
    let selfBidCount = 0;
    for (const bid of activeBids) {
      // Get the specific token for this bid
      const token = await prisma.evmCollectionToken.findFirst({
        where: {
          landListingId: bid.landListingId,
          tokenId: bid.tokenId
        }
      });

      if (token && token.ownerAddress && bid.bidder.evmAddress) {
        const tokenOwner = token.ownerAddress.toLowerCase();
        const bidder = bid.bidder.evmAddress.toLowerCase();
        
        if (tokenOwner === bidder) {
          selfBidCount++;
          console.log(`  ⚠️  Self-bid detected: ${bid.bidder.username} (${bidder}) bidding on token ${bid.tokenId} they own`);
        }
      }
    }

    if (selfBidCount === 0) {
      console.log('  ✅ No self-bidding issues found');
    } else {
      console.log(`  ❌ Found ${selfBidCount} self-bidding issues`);
    }

    // Test 3: Blockchain vs Database ownership comparison
    console.log('\n⛓️  Test 3: Blockchain vs Database Ownership Sync');
    console.log('------------------------------------------------');
    
    // Sample a few tokens to check blockchain ownership
    const sampleTokens = tokensWithOwners.slice(0, 5);
    
    for (const token of sampleTokens) {
      try {
        console.log(`\nChecking token ${token.tokenId} from collection ${token.landListing.collectionId}:`);
        console.log(`  Database owner: ${token.ownerAddress}`);
        
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
          args: [BigInt(token.tokenId)]
        }) as string;

        console.log(`  Blockchain owner: ${blockchainOwner}`);
        
        if (token.ownerAddress!.toLowerCase() === blockchainOwner.toLowerCase()) {
          console.log(`  ✅ Ownership matches`);
        } else {
          console.log(`  ❌ Ownership mismatch!`);
        }
      } catch (error) {
        console.log(`  ⚠️  Error checking blockchain: ${error}`);
      }
    }

    // Test 4: Frontend ownership API test
    console.log('\n🖥️  Test 4: Frontend Ownership API Test');
    console.log('--------------------------------------');
    
    // Test the ownership API for a sample collection
    if (collectionGroups.size > 0) {
      const testCollectionId = Array.from(collectionGroups.keys())[0];
      const testTokens = collectionGroups.get(testCollectionId)!;
      const testOwner = testTokens[0].ownerAddress!;
      
      console.log(`Testing ownership API for collection ${testCollectionId} and owner ${testOwner}`);
      
      try {
        const response = await fetch(`http://localhost:3000/api/collections/${testCollectionId}/ownership?userAddress=${testOwner}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`  ✅ API Response: User owns ${data.data.ownership.totalOwned} tokens`);
          console.log(`  Owned token IDs: ${data.data.ownership.ownedTokenIds.join(', ')}`);
        } else {
          console.log(`  ❌ API Error: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.log(`  ⚠️  API call failed: ${error}`);
      }
    }

    // Test 5: Bid validation test
    console.log('\n🔍 Test 5: Bid Validation Test');
    console.log('------------------------------');
    
    if (tokensWithOwners.length > 0) {
      const testToken = tokensWithOwners[0];
      const tokenOwner = testToken.ownerAddress!;
      const differentUser = '0x1234567890123456789012345678901234567890'; // Mock address
      
      console.log(`Testing bid validation for token ${testToken.tokenId}:`);
      console.log(`  Token owner: ${tokenOwner}`);
      
      // Import and test bid validation
      const { validateBidPlacement } = await import('../lib/bidValidation');
      
      // Test 1: Owner trying to bid on their own token (should fail)
      const selfBidResult = await validateBidPlacement(
        testToken.landListingId,
        testToken.tokenId,
        tokenOwner
      );
      
      console.log(`  Self-bid validation: ${selfBidResult.isValid ? '❌ ALLOWED (should be blocked)' : '✅ BLOCKED (correct)'}`);
      if (!selfBidResult.isValid) {
        console.log(`    Error: ${selfBidResult.error}`);
      }
      
      // Test 2: Different user trying to bid (should succeed)
      const validBidResult = await validateBidPlacement(
        testToken.landListingId,
        testToken.tokenId,
        differentUser
      );
      
      console.log(`  Valid bid validation: ${validBidResult.isValid ? '✅ ALLOWED (correct)' : '❌ BLOCKED (should be allowed)'}`);
      if (!validBidResult.isValid) {
        console.log(`    Error: ${validBidResult.error}`);
      }
    }

    console.log('\n🎉 Individual Token Ownership Test Complete!');
    console.log('===========================================');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testIndividualTokenOwnership().catch(console.error); 