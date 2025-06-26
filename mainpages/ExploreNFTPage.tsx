'use client';

import React, { useState, useEffect, useCallback } from 'react';
// import { useAccount, useContractRead, usePublicClient } from 'wagmi'; // Temporarily disabled
// import { Abi } from 'viem'; // Temporarily disabled
import { motion } from 'framer-motion';
import { FiAlertCircle, FiLoader, FiPackage, FiSearch, FiFilter, FiGrid, FiList, FiMap, FiX, FiLayers } from 'react-icons/fi';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext'; // Re-enabled with hydration guards
import { useExploreState } from '@/context/ExploreStateContext';
import AnimatedButton from '@/components/common/AnimatedButton';
import PulsingDotsSpinner from '@/components/common/PulsingDotsSpinner';
import SkeletonLoader from '@/components/common/SkeletonLoader';
// import LowBalanceWarning from '@/components/common/LowBalanceWarning'; // Temporarily disabled
import NFTImage from '@/components/nft/NFTImage';
// import { LAND_MARKETPLACE_ADDRESS, PLATZ_LAND_NFT_ADDRESS } from '@/config/contracts'; // Temporarily disabled
// import { LandMarketplaceABI } from '@/contracts/LandMarketplaceABI'; // Temporarily disabled
// import { PlatzLandNFTABI } from '@/contracts/PlatzLandNFTABI'; // Temporarily disabled
// import { formatEther, decodeEventLog, createPublicClient, http, PublicClient } from 'viem'; // Temporarily disabled
// import { getLogsInChunks, safeDecodeEventLog } from '@/lib/ethereum/blockchainUtils'; // Temporarily disabled
// import { getSepoliaClientConfig } from '@/lib/ethereum/rpcConfig'; // Temporarily disabled
import CollectionsGrid from '@/components/collections/CollectionsGrid';
import CollectionCard from '@/components/CollectionCard'; // Restored import
import { CollectionDetail } from '../lib/types';
// import { fetchAndProcessCollectionDetails } from '../lib/collectionUtils'; // Temporarily disabled

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
  const { user, isLoading: authLoading } = useAuth(); // Re-enabled with hydration guards
  // const publicClient = usePublicClient(); // Temporarily disabled
  // const { address: accountAddress } = useAccount(); // Temporarily disabled
  
  // Use the explore state context instead of local state
  const { state, updateState, hasState } = useExploreState();
  const {
    onChainCollections,
    loading,
    error,
    page,
    totalPages,
    totalCollections,
    viewMode,
    showFilters,
    filters,
    countries,
    states
  } = state;

  // Temporarily simplified collection loading using API only
  const loadCollections = useCallback(async () => {
    updateState({ loading: true, error: null });
    try {
      console.log('🔄 Loading collections from API...');
      
      const response = await fetch('/api/collections');
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ API Response:', data);
      
      // Helper function to generate meaningful collection names
      const generateCollectionName = (col: any): string => {
        let name = '';
        
        // Only check actual title fields, not description
        if (col.nftTitle && col.nftTitle.trim()) {
          name = col.nftTitle.trim();
        } else if (col.listingTitle && col.listingTitle.trim()) {
          name = col.listingTitle.trim();
        } else {
          // Only if NO title fields are provided, show this
          return 'No name supplied';
        }
        
        // Remove " Collection" suffix if it exists (case insensitive)
        if (name.toLowerCase().endsWith(' collection')) {
          name = name.slice(0, -11); // Remove " Collection" (11 characters)
        }
        
        return name;
      };
      
      if (data.collections && Array.isArray(data.collections)) {
        // Transform API data to CollectionDetail format for display
        const transformedCollections: CollectionDetail[] = data.collections.map((col: any) => {
          // Fix image URL construction
          let imageUrl = '';
          if (col.nftImageFileRef) {
            // If it's already a full URL or path starting with /, use as is
            if (col.nftImageFileRef.startsWith('http') || col.nftImageFileRef.startsWith('/')) {
              imageUrl = col.nftImageFileRef;
            } else {
              // Add uploads prefix for both regular files and collection-specific paths
              imageUrl = `/uploads/${col.nftImageFileRef}`;
            }
          } else {
            // No image available - let CollectionCard handle the placeholder
            imageUrl = '';
          }
          
          console.log(`Collection ${col.collectionId}: nftImageFileRef="${col.nftImageFileRef}" -> imageUrl="${imageUrl}"`);
          
          return {
            id: col.id,
            collectionId: BigInt(col.collectionId),
            name: generateCollectionName(col),
            description: col.nftDescription || 'No description available',
            image: imageUrl,
            creator: col.user?.evmAddress || col.evmOwnerAddress || '0x0000000000000000000000000000000000000000',
            isListed: col.isListedForSale || (col.listingPrice && col.listingPrice > 0) || false,
            price: col.listingPrice ? BigInt(Math.floor(col.listingPrice * 1e18)) : 0n,
            totalSupply: BigInt(col.nftCollectionSize || 1),
            baseURI: col.metadataUri || '',
            collectionURI: col.metadataUri || '',
            country: col.country || '',
            state: col.state || '',
            area: col.propertyAreaSqm || 0,
            latitude: col.latitude || '',
            longitude: col.longitude || ''
          };
        });
        
        console.log(`✅ Transformed ${transformedCollections.length} collections for display`);
        
        // Debug: Log first few collections to verify transformation
        if (transformedCollections.length > 0) {
          console.log('📊 First few transformed collections:', transformedCollections.slice(0, 3).map(col => ({
            id: col.id,
            name: col.name,
            image: col.image,
            isListed: col.isListed,
            price: col.price.toString()
          })));
        }
        
        updateState({ 
          onChainCollections: transformedCollections,
          totalCollections: transformedCollections.length,
          totalPages: Math.ceil(transformedCollections.length / 12),
          loading: false 
        });
            } else {
        console.log('⚠️ No collections found in API response');
        updateState({ onChainCollections: [], loading: false });
      }
    } catch (err: any) {
      console.error('❌ Error loading collections:', err.message);
      updateState({ 
        error: err.message || 'Failed to load collections.',
        loading: false 
      });
    }
  }, [updateState]);

  useEffect(() => {
    // Only load collections if we don't have cached state or if the state is too old (older than 5 minutes)
    const shouldRefresh = !hasState() || 
      (state.lastUpdated && Date.now() - state.lastUpdated > 5 * 60 * 1000);
    
    if (shouldRefresh) {
    loadCollections();
    } else {
      console.log('✅ Using cached explore state');
    }
  }, [loadCollections, hasState]);

  // Helper functions to update specific parts of state
  const setPage = useCallback((newPage: number) => {
    updateState({ page: newPage });
  }, [updateState]);

  const setViewMode = useCallback((mode: 'grid' | 'list' | 'map') => {
    updateState({ viewMode: mode });
  }, [updateState]);

  const setShowFilters = useCallback((show: boolean) => {
    updateState({ showFilters: show });
  }, [updateState]);

  const setFilters = useCallback((newFilters: typeof filters) => {
    updateState({ filters: newFilters });
  }, [updateState]);

  if (loading) {
    return (
      <motion.div 
        className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] bg-gray-50 dark:bg-primary-dark"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Cyber loading background */}
        <motion.div
          className="absolute inset-0 opacity-5 dark:opacity-10"
          animate={{
            background: [
              "radial-gradient(circle at 20% 80%, rgba(0, 0, 0, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 20%, rgba(0, 0, 0, 0.2) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 80%, rgba(0, 0, 0, 0.3) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mb-6"
        >
        <PulsingDotsSpinner size={48} color="bg-black dark:bg-white" />
        </motion.div>
        
        <motion.h2 
          className="text-xl font-mono uppercase tracking-wider text-black dark:text-white mb-2"
          animate={{ 
            textShadow: [
              "0 0 10px rgba(0, 0, 0, 0.5)",
              "0 0 20px rgba(0, 0, 0, 0.8)",
              "0 0 10px rgba(0, 0, 0, 0.5)",
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          LOADING LISTINGS
        </motion.h2>
        
        <motion.p 
          className="text-sm font-mono text-black/70 dark:text-white/70"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Fetching NFT listing data...
        </motion.p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="container mx-auto py-6 sm:py-8 px-3 sm:px-4 md:px-6 lg:px-8 text-center min-h-[calc(100vh-200px)] flex flex-col justify-center items-center bg-gray-50 dark:bg-primary-dark"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Cyber error background */}
        <motion.div
          className="absolute inset-0 opacity-5 dark:opacity-10"
          animate={{
            background: [
              "radial-gradient(circle at 50% 50%, rgba(255, 0, 0, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 30% 70%, rgba(255, 0, 0, 0.2) 0%, transparent 50%)",
              "radial-gradient(circle at 70% 30%, rgba(255, 0, 0, 0.25) 0%, transparent 50%)",
              "radial-gradient(circle at 50% 50%, rgba(255, 0, 0, 0.3) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
        
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mb-6"
        >
          <FiAlertCircle className="text-red-400 text-6xl mx-auto" />
        </motion.div>
        
        <motion.h2 
          className="text-2xl font-mono uppercase tracking-wider text-red-400 mb-4"
          style={{
            textShadow: "0 0 15px rgba(255, 100, 100, 0.6)",
          }}
        >
          SYSTEM ERROR
        </motion.h2>
        
        <motion.p 
          className="text-red-300 text-lg mb-6 font-mono max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {error}
        </motion.p>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatedButton 
            onClick={loadCollections} 
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 font-mono uppercase tracking-wider border border-red-400 rounded-cyber"
          >
            <FiLoader className="mr-2" /> RETRY CONNECTION
        </AnimatedButton>
        </motion.div>
      </motion.div>
    );
  }

  if (onChainCollections.length === 0) {
    return (
      <motion.div 
        className="container mx-auto py-6 sm:py-8 px-3 sm:px-4 md:px-6 lg:px-8 text-center min-h-[calc(100vh-200px)] flex flex-col justify-center items-center bg-gray-50 dark:bg-primary-dark"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Cyber empty state background */}
        <motion.div
          className="absolute inset-0 opacity-5 dark:opacity-10"
          animate={{
            background: [
              "radial-gradient(circle at 40% 60%, rgba(0, 0, 0, 0.2) 0%, transparent 50%)",
              "radial-gradient(circle at 60% 40%, rgba(0, 0, 0, 0.15) 0%, transparent 50%)",
              "radial-gradient(circle at 40% 60%, rgba(0, 0, 0, 0.2) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 2, -2, 0]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="mb-8"
        >
          <FiPackage className="text-black/60 dark:text-white/60 text-8xl mx-auto" />
        </motion.div>
        
        <motion.h2 
          className="text-3xl font-mono uppercase tracking-wider text-black dark:text-white mb-4"
          style={{
            textShadow: "0 0 20px rgba(0, 0, 0, 0.5)",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          NO LISTINGS DETECTED
        </motion.h2>
        
        <motion.p 
          className="text-black/70 dark:text-white/70 mb-8 font-mono text-lg max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          No NFT listings found. Create the first listing to begin.
        </motion.p>
        
        <Link href="/create-land-listing" passHref>
          <motion.div
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0, 0, 0, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <AnimatedButton className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 px-8 py-4 text-lg font-mono uppercase tracking-wider border border-black/30 dark:border-white/30 rounded-cyber">
              + CREATE NEW LISTING
          </AnimatedButton>
          </motion.div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="container mx-auto py-6 sm:py-8 px-3 sm:px-4 md:px-6 lg:px-8 bg-gray-50 dark:bg-primary-dark min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Cyber background pattern */}
      <motion.div
        className="fixed inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none z-0"
        animate={{
          backgroundPosition: ["0px 0px", "50px 50px"],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '25px 25px'
        }}
      />
      
      <div className="relative z-10">
        {/* Header Section with enhanced cyber styling */}
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div className="text-center md:text-left mb-6 md:mb-0">
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold font-mono uppercase tracking-wider text-black dark:text-white mb-3"
              style={{
                textShadow: "0 0 30px rgba(0, 0, 0, 0.6)",
              }}
              animate={{
                textShadow: [
                  "0 0 30px rgba(0, 0, 0, 0.6)",
                  "0 0 40px rgba(0, 0, 0, 0.8)",
                  "0 0 30px rgba(0, 0, 0, 0.6)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              EXPLORE LISTINGS
            </motion.h1>
            
            <motion.div 
              className="flex items-center justify-center md:justify-start space-x-4 text-black/70 dark:text-white/70 font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <motion.span
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {onChainCollections.length} LISTINGS FOUND
              </motion.span>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="w-2 h-2 bg-black dark:bg-white rounded-full"
              />
              <motion.span
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                API VERIFIED
              </motion.span>
            </motion.div>
          </motion.div>
          
          {/* Stats display */}
          <motion.div 
            className="flex space-x-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.div 
              className="text-center p-4 border border-black/20 dark:border-white/20 rounded-cyber bg-white/10 dark:bg-black/10 backdrop-blur-sm"
              whileHover={{ scale: 1.05, borderColor: "rgba(0, 0, 0, 0.4)" }}
            >
              <div className="text-2xl font-bold font-mono text-black dark:text-white">{onChainCollections.length}</div>
              <div className="text-xs font-mono text-black/60 dark:text-white/60 uppercase tracking-wider">LISTINGS</div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Collections Grid with enhanced animations */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10"
          style={{ gridAutoRows: '1fr' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {onChainCollections.map((collection: CollectionDetail, index: number) => (
          <motion.div
            key={collection.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
            className="w-full h-full" 
          >
            <CollectionCard collection={collection} />
          </motion.div>
        ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ExploreNFTPage;
