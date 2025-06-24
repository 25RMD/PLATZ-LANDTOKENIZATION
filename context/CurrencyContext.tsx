'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  SupportedCurrency,
  ExchangeRates,
  fetchExchangeRates,
  getUserCurrencyPreference,
  setUserCurrencyPreference,
  convertEthToCurrency,
  convertCurrencyToEth,
  formatCurrencyAmount,
  formatEthAmount,
  CURRENCY_OPTIONS,
  FetchExchangeRatesResult
} from '@/lib/utils/currencyConversion';

interface CurrencyContextType {
  // Current state
  preferredCurrency: SupportedCurrency;
  exchangeRates: ExchangeRates | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setPreferredCurrency: (currency: SupportedCurrency) => void;
  refreshExchangeRates: () => Promise<void>;
  
  // Conversion utilities
  convertEthToCurrency: (ethAmount: number, currency?: SupportedCurrency) => number;
  convertCurrencyToEth: (currencyAmount: number, currency?: SupportedCurrency) => number;
  formatCurrencyAmount: (amount: number, currency?: SupportedCurrency, decimals?: number) => string;
  formatEthAmount: (amount: number, decimals?: number) => string;
  
  // Display utilities
  formatPriceWithConversion: (ethAmount: number, showBoth?: boolean) => string;
  getCurrencySymbol: (currency?: SupportedCurrency) => string;
  getCurrencyName: (currency?: SupportedCurrency) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  // Start with default values to ensure server/client consistency
  const [preferredCurrency, setPreferredCurrencyState] = useState<SupportedCurrency>('NGN');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Start as false to prevent initial loading flash
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Handle hydration - this ensures we only run client-side code after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize preferred currency from localStorage only after mount
  useEffect(() => {
    if (!mounted) return;
    
    try {
      const savedCurrency = getUserCurrencyPreference();
      setPreferredCurrencyState(savedCurrency);
      console.log('[CurrencyProvider] Loaded saved currency preference:', savedCurrency);
    } catch (error) {
      console.warn('[CurrencyProvider] Failed to load currency preference:', error);
      // Keep default NGN if localStorage fails
    }
  }, [mounted]);

  // Fetch exchange rates on mount and set up refresh interval only after mount
  useEffect(() => {
    if (!mounted) return;

    const loadExchangeRates = async () => {
      setIsLoading(true);
      setError(null);
      
        console.log('[CurrencyProvider] Fetching exchange rates...');
      const result = await fetchExchangeRates();
      
      setExchangeRates(result);
      if (!result.success) {
        setError('Using estimated prices. Live rates unavailable.');
        console.log('[CurrencyProvider] Exchange rates loaded with fallback data.');
      } else {
        console.log('[CurrencyProvider] Exchange rates loaded successfully.');
      }

      setIsLoading(false);
    };

    loadExchangeRates();

    // Refresh rates every 5 minutes
    const interval = setInterval(() => {
      console.log('[CurrencyProvider] Refreshing exchange rates...');
      loadExchangeRates();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [mounted]);

  const setPreferredCurrency = useCallback((currency: SupportedCurrency) => {
    setPreferredCurrencyState(currency);
    
    // Only save to localStorage if mounted (client-side)
    if (mounted) {
      try {
    setUserCurrencyPreference(currency);
        console.log('[CurrencyProvider] Saved currency preference:', currency);
      } catch (error) {
        console.warn('[CurrencyProvider] Failed to save currency preference:', error);
      }
    }
  }, [mounted]);

  const refreshExchangeRates = useCallback(async () => {
    if (!mounted) return;
    
    setIsLoading(true);
    setError(null);
    
      console.log('[CurrencyProvider] Manually refreshing exchange rates...');
    const result = await fetchExchangeRates();

    setExchangeRates(result);
    if (!result.success) {
      setError('Using estimated prices. Live rates unavailable.');
      console.log('[CurrencyProvider] Exchange rates refreshed with fallback data.');
    } else {
      console.log('[CurrencyProvider] Exchange rates refreshed successfully.');
    }
    
      setIsLoading(false);
  }, [mounted]);

  const convertEthToCurrencyWrapper = useCallback((
    ethAmount: number, 
    currency?: SupportedCurrency
  ): number => {
    if (!exchangeRates) return 0;
    return convertEthToCurrency(ethAmount, currency || preferredCurrency, exchangeRates);
  }, [exchangeRates, preferredCurrency]);

  const convertCurrencyToEthWrapper = useCallback((
    currencyAmount: number, 
    currency?: SupportedCurrency
  ): number => {
    if (!exchangeRates) return 0;
    return convertCurrencyToEth(currencyAmount, currency || preferredCurrency, exchangeRates);
  }, [exchangeRates, preferredCurrency]);

  const formatCurrencyAmountWrapper = useCallback((
    amount: number, 
    currency?: SupportedCurrency, 
    decimals?: number
  ): string => {
    return formatCurrencyAmount(amount, currency || preferredCurrency, decimals);
  }, [preferredCurrency]);

  const formatEthAmountWrapper = useCallback((amount: number, decimals?: number): string => {
    return formatEthAmount(amount, decimals);
  }, []);

  const formatPriceWithConversion = useCallback((
    ethAmount: number, 
    showBoth: boolean = true
  ): string => {
    if (!exchangeRates || !mounted) {
      // Return just ETH price if rates not loaded or not mounted
      return formatEthAmount(ethAmount);
    }

    const convertedAmount = convertEthToCurrency(ethAmount, preferredCurrency, exchangeRates);
    const formattedCurrency = formatCurrencyAmount(convertedAmount, preferredCurrency);
    const formattedEth = formatEthAmount(ethAmount);

    if (showBoth) {
      return `${formattedEth} (${formattedCurrency})`;
    } else {
      return formattedCurrency;
    }
  }, [exchangeRates, preferredCurrency, mounted]);

  const getCurrencySymbol = useCallback((currency?: SupportedCurrency): string => {
    return CURRENCY_OPTIONS[currency || preferredCurrency].symbol;
  }, [preferredCurrency]);

  const getCurrencyName = useCallback((currency?: SupportedCurrency): string => {
    return CURRENCY_OPTIONS[currency || preferredCurrency].name;
  }, [preferredCurrency]);

  const value: CurrencyContextType = {
    preferredCurrency,
    exchangeRates,
    isLoading,
    error,
    setPreferredCurrency,
    refreshExchangeRates,
    convertEthToCurrency: convertEthToCurrencyWrapper,
    convertCurrencyToEth: convertCurrencyToEthWrapper,
    formatCurrencyAmount: formatCurrencyAmountWrapper,
    formatEthAmount: formatEthAmountWrapper,
    formatPriceWithConversion,
    getCurrencySymbol,
    getCurrencyName,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}; 