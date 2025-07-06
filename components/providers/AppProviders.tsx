"use client";

import { ThemeProvider } from 'next-themes';
import { WagmiProvider } from '@/components/providers/WagmiProvider';
import { AuthProvider } from '@/context/AuthContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { ExploreStateProvider } from '@/context/ExploreStateContext';
import React from 'react';

export function AppProviders({ children, initialState }: { children: React.ReactNode, initialState?: any }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <WagmiProvider initialState={initialState}>
        <AuthProvider>
          <CurrencyProvider>
            <ExploreStateProvider>
              {children}
            </ExploreStateProvider>
          </CurrencyProvider>
        </AuthProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
