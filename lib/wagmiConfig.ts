import { http, createConfig, fallback } from 'wagmi';
import { sepolia, mainnet } from 'wagmi/chains';
import { injected } from '@wagmi/connectors';

/**
 * Wagmi configuration for Ethereum wallet connections
 * Only using browser extension wallets (MetaMask, etc.)
 * WalletConnect has been removed to simplify dependencies
 */

// Define chains to support
const chains = [sepolia, mainnet] as const;

// Define multiple Sepolia RPC endpoints for fallback
const SEPOLIA_RPC_URLS = [
  'https://rpc.ankr.com/eth_sepolia/70110cc66e9b830d75f56bf44c3e8c599d71fe51ad70bf9d8a66c68ad97e0e57', // Primary Ankr RPC
  process.env.NEXT_PUBLIC_RPC_URL
].filter(Boolean) as string[]; // Filter out undefined/null values

// Create wagmi config with only injected connector (browser wallets)
export const wagmiConfig = createConfig({
  chains,
  connectors: [
    // @ts-ignore - Ignoring type issues due to potential version mismatches
    injected({
      shimDisconnect: true,
    }),
  ],
  transports: {
    [mainnet.id]: http('https://eth.llamarpc.com'),
    [sepolia.id]: fallback(
      SEPOLIA_RPC_URLS.map(url => 
        http(url, {
          timeout: 10000, // 10 seconds timeout
          fetchOptions: {
            cache: 'no-store',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          },
          retryCount: 3,
          retryDelay: 1000, // 1 second between retries
        })
      ),
      { rank: true } // Automatically rank transports by latency and reliability
    ),
  },
  ssr: true,
});
