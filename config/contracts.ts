// Contract addresses for the deployed contracts
// These are placeholders and should be updated with actual deployed contract addresses

// For Sepolia testnet
export const PLATZ_LAND_NFT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS || "0x155e70f694E645907d36583Cca893BE52bf3A29f";
export const LAND_MARKETPLACE_ADDRESS = "0xdce38280EE756a7F930feFB87efFb66C72Ef66CB";

// For local development
export const LOCALHOST_PLATZ_LAND_NFT_ADDRESS = "0x155e70f694E645907d36583Cca893BE52bf3A29f";
export const LOCALHOST_LAND_MARKETPLACE_ADDRESS = "0xdce38280EE756a7F930feFB87efFb66C72Ef66CB";

// Get the correct contract address based on the environment
export function getContractAddress(contractName: string): string {
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