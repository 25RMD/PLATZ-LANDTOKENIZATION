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
  CURRENCY_OPTIONS
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
  const [preferredCurrency, setPreferredCurrencyState] = useState<SupportedCurrency>('NGN');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize preferred currency from localStorage
  useEffect(() => {
    const savedCurrency = getUserCurrencyPreference();
    setPreferredCurrencyState(savedCurrency);
  }, []);

  // Fetch exchange rates on mount and set up refresh interval
  useEffect(() => {
    const loadExchangeRates = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const rates = await fetchExchangeRates();
        setExchangeRates(rates);
      } catch (err) {
        console.error('Failed to fetch exchange rates:', err);
        setError('Failed to load exchange rates');
      } finally {
        setIsLoading(false);
      }
    };

    loadExchangeRates();

    // Refresh rates every 5 minutes
    const interval = setInterval(loadExchangeRates, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const setPreferredCurrency = useCallback((currency: SupportedCurrency) => {
    setPreferredCurrencyState(currency);
    setUserCurrencyPreference(currency);
  }, []);

  const refreshExchangeRates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const rates = await fetchExchangeRates();
      setExchangeRates(rates);
    } catch (err) {
      console.error('Failed to refresh exchange rates:', err);
      setError('Failed to refresh exchange rates');
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    if (!exchangeRates) {
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
  }, [exchangeRates, preferredCurrency]);

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