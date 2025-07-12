'use client';

import React from 'react';
import { WagmiConfig } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '@/lib/wagmiConfig';

// Setup queryClient
const queryClient = new QueryClient();

interface WagmiProviderProps {
  children: React.ReactNode;
  initialState?: any;
}

export function WagmiProvider({ children, initialState }: WagmiProviderProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiConfig>
  );
}

// Shim component that provides basic context structure during SSR
const WagmiProviderShim: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};
