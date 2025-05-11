'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { FiFilter, FiGrid, FiList, FiMap, FiSearch, FiX } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import AnimatedButton from '@/components/common/AnimatedButton';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import NFTImage from '@/components/nft/NFTImage';

// Define types for NFT collections
interface NFTCollection {
  id: string;
  nftTitle: string;
  nftDescription: string;
  listingPrice: number;
  priceCurrency: string;
  nftImageFileRef: string;
  nftCollectionSize: number;
  country: string;
  state: string;
  localGovernmentArea: string;
  propertyAreaSqm: number;
  latitude: string;
  longitude: string;
  contractAddress: string;
  collectionId: string;
  mainTokenId: string;
  metadataUri: string;
  evmOwnerAddress: string;
  isListedForSale: boolean;
  listingPriceEth: number;
  mintTransactionHash: string;
  mintTimestamp: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    evmAddress: string;
  };
  evmCollectionTokens: {
    tokenId: string;
    tokenURI: string;
    ownerAddress: string;
    isListed: boolean;
    listingPrice: number;
  }[];
}

// Define types for filter state
interface FilterState {
  status: string;
  minPrice: string;
  maxPrice: string;
  country: string;
  state: string;
  search: string;
}

const ExploreNFTPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { address: connectedEvmAddress, isConnected: isEvmWalletConnected } = useAccount();

  // State for collections and loading
  const [collections, setCollections] = useState<NFTCollection[]>([]);
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

  // Fetch collections on mount and when filters change
  useEffect(() => {
    fetchCollections();
  }, [page, filters]);

  // Function to fetch collections from the API
  const fetchCollections = async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', '12'); // 12 items per page

      // Add filters if they exist
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
      if (filters.country) queryParams.append('country', filters.country);
      if (filters.state) queryParams.append('state', filters.state);
      if (filters.search) queryParams.append('search', filters.search);

      // Fetch collections from the API
      const response = await fetch(`/api/nft/collections?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch collections: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setCollections(data.data.collections);
        setTotalPages(data.data.pagination.pages);
        setTotalCollections(data.data.pagination.total);
        
        // Extract unique countries and states for filters
        if (data.data.collections.length > 0) {
          const uniqueCountries = [
            ...new Set<string>(data.data.collections.map((c: NFTCollection) => c.country).filter((value: string | undefined): value is string => !!value))
          ];
          const uniqueStates = [
            ...new Set<string>(data.data.collections.map((c: NFTCollection) => c.state).filter((value: string | undefined): value is string => !!value))
          ];
          
          setCountries(uniqueCountries);
          setStates(uniqueStates);
        }
      } else {
        setError(data.message || 'Failed to fetch collections');
      }
    } catch (err: any) {
      console.error('Error fetching collections:', err);
      setError(err.message || 'An error occurred while fetching collections');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); // Reset to first page when filters change
  };

  // Function to clear filters
  const clearFilters = () => {
    setFilters({
      status: '',
      minPrice: '',
      maxPrice: '',
      country: '',
      state: '',
      search: '',
    });
    setPage(1);
  };

  // Function to handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  // Function to purchase an NFT
  const handlePurchase = async (collectionId: string, tokenId: string) => {
    if (!isEvmWalletConnected) {
      alert('Please connect your Ethereum wallet to purchase NFTs');
      return;
    }

    // Implementation for purchasing NFT will go here
    // This would involve calling the smart contract's purchase function
    alert(`Purchase functionality will be implemented in a future update. Collection: ${collectionId}, Token: ${tokenId}`);
  };

  // Render loading state
  if (loading && collections.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  // Render error state
  if (error && collections.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">Error</h2>
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={fetchCollections}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-text-light dark:text-text-dark mb-3">Explore Land NFT Collections</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
          Browse and purchase tokenized land properties on the Ethereum Sepolia testnet. Each collection contains 1 main NFT and 99 fractional ownership tokens.
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-8 bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search by title or description..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            </div>
          </form>

          {/* View Mode Toggles */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
              aria-label="Grid view"
            >
              <FiGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
              aria-label="List view"
            >
              <FiList size={20} />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg ${viewMode === 'map' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
              aria-label="Map view"
            >
              <FiMap size={20} />
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg ${showFilters ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
              aria-label="Toggle filters"
            >
              <FiFilter size={20} />
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  id="status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="SOLD">Sold</option>
                </select>
              </div>
              <div>
                <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Price (ETH)</label>
                <input
                  type="number"
                  id="minPrice"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Price (ETH)</label>
                <input
                  type="number"
                  id="maxPrice"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                <select
                  id="country"
                  name="country"
                  value={filters.country}
                  onChange={handleFilterChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Countries</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State/Province</label>
                <select
                  id="state"
                  name="state"
                  value={filters.state}
                  onChange={handleFilterChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All States</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center"
              >
                <FiX className="mr-1" /> Clear Filters
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-6 flex justify-between items-center">
        <p className="text-gray-600 dark:text-gray-400">
          Showing {collections.length} of {totalCollections} collections
        </p>
      </div>

      {/* Collections Grid */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden"
            >
              <div className="relative h-48 bg-gray-200 dark:bg-zinc-800">
                <NFTImage
                  imageRef={collection.nftImageFileRef}
                  alt={collection.nftTitle || 'NFT Image'}
                  priority={index < 6} // Prioritize loading first 6 images
                />
                <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {collection.nftCollectionSize} NFTs
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
                  {collection.nftTitle || 'Untitled Collection'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                  {collection.nftDescription || 'No description provided'}
                </p>
                <div className="flex justify-between items-center mb-3">
                  <div className="text-sm text-gray-500 dark:text-gray-500">
                    {collection.country && collection.state ? `${collection.country}, ${collection.state}` : 'Location not specified'}
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {collection.listingPriceEth} ETH
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link
                    href={`/explore/${collection.id}`}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-center rounded-lg text-sm font-medium"
                  >
                    View Details
                  </Link>
                  {collection.isListedForSale && (
                    <button
                      onClick={() => handlePurchase(collection.id, collection.mainTokenId)}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-center rounded-lg text-sm font-medium"
                    >
                      Purchase
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Collections List */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden"
            >
              <div className="flex flex-col md:flex-row">
                <div className="md:w-48 h-48 bg-gray-200 dark:bg-zinc-800 flex-shrink-0">
                  <NFTImage
                    imageRef={collection.nftImageFileRef}
                    alt={collection.nftTitle || 'NFT Image'}
                    priority={index < 3} // Prioritize loading first 3 list images
                  />
                </div>
                <div className="p-4 flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {collection.nftTitle || 'Untitled Collection'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {collection.nftDescription || 'No description provided'}
                      </p>
                    </div>
                    <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {collection.listingPriceEth} ETH
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500">Location</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {collection.country && collection.state ? `${collection.country}, ${collection.state}` : 'Location not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500">Area</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {collection.propertyAreaSqm ? `${collection.propertyAreaSqm} sqm` : 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500">Collection Size</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {collection.nftCollectionSize} NFTs
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      href={`/explore/${collection.id}`}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-center rounded-lg text-sm font-medium"
                    >
                      View Details
                    </Link>
                    {collection.isListedForSale && (
                      <button
                        onClick={() => handlePurchase(collection.id, collection.mainTokenId)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-center rounded-lg text-sm font-medium"
                      >
                        Purchase
                      </button>
                    )}
                    <a
                      href={`https://sepolia.etherscan.io/token/${collection.contractAddress}?a=${collection.mainTokenId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 text-gray-800 dark:text-gray-200 text-center rounded-lg text-sm font-medium"
                    >
                      View on Etherscan
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Map View */}
      {viewMode === 'map' && (
        <div className="bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden h-[600px] flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">
            Map view will be implemented in a future update.
          </p>
        </div>
      )}

      {/* Empty State */}
      {collections.length === 0 && !loading && (
        <div className="bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Collections Found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            There are no NFT collections matching your criteria.
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className={`px-3 py-1 rounded-md ${
                page === 1
                  ? 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-zinc-600'
              }`}
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`px-3 py-1 rounded-md ${
                  page === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-zinc-600'
                }`}
              >
                {pageNum}
              </button>
            ))}
            
            <button
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className={`px-3 py-1 rounded-md ${
                page === totalPages
                  ? 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-zinc-600'
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default ExploreNFTPage;
