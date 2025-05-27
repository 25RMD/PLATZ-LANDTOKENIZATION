const { ethers } = require('ethers');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

// Contract configuration
const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;
const RPC_URL = process.env.SEPOLIA_RPC_URL || process.env.RPC_URL;

// Basic ABI to check contract existence and basic functions
const BASIC_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function getAllCollectionIds() view returns (uint256[])",
  "function getCollectionCount() view returns (uint256)",
  "function owner() view returns (address)"
];

async function debugContract() {
  try {
    console.log('🔍 Contract Debug Information');
    console.log('============================');
    console.log('Contract Address:', NFT_CONTRACT_ADDRESS);
    console.log('RPC URL:', RPC_URL);
    console.log('');

    if (!NFT_CONTRACT_ADDRESS || NFT_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      console.log('❌ Invalid contract address in environment variables');
      console.log('Please check your .env file and ensure NFT_CONTRACT_ADDRESS is set correctly');
      return;
    }

    if (!RPC_URL) {
      console.log('❌ No RPC URL configured');
      console.log('Please check your .env file and ensure SEPOLIA_RPC_URL or RPC_URL is set');
      return;
    }

    // Create provider and contract instance
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, BASIC_ABI, provider);

    // Check if address contains code (is a contract)
    console.log('📋 Contract Verification:');
    const code = await provider.getCode(NFT_CONTRACT_ADDRESS);
    console.log('- Has code:', code !== '0x' ? '✅ YES' : '❌ NO');
    console.log('- Code length:', code.length, 'characters');
    
    if (code === '0x') {
      console.log('');
      console.log('❌ ERROR: No contract code found at this address!');
      console.log('This means either:');
      console.log('1. The contract was not deployed to this address');
      console.log('2. The contract address in your .env file is incorrect');
      console.log('3. You\'re connected to the wrong network');
      console.log('');
      console.log('Solutions:');
      console.log('- Check your deployment scripts and logs');
      console.log('- Verify the contract address on Sepolia Etherscan');
      console.log('- Ensure you\'re using the Sepolia testnet');
      return;
    }

    console.log('');

    // Try to call basic ERC721 functions
    console.log('🏷️  Basic Contract Info:');
    try {
      const name = await contract.name();
      console.log('- Name:', name);
    } catch (error) {
      console.log('- Name: ❌ Error -', error.message);
    }

    try {
      const symbol = await contract.symbol();
      console.log('- Symbol:', symbol);
    } catch (error) {
      console.log('- Symbol: ❌ Error -', error.message);
    }

    try {
      const owner = await contract.owner();
      console.log('- Owner:', owner);
    } catch (error) {
      console.log('- Owner: ❌ Error -', error.message);
    }

    console.log('');

    // Try to call collection-specific functions
    console.log('📦 Collection Functions:');
    try {
      const collectionCount = await contract.getCollectionCount();
      console.log('- Collection Count:', collectionCount.toString());
    } catch (error) {
      console.log('- Collection Count: ❌ Error -', error.message);
      console.log('  This suggests the contract doesn\'t have getCollectionCount function');
    }

    try {
      const allCollectionIds = await contract.getAllCollectionIds();
      console.log('- All Collection IDs:', allCollectionIds.map(id => id.toString()));
      console.log('- Number of Collections:', allCollectionIds.length);
    } catch (error) {
      console.log('- All Collection IDs: ❌ Error -', error.message);
      console.log('  This suggests the contract doesn\'t have getAllCollectionIds function');
    }

    console.log('');

    // Check network info
    console.log('🌐 Network Information:');
    try {
      const network = await provider.getNetwork();
      console.log('- Network Name:', network.name);
      console.log('- Chain ID:', network.chainId.toString());
      console.log('- Is Sepolia?', network.chainId.toString() === '11155111' ? '✅ YES' : '❌ NO');
    } catch (error) {
      console.log('- Network: ❌ Error -', error.message);
    }

    try {
      const blockNumber = await provider.getBlockNumber();
      console.log('- Current Block:', blockNumber);
    } catch (error) {
      console.log('- Current Block: ❌ Error -', error.message);
    }

    console.log('');
    console.log('🔧 Recommendations:');
    
    if (code !== '0x') {
      console.log('✅ Contract exists at the specified address');
      
      // Try to determine what type of contract this is
      try {
        await contract.getAllCollectionIds();
        console.log('✅ Contract has getAllCollectionIds function');
      } catch (error) {
        console.log('❌ Contract missing getAllCollectionIds function');
        console.log('   - This might be an older version of the contract');
        console.log('   - Or the ABI doesn\'t match the deployed contract');
        console.log('   - Consider redeploying with the latest contract code');
      }
    }

  } catch (error) {
    console.error('❌ Script Error:', error);
    console.log('');
    console.log('Common issues:');
    console.log('1. RPC URL is not accessible');
    console.log('2. Contract address is invalid');
    console.log('3. Network configuration is wrong');
  }
}

// Usage
if (require.main === module) {
  debugContract();
}

module.exports = { debugContract }; 