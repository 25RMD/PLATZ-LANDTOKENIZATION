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
import NFTImage from '@/components/nft/NFTImage';
import { LAND_MARKETPLACE_ADDRESS, PLATZ_LAND_NFT_ADDRESS } from '@/config/contracts';
import { LandMarketplaceABI } from '@/contracts/LandMarketplaceABI';
import { PlatzLandNFTABI } from '@/contracts/PlatzLandNFTABI';
import { formatEther, decodeEventLog, createPublicClient, http, PublicClient } from 'viem';
import { sepolia } from 'viem/chains';
import { getLogsInChunks, safeDecodeEventLog } from '@/lib/ethereum/blockchainUtils';
import { SEPOLIA_RPC_URLS, getPrioritizedSepoliaRpcUrl, getSepoliaClientConfig } from '@/lib/ethereum/rpcConfig';
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
        // setLoading(false); // Optional: manage loading state based on whether this is an initial load critical error
        return;
      }
      console.log("Attempting to load all collection IDs...");
      const allCollectionIds = await publicClient.readContract({
            address: PLATZ_LAND_NFT_ADDRESS as `0x${string}`,
        abi: PlatzLandNFTABI,
        functionName: 'getAllCollectionIds',
        args: [],
      }) as bigint[];

      console.log(`Found ${allCollectionIds?.length || 0} collection IDs: ${allCollectionIds?.join(', ')}`);

      if (!allCollectionIds || allCollectionIds.length === 0) {
        setOnChainCollections([]);
        setLoading(false);
        return;
      }

      const collectionsDetailsPromises = allCollectionIds.map(id => fetchCollectionDetails(id, publicClient));
      const settledResults = await Promise.allSettled(collectionsDetailsPromises);

      const fetchedOnChainCollections: CollectionDetail[] = [];
      settledResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          fetchedOnChainCollections.push(result.value);
        } else if (result.status === 'rejected') {
          console.error(`Failed to fetch details for collection ID ${allCollectionIds[index]}:`, result.reason);
        }
      });
      
      console.log(`Loaded ${fetchedOnChainCollections.length} collections from chain.`, fetchedOnChainCollections);
      // DETAILED LOG FOR DEBUGGING DESCRIPTIONS
      console.log('[ExploreNFTPage] DETAILED LOG: fetchedOnChainCollections before setting state:', 
        fetchedOnChainCollections.map(c => ({ 
          id: c.collectionId, 
          name: c.name, 
          description: c.description, 
          image: c.image 
        }))
      );
      setOnChainCollections(fetchedOnChainCollections.sort((a, b) => Number(b.collectionId) - Number(a.collectionId))); // Sort here if onChainCollections should be sorted

      setTotalCollections(fetchedOnChainCollections.length);
      setTotalPages(Math.ceil(fetchedOnChainCollections.length / 12)); // Assuming 12 items per page
      setLoading(false);
    } catch (err: any) {
      console.error('Error loading collections:', err);
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
      <div className="container mx-auto py-8 px-4 text-center min-h-[calc(100vh-200px)] flex flex-col justify-center items-center">
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
      <div className="container mx-auto py-8 px-4 text-center min-h-[calc(100vh-200px)] flex flex-col justify-center items-center">
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
    <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4 md:mb-0">
          Explore Land Collections
        </h1>
        {/* Optional: Add search/filter controls here later */}
      </div>

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
