const { createPublicClient, http } = require('viem');
const { sepolia } = require('viem/chains');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

// Import the ABI from the compiled artifacts
const PlatzLandNFTArtifact = require('../artifacts/contracts/PlatzLandNFTWithCollections.sol/PlatzLandNFTWithCollections.json');
const PlatzLandNFTABI = PlatzLandNFTArtifact.abi;

// Contract configuration
const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || process.env.NFT_CONTRACT_ADDRESS;
const RPC_URL = process.env.SEPOLIA_RPC_URL || process.env.RPC_URL;

async function testContractWithViem() {
  try {
    console.log('🧪 Testing Contract with Viem (Frontend Library)');
    console.log('================================================');
    console.log('Contract Address:', NFT_CONTRACT_ADDRESS);
    console.log('RPC URL:', RPC_URL);
    console.log('');

    if (!NFT_CONTRACT_ADDRESS || NFT_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      console.log('❌ Invalid contract address');
      return;
    }

    // Create Viem public client (same as frontend)
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(RPC_URL),
    });

    console.log('📋 Testing Contract Existence:');
    try {
      const bytecode = await publicClient.getBytecode({
        address: NFT_CONTRACT_ADDRESS,
      });
      console.log('✅ Contract exists:', bytecode !== '0x');
      console.log('✅ Bytecode length:', bytecode?.length || 0, 'characters');
    } catch (error) {
      console.log('❌ Error checking bytecode:', error.message);
    }

    console.log('');
    console.log('📦 Testing getAllCollectionIds with Viem:');
    try {
      console.log('Calling readContract with:');
      console.log('- address:', NFT_CONTRACT_ADDRESS);
      console.log('- functionName: getAllCollectionIds');
      console.log('- args: []');
      
      const allCollectionIds = await publicClient.readContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: PlatzLandNFTABI,
        functionName: 'getAllCollectionIds',
        args: [],
      });
      
      console.log('✅ Success! Collection IDs:', allCollectionIds?.map(id => id.toString()));
      console.log('✅ Number of collections:', allCollectionIds?.length || 0);
      
      // Test getCollection for the first few collection IDs
      if (allCollectionIds && allCollectionIds.length > 0) {
        console.log('');
        console.log('📋 Testing getCollection for individual collections:');
        
        for (let i = 0; i < Math.min(5, allCollectionIds.length); i++) {
          const collectionId = allCollectionIds[i];
          try {
            console.log(`\n🔍 Testing collection ID ${collectionId.toString()}:`);
            const collectionDetails = await publicClient.readContract({
              address: NFT_CONTRACT_ADDRESS,
              abi: PlatzLandNFTABI,
              functionName: 'getCollection',
              args: [collectionId],
            });
            
            console.log('✅ Success! Collection details:');
            console.log('  - Start Token ID:', collectionDetails[0]?.toString());
            console.log('  - Total Supply:', collectionDetails[1]?.toString());
            console.log('  - Main Token ID:', collectionDetails[2]?.toString());
            console.log('  - Base URI:', collectionDetails[3]);
            console.log('  - Collection URI:', collectionDetails[4]);
            console.log('  - Creator:', collectionDetails[5]);
            
          } catch (error) {
            console.log(`❌ getCollection failed for ID ${collectionId.toString()}:`, error.message);
            if (error.cause) {
              console.log('  Error cause:', error.cause.message || error.cause);
            }
          }
        }
      }
    } catch (error) {
      console.log('❌ getAllCollectionIds failed with Viem:', error.message);
      console.log('Full error:', error);
      
      // Try to get more details about the error
      if (error.cause) {
        console.log('Error cause:', error.cause);
      }
      if (error.data) {
        console.log('Error data:', error.data);
      }
    }

    console.log('');
    console.log('📦 Testing getCollectionCount with Viem:');
    try {
      const collectionCount = await publicClient.readContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: PlatzLandNFTABI,
        functionName: 'getCollectionCount',
        args: [],
      });
      
      console.log('✅ Success! Collection count:', collectionCount?.toString());
      
    } catch (error) {
      console.log('❌ getCollectionCount failed with Viem:', error.message);
      console.log('Full error:', error);
    }

    console.log('');
    console.log('📦 Testing Basic ERC721 Functions:');
    
    // Test name function
    try {
      const name = await publicClient.readContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: [
          {
            "inputs": [],
            "name": "name",
            "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
            "stateMutability": "view",
            "type": "function"
          }
        ],
        functionName: 'name',
        args: [],
      });
      console.log('✅ Contract name:', name);
    } catch (error) {
      console.log('❌ name() failed:', error.message);
    }

    // Test symbol function
    try {
      const symbol = await publicClient.readContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: [
          {
            "inputs": [],
            "name": "symbol",
            "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
            "stateMutability": "view",
            "type": "function"
          }
        ],
        functionName: 'symbol',
        args: [],
      });
      console.log('✅ Contract symbol:', symbol);
    } catch (error) {
      console.log('❌ symbol() failed:', error.message);
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
  testContractWithViem();
}

module.exports = { testContractWithViem }; 