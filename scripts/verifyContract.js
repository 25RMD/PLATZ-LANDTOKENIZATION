// Script to verify the contract on Etherscan
const { execSync } = require('child_process');
require('dotenv').config();

// Parameters - Update these with your actual contract address after deployment
const CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const CONSTRUCTOR_ARGS = '"PlatzLand Token" "PLATZ"'; // Constructor arguments for PlatzLandNFTWithCollections
const NETWORK = process.env.HARDHAT_NETWORK || 'sepolia'; // 'sepolia' for Sepolia network, 'hardhat' for local hardhat network
const CONTRACT_PATH = "contracts/PlatzLandNFTWithCollections.sol:PlatzLandNFTWithCollections";

// Run verification command
try {
  console.log(`Verifying PlatzLandNFTWithCollections contract at address ${CONTRACT_ADDRESS} on ${NETWORK} network...`);
  const command = `npx hardhat verify --network ${NETWORK} --contract ${CONTRACT_PATH} ${CONTRACT_ADDRESS} ${CONSTRUCTOR_ARGS}`;
  
  console.log(`Running command: ${command}`);
  const output = execSync(command, { encoding: 'utf-8' });
  
  console.log('Verification successful!');
  console.log(output);
} catch (error) {
  console.error('Verification failed:');
  console.error(error.message);
} 