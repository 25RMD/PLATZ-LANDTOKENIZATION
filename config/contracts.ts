// Contract addresses for the deployed contracts
// These are placeholders and should be updated with actual deployed contract addresses

// Define the Address type for Ethereum addresses, compatible with viem
export type Address = `0x${string}`;

// For Sepolia testnet - Use NEXT_PUBLIC_ prefixed variables for browser access
export const PLATZ_LAND_NFT_ADDRESS: Address = (
  process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || 
  process.env.NFT_CONTRACT_ADDRESS || 
  "0x8447dEe42d0cbBa5fa7DE617a3983Eb2da1d7Dde"
) as Address;

export const LAND_MARKETPLACE_ADDRESS: Address = (
  process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS || 
  process.env.MARKETPLACE_CONTRACT_ADDRESS || 
  "0xfAE9Ef51fea4D220cD427EC47C8dFDA4a6426De8"
) as Address;

// For local development
export const LOCALHOST_PLATZ_LAND_NFT_ADDRESS: Address = "0x8447dEe42d0cbBa5fa7DE617a3983Eb2da1d7Dde" as Address;
export const LOCALHOST_LAND_MARKETPLACE_ADDRESS: Address = "0xfAE9Ef51fea4D220cD427EC47C8dFDA4a6426De8" as Address;

// Get the correct contract address based on the environment
export function getContractAddress(contractName: string): Address {
  // Check if we're in development mode using localhost
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  
  if (isLocalhost) {
    switch (contractName) {
      case 'PLATZ_LAND_NFT':
        return LOCALHOST_PLATZ_LAND_NFT_ADDRESS;
      case 'LAND_MARKETPLACE':
        return LOCALHOST_LAND_MARKETPLACE_ADDRESS;
      default:
        throw new Error(`Unknown contract name: ${contractName}`);
    }
  } else {
    // Use Sepolia testnet addresses
    switch (contractName) {
      case 'PLATZ_LAND_NFT':
        return PLATZ_LAND_NFT_ADDRESS;
      case 'LAND_MARKETPLACE':
        return LAND_MARKETPLACE_ADDRESS;
      default:
        throw new Error(`Unknown contract name: ${contractName}`);
    }
  }
} 