'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiExternalLink, FiInfo, FiMap, FiShoppingCart } from 'react-icons/fi';
import Link from 'next/link';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import NFTTokenGrid from '@/components/nft/NFTTokenGrid';
import NFTPropertyDetails from '@/components/nft/NFTPropertyDetails';
import NFTMetadataSection from '@/components/nft/NFTMetadataSection';
import { LAND_MARKETPLACE_ADDRESS, PLATZ_LAND_NFT_ADDRESS } from '@/config/contracts';
import { LandMarketplaceABI } from '@/contracts/LandMarketplaceABI';
import { PlatzLandNFTABI } from '@/contracts/PlatzLandNFTABI';
import { formatEther, decodeEventLog } from 'viem';
import { getLogsInChunks, safeDecodeEventLog } from '@/lib/ethereum/blockchainUtils';

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

// Define types for on-chain collection data
interface OnChainCollection {
  collectionId: bigint;
  mainTokenId: bigint;
  startTokenId: bigint;
  totalSupply: bigint;
  baseURI: string;
  collectionURI: string;
  creator: string;
  isListed: boolean;
  price?: bigint;
  seller?: string;
}

interface NFTCollectionDetailPageProps {
  collectionId: string;
}

const NFTCollectionDetailPage: React.FC<NFTCollectionDetailPageProps> = ({ collectionId }) => {
  const { address: connectedEvmAddress, isConnected: isEvmWalletConnected } = useAccount();
  const publicClient = usePublicClient();
  
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

  // Token metadata cache
  const [tokenMetadataCache, setTokenMetadataCache] = useState<Record<string, any>>({});

  // Fetch collection data on mount
  useEffect(() => {
    fetchCollectionData();
  }, [collectionId]);

  // Function to fetch metadata from IPFS or other storage
  const fetchMetadata = async (uri: string) => {
    try {
      // Handle different URI formats for backward compatibility
      const url = uri.startsWith('ipfs://') 
        ? uri.replace('ipfs://', 'https://gateway.ipfs.io/ipfs/') 
        : uri.startsWith('ar://')
          ? uri.replace('ar://', 'https://arweave.net/')
          : uri;
      
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error('Error fetching metadata:', error);
      return null;
    }
  };

  // Function to fetch collection data
  const fetchCollectionData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!publicClient) {
        throw new Error("Web3 client not available");
      }
      
      // Parse the collection ID
      const parsedCollectionId = BigInt(collectionId);
      
      // Get collection data from the NFT contract
      const collectionData = await publicClient.readContract({
        address: PLATZ_LAND_NFT_ADDRESS,
        abi: PlatzLandNFTABI,
        functionName: 'getCollection',
        args: [parsedCollectionId]
      });

      if (!collectionData) {
        throw new Error("Collection not found");
      }
      
      // Destructure collection data
      const [startTokenId, totalSupply, mainTokenId, baseURI, collectionURI, creator] = collectionData as [bigint, bigint, bigint, string, string, string];
      
      // Check if collection is listed in the marketplace
      const marketplaceData = await publicClient.readContract({
        address: LAND_MARKETPLACE_ADDRESS,
        abi: LandMarketplaceABI,
        functionName: 'getCollectionListing',
        args: [parsedCollectionId]
      }) as [string, bigint, string, boolean];
      
      const [seller, basePrice, currency, isActive] = marketplaceData;
      
      // Fetch collection metadata
      const metadata = await fetchMetadata(collectionURI);
      if (!metadata) {
        throw new Error("Failed to fetch collection metadata");
      }
      
      // Create token array for the collection
      const collectionTokens = [];
      
      // Add main token first
      collectionTokens.push({
        tokenId: mainTokenId.toString(),
        tokenURI: metadata.image || '',
        ownerAddress: isActive ? LAND_MARKETPLACE_ADDRESS : creator,
        isListed: isActive,
        listingPrice: isActive ? Number(formatEther(basePrice)) : 0,
      });
      
      // Add additional tokens
      for (let i = 1n; i < totalSupply; i++) {
        const tokenId = startTokenId + i;
        
        // Check if token is individually listed
        const isTokenListed = await publicClient.readContract({
          address: LAND_MARKETPLACE_ADDRESS,
          abi: LandMarketplaceABI,
          functionName: 'isCollectionTokenListed',
          args: [parsedCollectionId, tokenId]
        }) as boolean;
        
        // Check token owner
        let ownerAddress;
        try {
          ownerAddress = await publicClient.readContract({
            address: PLATZ_LAND_NFT_ADDRESS,
            abi: PlatzLandNFTABI,
            functionName: 'ownerOf',
            args: [tokenId]
          }) as string;
        } catch (error) {
          // If ownerOf reverts, the token might be owned by the marketplace contract
          ownerAddress = LAND_MARKETPLACE_ADDRESS;
        }
        
        // Build token URI from baseURI
        const tokenURISuffix = i.toString();
        const tokenURI = `${baseURI}${baseURI.endsWith('/') ? '' : '/'}${tokenURISuffix}`;
        
        collectionTokens.push({
          tokenId: tokenId.toString(),
          tokenURI: tokenURI,
          ownerAddress: ownerAddress,
          isListed: isTokenListed,
          listingPrice: isActive ? Number(formatEther(basePrice)) : 0, // Same price for all tokens in collection
        });
      }
      
      // Transform to our application's collection format
      const transformedCollection: NFTCollection = {
        id: parsedCollectionId.toString(),
        nftTitle: metadata.name || `Collection #${parsedCollectionId}`,
        nftDescription: metadata.description || 'No description provided',
        listingPrice: isActive ? Number(formatEther(basePrice)) : 0,
        priceCurrency: 'ETH',
        nftImageFileRef: metadata.image || '',
        nftCollectionSize: Number(totalSupply),
        country: metadata.properties?.country || '',
        state: metadata.properties?.state || '',
        localGovernmentArea: metadata.properties?.localGovernmentArea || '',
        propertyAreaSqm: metadata.properties?.propertyAreaSqm || 0,
        latitude: metadata.properties?.latitude || '',
        longitude: metadata.properties?.longitude || '',
        contractAddress: PLATZ_LAND_NFT_ADDRESS,
        collectionId: parsedCollectionId.toString(),
        mainTokenId: mainTokenId.toString(),
        metadataUri: collectionURI,
        evmOwnerAddress: creator,
        isListedForSale: isActive,
        listingPriceEth: isActive ? Number(formatEther(basePrice)) : 0,
        mintTransactionHash: '',
        mintTimestamp: '',
        createdAt: new Date().toISOString(),
        user: {
          id: '',
          username: '',
          evmAddress: creator,
        },
        evmCollectionTokens: collectionTokens,
      };
      
      setCollection(transformedCollection);
      
      // Prefetch token metadata for each token
      for (const token of collectionTokens) {
        if (token.tokenURI) {
          fetchMetadata(token.tokenURI).then(metadata => {
            if (metadata) {
              setTokenMetadataCache(prev => ({
                ...prev,
                [token.tokenId]: metadata
              }));
            }
          }).catch(console.error);
        }
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
        className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-6">
        <FiArrowLeft className="mr-2" /> Back to Explore
      </Link>
      {/* Collection Header */}
      <div className="bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden mb-8">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 h-64 md:h-auto bg-gray-200 dark:bg-zinc-800 flex-shrink-0">
            {collection.nftImageFileRef ? (
              <img
                src={collection.nftImageFileRef?.startsWith('http') 
                  ? collection.nftImageFileRef 
                  : collection.nftImageFileRef?.startsWith('ipfs://') 
                    ? collection.nftImageFileRef.replace('ipfs://', 'https://gateway.ipfs.io/ipfs/') 
                    : collection.nftImageFileRef?.startsWith('ar://')
                      ? collection.nftImageFileRef.replace('ar://', 'https://arweave.net/')
                      : `/api/images/${collection.nftImageFileRef}`}
                alt={collection.nftTitle || 'Collection Image'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-300 dark:bg-zinc-700 flex items-center justify-center">
                <span className="text-gray-500 dark:text-gray-400">No Image Available</span>
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
                {collection.isListedForSale ? `${collection.listingPriceEth} ETH` : 'Not for sale'}
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
                  {collection.user?.username || (collection.evmOwnerAddress?.substring(0, 6) + '...' + collection.evmOwnerAddress?.substring(38))}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-500">Contract</p>
                <a
                  href={`https://sepolia.etherscan.io/token/${collection.contractAddress}`} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                >
                  View <FiExternalLink className="ml-1" size={14} />
                </a>
              </div>
            </div>

              {collection.isListedForSale && (
                <button
                  onClick={() => handlePurchaseToken(collection.mainTokenId)}
                className="w-full md:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center"
                >
                <FiShoppingCart className="mr-2" /> Purchase Collection
                </button>
              )}
          </div>
        </div>
      </div>
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-zinc-800">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('tokens')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tokens'
                ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            NFT Tokens ({collection.nftCollectionSize})
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Property Details
          </button>
          <button
            onClick={() => setActiveTab('metadata')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'metadata'
                ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Metadata
          </button>
        </nav>
      </div>
      {/* Tab Content */}
      <div className="bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6">
        {activeTab === 'tokens' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Collection Tokens</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This collection contains {collection.nftCollectionSize} NFT tokens representing ownership shares in the property.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {collection.evmCollectionTokens.map((token, index) => (
                <div 
                  key={token.tokenId} 
                  className="bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  <div className="aspect-square bg-gray-100 dark:bg-zinc-800 relative">
                    {index === 0 ? (
                      <div className="absolute top-0 left-0 bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-br">
                        Main Token
                      </div>
                    ) : null}
                    {token.isListed && (
                      <div className="absolute top-0 right-0 bg-green-600 text-white text-xs font-medium px-2 py-1 rounded-bl">
                        For Sale
                      </div>
                    )}
                    <img
                      src={token.tokenURI?.startsWith('http') 
                        ? token.tokenURI 
                        : token.tokenURI?.startsWith('ipfs://') 
                          ? token.tokenURI.replace('ipfs://', 'https://gateway.ipfs.io/ipfs/') 
                          : token.tokenURI?.startsWith('ar://')
                            ? token.tokenURI.replace('ar://', 'https://arweave.net/')
                            : `/api/images/${token.tokenURI || 'placeholder'}`}
                      alt={`Token #${token.tokenId}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Set a placeholder for failed image loads
                        (e.target as HTMLImageElement).src = 'https://placehold.co/300x300/gray/white?text=No+Image';
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Token #{token.tokenId}
                      </p>
                      {token.listingPrice > 0 && (
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                          {token.listingPrice} ETH
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                      Owner: {token.ownerAddress?.substring(0, 6)}...{token.ownerAddress?.substring(38)}
                    </p>
                    {token.isListed && (
                      <button
                        onClick={() => handlePurchaseToken(token.tokenId)}
                        className="w-full mt-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded flex items-center justify-center"
                      >
                        <FiShoppingCart className="mr-1" size={12} /> Buy
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Property Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Location Information</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-500">Country</p>
                    <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {collection.country || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-500">State/Province</p>
                    <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {collection.state || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-500">Local Government Area</p>
                    <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {collection.localGovernmentArea || 'Not specified'}
                    </p>
                  </div>
                  {collection.latitude && collection.longitude && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-500">Coordinates</p>
                      <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                        {collection.latitude}, {collection.longitude}
                      </p>
                    </div>
        )}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Property Specifications</h3>
                <div className="space-y-4">
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
                    <p className="text-sm text-gray-500 dark:text-gray-500">Blockchain Information</p>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        <span className="font-medium">Collection ID:</span> {collection.collectionId}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        <span className="font-medium">Main Token ID:</span> {collection.mainTokenId}
                      </p>
                      <a
                        href={`https://sepolia.etherscan.io/token/${collection.contractAddress}?a=${collection.mainTokenId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                      >
                        View on Etherscan <FiExternalLink className="ml-1" size={12} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Map Placeholder */}
            <div className="mt-8 bg-gray-100 dark:bg-zinc-800 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <FiMap className="mx-auto text-gray-400 dark:text-gray-600 mb-2" size={48} />
                <p className="text-gray-600 dark:text-gray-400">Interactive map coming soon</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'metadata' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Collection Metadata</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              View the blockchain metadata for this NFT collection.
            </p>
            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {JSON.stringify({
                  id: collection.id,
                  nftTitle: collection.nftTitle,
                  nftDescription: collection.nftDescription,
                  contractAddress: collection.contractAddress,
                  collectionId: collection.collectionId,
                  mainTokenId: collection.mainTokenId,
                  metadataUri: collection.metadataUri,
                  tokenCount: collection.nftCollectionSize,
                  isListedForSale: collection.isListedForSale,
                  listingPriceEth: collection.listingPriceEth,
                  properties: {
                    country: collection.country,
                    state: collection.state,
                    localGovernmentArea: collection.localGovernmentArea,
                    propertyAreaSqm: collection.propertyAreaSqm,
                    latitude: collection.latitude,
                    longitude: collection.longitude,
                  }
                }, null, 2)}
              </pre>
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mt-8 mb-4">Token URIs</h3>
            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-lg p-4 overflow-x-auto">
              <div className="grid grid-cols-1 gap-4">
                {collection.evmCollectionTokens.map((token) => (
                  <div key={token.tokenId} className="border-b border-gray-200 dark:border-zinc-700 pb-4 last:border-0 last:pb-0">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Token #{token.tokenId}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
                      {token.tokenURI || 'No URI available'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Purchase Modal */}
      {showPurchaseModal && selectedTokenId && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Confirm Purchase</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You are about to purchase Token #{selectedTokenId} from Collection #{collection.id}.
              </p>
              <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Price:</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    {collection.listingPriceEth} ETH
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Gas fee (est.):</span>
                  <span className="text-gray-900 dark:text-gray-100">~0.001 ETH</span>
                </div>
            </div>
              <div className="flex space-x-3">
              <button
                onClick={() => setShowPurchaseModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 text-gray-800 dark:text-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmPurchase}
                disabled={isPurchasing}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center"
              >
                  {isPurchasing ? <LoadingSpinner size="sm" /> : 'Confirm Purchase'}
              </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTCollectionDetailPage;
