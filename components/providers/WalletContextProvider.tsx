"use client";

import React, { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
// Import our custom wallet configuration
import { getWalletAdapters } from '@/lib/wallet-config';

interface WalletContextProviderProps {
    children: ReactNode;
}

export const WalletContextProvider: FC<WalletContextProviderProps> = ({ children }) => {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet'; 
    const endpoint = useMemo(() => {
        try {
            return clusterApiUrl(network as any);
        } catch (error) {
            console.error('Error getting cluster API URL:', error);
            // Default to devnet if there's an error
            return 'https://api.devnet.solana.com';
        }
    }, [network]);

    // Use our custom wallet configuration that avoids mobile adapters
    const wallets = useMemo(() => {
        try {
            return getWalletAdapters(network);
        } catch (error) {
            console.error('Error initializing wallet adapters:', error);
            return [];
        }
    }, [network]);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

// Ensure the component is exported correctly
export default WalletContextProvider; 