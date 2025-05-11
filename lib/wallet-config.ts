// lib/wallet-config.ts
// Simplified and reliable wallet configuration that explicitly excludes mobile wallet adapters

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { Adapter } from '@solana/wallet-adapter-base';

/**
 * Get wallet adapters for the specified network
 * This function explicitly avoids any mobile wallet adapter references
 */
export function getWalletAdapters(networkString: string): Adapter[] {
  // Determine the network
  let network: WalletAdapterNetwork;
  
  switch (networkString.toLowerCase()) {
    case 'mainnet':
    case 'mainnet-beta':
      network = WalletAdapterNetwork.Mainnet;
      break;
    case 'testnet':
      network = WalletAdapterNetwork.Testnet;
    case 'devnet':
    default:
      network = WalletAdapterNetwork.Devnet;
      break;
  }

  // Only include web-based wallet adapters that we know work correctly
  // Explicitly avoid any adapters that might reference mobile wallet packages
  const adapters: Adapter[] = [];
  
  try {
    // Add Phantom wallet adapter
    adapters.push(new PhantomWalletAdapter());
  } catch (error) {
    console.error('Failed to initialize PhantomWalletAdapter:', error);
  }
  
  try {
    // Add Solflare wallet adapter
    adapters.push(new SolflareWalletAdapter({ network }));
  } catch (error) {
    console.error('Failed to initialize SolflareWalletAdapter:', error);
  }
  
  return adapters;
}

/**
 * Helper function to check if a wallet is connected
 * @param publicKey - The wallet's public key
 * @returns boolean indicating if the wallet is connected
 */
export function isWalletConnected(publicKey: any): boolean {
  return publicKey !== null;
}
