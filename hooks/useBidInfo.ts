import { useState, useEffect, useCallback } from 'react';
import { BidInfo } from '@/types/bid';
import { fetchBidInfo } from '@/lib/bidService';

interface UseBidInfoOptions {
  tokenId: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseBidInfoReturn {
  bidInfo: BidInfo | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastRefresh: Date | null;
}

export const useBidInfo = ({ 
  tokenId, 
  autoRefresh = false, 
  refreshInterval = 30000 
}: UseBidInfoOptions): UseBidInfoReturn => {
  const [bidInfo, setBidInfo] = useState<BidInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchBidInfo(tokenId);
      setBidInfo(data);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bid info');
    } finally {
      setLoading(false);
    }
  }, [tokenId]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh || !tokenId) return;

    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refresh]);

  return {
    bidInfo,
    loading,
    error,
    refresh,
    lastRefresh
  };
}; 