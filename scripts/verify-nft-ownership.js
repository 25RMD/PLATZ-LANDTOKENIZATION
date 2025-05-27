const { ethers } = require('ethers');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

// Contract configuration
const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;
const RPC_URL = process.env.SEPOLIA_RPC_URL || process.env.RPC_URL;

// ABI for the functions we need
const NFT_ABI = [
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function getCollection(uint256 collectionId) view returns (uint256, uint256, uint256, string, string, address)",
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)"
];

async function verifyNFTOwnership(walletAddress, collectionId) {
  try {
    console.log('🔍 Verifying NFT Ownership');
    console.log('========================');
    console.log('Wallet Address:', walletAddress);
    console.log('Collection ID:', collectionId);
    console.log('Contract Address:', NFT_CONTRACT_ADDRESS);
    console.log('RPC URL:', RPC_URL);
    console.log('');

    // Create provider and contract instance
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider);

    // Get collection details
    console.log('📋 Collection Details:');
    try {
      const collectionData = await contract.getCollection(collectionId);
      const [startTokenId, totalSupply, mainTokenId, baseURI, collectionURI, creator] = collectionData;
      
      console.log('- Start Token ID:', startTokenId.toString());
      console.log('- Total Supply:', totalSupply.toString());
      console.log('- Main Token ID:', mainTokenId.toString());
      console.log('- Creator:', creator);
      console.log('- Base URI:', baseURI);
      console.log('');

      // Check ownership of main token
      console.log('👑 Main Token Ownership:');
      try {
        const mainTokenOwner = await contract.ownerOf(mainTokenId);
        console.log('- Main Token ID:', mainTokenId.toString());
        console.log('- Current Owner:', mainTokenOwner);
        console.log('- Is Your Wallet?', mainTokenOwner.toLowerCase() === walletAddress.toLowerCase() ? '✅ YES' : '❌ NO');
        console.log('');
      } catch (error) {
        console.log('- Error checking main token ownership:', error.message);
        console.log('');
      }

      // Check ownership of all tokens in collection
      console.log('🔢 All Collection Tokens:');
      for (let i = 0; i < totalSupply; i++) {
        const tokenId = startTokenId + BigInt(i);
        try {
          const owner = await contract.ownerOf(tokenId);
          const isYours = owner.toLowerCase() === walletAddress.toLowerCase();
          console.log(`- Token ${tokenId.toString()}: ${owner} ${isYours ? '✅' : '❌'}`);
        } catch (error) {
          console.log(`- Token ${tokenId.toString()}: Error - ${error.message}`);
        }
      }
      console.log('');

    } catch (error) {
      console.log('❌ Error getting collection details:', error.message);
      console.log('');
    }

    // Check wallet's total NFT balance
    console.log('💰 Wallet NFT Balance:');
    try {
      const balance = await contract.balanceOf(walletAddress);
      console.log('- Total NFTs owned:', balance.toString());
      
      if (balance > 0) {
        console.log('- Owned Token IDs:');
        for (let i = 0; i < balance; i++) {
          try {
            const tokenId = await contract.tokenOfOwnerByIndex(walletAddress, i);
            console.log(`  - Token ${tokenId.toString()}`);
          } catch (error) {
            console.log(`  - Error getting token ${i}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.log('❌ Error checking wallet balance:', error.message);
    }

  } catch (error) {
    console.error('❌ Script Error:', error);
  }
}

// Usage
if (require.main === module) {
  const walletAddress = process.argv[2];
  const collectionId = process.argv[3];

  if (!walletAddress || !collectionId) {
    console.log('Usage: node verify-nft-ownership.js <wallet-address> <collection-id>');
    console.log('Example: node verify-nft-ownership.js 0x1234...5678 1');
    process.exit(1);
  }

  verifyNFTOwnership(walletAddress, collectionId);
}

module.exports = { verifyNFTOwnership }; 