'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiExternalLink, FiInfo, FiMap, FiShoppingCart, FiTrendingUp, FiTrendingDown, FiTool, FiDollarSign, FiRefreshCw } from 'react-icons/fi';
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
import { usePreservedNavigation } from '@/hooks/usePreservedNavigation';
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
  const { navigateToExplore } = usePreservedNavigation();
  
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
  const [selectedBidTokenPrice, setSelectedBidTokenPrice] = useState<number>(0);
  const [currentHighestBid, setCurrentHighestBid] = useState<number>(0);

  // State for batch purchase modal
  const [showBatchPurchaseModal, setShowBatchPurchaseModal] = useState<boolean>(false);

  // Token metadata cache
  const [tokenMetadataCache, setTokenMetadataCache] = useState<Record<string, any>>({});

  // Image preloading hook
  const { preload, preloadSingle } = useImagePreloading();

  // Helper function to format collection names by removing "Collection: " prefix
  const formatCollectionName = (name?: string): string => {
    if (!name) return 'Untitled Listing';
    
    // Remove "Collection: " or "collection: " prefix (case insensitive)
    const lowerName = name.toLowerCase();
    if (lowerName.startsWith('collection: ')) {
      return name.substring('collection: '.length).trim();
    }
    
    return name;
  };

  // Effect to fetch collection data on mount
  useEffect(() => {
    if (publicClient && isClient) {
    fetchCollectionData();
    }
  }, [publicClient, isClient, collectionId]);

  // Effect to fetch price statistics when collection is loaded
  useEffect(() => {
    if (collection) {
    fetchPriceStatistics();
      checkUserOwnership();
      
      // Force a fresh blockchain ownership check after a short delay to ensure we have the latest data
      setTimeout(async () => {
        await refreshOwnershipFromBlockchain();
      }, 1000); // Reduced to 1-second delay for better responsiveness
    }
  }, [collection]);

  // Effect to check ownership when wallet connection changes
  useEffect(() => {
    if (collection) {
      checkUserOwnership();
    }
  }, [connectedEvmAddress, isEvmWalletConnected, collection]);

  // Effect for periodic refresh of ownership data (to catch external transfers/bid acceptances)
  useEffect(() => {
    if (!collection || !isClient) return;

    // Use more frequent refreshes when wallet is connected since user is actively interacting
    const refreshInterval = isEvmWalletConnected ? 15000 : 30000; // 15s when connected, 30s when not
    
    const intervalId = setInterval(async () => {
      // Only do aggressive blockchain refresh if wallet is connected
      if (isEvmWalletConnected) {
        await refreshOwnershipFromBlockchain();
      } else {
        // Just check ownership based on loaded collection data
        checkUserOwnership();
      }
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [collection, isClient, isEvmWalletConnected]);

  // Timeout effect to prevent infinite skeleton loading
  useEffect(() => {
    if (collection && collection.evmCollectionTokens.length > 0) {
      // Set a timeout to ensure all metadata entries are resolved
      const timeoutId = setTimeout(() => {
        setTokenMetadataCache(prev => {
          const updated = { ...prev };
          let hasUpdates = false;
          
          // Check for any undefined entries and set them to null
          collection.evmCollectionTokens.forEach(token => {
            if (updated[token.tokenId] === undefined) {
              updated[token.tokenId] = null;
              hasUpdates = true;
              console.warn(`[NFTCollectionDetailPage] Timeout: Setting metadata cache for token ${token.tokenId} to null to prevent infinite skeleton loading`);
            }
          });
          
          return hasUpdates ? updated : prev;
        });
      }, 10000); // 10 second timeout
      
      return () => clearTimeout(timeoutId);
    }
  }, [collection]);

  // Function to fetch metadata from IPFS or other storage
  const fetchMetadata = async (uri: string, isOptional: boolean = false) => {
    try {
      // DEBUG: Log original URI
      console.log(`[DEBUG] fetchMetadata called with URI: ${uri}, isOptional: ${isOptional}`);
      
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
              console.log(`[DEBUG] Rewritten ngrok URL from ${uri} to ${url}`);
            } else {
              // Server-side or when window is not available
              url = `http://localhost:3000/api/static/${pathMatch[1]}`;
              console.log(`[DEBUG] Rewritten ngrok URL (server-side) from ${uri} to ${url}`);
            }
          }
        } catch (e: any) {
          console.error(`[DEBUG] Error rewriting ngrok URL ${url}:`, e.message);
          // Keep original URL if rewrite fails
        }
      }
      
      // If it's a localhost URL with /uploads/, convert to API route
      if (url.includes('localhost') && url.includes('/uploads/')) {
        const oldUrl = url;
        url = url.replace('/uploads/', '/api/static/');
        console.log(`[DEBUG] Rewritten localhost URL from ${oldUrl} to ${url}`);
      }
      
      // DEBUG: Log final URL before fetch
      console.log(`[DEBUG] Final URL for fetch: ${url}`);
      
      // Try the main URL first
      let response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      // DEBUG: Log response status
      console.log(`[DEBUG] Fetch response for ${url}: status ${response.status}, ok: ${response.ok}`);
      
      if (!response.ok) {
        if (isOptional) {
          console.log(`[DEBUG] Optional metadata fetch failed for ${url}, returning null`);
          return null;
        }
        const responseText = await response.text();
        console.error(`[DEBUG] Failed to fetch metadata from ${url}: ${response.status} ${response.statusText} - ${responseText}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${responseText}`);
      }
      
      const jsonData = await response.json();
      console.log(`[DEBUG] Successfully fetched metadata for ${url}:`, { 
        hasImage: !!jsonData.image, 
        imageUrl: jsonData.image 
      });
      return jsonData;
    } catch (error) {
      console.error(`[DEBUG] Exception in fetchMetadata for ${uri}:`, error);
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
      // Use the blockchain data that's already loaded in the collection
      // This is more accurate than the database since tokens are read directly from smart contract
      const ownedTokenIds = new Set<string>();
      
      collection.evmCollectionTokens.forEach((token, index) => {
        // Check direct ownership
        const isDirectlyOwned = token.ownerAddress && 
          token.ownerAddress.toLowerCase() === connectedEvmAddress.toLowerCase();
        
        // Check if token is owned by marketplace but listed by the connected user
        // This happens when the user lists their tokens for sale
        const isListedByUser = token.ownerAddress && 
          token.ownerAddress.toLowerCase() === LAND_MARKETPLACE_ADDRESS.toLowerCase() &&
          token.isListed &&
          // For collection listings, the user who minted the collection is the seller
          collection.evmOwnerAddress &&
          collection.evmOwnerAddress.toLowerCase() === connectedEvmAddress.toLowerCase();
        
        if (isDirectlyOwned || isListedByUser) {
          // Ensure tokenId is stored as string for consistent Set operations
          ownedTokenIds.add(String(token.tokenId));
        }
      });
      
      setOwnedTokenIds(ownedTokenIds);
      
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
        throw new Error("Listing not found");
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
        setError(`Failed to get marketplace details for listing ${collectionId}. The listing might not be listed, or an on-chain error occurred.`);
        // Re-throw the original error to see it in the browser console for full diagnosis
        throw error; 
      }
      
      // Fetch collection metadata
      const metadata = await fetchMetadata(collectionURI);
      if (!metadata) {
        throw new Error("Failed to fetch listing metadata");
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
        
        // Get individual token listing price or fall back to collection base price
        let tokenListingPrice = 0;
        if (isTokenListed && listingData && listingData.price) {
          // Use individual token's listing price (converted from wei to ETH)
          tokenListingPrice = Number(formatEther(listingData.price));
        } else if (isActive && typeof basePrice !== 'undefined') {
          // Fall back to collection base price for non-individually listed tokens
          tokenListingPrice = Number(formatEther(basePrice));
        }
        
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
          // If ownerOf reverts, we can't be sure of the owner.
          // Set it to a placeholder. The refreshOwnershipFromBlockchain function will correct it later.
          ownerAddress = '0x0000000000000000000000000000000000000000'; // Address zero
          console.warn(`[NFTCollectionDetailPage] ownerOf failed for token ${tokenId}, setting to address zero as placeholder:`, error);
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
          listingPrice: tokenListingPrice,
        });
      }
      
      // Transform to our application's collection format
      const transformedCollection: NFTCollection = {
        id: parsedCollectionId.toString(),
        nftTitle: metadata.name || `Listing #${parsedCollectionId}`,
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
            // DEBUG: Log metadata fetch results
            console.log(`[DEBUG] Metadata fetch for token ${token.tokenId}:`, {
              tokenURI: token.tokenURI,
              success: !!metadata,
              hasImage: !!(metadata?.image),
              imageUrl: metadata?.image,
              isOptional
            });
            
            // Always update the cache, even if metadata is null for optional tokens
            // This prevents main tokens from getting stuck in loading state for legacy collections
              setTokenMetadataCache(prev => ({
                ...prev,
              [token.tokenId]: metadata || null
            }));
            
            // Add image URL to preload list only if metadata exists
            let imageUrl = tokenMetadataCache[token.tokenId]?.image || '';
            if (!imageUrl && isMainToken && transformedCollection.nftImageFileRef) {
              imageUrl = transformedCollection.nftImageFileRef;
            }
            
            // Provide fallback for child tokens when metadata fails to load
            if (!imageUrl && !isMainToken && transformedCollection.nftImageFileRef) {
              // Use collection main image as fallback for child tokens
              imageUrl = transformedCollection.nftImageFileRef;
            }
            
            if (imageUrl) {
              imageUrls.push(imageUrl);
            }
          }).catch(error => {
            // DEBUG: Log metadata fetch errors
            console.error(`[DEBUG] Metadata fetch error for token ${token.tokenId}:`, {
              tokenURI: token.tokenURI,
              error: error.message,
              isOptional
            });
            
            // Also update cache on error to prevent infinite loading
            setTokenMetadataCache(prev => ({
              ...prev,
              [token.tokenId]: null
            }));
            
            if (isOptional) {
              console.warn(`[NFTCollectionDetailPage] Failed to fetch optional metadata for token ${token.tokenId}:`, error);
            } else {
              console.error(`[NFTCollectionDetailPage] Failed to fetch required metadata for token ${token.tokenId}:`, error);
            }
          });
        } else {
          // If no tokenURI, immediately set cache to null to prevent skeleton loading
          setTokenMetadataCache(prev => ({
            ...prev,
            [token.tokenId]: null
          }));
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
      
      // Check if this is a "Collection does not exist" error from the new contract
      // viem errors can have the message in different properties: message, shortMessage, reason, or details
      const errorMessage = err.message || err.shortMessage || err.reason || err.details || '';
      const isCollectionNotFound = errorMessage.includes('Collection does not exist') || 
                                   (err.name && err.name.includes('ContractFunctionExecutionError') && errorMessage.includes('Collection does not exist'));
      
      if (isCollectionNotFound) {
        setError(`This collection (ID: ${collectionId}) was created on our previous smart contract and is no longer accessible on-chain. Collections created after our recent contract upgrade will work properly. We apologize for the inconvenience.`);
      } else {
        setError(errorMessage || 'An error occurred while fetching the listing');
      }
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

    // Find the token to get its listing price
    const selectedToken = collection?.evmCollectionTokens.find(token => token.tokenId === tokenId);
    const tokenListingPrice = selectedToken?.listingPrice || 0;

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
    setSelectedBidTokenPrice(tokenListingPrice);
    setShowBidModal(true);
  };

  // Function to handle successful bid placement
  const handleBidPlaced = async () => {
    // Refresh collection data and price statistics immediately
    await fetchCollectionData();
    await fetchPriceStatistics();
    
    // Force aggressive blockchain ownership check after a brief delay to ensure blockchain state is updated
    setTimeout(async () => {
      await refreshOwnershipFromBlockchain();
    }, 3000); // Increased delay to ensure blockchain state is fully propagated
  };

  // Function to manually refresh all data (for user-triggered refresh)
  const handleManualRefresh = async () => {
    setLoading(true);
    try {
      await fetchCollectionData();
      await fetchPriceStatistics();
      
      // Force a direct blockchain ownership check after data refresh
      await refreshOwnershipFromBlockchain();
    } catch (error) {
      console.error('Error during manual refresh:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to aggressively refresh ownership directly from blockchain
  const refreshOwnershipFromBlockchain = async () => {
    if (!isEvmWalletConnected || !connectedEvmAddress || !collection || !publicClient) {
      setOwnedTokenIds(new Set());
      return;
    }

    try {
      const ownedTokenIds = new Set<string>();
      
      // Query each token's ownership directly from blockchain
      for (const token of collection.evmCollectionTokens) {
        try {
          const currentOwner = await publicClient.readContract({
            address: PLATZ_LAND_NFT_ADDRESS,
            abi: PlatzLandNFTABI,
            functionName: 'ownerOf',
            args: [BigInt(token.tokenId)]
          }) as string;
          
          let userOwnsToken = false;
          
          // SCENARIO 1: User directly owns the token (most common after purchase)
          if (currentOwner.toLowerCase() === connectedEvmAddress.toLowerCase()) {
            userOwnsToken = true;
          }
          
          // SCENARIO 2: Token is held by marketplace contract
          else if (currentOwner.toLowerCase() === LAND_MARKETPLACE_ADDRESS.toLowerCase()) {
            // Check if the token is actively listed by this user
            try {
              const listingData = await publicClient.readContract({
                address: LAND_MARKETPLACE_ADDRESS,
                abi: LandMarketplaceABI,
                functionName: 'getListing',
                args: [PLATZ_LAND_NFT_ADDRESS, BigInt(token.tokenId)]
              });
              
              // getListing returns { seller, price, paymentToken, isActive }
              if (listingData && listingData.isActive && listingData.seller) {
                const seller = listingData.seller as string;
                if (seller.toLowerCase() === connectedEvmAddress.toLowerCase()) {
                  userOwnsToken = true;
                }
              }
            } catch (listingError) {
              // Silently handle listing errors
            }
          }
          
          if (userOwnsToken) {
            ownedTokenIds.add(String(token.tokenId));
          }
          
        } catch (error) {
          // Silently handle token ownership errors
        }
      }
      
      console.log(`[NFTCollectionDetailPage] User owns ${ownedTokenIds.size} tokens:`, Array.from(ownedTokenIds));
      setOwnedTokenIds(ownedTokenIds);
      
    } catch (error) {
      console.error('[NFTCollectionDetailPage] Error refreshing ownership from blockchain:', error);
      setOwnedTokenIds(new Set());
    }
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
        
        // Force aggressive blockchain ownership check after a brief delay to ensure blockchain state is updated
        setTimeout(async () => {
          await refreshOwnershipFromBlockchain();
        }, 3000); // Increased delay to ensure blockchain state is fully propagated
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
    const isMigrationError = error.includes('previous smart contract');
    
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        <div className={`${isMigrationError ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'} border rounded-lg p-6 text-center`}>
          <h2 className={`text-xl font-semibold ${isMigrationError ? 'text-blue-800 dark:text-blue-200' : 'text-red-800 dark:text-red-200'} mb-2`}>
            {isMigrationError ? 'Contract Migration Notice' : 'Error'}
          </h2>
          <p className={`${isMigrationError ? 'text-blue-700 dark:text-blue-300' : 'text-red-700 dark:text-red-300'} mb-4`}>
            {error}
          </p>
          
          {isMigrationError && (
            <div className="mb-4 p-4 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
              <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">What happened?</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                We recently upgraded our smart contracts to fix collection counting issues. 
                Old collections remain in our database but are no longer accessible on the blockchain.
              </p>
              <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">What's next?</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                New collections created after the upgrade will work correctly and show proper item counts.
              </p>
            </div>
          )}
          
          <div className="flex gap-3 justify-center">
            <Link
              href="/explore"
              className={`px-4 py-2 ${isMigrationError ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-lg transition-colors`}
            >
              Browse Available Collections
            </Link>
            {!isMigrationError && (
          <button
            onClick={fetchCollectionData}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render 404 state
  if (!collection) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Listing Not Found</h2>
          <p className="text-yellow-700 dark:text-yellow-300">The NFT listing you're looking for doesn't exist or has been removed.</p>
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
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.button
          onClick={navigateToExplore}
          className="inline-flex items-center text-white hover:text-cyber-accent mb-6 font-mono uppercase tracking-wider transition-all duration-300 group cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            whileHover={{ x: -5 }}
            transition={{ duration: 0.2 }}
          >
            <FiArrowLeft className="mr-2" />
          </motion.div>
          <motion.span
            style={{
              textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
            }}
            whileHover={{
              textShadow: "0 0 15px rgba(255, 255, 255, 0.8)",
            }}
          >
            BACK TO EXPLORE
          </motion.span>
        </motion.button>
      </motion.div>

        {/* Low Balance Warning */}
        {isEvmWalletConnected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
          <LowBalanceWarning threshold={0.01} />
          </motion.div>
        )}

      {/* Collection Header */}
      <motion.div 
        className="border border-text-light/20 dark:border-text-dark/20 rounded-cyber-lg bg-primary-light/95 dark:bg-primary-dark/95 backdrop-blur-cyber overflow-hidden mb-8 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        
        <div className="flex flex-col md:flex-row relative">
          <div className="md:w-1/3 h-64 md:h-auto bg-black/5 dark:bg-white/5 flex-shrink-0 rounded-tl-cyber-lg md:rounded-bl-cyber-lg md:rounded-tr-none rounded-tr-cyber-lg">
            <NFTImage
              src={collection.nftImageFileRef || ''}
              alt={formatCollectionName(collection.nftTitle) || 'Listing Image'}
              className="w-full h-full"
              collectionId={collection.id}
              isMainToken={true}
              priority={true}
              dimensions={{ aspectRatio: '4/3' }}
              fallback="https://placehold.co/400x300/gray/white?text=Listing+Image"
            />
          </div>
          <div className="p-6 flex-1">
            <div className="flex justify-between items-start">
              <div>
                <motion.h1 
                  className="text-2xl font-bold text-text-light dark:text-text-dark mb-2 font-mono uppercase tracking-wider"
                  style={{
                    textShadow: "0 0 20px rgba(255, 255, 255, 0.5)",
                  }}
                  animate={{
                    textShadow: [
                      "0 0 20px rgba(255, 255, 255, 0.5)",
                      "0 0 25px rgba(255, 255, 255, 0.7)",
                      "0 0 20px rgba(255, 255, 255, 0.5)",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {formatCollectionName(collection.nftTitle)}
                </motion.h1>
                <motion.p 
                  className="text-text-light/70 dark:text-text-dark/70 mb-4 font-mono"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {collection.nftDescription || 'No description provided'}
                </motion.p>
              </div>
              <div className="text-right">
                {collection.isListedForSale && (
                  <motion.div 
                    className="text-2xl font-bold text-text-light dark:text-text-dark font-mono"
                    style={{
                      textShadow: "0 0 15px rgba(255, 255, 255, 0.6)",
                    }}
                    animate={{
                      textShadow: [
                        "0 0 15px rgba(255, 255, 255, 0.6)",
                        "0 0 20px rgba(255, 255, 255, 0.8)",
                        "0 0 15px rgba(255, 255, 255, 0.6)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {formatPriceWithConversion(collection.listingPriceEth)}
                  </motion.div>
                )}
                {priceStats && !statsLoading && (
                  <motion.div 
                    className="flex items-center mt-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {priceStats.priceChange24h >= 0 ? (
                      <FiTrendingUp className="text-cyber-accent mr-1" size={16} />
                    ) : (
                      <FiTrendingDown className="text-red-400 mr-1" size={16} />
                    )}
                    <span className={`text-sm font-mono ${priceStats.priceChange24h >= 0 ? 'text-cyber-accent' : 'text-red-400'}`}>
                      {priceStats.priceChange24h >= 0 ? '+' : ''}{priceStats.priceChange24h.toFixed(2)}%
                    </span>
                    <span className="text-text-light/60 dark:text-text-dark/60 text-sm ml-2 font-mono">24h</span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Market Statistics Section */}
            {priceStats && !statsLoading && (
              <motion.div 
                className="bg-black/5 dark:bg-white/5 rounded-cyber p-4 mb-6 border border-white/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.h3 
                  className="text-lg font-medium text-text-light dark:text-text-dark mb-3 font-mono uppercase tracking-wider"
                  style={{
                    textShadow: "0 0 10px rgba(255, 255, 255, 0.4)",
                  }}
                >
                  MARKET STATISTICS
                </motion.h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <p className="text-sm text-text-light/60 dark:text-text-dark/60 font-mono uppercase tracking-wider">Floor Price</p>
                    <p className="text-base font-medium text-text-light dark:text-text-dark font-mono">
                      {formatPriceWithConversion(priceStats.floorPrice)}
                    </p>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <p className="text-sm text-text-light/60 dark:text-text-dark/60 font-mono uppercase tracking-wider">24h Volume</p>
                    <p className="text-base font-medium text-text-light dark:text-text-dark font-mono">
                      {formatPriceWithConversion(priceStats.volume24h)}
                    </p>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <p className="text-sm text-text-light/60 dark:text-text-dark/60 font-mono uppercase tracking-wider">24h Sales</p>
                    <p className="text-base font-medium text-text-light dark:text-text-dark font-mono">
                      {priceStats.sales24h}
                    </p>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <p className="text-sm text-text-light/60 dark:text-text-dark/60 font-mono uppercase tracking-wider">Top Offer</p>
                    <p className="text-base font-medium text-text-light dark:text-text-dark font-mono">
                      {priceStats.topOffer > 0 ? formatPriceWithConversion(priceStats.topOffer) : 'No offers'}
                    </p>
                  </motion.div>
                  </div>
              </motion.div>
            )}

            {/* Collection Information Grid */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <motion.div whileHover={{ scale: 1.02 }}>
                <p className="text-sm text-text-light/60 dark:text-text-dark/60 font-mono uppercase tracking-wider">Location</p>
                <p className="text-base font-medium text-text-light dark:text-text-dark font-mono">
                  {collection.country && collection.state ? `${collection.country}, ${collection.state}` : 'Not specified'}
                </p>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }}>
                <p className="text-sm text-text-light/60 dark:text-text-dark/60 font-mono uppercase tracking-wider">Area</p>
                <p className="text-base font-medium text-text-light dark:text-text-dark font-mono">
                  {collection.propertyAreaSqm ? `${collection.propertyAreaSqm} sqm` : 'Not specified'}
                </p>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }}>
                <p className="text-sm text-text-light/60 dark:text-text-dark/60 font-mono uppercase tracking-wider">Listing Size</p>
                <p className="text-base font-medium text-text-light dark:text-text-dark font-mono">
                  {collection.nftCollectionSize} NFTs
                </p>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }}>
                <p className="text-sm text-text-light/60 dark:text-text-dark/60 font-mono uppercase tracking-wider">Owner</p>
                <p className="text-base font-medium text-text-light dark:text-text-dark truncate font-mono">
                  {collection.user?.username || (collection.evmOwnerAddress?.substring(0, 6) + '...' + collection.evmOwnerAddress?.substring(38))}
                </p>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }}>
                <p className="text-sm text-text-light/60 dark:text-text-dark/60 font-mono uppercase tracking-wider">Contract</p>
                <motion.a
                  href={`https://sepolia.etherscan.io/token/${collection.contractAddress}`} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-medium text-white hover:text-cyber-accent transition-colors flex items-center font-mono"
                  whileHover={{ scale: 1.05 }}
                  style={{
                    textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                  }}
                >
                  VIEW CONTRACT <FiExternalLink className="ml-1" size={14} />
                </motion.a>
              </motion.div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <motion.button
                onClick={() => setShowBidModal(true)}
                className="px-6 py-3 bg-cyber-accent hover:bg-cyber-accent/80 text-black rounded-cyber flex items-center justify-center font-mono uppercase tracking-wider transition-all duration-300"
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(0, 255, 0, 0.5)" }}
                whileTap={{ scale: 0.95 }}
              >
                <FiDollarSign className="mr-2" /> PLACE BID
              </motion.button>
              
                {collection.evmCollectionTokens.some(token => token.isListed) && (
                <motion.button
                    onClick={() => setShowBatchPurchaseModal(true)}
                  className="px-6 py-3 bg-white hover:bg-white/80 text-black rounded-cyber flex items-center justify-center font-mono uppercase tracking-wider transition-all duration-300"
                  whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255, 255, 255, 0.5)" }}
                  whileTap={{ scale: 0.95 }}
                  >
                  <FiShoppingCart className="mr-2" /> BUY MULTIPLE
                </motion.button>
                )}
              
              <motion.button
                onClick={handleManualRefresh}
                disabled={loading}
                className="px-4 py-3 bg-black hover:bg-gray-900 disabled:bg-gray-600 text-white rounded-cyber flex items-center justify-center font-mono uppercase tracking-wider transition-all duration-300 border border-white/20"
                whileHover={{ scale: loading ? 1 : 1.05, boxShadow: loading ? "none" : "0 0 20px rgba(255, 255, 255, 0.3)" }}
                whileTap={{ scale: loading ? 1 : 0.95 }}
                title="Refresh ownership data from blockchain"
                animate={loading ? { rotate: 360 } : {}}
                transition={loading ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
              >
                <FiRefreshCw className={`${loading ? 'animate-spin' : ''}`} size={16} />
              </motion.button>
            </motion.div>
              </div>
          </div>
      </motion.div>

      {/* Tabs Navigation */}
      <motion.div 
        className="mb-6 border-b border-white/20"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <nav className="flex space-x-8">
          {[
            { key: 'tokens', label: `NFT TOKENS (${collection.nftCollectionSize})` },
            { key: 'details', label: 'PROPERTY DETAILS' },
            { key: 'metadata', label: 'METADATA' },
            { key: 'activity', label: 'ACTIVITY' }
          ].map((tab) => (
          <motion.button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'tokens' | 'details' | 'metadata' | 'activity')}
            className={`py-4 px-1 border-b-2 font-medium text-sm font-mono uppercase tracking-wider transition-all duration-300 ${
                activeTab === tab.key
                ? 'border-white text-white'
                : 'border-transparent text-text-light/60 dark:text-text-dark/60 hover:text-white'
            }`}
            whileHover={{ scale: 1.05 }}
              style={activeTab === tab.key ? {
              textShadow: "0 0 15px rgba(255, 255, 255, 0.8)",
            } : {}}
          >
              {tab.label}
          </motion.button>
          ))}
        </nav>
      </motion.div>

      {/* Tab Content */}
      <motion.div 
        className="border border-text-light/20 dark:border-text-dark/20 rounded-cyber-lg bg-primary-light/95 dark:bg-primary-dark/95 backdrop-blur-cyber p-6 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <motion.div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none"
          animate={{
            backgroundPosition: ["0px 0px", "30px 30px"],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px'
          }}
        />
        
        {/* Tokens Tab */}
        {activeTab === 'tokens' && (
          <div className="relative z-10">
            <motion.h2 
              className="text-xl font-semibold text-text-light dark:text-text-dark mb-4 font-mono uppercase tracking-wider"
              style={{
                textShadow: "0 0 15px rgba(255, 255, 255, 0.5)",
              }}
            >
              LISTING TOKENS
            </motion.h2>
            <motion.p 
              className="text-text-light/70 dark:text-text-dark/70 mb-6 font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              This listing contains {collection.nftCollectionSize} NFT tokens representing ownership shares in the property.
            </motion.p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {(() => {
                const sortedTokens = [...collection.evmCollectionTokens].sort((a, b) => {
                  const aIsOwned = ownedTokenIds.has(a.tokenId);
                  const bIsOwned = ownedTokenIds.has(b.tokenId);
                  
                  if (!aIsOwned && bIsOwned) return -1;
                  if (aIsOwned && !bIsOwned) return 1;
                  
                  return parseInt(a.tokenId) - parseInt(b.tokenId);
                });

                return sortedTokens.map((token, index) => {
                  const tokenMetadata = tokenMetadataCache[token.tokenId];
                  const originalIndex = collection.evmCollectionTokens.findIndex(t => t.tokenId === token.tokenId);
                  const isMainToken = originalIndex === 0;
                  const isOwnedByUser = ownedTokenIds.has(String(token.tokenId));
                  
                  // Generate plot-based name using original index (so plot numbers stay consistent)
                  const plotNumber = originalIndex + 1;
                  const plotName = `Plot ${plotNumber}`;
                  
                  let imageUrl = tokenMetadata?.image || '';
                  if (!imageUrl && isMainToken && collection.nftImageFileRef) {
                    imageUrl = collection.nftImageFileRef;
                  }
                  
                  // Provide fallback for child tokens when metadata fails to load
                  if (!imageUrl && !isMainToken && collection.nftImageFileRef) {
                    // Use collection main image as fallback for child tokens
                    imageUrl = collection.nftImageFileRef;
                  }
                  
                  // DEBUG: Log image URL issues
                  if (plotNumber <= 3 || !imageUrl) {
                    // Debug logging removed for cleaner console output
                  }
                  
                  const isMetadataLoading = isMainToken && 
                    tokenMetadata === undefined && 
                    collection && 
                    collection.evmCollectionTokens.length > 0;
                  
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
                    <motion.div 
                      key={token.tokenId} 
                      className={`border rounded-cyber-lg overflow-hidden hover:shadow-lg transition-all duration-300 bg-primary-light/50 dark:bg-primary-dark/50 backdrop-blur-sm ${
                        isOwnedByUser 
                          ? 'border-cyber-accent bg-cyber-accent/10' 
                          : 'border-white/20 hover:border-white/40'
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.4 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                    >
                      <div className="aspect-square bg-black/5 dark:bg-white/5 relative">
                        {isMainToken && (
                          <motion.div 
                            className="absolute top-0 left-0 bg-white text-black text-xs font-medium px-2 py-1 rounded-br z-10 font-mono uppercase tracking-wider"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            MAIN TOKEN
                          </motion.div>
                        )}
                        {isOwnedByUser && (
                          <motion.div 
                            className="absolute top-0 right-0 bg-cyber-accent text-black text-xs font-medium px-2 py-1 rounded-bl z-10 font-mono uppercase tracking-wider"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3 }}
                          >
                            OWNED
                          </motion.div>
                        )}
                        {!isOwnedByUser && token.isListed && (
                          <motion.div 
                            className="absolute top-0 right-0 bg-white text-black text-xs font-medium px-2 py-1 rounded-bl z-10 font-mono uppercase tracking-wider"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3 }}
                          >
                            FOR SALE
                          </motion.div>
                        )}
                        <NFTImage
                          src={imageUrl}
                          alt={plotName}
                          className={`w-full h-full transition-all duration-500 ${isOwnedByUser ? 'opacity-80' : 'hover:scale-110'}`}
                          tokenId={token.tokenId}
                          collectionId={collection.id}
                          isMainToken={isMainToken}
                          lazy={!isMainToken}
                          priority={isMainToken}
                          dimensions={{ aspectRatio: '1/1' }}
                          fallback="https://placehold.co/300x300/gray/white?text=No+Image"
                        />
                      </div>
                      <div className="p-3">
                        <div className="flex justify-between items-start">
                          <motion.p 
                            className={`text-sm font-medium font-mono ${
                            isOwnedByUser 
                                ? 'text-cyber-accent' 
                                : 'text-text-light dark:text-text-dark'
                            }`}
                            style={isOwnedByUser ? {
                              textShadow: "0 0 10px rgba(0, 255, 0, 0.5)",
                            } : {}}
                          >
                            {plotName}
                          </motion.p>
                          {token.listingPrice > 0 && !isOwnedByUser && (
                            <motion.p 
                              className="text-sm font-bold text-text-light dark:text-text-dark font-mono"
                              style={{
                                textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                              }}
                            >
                              {formatPriceWithConversion(token.listingPrice)}
                            </motion.p>
                          )}
                        </div>
                        <p className={`text-xs truncate mt-1 font-mono ${
                          isOwnedByUser 
                            ? 'text-cyber-accent/70' 
                            : 'text-text-light/60 dark:text-text-dark/60'
                        }`}>
                          {isOwnedByUser 
                            ? 'You own this token' 
                            : `Owner: ${token.ownerAddress?.substring(0, 6)}...${token.ownerAddress?.substring(38)}`
                          }
                        </p>
                        <div className="mt-2 space-y-1">
                                                  {isOwnedByUser ? (
                          <div className="text-center py-2">
                              <motion.p 
                                className="text-xs text-cyber-accent font-medium font-mono uppercase tracking-wider"
                                animate={{ opacity: [0.7, 1, 0.7] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                ✓ YOU OWN THIS
                              </motion.p>
                          </div>
                        ) : (
                            <>
                              {token.isListed && (
                                <motion.button
                                  onClick={() => handlePurchaseToken(token.tokenId)}
                                  className="w-full px-3 py-1 bg-cyber-accent hover:bg-cyber-accent/80 text-black text-sm rounded-cyber flex items-center justify-center font-mono uppercase tracking-wider transition-all duration-300"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <FiShoppingCart className="mr-1" size={12} /> BUY NOW
                                </motion.button>
                              )}
                              {isEvmWalletConnected && (
                                <motion.button
                                  onClick={() => handleBidOnToken(token.tokenId, plotName)}
                                  className="w-full px-3 py-1 bg-white hover:bg-white/80 text-black text-sm rounded-cyber flex items-center justify-center font-mono uppercase tracking-wider transition-all duration-300"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <FiTool className="mr-1" size={12} /> PLACE BID
                                </motion.button>
                              )}
                              {!isEvmWalletConnected && (
                                <button
                                  disabled
                                  className="w-full px-3 py-1 bg-white/20 text-white/60 text-sm rounded-cyber flex items-center justify-center cursor-not-allowed font-mono uppercase tracking-wider"
                                >
                                  <FiTool className="mr-1" size={12} /> CONNECT WALLET TO BID
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* Other tabs content would go here */}
        {activeTab === 'details' && (
          <div className="relative z-10">
            <NFTPropertyDetails collection={collection} />
          </div>
        )}

        {activeTab === 'metadata' && (
          <div className="relative z-10">
            <NFTMetadataSection collection={collection} />
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="relative z-10">
            <motion.h2 
              className="text-xl font-semibold text-text-light dark:text-text-dark mb-4 font-mono uppercase tracking-wider"
              style={{
                textShadow: "0 0 15px rgba(255, 255, 255, 0.5)",
              }}
            >
              LISTING ACTIVITY
            </motion.h2>
            <motion.p 
              className="text-text-light/70 dark:text-text-dark/70 mb-6 font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Recent transactions and activities for this NFT listing.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
            <ActivityFeed 
              collectionId={collection.collectionId}
              limit={20}
              showHeader={false}
              className="border-none shadow-none p-0"
            />
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Purchase Modal */}
      {showPurchaseModal && selectedTokenId && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Confirm Purchase</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {purchaseType === 'collection' 
                  ? `You are about to purchase the entire Listing #${collection.id}.`
                  : `You are about to purchase Token #${selectedTokenId} from Listing #${collection.id}.`
                }
              </p>
              <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Item:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {purchaseType === 'collection' ? 'Entire Listing' : `Token #${selectedTokenId}`}
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
            setSelectedBidTokenPrice(0);
          }}
          onBidPlaced={handleBidPlaced}
          tokenId={selectedBidTokenId}
          tokenName={selectedBidTokenName}
          currentHighestBid={currentHighestBid}
          floorPrice={priceStats?.floorPrice || 0}
          tokenListingPrice={selectedBidTokenPrice}
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
            .map((token, index) => {
              const originalIndex = collection.evmCollectionTokens.findIndex(t => t.tokenId === token.tokenId);
              const plotNumber = originalIndex + 1;
              const plotName = `Plot ${plotNumber}`;
              
              return {
              tokenId: token.tokenId,
              tokenURI: token.tokenURI,
              listingPrice: token.listingPrice,
                metadata: {
                  ...tokenMetadataCache[token.tokenId],
                  name: plotName
                }
              };
            })}
          collectionName={formatCollectionName(collection.nftTitle)}
          collectionId={collection.collectionId}
        />
      )}
    </div>
  );
};

export default NFTCollectionDetailPage;
