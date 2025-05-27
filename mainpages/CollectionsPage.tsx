"use client";
import { categories, sortOptions } from "@/lib/data";
import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiChevronDown,
  FiFilter,
  FiGrid,
  FiList,
  FiSearch,
  FiAlertCircle,
  FiX
} from "react-icons/fi";
import CollectionCard from "@/components/CollectionCard";
import CollectionListCard from "@/components/CollectionListCard";
import PulsingDotsSpinner from "@/components/common/PulsingDotsSpinner";
import CollectionCardSkeleton from '@/components/skeletons/CollectionCardSkeleton';
import CollectionListCardSkeleton from '@/components/skeletons/CollectionListCardSkeleton';
import { CollectionDetail } from '@/lib/types';

export interface LandListingForCollection {
  id: string;
  nftTitle: string | null; 
  nftDescription: string | null;
  listingPrice: number | string | null; 
  priceCurrency: string | null;
  nftImageFileRef: string | null;
  nftCollectionSize: number | null;
  user: {
    id: string;
    username: string | null;
    solanaPubKey: string | null;
  } | null;
  createdAt: string; 
  // Add other fields if they were included in GET /api/collections select
}

// Helper function to convert LandListingForCollection to CollectionDetail
const convertToCollectionDetail = (listing: LandListingForCollection): CollectionDetail => {
  const getPriceAsNumber = (price: string | number | null | undefined): number => {
    if (price === null || price === undefined) return 0;
    if (typeof price === 'string') return parseFloat(price) || 0;
    return price;
  };

  return {
    collectionId: BigInt(listing.id), // Convert string ID to bigint
    startTokenId: BigInt(0), // Default value since not available in LandListingForCollection
    totalSupply: BigInt(listing.nftCollectionSize || 0),
    mainTokenId: BigInt(0), // Default value since not available in LandListingForCollection
    baseURI: '', // Default value since not available in LandListingForCollection
    collectionURI: listing.nftImageFileRef || '', // Use image as collection URI
    creator: listing.user?.solanaPubKey || 'Unknown', // Use user's Solana public key as creator
    isListed: listing.listingPrice !== null && listing.listingPrice !== undefined && getPriceAsNumber(listing.listingPrice) > 0,
    price: listing.listingPrice ? BigInt(Math.floor(getPriceAsNumber(listing.listingPrice) * 1e18)) : undefined, // Convert to wei if price exists
    seller: listing.user?.solanaPubKey || undefined,
    name: listing.nftTitle || 'Untitled Collection',
    image: listing.nftImageFileRef || '',
    description: listing.nftDescription || 'No description available'
  };
};

const CollectionsPage = () => {
  const [allCollections, setAllCollections] = useState<LandListingForCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>("volume"); 

  useEffect(() => {
    const fetchCollections = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/collections');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: LandListingForCollection[] = await response.json();
        setAllCollections(data);
      } catch (err: any) {
        console.error("Failed to fetch collections:", err);
        setError(err.message || "Failed to load collections. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollections();
  }, []);

  const filteredCollections = allCollections
    .filter((collection) =>
      collection.nftTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ?? true
    )
    .sort((a, b) => {
      const getPriceAsNumber = (price: string | number | null | undefined): number => {
        if (price === null || price === undefined) return 0;
        if (typeof price === 'string') return parseFloat(price) || 0;
        return price;
      };

      switch (sortBy) {
        case "volume": 
          return (b.nftCollectionSize ?? 0) - (a.nftCollectionSize ?? 0);
        case "floor": 
          return getPriceAsNumber(b.listingPrice) - getPriceAsNumber(a.listingPrice);
        case "items": 
          return (b.nftCollectionSize ?? 0) - (a.nftCollectionSize ?? 0);
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

  return (
    <div className="pt-8 md:pt-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-light dark:text-text-dark mb-2">
              Land Collections
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Discover tokenized land properties available for investment
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <span className="bg-gray-100 dark:bg-zinc-800 px-2 sm:px-3 py-1 rounded-full">
              {allCollections.length} Properties
            </span>
            <span className="bg-gray-100 dark:bg-zinc-800 px-2 sm:px-3 py-1 rounded-full">
              {filteredCollections.length} Showing
            </span>
          </div>
        </div>

        <div className="mb-6 sm:mb-8">
          <div className="relative mb-4 sm:mb-6">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search by name, location, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-3 bg-gray-50 dark:bg-zinc-800 text-text-light dark:text-text-dark placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 border border-gray-200 dark:border-zinc-700 transition-colors text-sm sm:text-base"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 border rounded-lg text-xs sm:text-sm transition-colors duration-150 ${ 
                  showFilters 
                    ? 'bg-gray-100 dark:bg-zinc-700 border-gray-300 dark:border-zinc-600 text-text-light dark:text-text-dark' 
                    : 'bg-transparent border-gray-300 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600'
                }`}
              >
                <FiFilter className="w-4 h-4"/>
                <span>Filters</span>
              </button>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-gray-50 dark:bg-zinc-800 text-text-light dark:text-text-dark px-3 sm:px-4 py-2 sm:py-2.5 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 border border-gray-200 dark:border-zinc-700 transition-colors text-xs sm:text-sm"
                >
                  {sortOptions.map((option) => (
                    <option key={option.id} value={option.id} className="bg-primary-light dark:bg-primary-dark text-text-light dark:text-text-dark">
                      Sort: {option.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <FiChevronDown className="text-gray-400 dark:text-gray-500 w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="hidden sm:flex gap-1 bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg border border-gray-200 dark:border-zinc-700">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-white text-blue-600 dark:bg-zinc-700 dark:text-blue-400 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
                aria-label="Grid view"
              >
                <FiGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-white text-blue-600 dark:bg-zinc-700 dark:text-blue-400 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
                aria-label="List view"
              >
                <FiList className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 mb-6 bg-gray-50 dark:bg-zinc-800 rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-700"
            >
              <div className="p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-text-light dark:text-text-dark">
                    Filter by Category (Temporarily Disabled)
                </h3>
                   <button 
                      onClick={() => setShowFilters(false)} 
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      aria-label="Close filters"
                    >
                      <FiX className="w-5 h-5" />
                   </button>
                 </div>
                 <p className="text-sm text-gray-500 dark:text-gray-400">Category filtering will be re-enabled once categories are added to Land Listings.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {isLoading ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, index) => (
              <CollectionCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <CollectionListCardSkeleton key={index} />
            ))}
        </div>
        )
      ) : error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-20 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-300 dark:border-red-700"
        >
          <FiAlertCircle className="mx-auto h-12 w-12 text-red-500 dark:text-red-400 mb-4" />
          <h3 className="text-xl text-red-700 dark:text-red-300 mb-2">Failed to Load Properties</h3>
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </motion.div>
      ) : filteredCollections.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-20"
        >
          <h3 className="text-xl font-medium text-text-light dark:text-text-dark mb-2">
            No properties found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm 
              ? "Try adjusting your search"
              : "No properties available. Try creating one!"}
          </p>
        </motion.div>
      ) : viewMode === "grid" ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {filteredCollections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              whileHover={{ y: -5 }}
            >
              <CollectionCard collection={convertToCollectionDetail(collection)} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-3"
        >
          {filteredCollections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <CollectionListCard collection={collection} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default CollectionsPage;
