const { ethers } = require('ethers');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

// Import the ABI (you might need to adjust the path)
const PlatzLandNFTAbi = require('../artifacts/contracts/PlatzLandNFTWithCollections.sol/PlatzLandNFTWithCollections.json');

// Contract configuration
const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || process.env.NFT_CONTRACT_ADDRESS;
const RPC_URL = process.env.SEPOLIA_RPC_URL || process.env.RPC_URL;

async function testContractFrontendStyle() {
  try {
    console.log('🧪 Testing Contract (Frontend Style)');
    console.log('===================================');
    console.log('Contract Address:', NFT_CONTRACT_ADDRESS);
    console.log('RPC URL:', RPC_URL);
    console.log('');

    if (!NFT_CONTRACT_ADDRESS || NFT_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      console.log('❌ Invalid contract address');
      return;
    }

    // Create provider and contract instance (similar to frontend)
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, PlatzLandNFTAbi.abi, provider);

    console.log('📦 Testing getAllCollectionIds (Frontend Method):');
    try {
      const allCollectionIds = await contract.getAllCollectionIds();
      console.log('✅ Success! Collection IDs:', allCollectionIds.map(id => id.toString()));
      console.log('✅ Number of collections:', allCollectionIds.length);
      
      // Test getting details for first collection
      if (allCollectionIds.length > 0) {
        console.log('');
        console.log('📋 Testing getCollection for first collection:');
        const firstCollectionId = allCollectionIds[0];
        const collectionDetails = await contract.getCollection(firstCollectionId);
        console.log('✅ Collection details for ID', firstCollectionId.toString() + ':');
        console.log('  - Start Token ID:', collectionDetails[0].toString());
        console.log('  - Total Supply:', collectionDetails[1].toString());
        console.log('  - Main Token ID:', collectionDetails[2].toString());
        console.log('  - Base URI:', collectionDetails[3]);
        console.log('  - Collection URI:', collectionDetails[4]);
        console.log('  - Creator:', collectionDetails[5]);
      }
      
    } catch (error) {
      console.log('❌ getAllCollectionIds failed:', error.message);
      console.log('Error details:', error);
    }

    console.log('');
    console.log('🔧 Environment Variables Check:');
    console.log('- NEXT_PUBLIC_NFT_CONTRACT_ADDRESS:', process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS);
    console.log('- NFT_CONTRACT_ADDRESS:', process.env.NFT_CONTRACT_ADDRESS);
    console.log('- SEPOLIA_RPC_URL:', process.env.SEPOLIA_RPC_URL ? 'Set' : 'Not set');
    console.log('- RPC_URL:', process.env.RPC_URL ? 'Set' : 'Not set');

  } catch (error) {
    console.error('❌ Test Error:', error);
  }
}

// Usage
if (require.main === module) {
  testContractFrontendStyle();
}

module.exports = { testContractFrontendStyle }; 