'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FiRefreshCw, FiDollarSign } from 'react-icons/fi';
import { useCurrency } from '@/context/CurrencyContext';
import { parseCurrencyInput, validateCurrencyAmount } from '@/lib/utils/currencyConversion';

interface CurrencyInputProps {
  value: string;
  onChange: (value: string, ethValue: number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: string;
  showConversion?: boolean;
  allowCurrencyToggle?: boolean;
  minEthAmount?: number;
}

type InputMode = 'ETH' | 'CURRENCY';

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  placeholder = "0.0000",
  disabled = false,
  className = "",
  label,
  error,
  showConversion = true,
  allowCurrencyToggle = true,
  minEthAmount = 0.001
}) => {
  const {
    preferredCurrency,
    exchangeRates,
    isLoading: ratesLoading,
    convertEthToCurrency,
    convertCurrencyToEth,
    formatCurrencyAmount,
    formatEthAmount,
    getCurrencySymbol,
    getCurrencyName,
    refreshExchangeRates
  } = useCurrency();

  const [inputMode, setInputMode] = useState<InputMode>('ETH');
  const [localError, setLocalError] = useState<string>('');

  // Calculate conversions
  const numericValue = parseCurrencyInput(value);
  const ethValue = inputMode === 'ETH' ? numericValue : convertCurrencyToEth(numericValue);
  const currencyValue = inputMode === 'CURRENCY' ? numericValue : convertEthToCurrency(numericValue);

  // Validate input
  useEffect(() => {
    if (numericValue > 0) {
      if (inputMode === 'ETH') {
        if (numericValue < minEthAmount) {
          setLocalError(`Minimum amount is ${minEthAmount} ETH`);
        } else {
          setLocalError('');
        }
      } else {
        const validation = validateCurrencyAmount(numericValue, preferredCurrency);
        setLocalError(validation.isValid ? '' : validation.error || '');
      }
    } else {
      setLocalError('');
    }
  }, [numericValue, inputMode, preferredCurrency, minEthAmount]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow only valid decimal numbers
    if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
      onChange(inputValue, inputMode === 'ETH' ? parseCurrencyInput(inputValue) : convertCurrencyToEth(parseCurrencyInput(inputValue)));
    }
  }, [onChange, inputMode, convertCurrencyToEth]);

  const toggleInputMode = useCallback(() => {
    if (!allowCurrencyToggle || disabled) return;
    
    const newMode: InputMode = inputMode === 'ETH' ? 'CURRENCY' : 'ETH';
    setInputMode(newMode);
    
    // Convert current value to new mode
    if (numericValue > 0) {
      const newValue = newMode === 'ETH' ? ethValue : currencyValue;
      onChange(newValue.toString(), ethValue);
    }
  }, [inputMode, allowCurrencyToggle, disabled, numericValue, ethValue, currencyValue, onChange]);

  const currentSymbol = inputMode === 'ETH' ? '' : getCurrencySymbol();
  const currentUnit = inputMode === 'ETH' ? 'ETH' : preferredCurrency;
  const conversionText = showConversion && exchangeRates && numericValue > 0 
    ? inputMode === 'ETH' 
      ? `≈ ${formatCurrencyAmount(currencyValue)}`
      : `≈ ${formatEthAmount(ethValue)}`
    : '';

  const displayError = error || localError;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      <div className="relative">
        {/* Currency symbol on the left */}
        {currentSymbol && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 text-sm">{currentSymbol}</span>
          </div>
        )}
        
        {/* Input field */}
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full ${currentSymbol ? 'pl-8' : 'pl-3'} pr-20 py-3 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 ${
            displayError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
          } ${className}`}
        />
        
        {/* Currency unit and toggle button on the right */}
        <div className="absolute inset-y-0 right-0 flex items-center">
          {allowCurrencyToggle ? (
            <button
              type="button"
              onClick={toggleInputMode}
              disabled={disabled || ratesLoading}
              className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentUnit}
            </button>
          ) : (
            <span className="px-3 text-sm text-gray-500">{currentUnit}</span>
          )}
        </div>
      </div>

      {/* Conversion display */}
      {showConversion && (
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-500 dark:text-gray-400">
            {ratesLoading ? (
              <div className="flex items-center">
                <FiRefreshCw className="animate-spin mr-1" size={12} />
                Loading rates...
              </div>
            ) : conversionText ? (
              conversionText
            ) : exchangeRates ? (
              `1 ETH = ${formatCurrencyAmount(exchangeRates[preferredCurrency])}`
            ) : (
              'Exchange rates unavailable'
            )}
          </div>
          
          {exchangeRates && (
            <button
              type="button"
              onClick={refreshExchangeRates}
              disabled={ratesLoading}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
              title="Refresh exchange rates"
            >
              <FiRefreshCw className={`${ratesLoading ? 'animate-spin' : ''}`} size={12} />
            </button>
          )}
        </div>
      )}

      {/* Error display */}
      {displayError && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {displayError}
        </p>
      )}

      {/* Currency preference info */}
      {showConversion && !ratesLoading && exchangeRates && (
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Preferred currency: {getCurrencyName()}
        </p>
      )}
    </div>
  );
};

export default CurrencyInput; 