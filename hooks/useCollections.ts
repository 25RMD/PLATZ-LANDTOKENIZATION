import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { usePublicClient } from 'wagmi';
import { fetchCollections, Collection } from '@/lib/fetchCollections';

interface UseCollectionsOptions {
  page?: number;
  limit?: number;
  fromBlock?: number;
  autoLoad?: boolean;
}

export function useCollections(options: UseCollectionsOptions = {}) {
  const publicClient = usePublicClient();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(options.page || 1);
  const limit = options.limit || 10;
  const autoLoad = options.autoLoad !== false;

  const loadCollections = async (pageToLoad = page) => {
    if (!publicClient) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Create Ethers provider from public client
      // ethers v6 requires specific network format
      const url = publicClient.transport.url;
      const chainId = publicClient.chain?.id;
      
      // Create provider with properly formatted network parameter
      let provider: ethers.JsonRpcProvider;
      if (chainId) {
        // For Sepolia, use the known network name
        if (chainId === 11155111) {
          provider = new ethers.JsonRpcProvider(url, "sepolia");
        } else {
          // For other networks, use the chainId in the correct format
          provider = new ethers.JsonRpcProvider(url, {
            name: `chain-${chainId}`,
            chainId: chainId
          });
        }
      } else {
        provider = new ethers.JsonRpcProvider(url);
      }
      
      const result = await fetchCollections(provider, {
        page: pageToLoad,
        limit,
        fromBlock: options.fromBlock
      });
      
      setCollections(pageToLoad === 1 
        ? result.collections 
        : [...collections, ...result.collections]
      );
      setTotalCount(result.totalCount);
      setHasMore(result.hasMore);
      setPage(pageToLoad);
    } catch (err: any) {
      console.error('Error loading collections:', err);
      setError(err.message || 'Failed to load collections');
    } finally {
      setIsLoading(false);
    }
  };

  const loadNextPage = () => {
    if (!isLoading && hasMore) {
      loadCollections(page + 1);
    }
  };

  const refresh = () => {
    loadCollections(1);
  };

  useEffect(() => {
    if (autoLoad && publicClient) {
      loadCollections();
    }
  }, [publicClient]);

  return {
    collections,
    isLoading,
    error,
    totalCount,
    hasMore,
    page,
    loadNextPage,
    refresh
  };
} 