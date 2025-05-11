'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiExternalLink, FiInfo, FiMap, FiShoppingCart } from 'react-icons/fi';
import Link from 'next/link';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import NFTTokenGrid from '@/components/nft/NFTTokenGrid';
import NFTPropertyDetails from '@/components/nft/NFTPropertyDetails';
import NFTMetadataSection from '@/components/nft/NFTMetadataSection';

// Define types for NFT collection
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

interface NFTCollectionDetailPageProps {
  collectionId: string;
}

const NFTCollectionDetailPage: React.FC<NFTCollectionDetailPageProps> = ({ collectionId }) => {
  const { address: connectedEvmAddress, isConnected: isEvmWalletConnected } = useAccount();
  
  // State for collection data and loading
  const [collection, setCollection] = useState<NFTCollection | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for active tab
  const [activeTab, setActiveTab] = useState<'tokens' | 'details' | 'metadata'>('tokens');
  
  // State for purchase modal
  const [showPurchaseModal, setShowPurchaseModal] = useState<boolean>(false);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState<boolean>(false);

  // Fetch collection data on mount
  useEffect(() => {
    fetchCollectionData();
  }, [collectionId]);

  // Function to fetch collection data
  const fetchCollectionData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/nft/collections/${collectionId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch collection: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setCollection(data.data);
      } else {
        setError(data.message || 'Failed to fetch collection');
      }
    } catch (err: any) {
      console.error('Error fetching collection:', err);
      setError(err.message || 'An error occurred while fetching the collection');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle token purchase
  const handlePurchaseToken = (tokenId: string) => {
    if (!isEvmWalletConnected) {
      alert('Please connect your Ethereum wallet to purchase NFTs');
      return;
    }

    setSelectedTokenId(tokenId);
    setShowPurchaseModal(true);
  };

  // Function to confirm purchase
  const confirmPurchase = async () => {
    if (!collection || selectedTokenId === null) return;
    
    setIsPurchasing(true);
    
    try {
      // Implementation for purchasing NFT will go here
      // This would involve calling the smart contract's purchase function
      alert(`Purchase functionality will be implemented in a future update. Collection: ${collection.id}, Token: ${selectedTokenId}`);
      
      // Close modal after purchase
      setShowPurchaseModal(false);
      setSelectedTokenId(null);
    } catch (err: any) {
      console.error('Error purchasing token:', err);
      alert(`Error purchasing token: ${err.message}`);
    } finally {
      setIsPurchasing(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">Error</h2>
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={fetchCollectionData}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render 404 state
  if (!collection) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Collection Not Found</h2>
          <p className="text-yellow-700 dark:text-yellow-300">The NFT collection you're looking for doesn't exist or has been removed.</p>
          <Link
            href="/explore"
            className="mt-4 inline-block px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg"
          >
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Button */}
      <Link
        href="/explore"
        className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-6"
      >
        <FiArrowLeft className="mr-2" /> Back to Explore
      </Link>

      {/* Collection Header */}
      <div className="bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden mb-8">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 h-64 md:h-auto bg-gray-200 dark:bg-zinc-800 flex-shrink-0">
            {collection.nftImageFileRef ? (
              <img
                src={`/api/images/${collection.nftImageFileRef}`}
                alt={collection.nftTitle}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-300 dark:bg-zinc-700 flex items-center justify-center">
                <LoadingSpinner size="lg" />
              </div>
            )}
          </div>
          <div className="p-6 flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {collection.nftTitle || 'Untitled Collection'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {collection.nftDescription || 'No description provided'}
                </p>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {collection.listingPriceEth} ETH
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-500">Location</p>
                <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {collection.country && collection.state ? `${collection.country}, ${collection.state}` : 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-500">Area</p>
                <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {collection.propertyAreaSqm ? `${collection.propertyAreaSqm} sqm` : 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-500">Collection Size</p>
                <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {collection.nftCollectionSize} NFTs
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-500">Owner</p>
                <p className="text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                  {collection.user?.username || collection.evmOwnerAddress.substring(0, 6) + '...' + collection.evmOwnerAddress.substring(38)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-500">Minted On</p>
                <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {collection.mintTimestamp ? new Date(collection.mintTimestamp).toLocaleDateString() : 'Not available'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-500">Contract</p>
                <a
                  href={`https://sepolia.etherscan.io/address/${collection.contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 truncate flex items-center"
                >
                  {collection.contractAddress.substring(0, 6) + '...' + collection.contractAddress.substring(38)}
                  <FiExternalLink className="ml-1" size={14} />
                </a>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {collection.isListedForSale && (
                <button
                  onClick={() => handlePurchaseToken(collection.mainTokenId)}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center"
                >
                  <FiShoppingCart className="mr-2" /> Purchase Main Token
                </button>
              )}
              <a
                href={`https://sepolia.etherscan.io/token/${collection.contractAddress}?a=${collection.mainTokenId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium flex items-center"
              >
                <FiExternalLink className="mr-2" /> View on Etherscan
              </a>
              {collection.latitude && collection.longitude && (
                <a
                  href={`https://maps.google.com/?q=${collection.latitude},${collection.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/30 text-blue-800 dark:text-blue-300 rounded-lg font-medium flex items-center"
                >
                  <FiMap className="mr-2" /> View on Map
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-zinc-800">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('tokens')}
            className={`py-4 px-1 relative font-medium text-sm ${
              activeTab === 'tokens'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            NFT Tokens
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`py-4 px-1 relative font-medium text-sm ${
              activeTab === 'details'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Property Details
          </button>
          <button
            onClick={() => setActiveTab('metadata')}
            className={`py-4 px-1 relative font-medium text-sm ${
              activeTab === 'metadata'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Metadata
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden">
        {/* NFT Tokens Tab */}
        {activeTab === 'tokens' && (
          <NFTTokenGrid 
            tokens={collection.evmCollectionTokens} 
            contractAddress={collection.contractAddress}
            onPurchase={handlePurchaseToken}
            mainTokenId={collection.mainTokenId}
          />
        )}

        {/* Property Details Tab */}
        {activeTab === 'details' && (
          <NFTPropertyDetails collection={collection} />
        )}

        {/* Metadata Tab */}
        {activeTab === 'metadata' && (
          <NFTMetadataSection 
            contractAddress={collection.contractAddress}
            tokenId={collection.mainTokenId}
            metadataUri={collection.metadataUri}
            mintTransactionHash={collection.mintTransactionHash}
          />
        )}
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-md w-full mx-4 p-6"
          >
            <div className="flex items-center justify-center mb-4 text-yellow-500">
              <FiInfo size={24} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center mb-4">
              Confirm Purchase
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Are you sure you want to purchase Token #{selectedTokenId} for {collection.listingPriceEth} ETH?
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium"
                disabled={isPurchasing}
              >
                Cancel
              </button>
              <button
                onClick={confirmPurchase}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center"
                disabled={isPurchasing}
              >
                {isPurchasing ? <LoadingSpinner size={20} /> : 'Confirm Purchase'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default NFTCollectionDetailPage;
