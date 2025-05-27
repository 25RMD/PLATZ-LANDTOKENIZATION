'use client';

import React from 'react';
import { WagmiProvider as WagmiProviderBase } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '@/lib/wagmiConfig';

// Setup queryClient
const queryClient = new QueryClient();

interface WagmiProviderProps {
  children: React.ReactNode;
  initialState?: any;
}

export function WagmiProvider({ children, initialState }: WagmiProviderProps) {
  // Type assertion to bypass the type checking issue
  const Provider = WagmiProviderBase as any;
  
  return (
    <Provider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </Provider>
  );
}
