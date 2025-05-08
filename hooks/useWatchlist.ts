import { useState, useCallback } from 'react';

/**
 * Custom hook for managing watchlist functionality
 * @returns Watchlist state and functions
 */
export const useWatchlist = () => {
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(false);
  const [watchlistError, setWatchlistError] = useState<string | null>(null);

  /**
   * Check if an item is in the user's watchlist
   * @param collectionId - ID of the collection to check
   * @returns Promise resolving to the watchlist status
   */
  const checkWatchlistStatus = useCallback(async (collectionId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/watchlist/check?collectionId=${collectionId}`);
      
      if (response.status === 401) {
        // User not authenticated, don't show error
        setIsWatchlisted(false);
        return false;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setIsWatchlisted(data.isWatchlisted);
      return data.isWatchlisted;
    } catch (err) {
      console.error('Error checking watchlist status:', err);
      setWatchlistError('Failed to check watchlist status');
      return false;
    }
  }, []);
  
  /**
   * Toggle watchlist status for a collection
   * @param collectionId - ID of the collection to toggle
   * @returns Promise with the result of the operation
   */
  const toggleWatchlist = useCallback(async (collectionId: string): Promise<{
    success: boolean;
    action?: 'added' | 'removed';
    message: string;
  }> => {
    try {
      setIsWatchlistLoading(true);
      setWatchlistError(null);
      
      const response = await fetch('/api/watchlist/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collectionId }),
      });
      
      if (response.status === 401) {
        return {
          success: false,
          message: 'Please sign in to add to watchlist'
        };
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setIsWatchlisted(data.action === 'added');
      
      return {
        success: true,
        action: data.action,
        message: data.action === 'added' ? 'Added to watchlist' : 'Removed from watchlist'
      };
    } catch (err) {
      console.error('Error toggling watchlist:', err);
      setWatchlistError('Failed to update watchlist');
      return {
        success: false,
        message: 'Failed to update watchlist'
      };
    } finally {
      setIsWatchlistLoading(false);
    }
  }, []);

  return {
    isWatchlisted,
    isWatchlistLoading,
    watchlistError,
    checkWatchlistStatus,
    toggleWatchlist
  };
};

export default useWatchlist;
