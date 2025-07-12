import { configureChains, createConfig } from 'wagmi';
import { sepolia, mainnet } from 'viem/chains';
import { InjectedConnector } from '@wagmi/connectors/injected';
import { publicProvider } from 'wagmi/providers/public';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

/**
 * Wagmi configuration for Ethereum wallet connections
 * Only using browser extension wallets (MetaMask, etc.)
 * WalletConnect has been removed to simplify dependencies
 */

// Define chains to support
const chains = [sepolia, mainnet];

// Define multiple Sepolia RPC endpoints for fallback
const SEPOLIA_RPC_URLS = [
  'https://rpc.ankr.com/eth_sepolia/70110cc66e9b830d75f56bf44c3e8c599d71fe51ad70bf9d8a66c68ad97e0e57', // Primary Ankr RPC
  process.env.RPC_URL
].filter(Boolean) as string[]; // Filter out undefined/null values

// Configure chains and providers
const { chains: configuredChains, publicClient } = configureChains(
  chains,
  [
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id === sepolia.id) {
          return { http: SEPOLIA_RPC_URLS[0] };
        }
        if (chain.id === mainnet.id) {
          return { http: 'https://eth.llamarpc.com' };
        }
        return null;
      },
    }),
    publicProvider(),
  ]
);

// Create wagmi config with only injected connector (browser wallets)
export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    new InjectedConnector({
      chains: configuredChains,
      options: {
        shimDisconnect: true,
      },
    }),
  ],
  publicClient,
});
