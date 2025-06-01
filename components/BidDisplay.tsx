import React from 'react';
import { useBidInfo } from '@/hooks/useBidInfo';
import { formatBidAmount, formatTimeSince, getBidStatusMessage } from '@/lib/bidService';

interface BidDisplayProps {
  tokenId: number;
  autoRefresh?: boolean;
  className?: string;
}

export const BidDisplay: React.FC<BidDisplayProps> = ({ 
  tokenId, 
  autoRefresh = true,
  className = '' 
}) => {
  const { bidInfo, loading, error, lastRefresh } = useBidInfo({ 
    tokenId, 
    autoRefresh 
  });

  if (loading) {
    return (
      <div className={`bid-display loading ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bid-display error ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">⚠️ {error}</p>
          <p className="text-gray-500 text-xs mt-1">
            Showing default minimum bid of 0.001 ETH
          </p>
        </div>
      </div>
    );
  }

  if (!bidInfo) {
    return (
      <div className={`bid-display no-data ${className}`}>
        <p className="text-gray-500">Unable to load bid information</p>
      </div>
    );
  }

  return (
    <div className={`bid-display ${bidInfo.status} ${className}`}>
      {bidInfo.hasActiveBid ? (
        <div className="current-bid bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Current Highest Bid
            </h3>
            {lastRefresh && (
              <span className="text-xs text-gray-500">
                Updated {formatTimeSince(lastRefresh.toISOString())}
              </span>
            )}
          </div>
          
          <div className="space-y-2">
            <p className="text-2xl font-bold text-blue-600">
              {formatBidAmount(bidInfo.currentBid)}
            </p>
            
            {bidInfo.bidder && (
              <p className="text-sm text-gray-600">
                by <span className="font-medium">{bidInfo.bidder.username}</span>
                <span className="text-xs text-gray-400 ml-1">
                  ({bidInfo.bidder.address.slice(0, 6)}...{bidInfo.bidder.address.slice(-4)})
                </span>
              </p>
            )}
            
            <div className="border-t border-blue-100 pt-2 mt-3">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Minimum next bid:</span>{' '}
                <span className="text-green-600 font-semibold">
                  {formatBidAmount(bidInfo.minimumBid)}
                </span>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="no-bids bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Bids Yet
            </h3>
            <p className="text-gray-600 mb-3">
              Be the first to place a bid on this token!
            </p>
            <p className="text-sm">
              <span className="font-medium">Minimum bid:</span>{' '}
              <span className="text-green-600 font-semibold">
                {formatBidAmount(bidInfo.minimumBid)}
              </span>
            </p>
          </div>
        </div>
      )}
      
      {bidInfo.lastUpdated && (
        <p className="text-xs text-gray-400 mt-2 text-center">
          Last bid activity: {formatTimeSince(bidInfo.lastUpdated)}
        </p>
      )}
    </div>
  );
}; 