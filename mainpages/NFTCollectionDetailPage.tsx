'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiExternalLink, FiInfo, FiMap, FiShoppingCart, FiTrendingUp, FiTrendingDown, FiTool, FiDollarSign, FiRefreshCw, FiChevronDown } from 'react-icons/fi';
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
import { useRouter } from 'next/navigation';

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
  // Use the actual deployed contract address from environment, falling back to the default.
  const deployedContractAddress = (
    process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS ||
    process.env.NFT_CONTRACT_ADDRESS ||
    PLATZ_LAND_NFT_ADDRESS
  ) as `0x${string}`;
  
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

  // State for description expansion
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState<boolean>(false);

  // State for fullscreen image modal
  const [showFullscreenImage, setShowFullscreenImage] = useState<boolean>(false);

  // Token metadata cache
  const [tokenMetadataCache, setTokenMetadataCache] = useState<Record<string, any>>({});

  // Web3 hooks
  const { address: connectedEvmAddress, isConnected: isEvmWalletConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const isClient = useIsClient();
  const { formatPriceWithConversion } = useCurrency();
  const { navigateToExplore } = usePreservedNavigation();

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
      // Log the contract addresses being used on the client-side for debugging
      console.log(`[NFTCollectionDetailPage Client] Using Contract Address: ${deployedContractAddress}`);
      console.log(`[NFTCollectionDetailPage Client] From env var: ${process.env.NFT_CONTRACT_ADDRESS}`);
      console.log(`[NFTCollectionDetailPage Client] Default from config: ${PLATZ_LAND_NFT_ADDRESS}`);
    fetchCollectionData();
    }
  }, [publicClient, isClient, collectionId, deployedContractAddress]);

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
      console.log(`[NFTCollectionDetailPage] Fetching collection data for ID: ${collectionId}`);
      
      // Instead of calling the smart contract directly, use the collections API
      // This avoids the "getCollection function not found" error
      const response = await fetch(`/api/collections`);
      const apiData = await response.json();
      
      if (!apiData.success) {
        throw new Error(apiData.error || "Failed to fetch collections");
      }
      
      // Find the specific collection by ID
      const collection = apiData.collections.find((c: any) => c.collectionId === collectionId);
      
      if (!collection) {
        throw new Error(`Collection ${collectionId} not found`);
      }
      
      console.log(`[NFTCollectionDetailPage] Found collection:`, collection);
      
      // Convert API data to the format expected by the component
      const collectionData: NFTCollection = {
        id: collection.id,
        nftTitle: collection.nftTitle || `Collection ${collectionId}`,
        nftDescription: collection.nftDescription || '',
        listingPrice: collection.listingPrice || 0,
        priceCurrency: collection.priceCurrency || 'ETH',
        nftImageFileRef: collection.nftImageFileRef || '',
        nftCollectionSize: collection.nftCollectionSize || 1,
        country: collection.country || '',
        state: collection.state || '',
        localGovernmentArea: collection.localGovernmentArea || '',
        propertyAreaSqm: collection.propertyAreaSqm || 0,
        latitude: collection.latitude || '',
        longitude: collection.longitude || '',
        contractAddress: collection.contractAddress || deployedContractAddress,
        collectionId: collection.collectionId,
        mainTokenId: collection.mainTokenId || '0',
        metadataUri: '',
        evmOwnerAddress: collection.creatorAddress || collection.user?.evmAddress || '',
        isListedForSale: !!(collection.listingPrice && collection.listingPrice > 0),
        listingPriceEth: collection.listingPrice ? parseFloat(collection.listingPrice.toString()) : 0,
        mintTransactionHash: collection.mintTransactionHash || '',
        mintTimestamp: collection.mintTimestamp || collection.createdAt,
        createdAt: collection.createdAt,
        user: collection.user || { id: '', username: 'Unknown', evmAddress: collection.creatorAddress || '' },
        evmCollectionTokens: []
      };
      
      // Fetch real token ownership data from blockchain instead of using mock data
      const collectionTokens: NFTCollection['evmCollectionTokens'] = [];
      const mainTokenId = parseInt(collection.mainTokenId || '0');
      const collectionSize = collection.nftCollectionSize || 1;
      
      console.log(`[NFTCollectionDetailPage] Fetching real ownership for ${collectionSize} tokens starting from ${mainTokenId}`);
      
      // Fetch real ownership for all tokens in the collection
      for (let i = 0; i < collectionSize; i++) {
        const tokenId = mainTokenId + i;
        
        try {
          // Try to get real ownership from blockchain
          let ownerAddress = collection.creatorAddress || collection.user?.evmAddress || '';
          
          // Attempt to fetch real ownership from the smart contract
          if (publicClient) {
            try {
              const realOwner = await publicClient.readContract({
                address: deployedContractAddress,
            abi: PlatzLandNFTABI,
            functionName: 'ownerOf',
                args: [BigInt(tokenId)],
              }) as `0x${string}`;
              
              if (realOwner && realOwner !== '0x0000000000000000000000000000000000000000') {
                ownerAddress = realOwner;
                console.log(`[NFTCollectionDetailPage] Token ${tokenId} real owner: ${realOwner}`);
              }
            } catch (ownerError) {
              console.warn(`[NFTCollectionDetailPage] Could not fetch owner for token ${tokenId}:`, ownerError);
              // Fall back to creator address
          }
        }
        
        collectionTokens.push({
          tokenId: tokenId.toString(),
            tokenURI: '',
          ownerAddress: ownerAddress,
            isListed: false, // All tokens start unlisted - no special main token treatment
            listingPrice: 0, // All tokens start with no listing price - no special main token treatment
          });
        } catch (tokenError) {
          console.error(`[NFTCollectionDetailPage] Error processing token ${tokenId}:`, tokenError);
          // Add token with fallback data
          collectionTokens.push({
            tokenId: tokenId.toString(),
            tokenURI: '',
            ownerAddress: collection.creatorAddress || collection.user?.evmAddress || '',
            isListed: false,
            listingPrice: 0,
          });
        }
      }
      
      collectionData.evmCollectionTokens = collectionTokens;
      
      setCollection(collectionData);
      
      // Fetch price statistics
      await fetchPriceStatistics();
      
      // Check user ownership if wallet is connected
      if (connectedEvmAddress) {
        await checkUserOwnership();
      }
      
    } catch (error: any) {
      console.error('[NFTCollectionDetailPage] Error fetching collection data:', error);
      setError(`Failed to load collection details: ${error.message}`);
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

  // Add missing refreshOwnershipFromBlockchain function
  const refreshOwnershipFromBlockchain = async () => {
    if (!collection || !publicClient) return;
    
    console.log('[NFTCollectionDetailPage] Refreshing ownership from blockchain...');
    
    try {
      const updatedTokens = [...collection.evmCollectionTokens];
      let hasUpdates = false;
      
      // Check ownership for each token directly from blockchain
      for (let i = 0; i < updatedTokens.length; i++) {
        const token = updatedTokens[i];
        try {
          const realOwner = await publicClient.readContract({
            address: deployedContractAddress,
            abi: PlatzLandNFTABI,
            functionName: 'ownerOf',
            args: [BigInt(token.tokenId)],
          }) as `0x${string}`;
          
          if (realOwner && realOwner !== '0x0000000000000000000000000000000000000000') {
            if (token.ownerAddress.toLowerCase() !== realOwner.toLowerCase()) {
              console.log(`[NFTCollectionDetailPage] Updated ownership for token ${token.tokenId}: ${token.ownerAddress} -> ${realOwner}`);
              updatedTokens[i] = { ...token, ownerAddress: realOwner };
              hasUpdates = true;
            }
          }
        } catch (error) {
          console.warn(`[NFTCollectionDetailPage] Could not refresh ownership for token ${token.tokenId}:`, error);
        }
      }
      
      // Update collection data if there are ownership changes
      if (hasUpdates) {
        setCollection(prev => prev ? { ...prev, evmCollectionTokens: updatedTokens } : prev);
        
        // Re-check user ownership with updated data
        if (connectedEvmAddress) {
          const ownedTokenIds = new Set<string>();
          updatedTokens.forEach(token => {
            if (token.ownerAddress && token.ownerAddress.toLowerCase() === connectedEvmAddress.toLowerCase()) {
            ownedTokenIds.add(String(token.tokenId));
          }
          });
          setOwnedTokenIds(ownedTokenIds);
        }
      }
    } catch (error) {
      console.error('[NFTCollectionDetailPage] Error refreshing ownership from blockchain:', error);
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
          args: [deployedContractAddress, tokenId],
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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.button
          onClick={navigateToExplore}
          className="inline-flex items-center text-white hover:text-cyber-accent mb-4 sm:mb-6 font-mono text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 group cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            whileHover={{ x: -5 }}
            transition={{ duration: 0.2 }}
          >
            <FiArrowLeft className="mr-1 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5" />
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
        
        <div className="flex flex-col lg:flex-row relative">
          <div className="w-full lg:w-1/3 h-48 sm:h-56 md:h-64 lg:h-auto bg-black/5 dark:bg-white/5 flex-shrink-0 rounded-t-cyber-lg lg:rounded-tl-cyber-lg lg:rounded-bl-cyber-lg lg:rounded-tr-none relative group">
            <NFTImage
              src={collection.nftImageFileRef || ''}
              alt={formatCollectionName(collection.nftTitle) || 'Listing Image'}
              className="w-full h-full object-cover"
              collectionId={collection.id}
              isMainToken={true}
              priority={true}
              dimensions={{ aspectRatio: '4/3' }}
              fallback="https://placehold.co/400x300/gray/white?text=Listing+Image"
            />
            {/* Fullscreen Button */}
            <motion.button
              onClick={() => setShowFullscreenImage(true)}
              className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white p-2 rounded-cyber opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title="View fullscreen"
            >
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" 
                />
              </svg>
            </motion.button>
          </div>
          <div className="p-4 sm:p-6 flex-1">
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-start">
              <div className="flex-1">
                <motion.h1 
                  className="text-lg sm:text-xl md:text-2xl font-bold text-text-light dark:text-text-dark mb-2 sm:mb-3 font-mono uppercase tracking-wider leading-tight"
                  style={{
                    textShadow: "0 0 20px rgba(0, 0, 0, 0.3)",
                  }}
                  animate={{
                    textShadow: [
                      "0 0 20px rgba(0, 0, 0, 0.3)",
                      "0 0 25px rgba(0, 0, 0, 0.5)",
                      "0 0 20px rgba(0, 0, 0, 0.3)",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {formatCollectionName(collection.nftTitle)}
                </motion.h1>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-4"
                >
                  {(() => {
                    const description = collection.nftDescription || 'No description provided';
                    const maxLength = 150; // Maximum characters to show in preview
                    const shouldTruncate = description.length > maxLength;
                    const displayDescription = shouldTruncate && !isDescriptionExpanded 
                      ? description.substring(0, maxLength) + '...' 
                      : description;

                    return (
                      <div>
                        <motion.p 
                          className="text-text-light/70 dark:text-text-dark/70 font-mono text-xs sm:text-sm md:text-base"
                          layout
                        >
                          {displayDescription}
                </motion.p>
                        {shouldTruncate && (
                          <motion.button
                            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                            className="mt-2 text-black dark:text-cyber-accent hover:text-black/80 dark:hover:text-cyber-accent/80 text-sm font-mono uppercase tracking-wider transition-all duration-300 inline-flex items-center"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                              textShadow: "0 0 10px rgba(0, 0, 0, 0.3)",
                            }}
                          >
                            {isDescriptionExpanded ? (
                              <>
                                <span>SHOW LESS</span>
                                <motion.div
                                  className="ml-1"
                                  animate={{ rotate: 180 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <FiChevronDown size={12} />
                                </motion.div>
                              </>
                            ) : (
                              <>
                                <span>SHOW MORE</span>
                                <motion.div
                                  className="ml-1"
                                  animate={{ rotate: 0 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <FiChevronDown size={12} />
                                </motion.div>
                              </>
                            )}
                          </motion.button>
                        )}
              </div>
                    );
                  })()}
                </motion.div>
              </div>
              <div className="text-center sm:text-right flex-shrink-0">
                {collection.isListedForSale && (
                  <motion.div 
                    className="text-xl sm:text-2xl font-bold text-text-light dark:text-text-dark font-mono"
                    style={{
                      textShadow: "0 0 15px rgba(0, 0, 0, 0.3)",
                    }}
                    animate={{
                      textShadow: [
                        "0 0 15px rgba(0, 0, 0, 0.3)",
                        "0 0 20px rgba(0, 0, 0, 0.5)",
                        "0 0 15px rgba(0, 0, 0, 0.3)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {formatPriceWithConversion(collection.listingPriceEth)}
                  </motion.div>
                )}
                {priceStats && !statsLoading && (
                  <motion.div 
                    className="flex items-center justify-center sm:justify-end mt-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {priceStats.priceChange24h >= 0 ? (
                      <FiTrendingUp className="text-green-600 dark:text-cyber-accent mr-1" size={14} />
                    ) : (
                      <FiTrendingDown className="text-red-500 dark:text-red-400 mr-1" size={14} />
                    )}
                    <span className={`text-xs sm:text-sm font-mono ${priceStats.priceChange24h >= 0 ? 'text-green-600 dark:text-cyber-accent' : 'text-red-500 dark:text-red-400'}`}>
                      {priceStats.priceChange24h >= 0 ? '+' : ''}{priceStats.priceChange24h.toFixed(2)}%
                    </span>
                    <span className="text-text-light/60 dark:text-text-dark/60 text-xs sm:text-sm ml-2 font-mono">24h</span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Market Statistics Section */}
            {priceStats && !statsLoading && (
              <motion.div 
                className="bg-black/5 dark:bg-white/5 rounded-cyber p-3 sm:p-4 mb-4 sm:mb-6 border border-black/10 dark:border-white/10 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.h3 
                  className="text-base sm:text-lg font-medium text-text-light dark:text-text-dark mb-2 sm:mb-3 font-mono uppercase tracking-wider"
                  style={{
                    textShadow: "0 0 10px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  MARKET STATISTICS
                </motion.h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <p className="text-xs sm:text-sm text-text-light/60 dark:text-text-dark/60 font-mono uppercase tracking-wider">Floor Price</p>
                    <p className="text-sm sm:text-base font-medium text-text-light dark:text-text-dark font-mono">
                      {formatPriceWithConversion(priceStats.floorPrice)}
                    </p>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <p className="text-xs sm:text-sm text-text-light/60 dark:text-text-dark/60 font-mono uppercase tracking-wider">24h Volume</p>
                    <p className="text-sm sm:text-base font-medium text-text-light dark:text-text-dark font-mono">
                      {formatPriceWithConversion(priceStats.volume24h)}
                    </p>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <p className="text-xs sm:text-sm text-text-light/60 dark:text-text-dark/60 font-mono uppercase tracking-wider">24h Sales</p>
                    <p className="text-sm sm:text-base font-medium text-text-light dark:text-text-dark font-mono">
                      {priceStats.sales24h}
                    </p>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <p className="text-xs sm:text-sm text-text-light/60 dark:text-text-dark/60 font-mono uppercase tracking-wider">Top Offer</p>
                    <p className="text-sm sm:text-base font-medium text-text-light dark:text-text-dark font-mono">
                      {priceStats.topOffer > 0 ? formatPriceWithConversion(priceStats.topOffer) : 'No offers'}
                    </p>
                  </motion.div>
                  </div>
              </motion.div>
            )}

            {/* Collection Information Grid */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <motion.div whileHover={{ scale: 1.02 }}>
                <p className="text-xs sm:text-sm text-text-light/60 dark:text-text-dark/60 font-mono uppercase tracking-wider">Location</p>
                <p className="text-sm sm:text-base font-medium text-text-light dark:text-text-dark font-mono">
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
                {collection.evmOwnerAddress ? (
                  <motion.a
                    href={`https://sepolia.etherscan.io/address/${collection.evmOwnerAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-medium text-black dark:text-white hover:text-black/80 dark:hover:text-cyber-accent transition-colors flex items-center font-mono"
                    whileHover={{ scale: 1.05 }}
                    style={{
                      textShadow: "0 0 10px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    {collection.user?.username 
                      ? `${collection.user.username} (${collection.evmOwnerAddress.substring(0, 6)}...${collection.evmOwnerAddress.substring(38)})` 
                      : `${collection.evmOwnerAddress.substring(0, 6)}...${collection.evmOwnerAddress.substring(38)}`
                    }
                    <FiExternalLink className="ml-1" size={14} />
                  </motion.a>
                ) : (
                  <p className="text-base font-medium text-text-light dark:text-text-dark truncate font-mono">
                    Unknown
                  </p>
                )}
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }}>
                <p className="text-sm text-text-light/60 dark:text-text-dark/60 font-mono uppercase tracking-wider">Contract</p>
                <motion.a
                  href={`https://sepolia.etherscan.io/token/${collection.contractAddress}`} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-medium text-black dark:text-white hover:text-black/80 dark:hover:text-cyber-accent transition-colors flex items-center font-mono"
                  whileHover={{ scale: 1.05 }}
                  style={{
                    textShadow: "0 0 10px rgba(0, 0, 0, 0.3)",
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
                className="px-6 py-3 bg-black dark:bg-cyber-accent hover:bg-black/80 dark:hover:bg-cyber-accent/80 text-white dark:text-black rounded-cyber flex items-center justify-center font-mono uppercase tracking-wider transition-all duration-300"
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(0, 0, 0, 0.5)" }}
                whileTap={{ scale: 0.95 }}
              >
                <FiDollarSign className="mr-2" /> PLACE BID
              </motion.button>
              
                {collection.evmCollectionTokens.some(token => token.isListed) && (
                <motion.button
                    onClick={() => setShowBatchPurchaseModal(true)}
                  className="px-6 py-3 bg-gray-200 dark:bg-white hover:bg-gray-300 dark:hover:bg-white/80 text-black rounded-cyber flex items-center justify-center font-mono uppercase tracking-wider transition-all duration-300"
                  whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(0, 0, 0, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  >
                  <FiShoppingCart className="mr-2" /> BUY MULTIPLE
                </motion.button>
                )}
              
              <motion.button
                onClick={handleManualRefresh}
                disabled={loading}
                className="px-4 py-3 bg-black hover:bg-gray-900 disabled:bg-gray-600 text-white rounded-cyber flex items-center justify-center font-mono uppercase tracking-wider transition-all duration-300 border border-black/20 dark:border-white/20"
                whileHover={{ scale: loading ? 1 : 1.05, boxShadow: loading ? "none" : "0 0 20px rgba(0, 0, 0, 0.3)" }}
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
        className="mb-4 sm:mb-6 border-b border-black/20 dark:border-white/20"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide">
          {[
            { key: 'tokens', label: `TOKENS (${collection.nftCollectionSize})`, mobileLabel: `TOKENS (${collection.nftCollectionSize})` },
            { key: 'details', label: 'PROPERTY DETAILS', mobileLabel: 'DETAILS' },
            { key: 'metadata', label: 'METADATA', mobileLabel: 'META' },
            { key: 'activity', label: 'ACTIVITY', mobileLabel: 'ACTIVITY' }
          ].map((tab) => (
          <motion.button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'tokens' | 'details' | 'metadata' | 'activity')}
            className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm font-mono uppercase tracking-wider transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.key
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-transparent text-text-light/60 dark:text-text-dark/60 hover:text-black dark:hover:text-white'
            }`}
            whileHover={{ scale: 1.05 }}
              style={activeTab === tab.key ? {
              textShadow: "0 0 15px rgba(0, 0, 0, 0.3)",
            } : {}}
          >
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.mobileLabel}</span>
          </motion.button>
          ))}
        </nav>
      </motion.div>

      {/* Tab Content */}
      <motion.div 
        className="border border-text-light/20 dark:border-text-dark/20 rounded-cyber-lg bg-primary-light/95 dark:bg-primary-dark/95 backdrop-blur-cyber p-3 sm:p-4 md:p-6 relative overflow-hidden"
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
              className="text-lg sm:text-xl font-semibold text-text-light dark:text-text-dark mb-3 sm:mb-4 font-mono uppercase tracking-wider"
              style={{
                textShadow: "0 0 15px rgba(0, 0, 0, 0.3)",
              }}
            >
              LISTED TOKENS
            </motion.h2>
            <motion.p 
              className="text-text-light/70 dark:text-text-dark/70 mb-4 sm:mb-6 font-mono text-sm sm:text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              This listing contains {collection.nftCollectionSize} NFT tokens representing ownership shares in the property.
            </motion.p>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
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
                  // Removed isMainToken - all tokens are equal
                  const isOwnedByUser = ownedTokenIds.has(String(token.tokenId));
                  
                  // Generate plot-based name using original index (so plot numbers stay consistent)
                  const plotNumber = originalIndex + 1;
                  const plotName = `Plot ${plotNumber}`;
                  
                  let imageUrl = tokenMetadata?.image || '';
                  if (!imageUrl && collection.nftImageFileRef) {
                    imageUrl = collection.nftImageFileRef;
                  }
                  
                  // Use collection image as fallback for all tokens
                  if (!imageUrl && collection.nftImageFileRef) {
                    imageUrl = collection.nftImageFileRef;
                  }
                  
                  // DEBUG: Log image URL issues
                  if (plotNumber <= 3 || !imageUrl) {
                    // Debug logging removed for cleaner console output
                  }
                  
                  const isMetadataLoading = tokenMetadata === undefined && 
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
                          ? 'border-black dark:border-cyber-accent bg-black/5 dark:bg-cyber-accent/10' 
                          : 'border-black/20 dark:border-white/20 hover:border-black/40 dark:hover:border-white/40'
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.4 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                    >
                      <div className="aspect-square bg-black/5 dark:bg-white/5 relative">
                        {isOwnedByUser && (
                          <motion.div 
                            className="absolute top-0 right-0 bg-black dark:bg-cyber-accent text-white dark:text-black text-xs font-medium px-2 py-1 rounded-bl z-10 font-mono uppercase tracking-wider"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3 }}
                          >
                            OWNED
                          </motion.div>
                        )}
                        {!isOwnedByUser && token.isListed && (
                          <motion.div 
                            className="absolute top-0 right-0 bg-gray-200 dark:bg-white text-black text-xs font-medium px-2 py-1 rounded-bl z-10 font-mono uppercase tracking-wider"
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
                          isMainToken={false} // All tokens are equal - no main token special treatment
                          lazy={true} // All tokens use lazy loading for better performance
                          priority={false} // All tokens have same priority
                          dimensions={{ aspectRatio: '1/1' }}
                          fallback="https://placehold.co/300x300/gray/white?text=No+Image"
                        />
                      </div>
                      <div className="p-2 sm:p-3">
                        <div className="flex justify-between items-start">
                          <motion.p 
                            className={`text-xs sm:text-sm font-medium font-mono ${
                            isOwnedByUser 
                                ? 'text-black dark:text-cyber-accent' 
                                : 'text-text-light dark:text-text-dark'
                            }`}
                            style={isOwnedByUser ? {
                              textShadow: "0 0 10px rgba(0, 0, 0, 0.3)",
                            } : {}}
                          >
                            {plotName}
                          </motion.p>
                          {token.listingPrice > 0 && !isOwnedByUser && (
                            <motion.p 
                              className="text-xs sm:text-sm font-bold text-text-light dark:text-text-dark font-mono"
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
                            ? 'text-black/70 dark:text-cyber-accent/70' 
                            : 'text-text-light/60 dark:text-text-dark/60'
                        }`}>
                          {isOwnedByUser 
                            ? 'You own this token' 
                            : `Owner: ${token.ownerAddress?.substring(0, 4)}...${token.ownerAddress?.substring(38)}`
                          }
                        </p>
                        <div className="mt-2 space-y-1">
                          {isOwnedByUser ? (
                          <div className="text-center py-1 sm:py-2">
                              <motion.p 
                                className="text-xs text-black dark:text-cyber-accent font-medium font-mono uppercase tracking-wider"
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
                                  className="w-full px-2 sm:px-3 py-1 bg-black dark:bg-cyber-accent hover:bg-black/80 dark:hover:bg-cyber-accent/80 text-white dark:text-black text-xs sm:text-sm rounded-cyber flex items-center justify-center font-mono uppercase tracking-wider transition-all duration-300"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <FiShoppingCart className="mr-1" size={10} /> BUY NOW
                                </motion.button>
                              )}
                              {isEvmWalletConnected && (
                                <motion.button
                                  onClick={() => handleBidOnToken(token.tokenId, plotName)}
                                  className="w-full px-2 sm:px-3 py-1 bg-gray-200 dark:bg-white hover:bg-gray-300 dark:hover:bg-white/80 text-black text-xs sm:text-sm rounded-cyber flex items-center justify-center font-mono uppercase tracking-wider transition-all duration-300"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <FiTool className="mr-1" size={10} /> PLACE BID
                                </motion.button>
                              )}
                              {!isEvmWalletConnected && (
                                <button
                                  disabled
                                  className="w-full px-2 sm:px-3 py-1 bg-gray-100 dark:bg-white/20 text-gray-400 dark:text-white/60 text-xs sm:text-sm rounded-cyber flex items-center justify-center cursor-not-allowed font-mono uppercase tracking-wider"
                                >
                                  <FiTool className="mr-1" size={10} /> CONNECT WALLET TO BID
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
                textShadow: "0 0 15px rgba(0, 0, 0, 0.3)",
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

      {/* Fullscreen Image Modal */}
      {showFullscreenImage && (
        <motion.div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => setShowFullscreenImage(false)}
        >
          <motion.div 
            className="relative max-w-full max-h-full"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <motion.button
              onClick={() => setShowFullscreenImage(false)}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-3 rounded-cyber backdrop-blur-sm z-10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title="Close fullscreen"
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </motion.button>
            
            {/* Fullscreen Image */}
            <NFTImage
              src={collection.nftImageFileRef || ''}
              alt={formatCollectionName(collection.nftTitle) || 'Listing Image'}
              className="max-w-full max-h-[90vh] object-contain rounded-cyber-lg"
              collectionId={collection.id}
              isMainToken={true}
              priority={true}
              fallback="https://placehold.co/800x600/gray/white?text=Listing+Image"
            />
            
            {/* Image Info */}
            <motion.div 
              className="absolute bottom-4 left-4 right-4 bg-black/50 text-white p-4 rounded-cyber backdrop-blur-sm"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="font-mono text-sm uppercase tracking-wider">
                {formatCollectionName(collection.nftTitle)}
              </p>
              <p className="font-mono text-xs text-white/70 mt-1">
                Collection #{collection.collectionId} • {collection.nftCollectionSize} NFTs
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default NFTCollectionDetailPage;
