import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';
import { useCurrency } from '@/context/CurrencyContext';
import PulsingDotsSpinner from '@/components/common/PulsingDotsSpinner';

interface BidInfo {
  tokenId: number;
  currentBid: number | null;
  minimumBid: number;
  synced: boolean;
  hasActiveBid: boolean;
}

interface BidInfoDisplayProps {
  tokenId: string | number;
  className?: string;
  showRefresh?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

const BidInfoDisplay: React.FC<BidInfoDisplayProps> = ({
  tokenId,
  className = '',
  showRefresh = true,
  autoRefresh = false,
  refreshInterval = 30000 // 30 seconds
}) => {
  const { formatPriceWithConversion } = useCurrency();
  const [bidInfo, setBidInfo] = useState<BidInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchBidInfo = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/tokens/${tokenId}/bid-info`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch bid information');
      }
      
      setBidInfo(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching bid info:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch bid information');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchBidInfo();
  }, [tokenId]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchBidInfo, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, tokenId]);

  if (error) {
    return (
      <div className={`text-red-600 dark:text-red-400 text-sm ${className}`}>
        <div className="flex items-center">
          <FiAlertTriangle className="mr-1" size={14} />
          <span>Failed to load bid info</span>
          {showRefresh && (
            <button
              onClick={fetchBidInfo}
              className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              disabled={isLoading}
            >
              <FiRefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (isLoading && !bidInfo) {
    return (
      <div className={`flex items-center text-gray-500 dark:text-gray-400 text-sm ${className}`}>
        <PulsingDotsSpinner size={12} color="bg-gray-500" />
        <span className="ml-2">Loading bid info...</span>
      </div>
    );
  }

  if (!bidInfo) {
    return (
      <div className={`text-gray-500 dark:text-gray-400 text-sm ${className}`}>
        No bid information available
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Current Bid:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {bidInfo.hasActiveBid 
                ? formatPriceWithConversion(bidInfo.currentBid!) 
                : 'No bids yet'
              }
            </span>
            {bidInfo.hasActiveBid && !bidInfo.synced && (
              <span 
                className="text-orange-500 text-xs" 
                title="Blockchain data may be out of sync"
              >
                ⚠️
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Min Bid:</span>
            <span className="font-medium text-green-600 dark:text-green-400">
              {formatPriceWithConversion(bidInfo.minimumBid)}
            </span>
          </div>
        </div>
        
        {showRefresh && (
          <div className="flex flex-col items-end space-y-1">
            <button
              onClick={fetchBidInfo}
              disabled={isLoading}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded"
              title="Refresh bid information"
            >
              <FiRefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>
            {lastUpdated && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        )}
      </div>
      
      {bidInfo.hasActiveBid && (
        <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
          💡 To place a bid, you need at least {formatPriceWithConversion(bidInfo.minimumBid)}
        </div>
      )}
    </div>
  );
};

export default BidInfoDisplay; 