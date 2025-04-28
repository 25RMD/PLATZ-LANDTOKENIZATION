"use client";

import React, { FC, ReactNode, useMemo } from 'react';
import {
    ConnectionProvider,
    WalletProvider,
} from '@solana/wallet-adapter-react';
import {
    WalletModalProvider,
    // WalletDisconnectButton, // Not used directly here, but available
    // WalletMultiButton,    // Not used directly here, but available
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
    // Add other wallets you want to support, e.g.:
    // LedgerWalletAdapter,
    // TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';

interface WalletContextProviderProps {
    children: ReactNode;
}

export const WalletContextProvider: FC<WalletContextProviderProps> = ({ children }) => {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    // Consider using an environment variable for this
    // IMPORTANT: Ensure NEXT_PUBLIC_SOLANA_NETWORK is set in your .env.local
    const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet'; 
    const endpoint = useMemo(() => clusterApiUrl(network as any), [network]);

    const wallets = useMemo(
        () => [
            // Add desired wallets here
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter({ network } as any),
        ],
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            {/* autoConnect attempts to automatically connect on page load if wallet was previously connected */}
            <WalletProvider wallets={wallets} autoConnect>
                 {/* WalletModalProvider provides the UI modal for selecting wallets */}
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

// Ensure the component is exported correctly
export default WalletContextProvider; 