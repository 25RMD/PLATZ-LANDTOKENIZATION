'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAccount, useContractRead, usePublicClient } from 'wagmi';
import { Abi } from 'viem';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiLoader, FiPackage, FiSearch, FiFilter, FiGrid, FiList, FiMap, FiX, FiLayers } from 'react-icons/fi';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AnimatedButton from '@/components/common/AnimatedButton';
import PulsingDotsSpinner from '@/components/common/PulsingDotsSpinner';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import LowBalanceWarning from '@/components/common/LowBalanceWarning';
import NFTImage from '@/components/nft/NFTImage';
import { LAND_MARKETPLACE_ADDRESS, PLATZ_LAND_NFT_ADDRESS } from '@/config/contracts';
import { LandMarketplaceABI } from '@/contracts/LandMarketplaceABI';
import { PlatzLandNFTABI } from '@/contracts/PlatzLandNFTABI';
import { formatEther, decodeEventLog, createPublicClient, http, PublicClient } from 'viem';
import { getLogsInChunks, safeDecodeEventLog } from '@/lib/ethereum/blockchainUtils';
import { getSepoliaClientConfig } from '@/lib/ethereum/rpcConfig';
import CollectionsGrid from '@/components/collections/CollectionsGrid';
import CollectionCard from '@/components/CollectionCard'; // Restored import
import { CollectionDetail } from '../lib/types';
import { fetchAndProcessCollectionDetails } from '../lib/collectionUtils';

// Define types for filter state
interface FilterState {
  status: string;
  minPrice: string;
  maxPrice: string;
  country: string;
  state: string;
  search: string;
}

// --- MAIN PAGE COMPONENT ---
const ExploreNFTPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const publicClient = usePublicClient();
  const { address: accountAddress } = useAccount();

  const fetchCollectionDetails = useCallback(async (collectionId: bigint, client: PublicClient): Promise<CollectionDetail | null> => {
    if (!client) {
      console.error("[ExploreNFTPage] Public client is not available.");
      return null;
    }

    let baseUrlToUse: string;
    if (typeof window !== 'undefined') {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        baseUrlToUse = window.location.origin; // e.g., http://localhost:3000
      } else {
        // If on client but not localhost (e.g., accessed via ngrok URL directly in browser)
        baseUrlToUse = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
      }
    } else {
      // Server-side or window not available
      baseUrlToUse = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; // Fallback for SSR if needed
    }
    
    // Fallback if somehow still undefined
    if (!baseUrlToUse) {
      console.warn("[ExploreNFTPage] baseUrlToUse could not be determined, defaulting to NEXT_PUBLIC_BASE_URL or a hardcoded localhost.");
      baseUrlToUse = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    }

    console.log(`[ExploreNFTPage] Determined baseUrlToUse for fetching: ${baseUrlToUse}`);

    return fetchAndProcessCollectionDetails(
      collectionId,
      client,
      baseUrlToUse, // Use the dynamically determined base URL
      PLATZ_LAND_NFT_ADDRESS as `0x${string}`, 
      LAND_MARKETPLACE_ADDRESS as `0x${string}`,
      PlatzLandNFTABI as Abi, 
      LandMarketplaceABI as Abi 
    );
  }, []); // Removed publicClient from dependency array as fetchAndProcessCollectionDetails now accepts it as an argument

  // State for collections and loading
  const [onChainCollections, setOnChainCollections] = useState<CollectionDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for pagination
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCollections, setTotalCollections] = useState<number>(0);
  
  // State for view mode
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  
  // State for filters
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState>({
    status: '',
    minPrice: '',
    maxPrice: '',
    country: '',
    state: '',
    search: '',
  });
  
  // State for countries and states (for filter dropdowns)
  const [countries, setCountries] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);

  const loadCollections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!publicClient) {
        console.warn('[ExploreNFTPage] Public client not available yet.');
        setError('Blockchain connection not available.');
        return;
      }
      
      let allCollectionIds: bigint[] = [];
      
      try {
        // First, try to get all collection IDs
        allCollectionIds = await publicClient.readContract({
          address: PLATZ_LAND_NFT_ADDRESS as `0x${string}`,
          abi: PlatzLandNFTABI,
          functionName: 'getAllCollectionIds',
          args: [],
        }) as bigint[];
        
        console.log(`✅ Found ${allCollectionIds?.length || 0} collections on blockchain`);
      } catch (getAllError: any) {
        console.error('❌ getAllCollectionIds failed:', getAllError.message);
        
        // Fallback 1: Try to get collection count and iterate
        try {
          const collectionCount = await publicClient.readContract({
            address: PLATZ_LAND_NFT_ADDRESS as `0x${string}`,
            abi: PlatzLandNFTABI,
            functionName: 'getCollectionCount',
            args: [],
          }) as bigint;
          
          // Generate collection IDs from 1 to count (collections start at 1, not 0)
          allCollectionIds = [];
          for (let i = 1; i <= Number(collectionCount); i++) {
            allCollectionIds.push(BigInt(i));
          }
          
          console.log(`✅ Generated ${allCollectionIds.length} collection IDs from count`);
        } catch (getCountError: any) {
          console.error('❌ getCollectionCount also failed:', getCountError.message);
          
          // Fallback 2: Try to load from database/API
          try {
            const response = await fetch('/api/collections');
            if (response.ok) {
              const data = await response.json();
              if (data.collections && Array.isArray(data.collections)) {
                allCollectionIds = data.collections
                  .filter((c: any) => c.collectionId)
                  .map((c: any) => BigInt(c.collectionId));
                console.log(`✅ Got ${allCollectionIds.length} collection IDs from API fallback`);
              }
            } else {
              throw new Error(`API returned ${response.status}`);
            }
          } catch (apiError: any) {
            console.error('❌ All fallback methods failed:', apiError.message);
            
            // Final fallback: Check if this is a contract deployment issue
            const contractCode = await publicClient.getBytecode({
              address: PLATZ_LAND_NFT_ADDRESS as `0x${string}`,
            });
            
            if (!contractCode || contractCode === '0x') {
              setError(`Contract not deployed at address ${PLATZ_LAND_NFT_ADDRESS}. Please check your contract deployment.`);
            } else {
              setError(`Contract exists but doesn't have expected functions. This might be an older version of the contract or ABI mismatch.`);
            }
            setLoading(false);
            return;
          }
        }
      }

      if (!allCollectionIds || allCollectionIds.length === 0) {
        console.log("No collections found");
        setOnChainCollections([]);
        setLoading(false);
        return;
      }

      // Process collections sequentially to avoid RPC rate limiting
      console.log(`🔄 Loading ${allCollectionIds.length} collections...`);
      const fetchedOnChainCollections: CollectionDetail[] = [];
      
      for (let i = 0; i < allCollectionIds.length; i++) {
        const collectionId = allCollectionIds[i];
        
        try {
          const collectionDetail = await fetchCollectionDetails(collectionId, publicClient);
          if (collectionDetail) {
            fetchedOnChainCollections.push(collectionDetail);
          }
        } catch (error: any) {
          console.error(`❌ Failed to fetch collection ${collectionId}:`, error.message);
        }
        
        // Add a small delay between requests to avoid rate limiting
        if (i < allCollectionIds.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
        }
      }
      
      console.log(`✅ Successfully loaded ${fetchedOnChainCollections.length}/${allCollectionIds.length} collections`);
      setOnChainCollections(fetchedOnChainCollections.sort((a, b) => Number(b.collectionId) - Number(a.collectionId)));

      setTotalCollections(fetchedOnChainCollections.length);
      setTotalPages(Math.ceil(fetchedOnChainCollections.length / 12)); // Assuming 12 items per page
      setLoading(false);
    } catch (err: any) {
      console.error('❌ Error loading collections:', err.message);
      setError(err.message || 'Failed to load collections.');
    }
    setLoading(false);
  }, [publicClient]);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)]">
        <PulsingDotsSpinner size={48} color="bg-black dark:bg-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 sm:py-8 px-3 sm:px-4 md:px-6 lg:px-8 text-center min-h-[calc(100vh-200px)] flex flex-col justify-center items-center">
        <FiAlertCircle className="text-red-500 text-5xl mx-auto mb-4" />
        <p className="text-red-500 text-xl mb-4">Error: {error}</p>
        <AnimatedButton onClick={loadCollections} className="bg-blue-500 hover:bg-blue-600 text-white">
          <FiLoader className="mr-2" /> Retry
        </AnimatedButton>
      </div>
    );
  }

  if (onChainCollections.length === 0) {
    return (
      <div className="container mx-auto py-6 sm:py-8 px-3 sm:px-4 md:px-6 lg:px-8 text-center min-h-[calc(100vh-200px)] flex flex-col justify-center items-center">
        <FiPackage className="text-gray-400 dark:text-gray-500 text-6xl mx-auto mb-6" />
        <p className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-3">No Collections Found</p>
        <p className="text-gray-500 dark:text-gray-400 mb-8">It looks like there are no NFT collections available at the moment.</p>
        <Link href="/create-land-listing" passHref>
          <AnimatedButton className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 text-lg">
            Create New Listing
          </AnimatedButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 sm:py-8 px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4 md:mb-0">
          Explore Land Collections
        </h1>
        {/* Optional: Add search/filter controls here later */}
      </div>

      {/* Low Balance Warning */}
      {accountAddress && (
        <LowBalanceWarning threshold={0.01} />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
        {onChainCollections.map((collection: CollectionDetail) => (
          <motion.div
            key={collection.collectionId.toString()}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }} // Slightly faster animation
            className="w-full" 
          >
            <CollectionCard collection={collection} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ExploreNFTPage;
