"use client";

import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletName } from '@solana/wallet-adapter-base';
import { FaWallet, FaSignOutAlt, FaExclamationTriangle } from 'react-icons/fa';
import { isWalletConnected } from '@/lib/wallet-config';

/**
 * A custom wallet button component that provides wallet connection functionality
 * without relying on the problematic mobile wallet adapter dependencies.
 * 
 * Features:
 * - Connect/disconnect wallet
 * - Display wallet address when connected
 * - Wallet selection dropdown
 * - Error handling
 */
const CustomWalletButton = () => {
    const { connected, publicKey, disconnect, wallet, select, wallets, connecting } = useWallet();
    const [showDropdown, setShowDropdown] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    // Handle clicks outside the dropdown to close it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Clear error after 5 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // Handle wallet connection
    const handleConnect = useCallback((walletName?: string) => {
        try {
            setError(null);
            setShowDropdown(false);
            
            if (walletName) {
                select(walletName as WalletName);
            } else if (wallets.length === 1) {
                select(wallets[0].adapter.name);
            } else {
                // If multiple wallets, show dropdown instead of auto-selecting
                setShowDropdown(true);
            }
        } catch (err) {
            console.error('Wallet connection error:', err);
            setError('Failed to connect wallet');
        }
    }, [select, wallets]);

    // Handle wallet disconnection
    const handleDisconnect = useCallback(() => {
        try {
            disconnect();
            setShowDropdown(false);
        } catch (err) {
            console.error('Wallet disconnection error:', err);
            setError('Failed to disconnect wallet');
        }
    }, [disconnect]);

    // Format public key for display
    const formatPublicKey = (key: string) => {
        if (!key) return '';
        return `${key.slice(0, 4)}...${key.slice(-4)}`;
    };

    return (
        <div className="relative">
            {/* Main Button */}
            <button
                onClick={() => connected ? handleDisconnect() : handleConnect()}
                disabled={connecting}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
                <FaWallet className="w-4 h-4" />
                {connected && publicKey 
                    ? formatPublicKey(publicKey.toString())
                    : connecting 
                        ? 'Connecting...' 
                        : 'Connect Wallet'
                }
            </button>

            {/* Wallet Selection Dropdown */}
            {showDropdown && wallets.length > 0 && (
                <div 
                    ref={dropdownRef}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-zinc-700 py-1"
                >
                    <div className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-zinc-700">
                        Select a wallet
                    </div>
                    {wallets.map((wallet) => (
                        <button
                            key={wallet.adapter.name}
                            onClick={() => handleConnect(wallet.adapter.name)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 flex items-center gap-2"
                        >
                            {wallet.adapter.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="absolute right-0 mt-2 w-56 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md shadow-lg z-10 border border-red-200 dark:border-red-800/50 p-3 text-sm flex items-start gap-2">
                    <FaExclamationTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

export default CustomWalletButton;
