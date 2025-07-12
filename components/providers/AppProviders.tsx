"use client";

import { ThemeProvider } from 'next-themes';
import { WagmiProvider } from '@/components/providers/WagmiProvider';
import { AuthProvider } from '@/context/AuthContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { ExploreStateProvider } from '@/context/ExploreStateContext';
import React from 'react';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <WagmiProvider>
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
