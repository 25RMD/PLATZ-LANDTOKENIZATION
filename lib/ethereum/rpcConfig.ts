import { ethers } from 'ethers';
import { throttle } from 'lodash';

// Extend the Window interface to include the ethereum property
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Define types for RPC endpoint configuration
interface RpcEndpoint {
  url: string;
  weight: number;
}

// Track the last used RPC URL and its failure count
let currentRpcUrl: string | null = null;
let currentProvider: ethers.Provider | null = null;
let failureCount = 0;
const MAX_RETRIES = 3;
const RPC_SWITCH_THRESHOLD = 5; // Number of failures before switching RPC

// List of reliable Sepolia RPC URLs with weights (higher = more preferred)
const RPC_ENDPOINTS = [
  // Primary: Environment variables take precedence
  { url: process.env.NEXT_PUBLIC_RPC_URL, weight: 100 },
  { url: process.env.RPC_URL, weight: 90 },
  { url: process.env.SEPOLIA_RPC_URL, weight: 80 },
  { url: process.env.FALLBACK_RPC_URL_1, weight: 70 },
  { url: process.env.FALLBACK_RPC_URL_2, weight: 60 },
  // Fallback public endpoints with lower weights
  { url: 'https://ethereum-sepolia.publicnode.com', weight: 50 },
  { url: 'https://rpc.sepolia.org', weight: 40 },
  { url: 'https://rpc2.sepolia.org', weight: 30 },
  { url: 'https://sepolia.drpc.org', weight: 20 },
  { url: 'https://1rpc.io/sepolia', weight: 10 }
].filter(item => item.url) as Array<{ url: string; weight: number }>;

// Sort by weight in descending order
RPC_ENDPOINTS.sort((a, b) => b.weight - a.weight);

// Get a weighted random RPC URL
export function getWeightedRandomRpcUrl(): string {
  const totalWeight = RPC_ENDPOINTS.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of RPC_ENDPOINTS) {
    if (random < item.weight) {
      return item.url;
    }
    random -= item.weight;
  }
  
  // Fallback to the first available URL
  return RPC_ENDPOINTS[0]?.url || 'https://ethereum-sepolia.publicnode.com';
}

// Get the next RPC URL in a round-robin fashion
let lastUsedIndex = -1;
function getNextRpcUrl(): string {
  lastUsedIndex = (lastUsedIndex + 1) % RPC_ENDPOINTS.length;
  return RPC_ENDPOINTS[lastUsedIndex]?.url || 'https://ethereum-sepolia.publicnode.com';
}

// Create a new provider with the given URL
function createNewProvider(url: string): ethers.Provider {
  console.log(`[RPC] Creating new provider for URL: ${url.split('//')[1]?.split('@').pop() || url}`);
  
  // Create a custom fetch function with better error handling
  const fetchWithTimeout = async (url: string, options: any): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  // Create a custom provider with better error handling
  const provider = new ethers.JsonRpcProvider(
    url,
    'sepolia',
    {
      staticNetwork: true,
      batchMaxSize: 1,
      cacheTimeout: -1,
    }
  );
  
  // Override the fetch function with our custom implementation
  (provider as any).connection = {
    url,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    fetch: fetchWithTimeout,
  };

  // Add error handling
  provider.on('error', (error) => {
    console.error(`[RPC Error] ${error.message}`);
    failureCount++;
    
    // If we've had too many failures, switch to a new provider
    if (failureCount >= RPC_SWITCH_THRESHOLD) {
      console.warn(`[RPC] Too many failures (${failureCount}), switching RPC provider`);
      currentRpcUrl = null;
      currentProvider = null;
    }
  });

  return provider;
}

// Throttled version of getProvider to prevent rapid switching
const getProviderThrottled = throttle(() => {
  if (currentProvider && currentRpcUrl) {
    return currentProvider;
  }
  
  // Try to get a different URL than the current one
  let newUrl = getWeightedRandomRpcUrl();
  if (newUrl === currentRpcUrl) {
    newUrl = getNextRpcUrl();
  }
  
  currentRpcUrl = newUrl;
  currentProvider = createNewProvider(newUrl);
  failureCount = 0;
  
  return currentProvider;
}, 5000, { leading: true, trailing: false });

// Main function to get a provider
export function getProvider(): ethers.Provider {
  return getProviderThrottled();
}

// Get a signer for transactions
export function getSigner(privateKey: string): ethers.Wallet {
  const provider = getProvider();
  return new ethers.Wallet(privateKey, provider);
}

// Helper function to make RPC calls with retries
export async function rpcCall<T = any>(
  method: string,
  params: any[] = [],
  retries = 2
): Promise<T> {
  const provider = getProvider();
  
  try {
    // Use the provider's send method with type assertion
    const result = await (provider as any).send(method, params);
    // Reset failure count on success
    if (failureCount > 0) {
      failureCount = 0;
    }
    return result;
  } catch (error) {
    console.error(`[RPC Call Failed] ${method}`, error);
    
    if (retries > 0) {
      // Switch to a new provider on failure
      currentRpcUrl = null;
      currentProvider = null;
      console.log(`[RPC] Retrying (${retries} attempts left)...`);
      return rpcCall(method, params, retries - 1);
    }
    
    throw error;
  }
}

// For backward compatibility
export function createProvider() {
  return getProvider();
}

// Get a client configuration for viem
import { http, createPublicClient } from 'viem';
import { sepolia } from 'viem/chains';

export function getSepoliaClientConfig() {
  const rpcUrl = currentRpcUrl || getWeightedRandomRpcUrl();
  
  // Create a simpler transport without the complex retry logic
  const transport = http(rpcUrl, {
    batch: false, // Disable batching to reduce complexity
    retryCount: 2,
    fetchOptions: {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    },
  });
  
  return createPublicClient({
    chain: sepolia,
    transport,
    batch: {
      multicall: false, // Disable multicall to reduce complexity
    },
    cacheTime: 0,
  });
} 