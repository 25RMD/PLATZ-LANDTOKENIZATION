import { http, createConfig } from 'wagmi';
import { sepolia, mainnet } from 'wagmi/chains';
import { injected } from '@wagmi/connectors';

/**
 * Wagmi configuration for Ethereum wallet connections
 * Only using browser extension wallets (MetaMask, etc.)
 * WalletConnect has been removed to simplify dependencies
 */

// Define chains to support
const chains = [sepolia, mainnet] as const;

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
    [mainnet.id]: http(),
    [sepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://ethereum-sepolia.publicnode.com'),
  },
  ssr: true,
});
