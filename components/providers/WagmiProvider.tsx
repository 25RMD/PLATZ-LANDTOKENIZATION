'use client';

import React, { type PropsWithChildren } from 'react';
import { WagmiProvider as WagmiProviderBase, type State } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '@/lib/wagmiConfig'; // Assuming alias @ is configured for ./src or ./

// If you don't have '@/lib/wagmiConfig' aliased, use relative path:
// import { wagmiConfig } from '../../lib/wagmiConfig';

// Setup queryClient
const queryClient = new QueryClient();

export function WagmiProvider({ 
  children, 
  initialState 
}: PropsWithChildren<{ initialState?: State }>) {
  return (
    <WagmiProviderBase config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProviderBase>
  );
}
