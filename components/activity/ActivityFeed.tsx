"use client";

import React, { useEffect, useState } from 'react';
import { FiActivity, FiDollarSign, FiTrendingUp, FiRefreshCw, FiExternalLink } from 'react-icons/fi';
import { NFTImage } from '@/components/ui/image';
import PulsingDotsSpinner from '@/components/common/PulsingDotsSpinner';
import AnimatedButton from '@/components/common/AnimatedButton';

interface Transaction {
  id: string;
  transactionType: 'PURCHASE' | 'SALE' | 'TRANSFER' | 'BID_ACCEPTED' | 'BID_PLACED';
  tokenId: string;
  fromAddress: string;
  toAddress: string;
  price: number;
  currency: string;
  transactionHash: string;
  createdAt: string;
  landListing: {
    id: string;
    nftTitle: string;
    collectionId: string;
    nftImageFileRef: string;
  };
}

interface ActivityFeedProps {
  className?: string;
  limit?: number;
  collectionId?: string;
  showHeader?: boolean;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  className = '',
  limit = 10,
  collectionId,
  showHeader = true
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch recent transactions
  const fetchActivity = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: '0'
      });

      if (collectionId) {
        params.append('collectionId', collectionId);
      }

      const response = await fetch(`/api/transactions?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch activity');
      }

      const data = await response.json();
      
      if (data.success) {
        setTransactions(data.transactions || []);
      } else {
        throw new Error(data.message || 'Failed to fetch activity');
      }
    } catch (err: any) {
      console.error('Error fetching activity:', err);
      setError('Failed to load recent activity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, [limit, collectionId]);

  // Function to get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'PURCHASE':
      case 'SALE':
        return <FiDollarSign className="text-green-500" size={16} />;
      case 'BID_PLACED':
      case 'BID_ACCEPTED':
        return <FiTrendingUp className="text-blue-500" size={16} />;
      case 'TRANSFER':
        return <FiActivity className="text-purple-500" size={16} />;
      default:
        return <FiActivity className="text-gray-500" size={16} />;
    }
  };

  // Function to get activity description
  const getActivityDescription = (transaction: Transaction) => {
    const shortenAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;
    
    switch (transaction.transactionType) {
      case 'PURCHASE':
        return `${shortenAddress(transaction.toAddress)} purchased for ${transaction.price} ${transaction.currency}`;
      case 'SALE':
        return `Sold by ${shortenAddress(transaction.fromAddress)} for ${transaction.price} ${transaction.currency}`;
      case 'BID_PLACED':
        return `${shortenAddress(transaction.fromAddress)} placed bid of ${transaction.price} ${transaction.currency}`;
      case 'BID_ACCEPTED':
        return `Bid of ${transaction.price} ${transaction.currency} accepted`;
      case 'TRANSFER':
        return `Transferred from ${shortenAddress(transaction.fromAddress)} to ${shortenAddress(transaction.toAddress)}`;
      default:
        return 'Unknown activity';
    }
  };

  // Function to format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6 ${className}`}>
        {showHeader && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
          </div>
        )}
        <div className="flex justify-center py-8">
          <PulsingDotsSpinner size={32} color="bg-black dark:bg-white" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6 ${className}`}>
        {showHeader && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
          </div>
        )}
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <AnimatedButton
            onClick={fetchActivity}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
          >
            <FiRefreshCw className="inline mr-2" size={16} />
            Retry
          </AnimatedButton>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6 ${className}`}>
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
          <AnimatedButton
            onClick={fetchActivity}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FiRefreshCw size={16} />
          </AnimatedButton>
        </div>
      )}

      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <FiActivity className="mx-auto text-gray-400 dark:text-gray-600 mb-3" size={32} />
          <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              {/* NFT Image */}
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-zinc-800 flex-shrink-0">
                <NFTImage
                  src={transaction.landListing.nftImageFileRef || ''}
                  alt={transaction.landListing.nftTitle}
                  className="w-full h-full object-cover"
                  fallback="https://placehold.co/40x40/gray/white?text=NFT"
                />
              </div>

              {/* Activity Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2 mb-1">
                    {getActivityIcon(transaction.transactionType)}
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {transaction.landListing.nftTitle}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimeAgo(transaction.createdAt)}
                    </span>
                    <a
                      href={`https://sepolia.etherscan.io/tx/${transaction.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                      title="View on Etherscan"
                    >
                      <FiExternalLink size={12} />
                    </a>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {getActivityDescription(transaction)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Collection #{transaction.landListing.collectionId}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View More Link */}
      {transactions.length > 0 && transactions.length === limit && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-700 text-center">
          <button
            onClick={() => {/* TODO: Navigate to full activity page */}}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            View all activity
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed; 