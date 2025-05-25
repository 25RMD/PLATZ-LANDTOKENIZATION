"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiAlertCircle, FiStar, FiInfo, FiX, FiExternalLink } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import PulsingDotsSpinner from '@/components/common/PulsingDotsSpinner';
import { getImageUrl } from '@/lib/utils/imageUtils';

interface WatchlistItem {
  id: string;
  collectionId: string;
  name: string;
  description: string | null;
  image: string | null;
  price: number | null;
  currency: string;
  items: number;
  creator: string;
  createdAt: string;
  updatedAt: string;
  ownerCount: number;
  listedCount: number;
  nftCount: number;
  addedToWatchlistAt: string;
}

const WatchlistPage = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!isAuthenticated) {
        if (!authLoading) {
          setError('You must be logged in to view your watchlist');
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/watchlist');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setWatchlistItems(data.data || []);
      } catch (err: any) {
        console.error('Failed to fetch watchlist:', err);
        setError(err.message || 'Failed to load watchlist data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWatchlist();
  }, [isAuthenticated, authLoading]);

  const removeFromWatchlist = async (collectionId: string) => {
    try {
      const response = await fetch('/api/watchlist/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collectionId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove from watchlist');
      }

      // Remove the item from the state
      setWatchlistItems(prev => prev.filter(item => item.collectionId !== collectionId));
      console.log('Collection removed from watchlist');
    } catch (err: any) {
      console.error('Error removing from watchlist:', err);
      // Optionally show an error toast/notification here
    }
  };

  // Helper to format date
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid date';
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PulsingDotsSpinner size={48} color="bg-black dark:bg-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <FiAlertCircle className="text-red-500 w-16 h-16 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Error</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">{error}</p>
        {!isAuthenticated && (
          <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
            Log In
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Your Watchlist
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400 sm:mt-4">
            Collections you're keeping an eye on
          </p>
        </div>

        {watchlistItems.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700">
            <FiInfo className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No collections in your watchlist</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Add collections to your watchlist by clicking the star icon on a collection page.
            </p>
            <div className="mt-6">
              <Link href="/collections" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                Browse Collections
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {watchlistItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-zinc-800 overflow-hidden rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700 flex flex-col"
              >
                <div className="relative">
                  <Link href={`/collections/${item.collectionId}`}>
                    <div className="h-48 w-full overflow-hidden">
                      <img
                        src={getImageUrl(item.image, '/placeholder-collection.png')}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  </Link>
                  <button
                    onClick={() => removeFromWatchlist(item.collectionId)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-red-600 transition-colors"
                    title="Remove from watchlist"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="p-4 flex-grow">
                  <div className="flex items-start justify-between">
                    <Link
                      href={`/collections/${item.collectionId}`}
                      className="hover:underline">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate" title={item.name}>
                        {item.name}
                      </h3>
                    </Link>
                    <FiStar className="text-yellow-400 h-5 w-5 flex-shrink-0 ml-2" />
                  </div>
                  
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    By {item.creator}
                  </p>
                  
                  {item.description && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
                
                <div className="px-4 py-3 bg-gray-50 dark:bg-zinc-900/50 border-t border-gray-200 dark:border-zinc-700">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Items:</span>
                      <span className="ml-1 font-medium text-gray-900 dark:text-white">{item.items}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Price:</span>
                      <span className="ml-1 font-medium text-gray-900 dark:text-white">
                        {item.price ? `${item.price} ${item.currency}` : 'N/A'}
                      </span>
                    </div>
                    <div className="col-span-2 mt-1">
                      <span className="text-gray-500 dark:text-gray-400">Added:</span>
                      <span className="ml-1 font-medium text-gray-900 dark:text-white">{formatDate(item.addedToWatchlistAt)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="px-4 py-3 border-t border-gray-200 dark:border-zinc-700">
                  <Link
                    href={`/collections/${item.collectionId}`}
                    className="flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                    View Collection
                    <FiExternalLink className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchlistPage;
