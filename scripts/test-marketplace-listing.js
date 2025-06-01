const { ethers } = require('ethers');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

const LandMarketplaceABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "collectionId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "paymentToken",
        "type": "address"
      }
    ],
    "name": "listCollection",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "collectionId",
        "type": "uint256"
      }
    ],
    "name": "getCollectionListing",
    "outputs": [
      {
        "internalType": "address",
        "name": "seller",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "mainTokenId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "paymentToken",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

async function testMarketplaceContract() {
  try {
    console.log('🔍 Testing Marketplace Contract Configuration...\n');
    
    // Get contract addresses from environment
    const marketplaceAddress = process.env.MARKETPLACE_CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS;
    const nftAddress = process.env.NFT_CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;
    const rpcUrl = process.env.SEPOLIA_RPC_URL || process.env.RPC_URL;
    
    console.log('📋 Environment Variables:');
    console.log('MARKETPLACE_CONTRACT_ADDRESS:', process.env.MARKETPLACE_CONTRACT_ADDRESS);
    console.log('NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS:', process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS);
    console.log('NFT_CONTRACT_ADDRESS:', process.env.NFT_CONTRACT_ADDRESS);
    console.log('NEXT_PUBLIC_NFT_CONTRACT_ADDRESS:', process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS);
    console.log('RPC_URL:', rpcUrl);
    console.log();
    
    console.log('🎯 Using Addresses:');
    console.log('Marketplace:', marketplaceAddress);
    console.log('NFT Contract:', nftAddress);
    console.log();
    
    if (!marketplaceAddress || !nftAddress || !rpcUrl) {
      console.error('❌ Missing required environment variables');
      return;
    }
    
    // Create provider and contract instance
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const marketplaceContract = new ethers.Contract(marketplaceAddress, LandMarketplaceABI, provider);
    
    console.log('✅ Contract instance created successfully');
    
    // Test 1: Check if contract exists and has expected functions
    console.log('\n🧪 Test 1: Contract Function Verification');
    console.log('Has listCollection function:', typeof marketplaceContract.listCollection === 'function');
    console.log('Has getCollectionListing function:', typeof marketplaceContract.getCollectionListing === 'function');
    console.log('Has owner function:', typeof marketplaceContract.owner === 'function');
    
    // Test 2: Try to call a read-only function
    console.log('\n🧪 Test 2: Contract Owner Check');
    try {
      const owner = await marketplaceContract.owner();
      console.log('✅ Contract owner:', owner);
    } catch (error) {
      console.error('❌ Failed to get contract owner:', error.message);
    }
    
    // Test 3: Check if any collections are already listed
    console.log('\n🧪 Test 3: Check Existing Collection Listings');
    let listedCount = 0;
    for (let collectionId = 1; collectionId <= 12; collectionId++) {
      try {
        const listing = await marketplaceContract.getCollectionListing(collectionId);
        if (listing.isActive) {
          console.log(`✅ Collection ${collectionId} is listed:`, {
            seller: listing.seller,
            mainTokenId: listing.mainTokenId.toString(),
            price: ethers.formatEther(listing.price),
            isActive: listing.isActive
          });
          listedCount++;
        } else {
          console.log(`⚪ Collection ${collectionId} is not listed`);
        }
      } catch (error) {
        console.log(`❌ Collection ${collectionId} check failed:`, error.message);
      }
    }
    
    console.log(`\n📊 Summary: ${listedCount} collections are currently listed on the marketplace`);
    console.log('\n🎉 Marketplace contract test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
console.log('Starting marketplace contract test...');
testMarketplaceContract()
  .then(() => {
    console.log('Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test failed with error:', error);
    process.exit(1);
  }); 