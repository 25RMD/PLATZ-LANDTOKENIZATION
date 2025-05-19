import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';

// Array of reliable public Sepolia RPC endpoints in priority order
export const PUBLIC_SEPOLIA_RPC_URLS = [
  // Use environment variables if defined
  process.env.NEXT_PUBLIC_RPC_URL,
  process.env.RPC_URL,
  process.env.SEPOLIA_RPC_URL,
  
  // Public endpoints for Sepolia
  'https://ethereum-sepolia.publicnode.com',
  'https://rpc.sepolia.org',
  'https://sepolia.drpc.org',
  'https://1rpc.io/sepolia', 
  'https://ethereum-sepolia-rpc.publicnode.com',
  'https://sepolia.gateway.tenderly.co',
  'https://rpc.ankr.com/eth_sepolia',
  'https://rpc2.sepolia.org',
  'https://sepolia.blockpi.network/v1/rpc/public'
].filter(Boolean) as string[];

// Create a public client with a working RPC URL
export const createFallbackPublicClient = async () => {
  console.log('Creating fallback public client...');
  
  // Test each URL in order until a working one is found
  for (const url of PUBLIC_SEPOLIA_RPC_URLS) {
    try {
      console.log(`Trying RPC URL: ${url.substring(0, 30)}...`);
      
      const client = createPublicClient({
        chain: sepolia,
        transport: http(url, {
          timeout: 10000,
          retryCount: 2,
          retryDelay: 1000
        })
      });
      
      // Test the connection with a simple call
      const blockNumber = await client.getBlockNumber();
      console.log(`RPC URL ${url.substring(0, 30)}... is working (block: ${blockNumber})`);
      
      return client;
    } catch (error) {
      console.error(`RPC URL ${url.substring(0, 30)}... failed:`, error instanceof Error ? error.message : 'Unknown error');
    }
  }
  
  // If all URLs fail, throw an error
  throw new Error('All RPC URLs failed to connect. Please check your network connection or try again later.');
}; 