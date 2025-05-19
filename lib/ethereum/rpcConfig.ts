/**
 * Configuration for RPC endpoints
 * Provides a centralized place to manage blockchain RPC endpoints
 */

// List of reliable Sepolia RPC URLs - removing any localhost references
export const SEPOLIA_RPC_URLS = [
  'https://rpc.ankr.com/eth_sepolia/70110cc66e9b830d75f56bf44c3e8c599d71fe51ad70bf9d8a66c68ad97e0e57', // Primary Ankr RPC
  'https://eth-sepolia.g.alchemy.com/v2/VRy2LXl0jX2EN7w2OOx_d8p0heZVn_O5', // Public backup
  'https://eth-sepolia.g.alchemy.com/v2/-9NA8V25gEEn6DZokD_cuOxFRFVzf5qo', // Tenderly gateway
  // 'https://1rpc.io/sepolia', // 1RPC (decentralized)
  // 'https://rpc.sepolia.org', // Official Sepolia endpoint
  // 'https://rpc2.sepolia.org', // Alternative official Sepolia endpoint
  // process.env.NEXT_PUBLIC_RPC_URL, // Environment variable (if provided)
].filter(Boolean) as string[]; // Filter out undefined/null values

// Get a specific provider by priority (first available)
export function getPrioritizedSepoliaRpcUrl(): string {
  // Return the first valid URL in the list
  for (const url of SEPOLIA_RPC_URLS) {
    if (url && url.length > 0) {
      return url;
    }
  }
  
  // Fallback to a reliable public node if no configured URLs
  return 'https://ethereum-sepolia.publicnode.com';
}

// Function to create a client config with properly configured transport
export function getSepoliaClientConfig() {
  return {
    transport: {
      url: getPrioritizedSepoliaRpcUrl(),
      timeout: 15000, // 15 seconds
      fetchOptions: {
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      },
      retryCount: 3,
      retryDelay: 1000 // 1 second
    }
  };
}

// Additional chains can be added here as needed
// Example: MAINNET_RPC_URLS, POLYGON_RPC_URLS, etc. 