'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiExternalLink, FiInfo, FiMap, FiShoppingCart, FiTrendingUp, FiTrendingDown, FiTool } from 'react-icons/fi';
import Link from 'next/link';
import PulsingDotsSpinner from '@/components/common/PulsingDotsSpinner';
import NFTTokenGrid from '@/components/nft/NFTTokenGrid';
import NFTPropertyDetails from '@/components/nft/NFTPropertyDetails';
import NFTMetadataSection from '@/components/nft/NFTMetadataSection';
import { NFTImage } from '@/components/ui/image';
import { NFTTokenCardSkeleton, CollectionDetailSkeleton } from '@/components/skeletons';
import BidModal from '@/components/nft/BidModal';
import BatchPurchaseModal from '@/components/nft/BatchPurchaseModal';
import LowBalanceWarning from '@/components/common/LowBalanceWarning';
import { useImagePreloading } from '@/hooks/useImagePreloading';
import { useIsClient } from '@/hooks/useIsClient';
import { LAND_MARKETPLACE_ADDRESS, PLATZ_LAND_NFT_ADDRESS } from '@/config/contracts';
import { LandMarketplaceABI } from '@/contracts/LandMarketplaceABI';
import { PlatzLandNFTABI } from '@/contracts/PlatzLandNFTABI';
import { formatEther, decodeEventLog, parseEther } from 'viem';
import { getLogsInChunks, safeDecodeEventLog } from '@/lib/ethereum/blockchainUtils';
import ActivityFeed from '@/components/activity/ActivityFeed';
import { useCurrency } from '@/context/CurrencyContext';

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

// Define types for price statistics
interface PriceStatistics {
  floorPrice: number;
  averagePrice: number;
  volume24h: number;
  priceChange24h: number;
  sales24h: number;
  topOffer: number;
}

interface NFTCollectionDetailPageProps {
  collectionId: string;
}

const NFTCollectionDetailPage: React.FC<NFTCollectionDetailPageProps> = ({ collectionId }) => {
  const { address: connectedEvmAddress, isConnected: isEvmWalletConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const isClient = useIsClient();
  const { formatPriceWithConversion } = useCurrency();
  
  // State for collection data and loading
  const [collection, setCollection] = useState<NFTCollection | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for price statistics
  const [priceStats, setPriceStats] = useState<PriceStatistics | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  
  // State for user ownership
  const [ownedTokenIds, setOwnedTokenIds] = useState<Set<string>>(new Set());
  
  // State for active tab
  const [activeTab, setActiveTab] = useState<'tokens' | 'details' | 'metadata' | 'activity'>('tokens');
  
  // State for purchase modal
  const [showPurchaseModal, setShowPurchaseModal] = useState<boolean>(false);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState<boolean>(false);
  const [purchaseType, setPurchaseType] = useState<'collection' | 'token'>('token');

  // State for bidding modal
  const [showBidModal, setShowBidModal] = useState<boolean>(false);
  const [selectedBidTokenId, setSelectedBidTokenId] = useState<string | null>(null);
  const [selectedBidTokenName, setSelectedBidTokenName] = useState<string>('');
  const [currentHighestBid, setCurrentHighestBid] = useState<number>(0);

  // State for batch purchase modal
  const [showBatchPurchaseModal, setShowBatchPurchaseModal] = useState<boolean>(false);

  // Token metadata cache
  const [tokenMetadataCache, setTokenMetadataCache] = useState<Record<string, any>>({});

  // Image preloading hook
  const { preload, preloadSingle } = useImagePreloading();

  // Fetch collection data on mount
  useEffect(() => {
    fetchCollectionData();
    fetchPriceStatistics();
  }, [collectionId]);

  // Check ownership when collection loads or wallet connection changes
  useEffect(() => {
    if (collection) {
      checkUserOwnership();
    }
  }, [collection, isEvmWalletConnected, connectedEvmAddress]);

  // Set up periodic refresh for price statistics to ensure real-time updates
  useEffect(() => {
    if (!collection) return;

    // Refresh stats every 30 seconds for real-time updates
    const statsInterval = setInterval(fetchPriceStatistics, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(statsInterval);
  }, [collection]);

  // Function to fetch metadata from IPFS or other storage
  const fetchMetadata = async (uri: string, isOptional: boolean = false) => {
    try {
      // Handle different URI formats for backward compatibility
      let url = uri.startsWith('ipfs://') 
        ? uri.replace('ipfs://', 'https://gateway.ipfs.io/ipfs/') 
        : uri.startsWith('ar://')
          ? uri.replace('ar://', 'https://arweave.net/')
          : uri;
      
      // Handle ngrok URL rewriting for local development - convert to API route
      if (url.includes('ngrok-free.app')) {
        try {
          const oldUrl = new URL(url);
          // Extract the path after /uploads/ or /api/static/
          const pathMatch = oldUrl.pathname.match(/\/(?:uploads|api\/static)\/(.+)/);
          if (pathMatch) {
            // Use our API static route instead
            if (typeof window !== 'undefined') {
              url = `${window.location.protocol}//${window.location.host}/api/static/${pathMatch[1]}`;
              console.log(`[NFTCollectionDetailPage] Rewrote ngrok URL from ${uri} to ${url}`);
            } else {
              // Server-side or when window is not available
              url = `http://localhost:3000/api/static/${pathMatch[1]}`;
              console.log(`[NFTCollectionDetailPage] Rewrote ngrok URL (server-side) from ${uri} to ${url}`);
            }
          }
        } catch (e: any) {
          console.error(`[NFTCollectionDetailPage] Error rewriting ngrok URL ${url}:`, e.message);
          // Keep original URL if rewrite fails
        }
      }
      
      // If it's a localhost URL with /uploads/, convert to API route
      if (url.includes('localhost') && url.includes('/uploads/')) {
        url = url.replace('/uploads/', '/api/static/');
      }
      
      // Try the main URL first
      let response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (isOptional) {
          return null;
        }
        const responseText = await response.text();
        console.error(`[NFTCollectionDetailPage] Failed to fetch metadata from ${url}: ${response.status} ${response.statusText} - ${responseText}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${responseText}`);
      }
      
      const jsonData = await response.json();
      return jsonData;
    } catch (error) {
      if (isOptional) {
        return null;
      }
      console.error('Error fetching metadata:', error);
      return null;
    }
  };

  // Function to fetch price statistics
  const fetchPriceStatistics = async () => {
    setStatsLoading(true);
    try {
      const response = await fetch(`/api/collections/${collectionId}/stats`);
      if (response.ok) {
        const data = await response.json();
        setPriceStats(data.stats);
        
        // Also refresh ownership when stats are updated (in case purchases happened)
        if (collection) {
          checkUserOwnership();
        }
      }
    } catch (error) {
      console.error('Error fetching price statistics:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Function to check user ownership for tokens in this collection
  const checkUserOwnership = async () => {
    if (!isEvmWalletConnected || !connectedEvmAddress || !collection) {
      setOwnedTokenIds(new Set());
      return;
    }

    try {
      console.log(`[NFTCollectionDetailPage] Checking ownership using blockchain data for collection ${collection.collectionId}`);
      
      // Use the blockchain data that's already loaded in the collection
      // This is more accurate than the database since tokens are read directly from smart contract
      const ownedTokenIds = new Set<string>();
      
      collection.evmCollectionTokens.forEach(token => {
        if (token.ownerAddress && 
            token.ownerAddress.toLowerCase() === connectedEvmAddress.toLowerCase()) {
          ownedTokenIds.add(token.tokenId);
        }
      });
      
      setOwnedTokenIds(ownedTokenIds);
      console.log(`[NFTCollectionDetailPage] User owns ${ownedTokenIds.size} tokens in collection ${collection.collectionId}:`, Array.from(ownedTokenIds));
      
      if (ownedTokenIds.size > 0) {
        const ownershipPercentage = (ownedTokenIds.size / collection.evmCollectionTokens.length) * 100;
        console.log(`[NFTCollectionDetailPage] Ownership percentage: ${ownershipPercentage.toFixed(1)}%`);
      }
      
    } catch (error) {
      console.error('Error checking token ownership:', error);
      setOwnedTokenIds(new Set());
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
      console.log(`[NFTCollectionDetailPage] Attempting to fetch marketplace listing for collectionId: ${parsedCollectionId}, Marketplace Address: ${LAND_MARKETPLACE_ADDRESS}`);
      let seller: string | undefined;
      let basePrice: bigint | undefined;
      let currency: string | undefined;
      let isActive: boolean = false; // Default to false, will be updated if listing is found and active

      try {
        const marketplaceCallArgs = {
          address: LAND_MARKETPLACE_ADDRESS,
          abi: LandMarketplaceABI,
          functionName: 'getCollectionListing' as const, // Ensure literal type
          args: [parsedCollectionId]
        } as const; // Ensure entire object is treated as const for stricter typing
        console.log('[NFTCollectionDetailPage] Calling getCollectionListing with args:', marketplaceCallArgs.args);

        // viem's readContract is strongly typed based on ABI. If the call reverts, it throws.
        // A successful call to getCollectionListing returns [string, bigint, string, boolean]
        const rawMarketplaceData = await publicClient.readContract(marketplaceCallArgs);
        
        console.log(`[NFTCollectionDetailPage] Successfully fetched rawMarketplaceData for collectionId ${parsedCollectionId}:`, rawMarketplaceData);
        
        if (rawMarketplaceData && Array.isArray(rawMarketplaceData) && rawMarketplaceData.length === 5) {
          // Destructure the 5 values: seller, mainTokenId, price, paymentToken, isActive
          let sellerAddress: `0x${string}` | undefined;
          let mainTokenId: bigint | undefined;
          let paymentTokenAddress: `0x${string}` | undefined;
          
          // Type assertion for the destructured array elements
          const [s, mId, p, pt, iA] = rawMarketplaceData as [`0x${string}`, bigint, bigint, `0x${string}`, boolean];
          sellerAddress = s;
          mainTokenId = mId;
          basePrice = p; // Assuming basePrice is already declared with type bigint | undefined
          paymentTokenAddress = pt;
          isActive = iA; // Assuming isActive is already declared with type boolean

          console.log(`[NFTCollectionDetailPage] Destructured marketplace data: seller=${sellerAddress}, mainTokenId=${mainTokenId?.toString()}, basePrice=${basePrice?.toString()}, paymentToken=${paymentTokenAddress}, isActive=${isActive}`);
        } else {
          console.warn(`[NFTCollectionDetailPage] marketplaceData is null, undefined, or not in expected format for collectionId ${parsedCollectionId}. Assuming not actively listed.`);
          // isActive remains false, other values undefined
        }
      } catch (error: any) {
        console.error(`[NFTCollectionDetailPage] Error calling getCollectionListing for collectionId ${parsedCollectionId}. LAND_MARKETPLACE_ADDRESS: ${LAND_MARKETPLACE_ADDRESS}.`);
          const replacer = (key: string, value: any) =>
            typeof value === 'bigint'
              ? value.toString() + 'n' // Convert BigInt to string and append 'n' for clarity
              : value;
          console.error("[NFTCollectionDetailPage] Full Error Object (BigInts as strings):", JSON.stringify(error, replacer, 2));
          if (error.shortMessage) {
            console.error("[NFTCollectionDetailPage] Revert Short Message:", error.shortMessage);
          }
          if (error.message) {
            console.error("[NFTCollectionDetailPage] Revert Message:", error.message);
          }
          if (error.reason) {
            console.error("[NFTCollectionDetailPage] Revert Reason:", error.reason); // Common field for revert reasons
          }
        setLoading(false); // Corrected typo
        setError(`Failed to get marketplace details for collection ${collectionId}. The collection might not be listed, or an on-chain error occurred.`);
        // Re-throw the original error to see it in the browser console for full diagnosis
        throw error; 
      }
      
      // Fetch collection metadata
      const metadata = await fetchMetadata(collectionURI);
      if (!metadata) {
        throw new Error("Failed to fetch collection metadata");
      }
      
      // Create token array for the collection
      const collectionTokens = [];
      
      // Add main token first
      let mainTokenURI: string;
      
      // Main tokens should use their own metadata files, not the child tokens API endpoint
      if (baseURI.includes('/child-tokens/')) {
        // This baseURI is for child tokens, but main token needs its own metadata
        const collectionIdMatch = baseURI.match(/collections\/([^\/]+)/);
        if (collectionIdMatch) {
          const collectionId = collectionIdMatch[1];
          // For legacy collections, construct the main token metadata URL using the known pattern
          // The actual pattern is: {uuid}-main-token-metadata-{collectionId}.json
          // For this specific collection, we know the exact filename
          if (collectionId === 'cmb2xvddo0000czr3i311rrid') {
            if (typeof window !== 'undefined') {
              mainTokenURI = `${window.location.protocol}//${window.location.host}/api/static/collections/${collectionId}/e44123f6-a515-46c6-95fa-78c665e33007-main-token-metadata-${collectionId}.json`;
            } else {
              mainTokenURI = `http://localhost:3000/api/static/collections/${collectionId}/e44123f6-a515-46c6-95fa-78c665e33007-main-token-metadata-${collectionId}.json`;
            }
          } else {
            // For other legacy collections, we'll need to implement a lookup mechanism
            // For now, skip main token metadata for unknown legacy collections
            mainTokenURI = '';
            console.warn(`[NFTCollectionDetailPage] Unknown legacy collection ID: ${collectionId}, skipping main token metadata`);
          }
          console.log(`[NFTCollectionDetailPage] Constructed main token URI for legacy collection: ${mainTokenURI}`);
        } else {
          // If we can't extract collection ID, skip main token metadata
          mainTokenURI = '';
          console.warn(`[NFTCollectionDetailPage] Could not extract collection ID from baseURI: ${baseURI}`);
        }
      } else {
        // Standard token URI construction for newer collections
        if (baseURI.includes('{id}')) {
          mainTokenURI = `${baseURI.replace("{id}", mainTokenId.toString())}.json`;
        } else {
          const cleanBaseURI = baseURI.endsWith('/') ? baseURI : `${baseURI}/`;
          mainTokenURI = `${cleanBaseURI}${mainTokenId.toString()}.json`;
        }
      }
      
      collectionTokens.push({
        tokenId: mainTokenId.toString(),
        tokenURI: mainTokenURI,
        ownerAddress: isActive ? LAND_MARKETPLACE_ADDRESS : creator, // If listed, marketplace is temp owner
        isListed: isActive,
        listingPrice: isActive && typeof basePrice !== 'undefined' ? Number(formatEther(basePrice)) : 0, // Use basePrice for collection listing
      });
      
      // Add additional tokens
      for (let i = 1n; i < totalSupply; i++) {
        const tokenId = startTokenId + i;
        
        // Check if token is individually listed using getListing
        // getListing returns a struct: [seller (address), price (uint256), paymentToken (address), isActive (bool)]
        const listingData = await publicClient.readContract({
          address: LAND_MARKETPLACE_ADDRESS,
          abi: LandMarketplaceABI,
          functionName: 'getListing',
          args: [PLATZ_LAND_NFT_ADDRESS, tokenId] // Use the NFT contract address and token ID
        });

        // getListing returns an object: { seller, price, paymentToken, isActive }
        const isTokenListed = listingData ? listingData.isActive : false;
        
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
        let tokenURI: string;
        
        // Check if baseURI contains {id} placeholder
        if (baseURI.includes('{id}')) {
          tokenURI = `${baseURI.replace("{id}", tokenId.toString())}.json`;
        } else {
          // If no {id} placeholder, assume baseURI is a directory path and append tokenId
          const cleanBaseURI = baseURI.endsWith('/') ? baseURI : `${baseURI}/`;
          tokenURI = `${cleanBaseURI}${tokenId.toString()}.json`;
        }
        
        // Rewrite ngrok URLs to use local API routes
        if (tokenURI.includes('ngrok-free.app')) {
          try {
            const oldUrl = new URL(tokenURI);
            // Extract the path after /uploads/ or /api/static/
            const pathMatch = oldUrl.pathname.match(/\/(?:uploads|api\/static)\/(.+)/);
            if (pathMatch) {
              // Use our API static route instead
              if (typeof window !== 'undefined') {
                tokenURI = `${window.location.protocol}//${window.location.host}/api/static/${pathMatch[1]}`;
                console.log(`[NFTCollectionDetailPage] Rewrote child token ngrok URL from ${oldUrl.href} to ${tokenURI}`);
              } else {
                // Server-side or when window is not available
                tokenURI = `http://localhost:3000/api/static/${pathMatch[1]}`;
                console.log(`[NFTCollectionDetailPage] Rewrote child token ngrok URL (server-side) from ${oldUrl.href} to ${tokenURI}`);
              }
            }
          } catch (e: any) {
            console.error(`[NFTCollectionDetailPage] Error rewriting child token ngrok URL ${tokenURI}:`, e.message);
            // Keep original URL if rewrite fails
          }
        }
        
        collectionTokens.push({
          tokenId: tokenId.toString(),
          tokenURI: tokenURI,
          ownerAddress: ownerAddress,
          isListed: isTokenListed,
          listingPrice: isActive && typeof basePrice !== 'undefined' ? Number(formatEther(basePrice)) : 0, // Use basePrice for collection listing
        });
      }
      
      // Transform to our application's collection format
      const transformedCollection: NFTCollection = {
        id: parsedCollectionId.toString(),
        nftTitle: metadata.name || `Collection #${parsedCollectionId}`,
        nftDescription: metadata.description || 'No description provided',
        listingPrice: isActive && typeof basePrice !== 'undefined' ? Number(formatEther(basePrice)) : 0,
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
        listingPriceEth: isActive && typeof basePrice !== 'undefined' ? parseFloat(formatEther(basePrice)) : 0,
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
      
      // Prefetch token metadata for each token and preload images
      const imageUrls: string[] = [];
      
      for (const token of collectionTokens) {
        if (token.tokenURI) {
          const isMainToken = token.tokenId === mainTokenId.toString();
          const isLegacyCollection = baseURI.includes('/child-tokens/');
          
          // For collections with /child-tokens/ in baseURI, child tokens are dynamically generated
          // We should still try to fetch them, but make them optional
          const isOptionalToken = isLegacyCollection && !isMainToken;
          
          // For legacy collections, main token metadata might not be accessible with the guessed pattern
          // Child tokens in legacy collections are dynamically generated, so they should be optional too
          const isOptional = (isMainToken && isLegacyCollection) || isOptionalToken;
          
          fetchMetadata(token.tokenURI, isOptional).then(metadata => {
            if (metadata) {
              setTokenMetadataCache(prev => ({
                ...prev,
                [token.tokenId]: metadata
              }));
              
              // Add image URL to preload list
              if (metadata.image) {
                imageUrls.push(metadata.image);
              }
            }
          }).catch(error => {
            if (isOptional) {
              console.warn(`[NFTCollectionDetailPage] Failed to fetch optional metadata for token ${token.tokenId}:`, error);
            } else {
              console.error(`[NFTCollectionDetailPage] Failed to fetch required metadata for token ${token.tokenId}:`, error);
            }
          });
        }
      }
      
      // Preload collection image with high priority
      if (transformedCollection.nftImageFileRef) {
        preloadSingle(transformedCollection.nftImageFileRef, { priority: 'high' }).catch(error => {
          console.warn('[NFTCollectionDetailPage] Failed to preload collection image:', error);
        });
      }
      
      // Preload token images with medium priority after a short delay
      setTimeout(() => {
        if (imageUrls.length > 0) {
          preload(imageUrls, { priority: 'medium', maxConcurrent: 2 }).catch(error => {
            console.warn('[NFTCollectionDetailPage] Failed to preload token images:', error);
          });
        }
      }, 1000);
      
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
    setPurchaseType('token');
    setShowPurchaseModal(true);
  };

  // Function to handle collection purchase
  const handlePurchaseCollection = () => {
    if (!isEvmWalletConnected) {
      alert('Please connect your Ethereum wallet to purchase NFTs');
      return;
    }

    setSelectedTokenId(collection?.mainTokenId || null);
    setPurchaseType('collection');
    setShowPurchaseModal(true);
  };

  // Function to handle bid on token
  const handleBidOnToken = async (tokenId: string, tokenName: string) => {
    if (!isEvmWalletConnected) {
      alert('Please connect your Ethereum wallet to place bids');
      return;
    }

    try {
      // Get current highest bid for this token
      const bidsResponse = await fetch(`/api/bids?collectionId=${collection?.collectionId}&status=ACTIVE`);
      if (bidsResponse.ok) {
        const bidsData = await bidsResponse.json();
        const tokenBids = bidsData.bids || [];
        const highestBid = tokenBids.length > 0 ? tokenBids[0].bidAmount : 0;
        setCurrentHighestBid(highestBid);
      }
    } catch (error) {
      console.error('Error fetching current bids:', error);
      setCurrentHighestBid(0);
    }

    setSelectedBidTokenId(tokenId);
    setSelectedBidTokenName(tokenName);
    setShowBidModal(true);
  };

  // Function to handle successful bid placement
  const handleBidPlaced = async () => {
    // Refresh collection data and price statistics
    await fetchCollectionData();
    await fetchPriceStatistics();
  };

  // Function to confirm purchase
  const confirmPurchase = async () => {
    if (!collection || !selectedTokenId || !walletClient || !publicClient) return;
    
    setIsPurchasing(true);
    
    try {
      let transactionHash: string;
      
      if (purchaseType === 'collection') {
        // Purchase entire collection
        const collectionId = BigInt(collection.collectionId);
        const price = parseEther(collection.listingPriceEth.toString());
        
        const { request } = await publicClient.simulateContract({
          address: LAND_MARKETPLACE_ADDRESS,
          abi: LandMarketplaceABI,
          functionName: 'purchaseCollection',
          args: [collectionId],
          value: price,
          account: connectedEvmAddress,
        });
        
        transactionHash = await walletClient.writeContract(request);
      } else {
        // Purchase individual token
        const tokenId = BigInt(selectedTokenId);
        const selectedToken = collection.evmCollectionTokens.find(t => t.tokenId === selectedTokenId);
        
        if (!selectedToken) {
          throw new Error('Token not found');
        }
        
        const price = parseEther(selectedToken.listingPrice.toString());
        
        const { request } = await publicClient.simulateContract({
          address: LAND_MARKETPLACE_ADDRESS,
          abi: LandMarketplaceABI,
          functionName: 'purchaseListing',
          args: [PLATZ_LAND_NFT_ADDRESS, tokenId],
          value: price,
          account: connectedEvmAddress,
        });
        
        transactionHash = await walletClient.writeContract(request);
      }
      
      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: transactionHash as `0x${string}`,
      });
      
      if (receipt.status === 'success') {
        // Record transaction in database
        try {
          const transactionData = {
            transactionType: purchaseType === 'collection' ? 'PURCHASE' : 'PURCHASE',
            tokenId: selectedTokenId,
            collectionId: collection.collectionId,
            fromAddress: LAND_MARKETPLACE_ADDRESS,
            toAddress: connectedEvmAddress!,
            price: purchaseType === 'collection' ? collection.listingPriceEth : (collection.evmCollectionTokens.find(token => token.tokenId === selectedTokenId)?.listingPrice || 0),
            currency: 'ETH',
            transactionHash,
            blockNumber: receipt.blockNumber ? Number(receipt.blockNumber) : undefined,
            gasUsed: receipt.gasUsed ? Number(receipt.gasUsed) : undefined
          };

          await fetch('/api/transactions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(transactionData),
          });
        } catch (recordError) {
          console.error('Failed to record transaction:', recordError);
          // Don't fail the purchase if recording fails
        }

        alert('Purchase successful! The NFT has been transferred to your wallet.');
        
        // Refresh collection data to show updated ownership
        await fetchCollectionData();
        await fetchPriceStatistics();
      } else {
        throw new Error('Transaction failed');
      }
      
      // Close modal after purchase
      setShowPurchaseModal(false);
      setSelectedTokenId(null);
    } catch (err: any) {
      console.error('Error purchasing:', err);
      alert(`Error purchasing: ${err.message || 'Transaction failed'}`);
    } finally {
      setIsPurchasing(false);
    }
  };

  // Render loading state
  if (loading) {
    return <CollectionDetailSkeleton />;
  }

  // Render error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
      {/* Back Button */}
      <Link
        href="/explore"
        className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-6">
        <FiArrowLeft className="mr-2" /> Back to Explore
      </Link>

        {/* Low Balance Warning */}
        {isEvmWalletConnected && (
          <LowBalanceWarning threshold={0.01} />
        )}
      {/* Collection Header */}
      <div className="bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden mb-8">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 h-64 md:h-auto bg-gray-200 dark:bg-zinc-800 flex-shrink-0">
            <NFTImage
              src={collection.nftImageFileRef || ''}
              alt={collection.nftTitle || 'Collection Image'}
              className="w-full h-full"
              collectionId={collection.id}
              isMainToken={true}
              priority={true}
              dimensions={{ aspectRatio: '4/3' }}
              fallback="https://placehold.co/400x300/gray/white?text=Collection+Image"
            />
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
              <div className="text-right">
                {collection.isListedForSale && (
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatPriceWithConversion(collection.listingPriceEth)}
                  </div>
                )}
                {priceStats && !statsLoading && (
                  <div className="flex items-center mt-1">
                    {priceStats.priceChange24h >= 0 ? (
                      <FiTrendingUp className="text-green-500 mr-1" size={16} />
                    ) : (
                      <FiTrendingDown className="text-red-500 mr-1" size={16} />
                    )}
                    <span className={`text-sm ${priceStats.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {priceStats.priceChange24h >= 0 ? '+' : ''}{priceStats.priceChange24h.toFixed(2)}%
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">24h</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price Statistics Section */}
            {priceStats && !statsLoading && (
              <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Market Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-500">Floor Price</p>
                    <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {formatPriceWithConversion(priceStats.floorPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-500">24h Volume</p>
                    <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {formatPriceWithConversion(priceStats.volume24h)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-500">24h Sales</p>
                    <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {priceStats.sales24h}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-500">Top Offer</p>
                    <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {priceStats.topOffer > 0 ? formatPriceWithConversion(priceStats.topOffer) : 'No offers'}
                    </p>
                  </div>
                </div>
              </div>
            )}

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

              <div className="flex flex-col sm:flex-row gap-3">
              {collection.isListedForSale && (
                <button
                    onClick={handlePurchaseCollection}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center"
                >
                <FiShoppingCart className="mr-2" /> Purchase Collection
                </button>
              )}
                {/* Show batch purchase button if there are listed tokens for sale */}
                {collection.evmCollectionTokens.some(token => token.isListed) && (
                  <button
                    onClick={() => setShowBatchPurchaseModal(true)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center"
                  >
                    <FiShoppingCart className="mr-2" /> Buy Multiple
                  </button>
                )}
              </div>
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
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'activity'
                ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Activity
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
              {(() => {
                // Sort tokens: non-owned first, then owned at the bottom
                const sortedTokens = [...collection.evmCollectionTokens].sort((a, b) => {
                  const aIsOwned = ownedTokenIds.has(a.tokenId);
                  const bIsOwned = ownedTokenIds.has(b.tokenId);
                  
                  // Non-owned tokens first (return -1 if a is not owned but b is owned)
                  if (!aIsOwned && bIsOwned) return -1;
                  if (aIsOwned && !bIsOwned) return 1;
                  
                  // Within same ownership status, maintain original order (by tokenId)
                  return parseInt(a.tokenId) - parseInt(b.tokenId);
                });

                return sortedTokens.map((token) => {
                  // Get token metadata from cache
                  const tokenMetadata = tokenMetadataCache[token.tokenId];
                  const originalIndex = collection.evmCollectionTokens.findIndex(t => t.tokenId === token.tokenId);
                  const isMainToken = originalIndex === 0;
                  const isOwnedByUser = ownedTokenIds.has(token.tokenId);
                  
                  // Determine image source
                  let imageUrl = tokenMetadata?.image || '';
                  if (!imageUrl && isMainToken && collection.nftImageFileRef) {
                    // For main token without metadata, use collection image as fallback
                    imageUrl = collection.nftImageFileRef;
                  }
                  
                  // Check if metadata is still loading
                  const isMetadataLoading = !tokenMetadata && isMainToken;
                  
                  // Show skeleton while metadata is loading for main token
                  if (isMetadataLoading) {
                    return (
                      <NFTTokenCardSkeleton
                        key={token.tokenId}
                        showBadges={true}
                        showPrice={token.listingPrice > 0}
                        showButton={token.isListed}
                      />
                    );
                  }
                  
                  return (
                    <div 
                      key={token.tokenId} 
                      className={`bg-gray-50 dark:bg-zinc-800/50 border rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 ${
                        isOwnedByUser 
                          ? 'border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' 
                          : 'border-gray-200 dark:border-zinc-700'
                      }`}
                    >
                      <div className="aspect-square bg-gray-100 dark:bg-zinc-800 relative">
                        {isMainToken && (
                          <div className="absolute top-0 left-0 bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-br z-10">
                            Main Token
                          </div>
                        )}
                        {isOwnedByUser && (
                          <div className="absolute top-0 right-0 bg-yellow-600 text-white text-xs font-medium px-2 py-1 rounded-bl z-10">
                            OWNED
                          </div>
                        )}
                        {!isOwnedByUser && token.isListed && (
                          <div className="absolute top-0 right-0 bg-green-600 text-white text-xs font-medium px-2 py-1 rounded-bl z-10">
                            For Sale
                          </div>
                        )}
                        <NFTImage
                          src={imageUrl}
                          alt={tokenMetadata?.name || `Token #${token.tokenId}`}
                          className={`w-full h-full ${isOwnedByUser ? 'opacity-80' : ''}`}
                          tokenId={token.tokenId}
                          collectionId={collection.id}
                          isMainToken={isMainToken}
                          lazy={!isMainToken} // Don't lazy load main token
                          priority={isMainToken}
                          dimensions={{ aspectRatio: '1/1' }}
                          fallback="https://placehold.co/300x300/gray/white?text=No+Image"
                        />
                      </div>
                      <div className="p-3">
                        <div className="flex justify-between items-start">
                          <p className={`text-sm font-medium ${
                            isOwnedByUser 
                              ? 'text-yellow-800 dark:text-yellow-200' 
                              : 'text-gray-900 dark:text-gray-100'
                          }`}>
                            {tokenMetadata?.name || `Token #${token.tokenId}`}
                          </p>
                          {token.listingPrice > 0 && !isOwnedByUser && (
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                              {formatPriceWithConversion(token.listingPrice)}
                            </p>
                          )}
                        </div>
                        <p className={`text-xs truncate mt-1 ${
                          isOwnedByUser 
                            ? 'text-yellow-700 dark:text-yellow-300' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {isOwnedByUser 
                            ? 'You own this token' 
                            : `Owner: ${token.ownerAddress?.substring(0, 6)}...${token.ownerAddress?.substring(38)}`
                          }
                        </p>
                        <div className="mt-2 space-y-1">
                          {/* Show different actions based on ownership */}
                                                  {isOwnedByUser ? (
                          <div className="text-center py-2">
                            <p className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">
                              ✓ You own this
                            </p>
                          </div>
                        ) : (
                            <>
                              {token.isListed && (
                                <button
                                  onClick={() => handlePurchaseToken(token.tokenId)}
                                  className="w-full px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded flex items-center justify-center"
                                >
                                  <FiShoppingCart className="mr-1" size={12} /> Buy Now
                                </button>
                              )}
                              {/* Allow bidding when wallet is connected and user doesn't own the token */}
                              {isEvmWalletConnected && (
                                <button
                                  onClick={() => handleBidOnToken(token.tokenId, tokenMetadata?.name || `Token #${token.tokenId}`)}
                                  className="w-full px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded flex items-center justify-center"
                                >
                                  <FiTool className="mr-1" size={12} /> Place Bid
                                </button>
                              )}
                              {/* Show connect wallet message when wallet is not connected */}
                              {!isEvmWalletConnected && (
                                <button
                                  disabled
                                  className="w-full px-3 py-1 bg-gray-400 text-white text-sm rounded flex items-center justify-center cursor-not-allowed"
                                >
                                  <FiTool className="mr-1" size={12} /> Connect Wallet to Bid
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
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

        {activeTab === 'activity' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Collection Activity</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Recent transactions and activities for this NFT collection.
            </p>
            <ActivityFeed 
              collectionId={collection.collectionId}
              limit={20}
              showHeader={false}
              className="border-none shadow-none p-0"
            />
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
                {purchaseType === 'collection' 
                  ? `You are about to purchase the entire Collection #${collection.id}.`
                  : `You are about to purchase Token #${selectedTokenId} from Collection #${collection.id}.`
                }
              </p>
              <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Item:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {purchaseType === 'collection' ? 'Entire Collection' : `Token #${selectedTokenId}`}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Price:</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    {purchaseType === 'collection' 
                      ? formatPriceWithConversion(collection.listingPriceEth)
                      : formatPriceWithConversion(collection.evmCollectionTokens.find(t => t.tokenId === selectedTokenId)?.listingPrice || 0)
                    }
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
                  {isPurchasing ? <PulsingDotsSpinner size={16} color="bg-black dark:bg-white" /> : 'Confirm Purchase'}
              </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bid Modal */}
      {showBidModal && selectedBidTokenId && collection && (
        <BidModal
          isOpen={showBidModal}
          onClose={() => {
            setShowBidModal(false);
            setSelectedBidTokenId(null);
            setSelectedBidTokenName('');
          }}
          onBidPlaced={handleBidPlaced}
          tokenId={selectedBidTokenId}
          tokenName={selectedBidTokenName}
          currentHighestBid={currentHighestBid}
          floorPrice={priceStats?.floorPrice || 0}
          collectionId={collection.collectionId}
        />
      )}

      {/* Batch Purchase Modal */}
      {showBatchPurchaseModal && collection && (
        <BatchPurchaseModal
          isOpen={showBatchPurchaseModal}
          onClose={() => setShowBatchPurchaseModal(false)}
          onPurchasesComplete={async () => {
            await fetchCollectionData();
            await fetchPriceStatistics();
          }}
          availableTokens={collection.evmCollectionTokens
            .filter(token => token.isListed)
            .map(token => ({
              tokenId: token.tokenId,
              tokenURI: token.tokenURI,
              listingPrice: token.listingPrice,
              metadata: tokenMetadataCache[token.tokenId]
            }))}
          collectionName={collection.nftTitle}
          collectionId={collection.collectionId}
        />
      )}
    </div>
  );
};

export default NFTCollectionDetailPage;
