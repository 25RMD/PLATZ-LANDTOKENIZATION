// Currency conversion utilities for ETH to USD and NGN
export type SupportedCurrency = 'USD' | 'NGN';

export interface ExchangeRates {
  USD: number;
  NGN: number;
  lastUpdated: number;
}

export interface FetchExchangeRatesResult extends ExchangeRates {
  success: boolean;
}

export interface CurrencyPreference {
  currency: SupportedCurrency;
  symbol: string;
  name: string;
}

export const CURRENCY_OPTIONS: Record<SupportedCurrency, CurrencyPreference> = {
  USD: {
    currency: 'USD',
    symbol: '$',
    name: 'US Dollar'
  },
  NGN: {
    currency: 'NGN',
    symbol: '₦',
    name: 'Nigerian Naira'
  }
};

// Cache for exchange rates (5 minute cache)
let exchangeRatesCache: ExchangeRates | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch current ETH exchange rates from CoinGecko API
 */
export async function fetchExchangeRates(): Promise<FetchExchangeRatesResult> {
  // Check cache first
  if (exchangeRatesCache && Date.now() - exchangeRatesCache.lastUpdated < CACHE_DURATION) {
    // If the cached item is a fallback, we mark success as false
    const isFallback = exchangeRatesCache.USD === 2500; // A simple check for fallback data
    return { ...exchangeRatesCache, success: !isFallback };
  }

  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd,ngn',
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.ethereum || !data.ethereum.usd || !data.ethereum.ngn) {
      throw new Error('Invalid response format from CoinGecko API');
    }

    const rates: ExchangeRates = {
      USD: data.ethereum.usd,
      NGN: data.ethereum.ngn,
      lastUpdated: Date.now()
    };

    // Update cache
    exchangeRatesCache = rates;
    
    return { ...rates, success: true };
  } catch (error) {
    console.warn('Could not fetch live exchange rates. Using fallback estimates.', error);
    
    // Return fallback rates if API fails
    const fallbackRates: ExchangeRates = {
      USD: 2500, // Approximate ETH price in USD
      NGN: 4000000, // Approximate ETH price in NGN
      lastUpdated: Date.now()
    };
    
    // Cache fallback rates for a shorter duration
    exchangeRatesCache = fallbackRates;
    
    return { ...fallbackRates, success: false };
  }
}

/**
 * Convert ETH amount to specified currency
 */
export function convertEthToCurrency(
  ethAmount: number,
  currency: SupportedCurrency,
  exchangeRates: ExchangeRates
): number {
  const rate = exchangeRates[currency];
  return ethAmount * rate;
}

/**
 * Convert currency amount to ETH
 */
export function convertCurrencyToEth(
  currencyAmount: number,
  currency: SupportedCurrency,
  exchangeRates: ExchangeRates
): number {
  const rate = exchangeRates[currency];
  return currencyAmount / rate;
}

/**
 * Format currency amount with appropriate symbol and decimals
 */
export function formatCurrencyAmount(
  amount: number,
  currency: SupportedCurrency,
  decimals: number = 2
): string {
  const { symbol } = CURRENCY_OPTIONS[currency];
  
  if (currency === 'NGN') {
    // Format NGN with commas and no decimals for large amounts
    return `${symbol}${amount.toLocaleString('en-NG', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals 
    })}`;
  } else {
    // Format USD with standard formatting
    return `${symbol}${amount.toLocaleString('en-US', { 
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals 
    })}`;
  }
}

/**
 * Format ETH amount with proper decimals
 */
export function formatEthAmount(amount: number, decimals: number = 4): string {
  return `${amount.toFixed(decimals)} ETH`;
}

/**
 * Parse currency input and return clean number
 */
export function parseCurrencyInput(input: string): number {
  // Remove currency symbols and commas
  const cleaned = input.replace(/[₦$,]/g, '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Validate currency amount input
 */
export function validateCurrencyAmount(amount: number, currency: SupportedCurrency): {
  isValid: boolean;
  error?: string;
} {
  if (amount <= 0) {
    return { isValid: false, error: 'Amount must be greater than zero' };
  }

  if (currency === 'NGN' && amount < 1000) {
    return { isValid: false, error: 'Minimum amount is ₦1,000' };
  }

  if (currency === 'USD' && amount < 0.01) {
    return { isValid: false, error: 'Minimum amount is $0.01' };
  }

  return { isValid: true };
}

/**
 * Get user's preferred currency from localStorage
 */
export function getUserCurrencyPreference(): SupportedCurrency {
  if (typeof window === 'undefined') return 'NGN'; // Default for SSR
  
  const stored = localStorage.getItem('currencyPreference');
  if (stored && (stored === 'USD' || stored === 'NGN')) {
    return stored as SupportedCurrency;
  }
  
  return 'NGN'; // Default to NGN
}

/**
 * Set user's preferred currency in localStorage
 */
export function setUserCurrencyPreference(currency: SupportedCurrency): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('currencyPreference', currency);
} 