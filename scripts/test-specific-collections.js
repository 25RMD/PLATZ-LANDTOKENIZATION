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

async function testSpecificCollections() {
  try {
    console.log('🧪 Testing Specific Collection IDs');
    console.log('==================================');
    
    // Create Viem public client (same as frontend)
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(RPC_URL),
    });

    // Test the specific collection IDs that are failing: 7, 8, 9, 10
    const failingIds = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    
    for (const collectionId of failingIds) {
      try {
        console.log(`\n🔍 Testing collection ID ${collectionId}:`);
        const collectionDetails = await publicClient.readContract({
          address: NFT_CONTRACT_ADDRESS,
          abi: PlatzLandNFTABI,
          functionName: 'getCollection',
          args: [BigInt(collectionId)],
        });
        
        console.log('✅ Success! Collection details:');
        console.log('  - Start Token ID:', collectionDetails[0]?.toString());
        console.log('  - Total Supply:', collectionDetails[1]?.toString());
        console.log('  - Main Token ID:', collectionDetails[2]?.toString());
        console.log('  - Base URI:', collectionDetails[3]);
        console.log('  - Collection URI:', collectionDetails[4]);
        console.log('  - Creator:', collectionDetails[5]);
        
      } catch (error) {
        console.log(`❌ getCollection failed for ID ${collectionId}:`, error.message);
        if (error.cause) {
          console.log('  Error cause:', error.cause.message || error.cause);
        }
        if (error.data) {
          console.log('  Error data:', error.data);
        }
      }
    }

  } catch (error) {
    console.error('❌ Test Error:', error);
  }
}

// Usage
if (require.main === module) {
  testSpecificCollections();
}

module.exports = { testSpecificCollections }; 