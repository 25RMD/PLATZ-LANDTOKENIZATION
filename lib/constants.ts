/**
 * Application-wide constants
 */

// List of reliable RPC URLs for Sepolia testnet
export const RPC_URLS = [
  "https://rpc.sepolia.org",
  "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
  "https://sepolia-rpc.scroll.io",
  "https://eth-sepolia.public.blastapi.io",
  "https://ethereum-sepolia.blockpi.network/v1/rpc/public"
];

// Default RPC URL
export const DEFAULT_RPC_URL = RPC_URLS[0];

// Block explorer URLs
export const BLOCK_EXPLORER_URLS = {
  sepolia: "https://sepolia.etherscan.io",
  mainnet: "https://etherscan.io"
};

// Maximum collection items to load at once
export const MAX_COLLECTION_ITEMS = 20;

// Cache durations (in milliseconds)
export const CACHE_DURATIONS = {
  collections: 5 * 60 * 1000, // 5 minutes
  nft: 10 * 60 * 1000,        // 10 minutes
  metadata: 30 * 60 * 1000    // 30 minutes
};

// Default timeouts
export const TIMEOUTS = {
  rpc: 10000,                 // 10 seconds
  metadata: 15000             // 15 seconds
}; 