"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; // Hook to get dynamic route parameters
import { motion } from 'framer-motion';
import { FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';

import { Collection } from '@/lib/interdace'; // Base collection type
import { NFT } from '@prisma/client'; // NFT type from Prisma
import NFTCardSimple from '@/components/NFTCardSimple'; // The card we just created
import LoadingSpinner from '@/components/common/LoadingSpinner';
import NFTCardSimpleSkeleton from '@/components/skeletons/NFTCardSimpleSkeleton'; // Import skeleton

// Define the expected structure for the fetched data, including NFTs
interface CollectionWithNFTs extends Collection {
  nfts: NFT[];
}

const SingleCollectionPage = () => {
  const params = useParams(); // Get route parameters
  const collectionId = params?.collectionId as string;

  const [collectionData, setCollectionData] = useState<CollectionWithNFTs | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!collectionId) {
      // Should not happen if routing is set up correctly, but good practice
      setError("Collection ID not found in URL.");
      setIsLoading(false);
      return;
    }

    const fetchCollection = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/collections/${collectionId}`);
        if (!response.ok) {
           const errorData = await response.json().catch(() => ({}));
           throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const data: CollectionWithNFTs = await response.json();
        setCollectionData(data);
      } catch (err: any) {
        console.error("Failed to fetch collection:", err);
        setError(err.message || "Failed to load collection data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollection();
  }, [collectionId]); // Re-fetch if collectionId changes (though unlikely in standard nav)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
        <Link href="/collections" className="inline-flex items-center text-text-light dark:text-text-dark hover:opacity-80 transition-opacity font-medium">
          <FiArrowLeft className="mr-2" />
          Back to Properties
        </Link>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <div className="container mx-auto px-4 py-8">
          {/* Skeleton Header Placeholder (Optional but good UX) */}
          <div className="mb-12 flex flex-col md:flex-row items-center gap-6 bg-primary-light dark:bg-primary-dark p-6 rounded-xl shadow-lg border border-black/10 dark:border-white/10 animate-pulse">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-300 dark:bg-zinc-700 flex-shrink-0"></div>
            <div className="text-center md:text-left flex-grow">
              <div className="h-8 bg-gray-300 dark:bg-zinc-700 rounded w-3/4 mb-3 mx-auto md:mx-0"></div>
              <div className="h-4 bg-gray-300 dark:bg-zinc-700 rounded w-1/2 mb-4 mx-auto md:mx-0"></div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center md:justify-start">
                <div className="h-4 bg-gray-300 dark:bg-zinc-700 rounded w-20"></div>
                <div className="h-4 bg-gray-300 dark:bg-zinc-700 rounded w-24"></div>
                <div className="h-4 bg-gray-300 dark:bg-zinc-700 rounded w-28"></div>
                <div className="h-4 bg-gray-300 dark:bg-zinc-700 rounded w-24"></div>
              </div>
            </div>
          </div>
          {/* Skeleton Grid Header */}
           <div className="h-7 bg-gray-300 dark:bg-zinc-700 rounded w-1/3 mb-6"></div>
           {/* Skeleton Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
             {Array.from({ length: 10 }).map((_, index) => (
               <NFTCardSimpleSkeleton key={index} />
             ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-20 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-300 dark:border-red-700"
        >
          <FiAlertCircle className="mx-auto h-12 w-12 text-red-500 dark:text-red-400 mb-4" />
          <h3 className="text-xl text-red-700 dark:text-red-300 mb-2">Failed to Load Property</h3>
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </motion.div>
      )}

      {/* Content State */}
      {collectionData && !isLoading && !error && (
        <>
          {/* Collection Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 flex flex-col md:flex-row items-center gap-6 bg-primary-light dark:bg-primary-dark p-6 rounded-xl shadow-lg border border-black/10 dark:border-white/10"
          >
            <img
              src={collectionData.image}
              alt={`${collectionData.name} banner`}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-black/20 dark:border-white/20 shadow-md flex-shrink-0"
            />
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-text-light dark:text-text-dark mb-2 flex items-center justify-center md:justify-start">
                {collectionData.name}
                {collectionData.verified && (
                   <span title="Verified Collection" className="ml-2 text-text-light dark:text-text-dark">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                   </span>
                )}
              </h1>
              <p className="text-text-light dark:text-text-dark opacity-70 mb-4">
                Created by <span className="font-medium text-text-light dark:text-text-dark opacity-90">{collectionData.creator}</span>
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center md:justify-start text-sm text-text-light dark:text-text-dark opacity-80">
                <span><strong className="font-semibold text-text-light dark:text-text-dark opacity-100">{collectionData.items.toLocaleString()}</strong> items</span>
                <span>Floor: <strong className="font-semibold text-text-light dark:text-text-dark opacity-100">{collectionData.floorPrice} ETH</strong></span>
                <span>Volume: <strong className="font-semibold text-text-light dark:text-text-dark opacity-100">{collectionData.volume.toLocaleString()} ETH</strong></span>
                <span className="capitalize">Category: <strong className="font-semibold text-text-light dark:text-text-dark opacity-100">{collectionData.category}</strong></span>
              </div>
               {/* Add Description/Social Links later if available */}
            </div>
          </motion.div>

          {/* NFT Grid Header */}
          <h2 className="text-2xl font-semibold text-text-light dark:text-text-dark mb-6">Tokens in Property</h2>

          {/* NFT Grid */}
          {collectionData.nfts && collectionData.nfts.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"
            >
              {collectionData.nfts.map((nft, index) => (
                <motion.div
                  key={nft.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.04 }}
                  whileHover={{ y: -5 }}
                 >
                  <NFTCardSimple nft={nft} collectionTotalItems={collectionData.items} index={index} />
                 </motion.div>
              ))}
            </motion.div>
          ) : (
             <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-10 text-text-light dark:text-text-dark opacity-60"
             >
                <p>No items found in this property (yet!).</p>
                {/* Maybe add a link to create NFTs for this collection later? */}
             </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default SingleCollectionPage; 