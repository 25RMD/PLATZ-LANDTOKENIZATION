"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAccount, usePublicClient } from 'wagmi';
import { useAuth } from '@/context/AuthContext';
import { PLATZ_LAND_NFT_ADDRESS } from '@/config/contracts';
import { PlatzLandNFTABI } from '@/contracts/PlatzLandNFTABI';
import { FiGrid, FiSearch, FiFilter, FiChevronDown, FiChevronUp, FiClock, FiEye, FiExternalLink, FiTag, FiX, FiDollarSign, FiCheck, FiActivity, FiUser } from 'react-icons/fi';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import AnimatedButton from '@/components/common/AnimatedButton';
import PulsingDotsSpinner from '@/components/common/PulsingDotsSpinner';
import NFTImage from '@/components/nft/NFTImage';

// Interfaces
interface OwnedCollection {
  collectionId: string;
  mainTokenId: string;
  name: string;
  description: string;
  image: string;
  totalSupply: number;
  itemsOwned: number;
  listedItems: number;
  unlistedItems: number;
  floorPrice: number | null;
  totalValue: number;
  contractAddress: string | null;
  createdAt: Date;
  owner: {
    id: string;
    username: string | null;
    evmAddress: string | null;
  };
  listings: Array<{
    id: string;
    mainTokenId: string | null;
    isListed: boolean;
    listingPrice: number;
    createdAt: Date;
  }>;
  ownershipType?: 'TOKEN_OWNER' | 'COLLECTION_OWNER' | 'COLLECTION_CREATOR' | 'BOTH';
  userTokenCount?: number;
}

interface UserBid {
  id: string;
  bidAmount: number;
  bidStatus: 'ACTIVE' | 'ACCEPTED' | 'WITHDRAWN' | 'OUTBID';
  transactionHash: string;
  createdAt: string;
  landListing: {
    id: string;
    nftTitle: string | null;
    collectionId: string;
    nftImageFileRef: string | null;
  };
}

interface HistoryItem {
  id: string;
  type: 'BID_PLACED' | 'BID_RECEIVED' | 'BID_ACCEPTED' | 'BID_PLACED';
  status: string;
  amount: number;
  transactionHash: string | null;
  createdAt: string;
  updatedAt: string;
  description: string;
  landListing: {
    id: string;
    nftTitle: string | null;
    collectionId: string;
    nftImageFileRef: string | null;
  };
  isUserAction: boolean;
  bidder?: {
    id: string;
    username: string | null;
    evmAddress: string | null;
  };
  bidId?: string;
  fromAddress?: string;
  toAddress?: string;
}

interface HistoryResponse {
  success: boolean;
  history: HistoryItem[];
  summary: {
    totalBidsPlaced: number;
    totalBidsReceived: number;
    totalTransactions: number;
    activeBids: number;
    acceptedBids: number;
    withdrawnBids: number;
  };
}

interface BidAnalytics {
  totalBids: number;
  activeBids: number;
  acceptedBids: number;
  withdrawnBids: number;
  outbidCount: number;
  totalBidAmount: number;
  averageBidAmount: number;
  successRate: number;
}

type TabType = 'collections' | 'bids' | 'all-received-bids' | 'active-bids' | 'history';
type FilterType = 'all' | 'listed' | 'unlisted';
type SortType = 'name' | 'date' | 'tokenCount' | 'price';
type SortOrder = 'asc' | 'desc';

interface AllReceivedBid {
  id: string;
  bidAmount: number;
  bidStatus: 'ACTIVE' | 'ACCEPTED' | 'WITHDRAWN' | 'OUTBID';
  transactionHash: string;
  createdAt: string;
  userRole?: 'bidder' | 'listing_owner'; // User's role in this bid
  bidder: {
    id: string;
    username: string | null;
    evmAddress: string | null;
  };
  landListing: {
    id: string;
    nftTitle: string | null;
    collectionId: string;
    nftImageFileRef: string | null;
  };
}

interface ActiveReceivedBid {
  id: string;
  bidAmount: number;
  bidStatus: 'ACTIVE';
  transactionHash: string;
  createdAt: string;
  userRole?: 'bidder' | 'listing_owner'; // User's role in this bid
  bidder: {
    id: string;
    username: string | null;
    evmAddress: string | null;
  };
  landListing: {
    id: string;
    nftTitle: string | null;
    collectionId: string;
    nftImageFileRef: string | null;
  };
}

interface AllReceivedBidAnalytics {
  totalReceived: number;
  activeReceived: number;
  acceptedReceived: number;
  withdrawnReceived: number;
  outbidReceived: number;
  totalValue: number;
  averageBidValue: number;
  uniqueBidders: number;
}

interface ActiveBidAnalytics {
  totalActive: number;
  totalValue: number;
  averageBidValue: number;
  uniqueBidders: number;
  highestBid: number;
}

const OrdersPage: React.FC = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const publicClient = usePublicClient();

  // State management
  const [activeTab, setActiveTab] = useState<TabType>('collections');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data state
  const [ownedCollections, setOwnedCollections] = useState<OwnedCollection[]>([]);
  const [userBids, setUserBids] = useState<UserBid[]>([]);
  const [allReceivedBids, setAllReceivedBids] = useState<AllReceivedBid[]>([]);
  const [activeBids, setActiveBids] = useState<ActiveReceivedBid[]>([]);
  const [bidHistory, setBidHistory] = useState<HistoryItem[]>([]);
  const [historySummary, setHistorySummary] = useState<HistoryResponse['summary'] | null>(null);
  const [bidAnalytics, setBidAnalytics] = useState<BidAnalytics | null>(null);
  const [allReceivedBidAnalytics, setAllReceivedBidAnalytics] = useState<AllReceivedBidAnalytics | null>(null);
  const [activeBidAnalytics, setActiveBidAnalytics] = useState<ActiveBidAnalytics | null>(null);
  
  // Search and filtering
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Calculate bid analytics
  const calculateBidAnalytics = useCallback((bids: UserBid[]) => {
    if (bids.length === 0) {
      setBidAnalytics(null);
      return;
    }

    const analytics: BidAnalytics = {
      totalBids: bids.length,
      activeBids: bids.filter(bid => bid.bidStatus === 'ACTIVE').length,
      acceptedBids: bids.filter(bid => bid.bidStatus === 'ACCEPTED').length,
      withdrawnBids: bids.filter(bid => bid.bidStatus === 'WITHDRAWN').length,
      outbidCount: bids.filter(bid => bid.bidStatus === 'OUTBID').length,
      totalBidAmount: bids.reduce((sum, bid) => sum + bid.bidAmount, 0),
      averageBidAmount: bids.reduce((sum, bid) => sum + bid.bidAmount, 0) / bids.length,
      successRate: bids.length > 0 ? (bids.filter(bid => bid.bidStatus === 'ACCEPTED').length / bids.length) * 100 : 0
    };

    setBidAnalytics(analytics);
  }, []);

  // Calculate all received bid analytics
  const calculateAllReceivedBidAnalytics = useCallback((bids: AllReceivedBid[]) => {
    if (bids.length === 0) {
      setAllReceivedBidAnalytics(null);
      return;
    }

    const uniqueBidders = new Set(bids.map(bid => bid.bidder.evmAddress).filter(Boolean)).size;

    const analytics: AllReceivedBidAnalytics = {
      totalReceived: bids.length,
      activeReceived: bids.filter(bid => bid.bidStatus === 'ACTIVE').length,
      acceptedReceived: bids.filter(bid => bid.bidStatus === 'ACCEPTED').length,
      withdrawnReceived: bids.filter(bid => bid.bidStatus === 'WITHDRAWN').length,
      outbidReceived: bids.filter(bid => bid.bidStatus === 'OUTBID').length,
      totalValue: bids.reduce((sum, bid) => sum + bid.bidAmount, 0),
      averageBidValue: bids.reduce((sum, bid) => sum + bid.bidAmount, 0) / bids.length,
      uniqueBidders
    };

    setAllReceivedBidAnalytics(analytics);
  }, []);

  // Calculate active bid analytics
  const calculateActiveBidAnalytics = useCallback((bids: ActiveReceivedBid[]) => {
    if (bids.length === 0) {
      setActiveBidAnalytics(null);
      return;
    }

    const uniqueBidders = new Set(bids.map(bid => bid.bidder.evmAddress).filter(Boolean)).size;
    const bidAmounts = bids.map(bid => bid.bidAmount);

    const analytics: ActiveBidAnalytics = {
      totalActive: bids.length,
      totalValue: bids.reduce((sum, bid) => sum + bid.bidAmount, 0),
      averageBidValue: bids.reduce((sum, bid) => sum + bid.bidAmount, 0) / bids.length,
      uniqueBidders,
      highestBid: Math.max(...bidAmounts)
    };

    setActiveBidAnalytics(analytics);
  }, []);

  // Fetch user bids
  const fetchUserBids = useCallback(async () => {
    if (!isConnected || !connectedAddress) {
      return;
    }

    try {
      console.log('Fetching user bids...');
      const response = await fetch(`/api/bids?userAddress=${connectedAddress}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.bids) {
          setUserBids(data.bids);
          console.log(`Found ${data.bids.length} bids for user`);
          calculateBidAnalytics(data.bids);
        }
      } else {
        console.error('Failed to fetch user bids:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching user bids:', error);
    }
  }, [isConnected, connectedAddress, calculateBidAnalytics]);

  // Fetch bid history
  const fetchBidHistory = useCallback(async () => {
    if (!isConnected || !connectedAddress) {
      return;
    }

    try {
      console.log('Fetching bid history...');
      const response = await fetch(`/api/bids/history?userAddress=${connectedAddress}`);
      
      if (response.ok) {
        const data: HistoryResponse = await response.json();
        if (data.success) {
          setBidHistory(data.history);
          setHistorySummary(data.summary);
          console.log(`Found ${data.history.length} history items for user`);
        }
      } else {
        console.error('Failed to fetch bid history:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching bid history:', error);
    }
  }, [isConnected, connectedAddress]);

  // Fetch user owned collections
  const scanUserNFTs = useCallback(async () => {
    if (!isConnected || !connectedAddress) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[ORDERS] Fetching user owned collections for:', connectedAddress);
      const response = await fetch(`/api/collections/user-owned?userAddress=${connectedAddress}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[ORDERS] API response:', { success: data.success, collectionsCount: data.collections?.length });
        if (data.success && data.collections) {
          setOwnedCollections(data.collections);
          console.log(`[ORDERS] Set ${data.collections.length} owned collections in state`);
        } else {
          console.error('[ORDERS] Failed to fetch owned collections:', data.error);
          setOwnedCollections([]);
        }
      } else {
        console.error('[ORDERS] Failed to fetch owned collections:', response.statusText);
        setOwnedCollections([]);
      }
    } catch (err: any) {
      console.error('[ORDERS] Error scanning NFTs:', err);
      setError(err.message || 'Failed to scan NFTs');
      setOwnedCollections([]);
    } finally {
      setLoading(false);
    }
  }, [isConnected, connectedAddress]);

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Handle withdraw bid
  const handleWithdrawBid = async (bid: UserBid) => {
    if (!connectedAddress) {
      toast.error('Please connect your wallet');
      return;
    }

    // Show loading toast
    const loadingToastId = toast.loading('Processing bid withdrawal...');

    try {
      const response = await fetch(`/api/bids/${bid.id}/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: connectedAddress,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Dismiss loading toast
        toast.dismiss(loadingToastId);
        
        // Show detailed success toast
        const tokenName = bid.landListing.nftTitle || `Token #${bid.tokenId}`;
        
        toast.success(
          `✅ Bid Withdrawn Successfully!\n` +
          `• Token: ${tokenName}\n` +
          `• Amount: ${bid.bidAmount} ETH\n` +
          `• Your funds have been returned`,
          {
            duration: 6000,
            style: {
              minWidth: '300px',
              whiteSpace: 'pre-line'
            }
          }
        );

        fetchUserBids(); // Refresh bids
        fetchBidHistory(); // Refresh history
      } else {
        // Dismiss loading toast
        toast.dismiss(loadingToastId);
        
        toast.error(
          `❌ Withdrawal Failed\n${data.error || 'Failed to withdraw bid'}`,
          {
            duration: 6000,
            style: {
              minWidth: '300px',
              whiteSpace: 'pre-line'
            }
          }
        );
      }
    } catch (error) {
      // Dismiss loading toast
      toast.dismiss(loadingToastId);
      
      console.error('Error withdrawing bid:', error);
      toast.error(
        `❌ Network Error\nFailed to process bid withdrawal. Please try again.`,
        {
          duration: 6000,
          style: {
            minWidth: '300px',
            whiteSpace: 'pre-line'
          }
        }
      );
    }
  };

  // Handle reject bid
  const handleRejectBid = async (bid: AllReceivedBid | ActiveReceivedBid) => {
    if (!connectedAddress) {
      toast.error('Please connect your wallet');
      return;
    }

    // Show loading toast
    const loadingToastId = toast.loading('Processing bid rejection...');

    try {
      const response = await fetch(`/api/bids/${bid.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: connectedAddress,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Dismiss loading toast
        toast.dismiss(loadingToastId);
        
        // Show detailed success toast
        const bidderName = bid.bidder.username || `${bid.bidder.evmAddress?.slice(0, 6)}...${bid.bidder.evmAddress?.slice(-4)}`;
        const tokenName = bid.landListing.nftTitle || `Token #${bid.tokenId}`;
        
        toast.success(
          `🚫 Bid Rejected Successfully!\n` +
          `• Token: ${tokenName}\n` +
          `• Amount: ${bid.bidAmount} ETH\n` +
          `• Bidder: ${bidderName}\n` +
          `• Bidder's funds have been returned`,
          {
            duration: 6000,
            style: {
              minWidth: '350px',
              whiteSpace: 'pre-line'
            }
          }
        );

        fetchAllReceivedBids(); // Refresh all received bids
        fetchActiveBids(); // Refresh active bids
        fetchBidHistory(); // Refresh history
      } else {
        // Dismiss loading toast
        toast.dismiss(loadingToastId);
        
        toast.error(
          `❌ Rejection Failed\n${data.message || 'Failed to reject bid'}`,
          {
            duration: 6000,
            style: {
              minWidth: '300px',
              whiteSpace: 'pre-line'
            }
          }
        );
      }
    } catch (error) {
      // Dismiss loading toast
      toast.dismiss(loadingToastId);
      
      console.error('Error rejecting bid:', error);
      toast.error(
        `❌ Network Error\nFailed to process bid rejection. Please try again.`,
        {
          duration: 6000,
          style: {
            minWidth: '300px',
            whiteSpace: 'pre-line'
          }
        }
      );
    }
  };

  // Handle accept bid (updated to refresh both sections)
  const handleAcceptBid = async (bid: AllReceivedBid | ActiveReceivedBid) => {
    if (!connectedAddress) {
      toast.error('Please connect your wallet');
      return;
    }

    // Show loading toast
    const loadingToastId = toast.loading('Processing bid acceptance...');

    try {
      const response = await fetch(`/api/bids/${bid.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'ACCEPTED',
          userAddress: connectedAddress,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Dismiss loading toast
        toast.dismiss(loadingToastId);
        
        // Show detailed success toast with bid information
        const bidderName = bid.bidder.username || `${bid.bidder.evmAddress?.slice(0, 6)}...${bid.bidder.evmAddress?.slice(-4)}`;
        const tokenName = bid.landListing.nftTitle || `Token #${bid.tokenId}`;
        
        toast.success(
          `🎉 Bid Accepted Successfully!\n` +
          `• Token: ${tokenName}\n` +
          `• Amount: ${bid.bidAmount} ETH\n` +
          `• Buyer: ${bidderName}` +
          (data.transactionHash ? `\n• Transaction: ${data.transactionHash.slice(0, 10)}...` : ''),
          {
            duration: 8000, // Show for 8 seconds
            style: {
              minWidth: '350px',
              whiteSpace: 'pre-line'
            }
          }
        );

        // If transaction hash is available, show a separate toast with link to view transaction
        if (data.transactionHash) {
          setTimeout(() => {
            toast.success(
              <div className="flex flex-col space-y-2">
                <span>NFT ownership transferred successfully!</span>
                <a
                  href={`https://sepolia.etherscan.io/tx/${data.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline text-sm"
                >
                  View transaction on Etherscan →
                </a>
              </div>,
              {
                duration: 10000,
                style: { minWidth: '300px' }
              }
            );
          }, 1000);
        }

        fetchAllReceivedBids(); // Refresh all received bids
        fetchActiveBids(); // Refresh active bids
        fetchUserBids(); // Also refresh user bids in case they have any
        fetchBidHistory(); // Refresh history
      } else {
        // Dismiss loading toast
        toast.dismiss(loadingToastId);
        
        // Show detailed error message
        const errorMessage = data.message || 'Failed to accept bid';
        toast.error(
          `❌ Bid Acceptance Failed\n${errorMessage}`,
          {
            duration: 6000,
            style: {
              minWidth: '300px',
              whiteSpace: 'pre-line'
            }
          }
        );
      }
    } catch (error) {
      // Dismiss loading toast
      toast.dismiss(loadingToastId);
      
      console.error('Error accepting bid:', error);
      toast.error(
        `❌ Network Error\nFailed to process bid acceptance. Please try again.`,
        {
          duration: 6000,
          style: {
            minWidth: '300px',
            whiteSpace: 'pre-line'
          }
        }
      );
    }
  };

  // Fetch all received bids (regardless of current ownership)
  const fetchAllReceivedBids = useCallback(async () => {
    if (!isConnected || !connectedAddress) {
      return;
    }

    try {
      console.log('Fetching all received bids...');
              const response = await fetch(`/api/bids/received?userAddress=${connectedAddress}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.bids) {
          setAllReceivedBids(data.bids);
          console.log(`Found ${data.bids.length} total bids received on user's listings`);
          calculateAllReceivedBidAnalytics(data.bids);
        }
      } else {
        console.error('Failed to fetch all received bids:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching all received bids:', error);
    }
  }, [isConnected, connectedAddress, calculateAllReceivedBidAnalytics]);

  // Fetch active bids (only on current listings)
  const fetchActiveBids = useCallback(async () => {
    if (!isConnected || !connectedAddress) {
      return;
    }

    try {
      console.log('Fetching active bids...');
      const response = await fetch(`/api/bids/active?userAddress=${connectedAddress}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.bids) {
          setActiveBids(data.bids);
          console.log(`Found ${data.bids.length} active bids on user's current listings`);
          calculateActiveBidAnalytics(data.bids);
        }
      } else {
        console.error('Failed to fetch active bids:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching active bids:', error);
    }
  }, [isConnected, connectedAddress, calculateActiveBidAnalytics]);

  // Filter and sort data
  const filteredAndSortedData = useCallback(() => {
    if (activeTab === 'collections') {
      let filtered = ownedCollections.filter(collection => {
        const searchLower = searchTerm.toLowerCase();
        return collection.name.toLowerCase().includes(searchLower) ||
               collection.description.toLowerCase().includes(searchLower) ||
               collection.collectionId.toLowerCase().includes(searchLower);
      });

      if (filterType === 'listed') {
        filtered = filtered.filter(collection => collection.listedItems > 0);
      } else if (filterType === 'unlisted') {
        filtered = filtered.filter(collection => collection.listedItems === 0);
      }

      filtered.sort((a, b) => {
        let comparison = 0;
        switch (sortType) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'date':
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
          case 'tokenCount':
            comparison = a.itemsOwned - b.itemsOwned;
            break;
          case 'price':
            comparison = (a.floorPrice || 0) - (b.floorPrice || 0);
            break;
          default:
            comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });

      return filtered;
    }

    if (activeTab === 'bids') {
      let filtered = userBids.filter(bid => {
        const searchLower = searchTerm.toLowerCase();
        return bid.landListing.nftTitle?.toLowerCase().includes(searchLower) ||
               bid.bidStatus.toLowerCase().includes(searchLower);
      });

      if (filterType === 'listed') {
        filtered = filtered.filter(bid => bid.bidStatus === 'ACTIVE');
      } else if (filterType === 'unlisted') {
        filtered = filtered.filter(bid => bid.bidStatus !== 'ACTIVE');
      }

      filtered.sort((a, b) => {
        let comparison = 0;
        switch (sortType) {
          case 'name':
            comparison = (a.landListing.nftTitle || '').localeCompare(b.landListing.nftTitle || '');
            break;
          case 'date':
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
          case 'price':
            comparison = a.bidAmount - b.bidAmount;
            break;
          default:
            comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });

      return filtered;
    }

    if (activeTab === 'all-received-bids') {
      let filtered = allReceivedBids.filter(bid => {
        const searchLower = searchTerm.toLowerCase();
        return (bid.landListing.nftTitle?.toLowerCase().includes(searchLower)) ||
               (bid.bidder.username?.toLowerCase().includes(searchLower)) ||
               (bid.bidder.evmAddress?.toLowerCase().includes(searchLower)) ||
               bid.bidStatus.toLowerCase().includes(searchLower);
      });

      if (filterType === 'listed') {
        filtered = filtered.filter(bid => bid.bidStatus === 'ACTIVE');
      } else if (filterType === 'unlisted') {
        filtered = filtered.filter(bid => bid.bidStatus !== 'ACTIVE');
      }

      filtered.sort((a, b) => {
        let comparison = 0;
        switch (sortType) {
          case 'name':
            comparison = (a.landListing.nftTitle || '').localeCompare(b.landListing.nftTitle || '');
            break;
          case 'date':
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
          case 'price':
            comparison = a.bidAmount - b.bidAmount;
            break;
          default:
            comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });

      return filtered;
    }

    if (activeTab === 'active-bids') {
      let filtered = activeBids.filter(bid => {
        const searchLower = searchTerm.toLowerCase();
        return (bid.landListing.nftTitle?.toLowerCase().includes(searchLower)) ||
               (bid.bidder.username?.toLowerCase().includes(searchLower)) ||
               (bid.bidder.evmAddress?.toLowerCase().includes(searchLower));
      });

      filtered.sort((a, b) => {
        let comparison = 0;
        switch (sortType) {
          case 'name':
            comparison = (a.landListing.nftTitle || '').localeCompare(b.landListing.nftTitle || '');
            break;
          case 'date':
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
          case 'price':
            comparison = a.bidAmount - b.bidAmount;
            break;
          default:
            comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });

      return filtered;
    }

    if (activeTab === 'history') {
      let filtered = bidHistory.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        return item.description.toLowerCase().includes(searchLower) ||
               item.landListing.nftTitle?.toLowerCase().includes(searchLower) ||
               item.type.toLowerCase().includes(searchLower) ||
               item.status.toLowerCase().includes(searchLower);
      });

      if (filterType === 'listed') {
        filtered = filtered.filter(item => item.status === 'ACTIVE' || item.status === 'COMPLETED');
      } else if (filterType === 'unlisted') {
        filtered = filtered.filter(item => item.status !== 'ACTIVE' && item.status !== 'COMPLETED');
      }

      filtered.sort((a, b) => {
        let comparison = 0;
        switch (sortType) {
          case 'name':
            comparison = (a.landListing.nftTitle || '').localeCompare(b.landListing.nftTitle || '');
            break;
          case 'date':
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
          case 'price':
            comparison = a.amount - b.amount;
            break;
          default:
            comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });

      return filtered;
    }

    // For other tabs that aren't implemented yet
    return [];
  }, [activeTab, ownedCollections, userBids, allReceivedBids, activeBids, bidHistory, searchTerm, filterType, sortType, sortOrder]);

  // Initial data fetch
  useEffect(() => {
    if (isConnected && connectedAddress && !authLoading) {
      console.log('[ORDERS] Fetching data for user:', connectedAddress);
      scanUserNFTs();
      fetchUserBids();
      fetchAllReceivedBids();
      fetchActiveBids();
      fetchBidHistory();
    } else {
      console.log('[ORDERS] Not fetching data:', { isConnected, connectedAddress, authLoading });
    }
  }, [isConnected, connectedAddress, authLoading]);

  const filteredData = filteredAndSortedData();
  
  // Debug logging
  console.log('[ORDERS] Render state:', {
    activeTab,
    isConnected,
    connectedAddress,
    authLoading,
    loading,
    error,
    ownedCollectionsLength: ownedCollections.length,
    filteredDataLength: filteredData.length
  });

  // Render loading state
  if (authLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)]">
        <PulsingDotsSpinner size={48} />
      </div>
    );
  }

  // Render not connected state
  if (!isConnected) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Connect Your Wallet
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Please connect your wallet to view your orders and bids.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] sm:min-h-[calc(100vh-96px)] container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
      {/* Tab Header - Cyberpunk Styling */}
      <div className="bg-secondary-light dark:bg-secondary-dark rounded-cyber-lg border border-black/10 dark:border-white/10 p-4 mb-6 cyber-grid backdrop-blur-cyber">
        <nav className="flex flex-wrap gap-2">
          {[
            { key: 'collections', label: 'My Collections', icon: FiGrid },
            { key: 'bids', label: 'My Bids', icon: FiTag },
            { key: 'all-received-bids', label: 'All Received Bids', icon: FiActivity },
            { key: 'active-bids', label: 'Active Received Bids', icon: FiUser },
            { key: 'history', label: 'History', icon: FiClock }
          ].map(({ key, label, icon: Icon }) => (
        <button
              key={key}
              onClick={() => setActiveTab(key as TabType)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-cyber text-sm font-mono transition-all duration-300
                ${activeTab === key 
                  ? 'bg-cyber-accent/20 text-cyber-accent border border-cyber-accent/30 shadow-lg scale-105' 
                  : 'text-text-light dark:text-text-dark hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-black/10 dark:hover:border-white/10'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {label}
        </button>
          ))}
        </nav>
      </div>

      {/* Search and Filters - Cyber Enhanced */}
      <div className="bg-secondary-light dark:bg-secondary-dark rounded-cyber-lg border border-black/10 dark:border-white/10 p-4 mb-6 cyber-grid backdrop-blur-cyber">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative group">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light dark:text-text-dark opacity-50 w-4 h-4" />
          <input
            type="text"
              placeholder="Search by name, collection ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-transparent border border-black/10 dark:border-white/10 rounded-cyber text-text-light dark:text-text-dark placeholder:text-text-light placeholder:dark:text-text-dark placeholder:opacity-50 focus:outline-none focus:border-cyber-accent focus:ring-2 focus:ring-cyber-accent/20 transition-all duration-300 font-mono"
          />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyber-glow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-cyber pointer-events-none" />
      </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-cyber text-text-light dark:text-text-dark hover:bg-black/10 dark:hover:bg-white/10 hover:border-cyber-accent/30 transition-all duration-300 font-mono group"
          >
            <FiFilter className="w-4 h-4 group-hover:text-cyber-accent transition-colors duration-300" />
            Filters
            {showFilters ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-black/10 dark:border-white/10"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Filter Type */}
              <div className="group">
                <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2 font-mono">Status Filter</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                  className="w-full px-3 py-2 bg-transparent border border-black/10 dark:border-white/10 rounded-cyber text-text-light dark:text-text-dark focus:outline-none focus:border-cyber-accent focus:ring-2 focus:ring-cyber-accent/20 transition-all duration-300 font-mono"
                >
                  <option value="all">All Items</option>
                  <option value="listed">Listed Only</option>
                  <option value="unlisted">Unlisted Only</option>
              </select>
            </div>

            {/* Sort Type */}
              <div className="group">
                <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2 font-mono">Sort By</label>
              <select
                value={sortType}
                onChange={(e) => setSortType(e.target.value as SortType)}
                  className="w-full px-3 py-2 bg-transparent border border-black/10 dark:border-white/10 rounded-cyber text-text-light dark:text-text-dark focus:outline-none focus:border-cyber-accent focus:ring-2 focus:ring-cyber-accent/20 transition-all duration-300 font-mono"
              >
                <option value="name">Name</option>
                  <option value="date">Date Created</option>
                  <option value="tokenCount">Token Count</option>
                <option value="price">Price</option>
              </select>
            </div>

            {/* Sort Order */}
              <div className="group">
                <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2 font-mono">Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  className="w-full px-3 py-2 bg-transparent border border-black/10 dark:border-white/10 rounded-cyber text-text-light dark:text-text-dark focus:outline-none focus:border-cyber-accent focus:ring-2 focus:ring-cyber-accent/20 transition-all duration-300 font-mono"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
          </motion.div>
        )}
      </div>

      {/* Content */}
      {loading && filteredData.length === 0 ? (
        <div className="flex flex-col justify-center items-center min-h-[calc(100vh-400px)]">
          <div className="text-center">
            <PulsingDotsSpinner size={48} />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Error</h3>
            <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
            <button
              onClick={scanUserNFTs}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 dark:text-gray-600 mb-4">
            <FiGrid size={64} className="mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No {activeTab} found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm 
              ? `No ${activeTab} match your search criteria.`
              : activeTab === 'all-received-bids' 
                ? "You haven't received any bids on your listings yet."
                : activeTab === 'active-bids'
                ? "No active bids on your current listings."
                : activeTab === 'bids'
                ? "You haven't made any bids yet."
                : activeTab === 'history'
                ? "No bid history found. Start bidding to see your activity here."
                : activeTab === 'collections'
                ? "You don't own any collections yet."
                : `No ${activeTab} found.`
            }
          </p>
          {activeTab === 'collections' && (
            <Link
              href="/explore"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Explore Collections
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredData.map((item) => (
            activeTab === 'collections' ? (
              <CollectionCard
                key={`collection-${(item as OwnedCollection).collectionId}`}
                collection={item as OwnedCollection}
                formatTimeAgo={formatTimeAgo}
              />
            ) : activeTab === 'bids' ? (
              <BidCard
                key={`bid-${(item as UserBid).id}`}
                bid={item as UserBid}
                formatTimeAgo={formatTimeAgo}
                onWithdrawBid={handleWithdrawBid}
              />
            ) : activeTab === 'all-received-bids' ? (
              <AllReceivedBidCard
                key={`all-received-bid-${(item as AllReceivedBid).id}`}
                bid={item as AllReceivedBid}
                formatTimeAgo={formatTimeAgo}
                onAcceptBid={handleAcceptBid}
                onRejectBid={handleRejectBid}
              />
            ) : activeTab === 'active-bids' ? (
              <ActiveBidCard
                key={`active-bid-${(item as ActiveReceivedBid).id}`}
                bid={item as ActiveReceivedBid}
                formatTimeAgo={formatTimeAgo}
                onAcceptBid={handleAcceptBid}
                onRejectBid={handleRejectBid}
              />
            ) : activeTab === 'history' ? (
              <HistoryCard
                key={`history-${(item as HistoryItem).id}`}
                historyItem={item as HistoryItem}
                formatTimeAgo={formatTimeAgo}
              />
            ) : null
          ))}
        </div>
      )}
    </div>
  );
};

// Bid Card Component
interface BidCardProps {
  bid: UserBid;
  formatTimeAgo: (date: Date) => string;
  onWithdrawBid: (bid: UserBid) => Promise<void>;
}

const BidCard: React.FC<BidCardProps> = ({ bid, formatTimeAgo, onWithdrawBid }) => {
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    try {
      await onWithdrawBid(bid);
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-secondary-light dark:bg-secondary-dark border border-black/10 dark:border-white/10 rounded-cyber-lg p-4 shadow-xl hover:shadow-2xl transition-all duration-500 group cyber-grid backdrop-blur-cyber"
    >
      {/* Cyber scan line effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-cyber-lg overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyber-glow/10 to-transparent w-full h-full animate-cyber-scan" />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-text-light dark:text-text-dark mb-1 font-mono text-lg">
              {bid.landListing.nftTitle || `Collection ${bid.landListing.collectionId}`}
            </h3>
            <p className="text-sm text-text-light dark:text-text-dark opacity-60 font-mono">
              Bid ID: {bid.id.slice(0, 8)}...
            </p>
          </div>
          
          {/* Bid Amount with cyber styling */}
          <div className="text-right">
            <div className="text-lg font-bold text-cyber-accent font-mono">
              {bid.bidAmount} ETH
          </div>
            <div className={`text-xs px-2 py-1 rounded-cyber font-mono ${
              bid.bidStatus === 'ACTIVE' ? 'bg-success-minimal/20 text-success-minimal' :
              bid.bidStatus === 'ACCEPTED' ? 'bg-cyber-accent/20 text-cyber-accent' :
              bid.bidStatus === 'WITHDRAWN' ? 'bg-warning-minimal/20 text-warning-minimal' :
              'bg-error-minimal/20 text-error-minimal'
          }`}>
            {bid.bidStatus}
            </div>
          </div>
        </div>

        {/* NFT Image with hover effects */}
        <div className="mb-3 relative overflow-hidden rounded-cyber group">
          <NFTImage
            imageRef={bid.landListing.nftImageFileRef}
            alt={bid.landListing.nftTitle || 'NFT'}
            className="w-full h-32 object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Metadata */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm font-mono">
            <span className="text-text-light dark:text-text-dark opacity-60">Transaction</span>
            <a
              href={`https://etherscan.io/tx/${bid.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyber-accent hover:text-cyber-glow flex items-center gap-1 transition-colors duration-300"
            >
              {bid.transactionHash.slice(0, 8)}...
              <FiExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="flex justify-between text-sm font-mono">
            <span className="text-text-light dark:text-text-dark opacity-60">Placed</span>
            <span className="text-text-light dark:text-text-dark">
              {formatTimeAgo(new Date(bid.createdAt))}
            </span>
          </div>
          </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Link
            href={`/collections/${bid.landListing.collectionId}`}
            className="flex-1 px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-cyber text-center text-text-light dark:text-text-dark hover:bg-black/10 dark:hover:bg-white/10 hover:border-cyber-accent/30 transition-all duration-300 font-mono text-sm group"
          >
            <FiEye className="inline w-4 h-4 mr-1 group-hover:text-cyber-accent transition-colors duration-300" />
            View
          </Link>
          
          {bid.bidStatus === 'ACTIVE' && (
            <button
              onClick={handleWithdraw}
              disabled={isWithdrawing}
              className="flex-1 px-3 py-2 bg-error-minimal/10 border border-error-minimal/30 rounded-cyber text-error-minimal hover:bg-error-minimal/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-mono text-sm"
            >
              {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// All Received Bid Card Component
interface AllReceivedBidCardProps {
  bid: AllReceivedBid;
  formatTimeAgo: (date: Date) => string;
  onAcceptBid: (bid: AllReceivedBid) => Promise<void>;
  onRejectBid?: (bid: AllReceivedBid) => Promise<void>;
}

const AllReceivedBidCard: React.FC<AllReceivedBidCardProps> = ({ bid, formatTimeAgo, onAcceptBid, onRejectBid }) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await onAcceptBid(bid);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReject = async () => {
    if (!onRejectBid) return;
    setIsRejecting(true);
    try {
      await onRejectBid(bid);
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-secondary-light dark:bg-secondary-dark border border-black/10 dark:border-white/10 rounded-cyber-lg p-4 shadow-xl hover:shadow-2xl transition-all duration-500 group cyber-grid backdrop-blur-cyber"
    >
      {/* Cyber scan line effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-cyber-lg overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyber-glow/10 to-transparent w-full h-full animate-cyber-scan" />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-text-light dark:text-text-dark mb-1 font-mono text-lg">
              {bid.landListing.nftTitle || `Collection ${bid.landListing.collectionId}`}
            </h3>
            <p className="text-sm text-text-light dark:text-text-dark opacity-60 font-mono">
              From: {bid.bidder.username || `${bid.bidder.evmAddress?.slice(0, 8)}...`}
            </p>
          </div>
          
          {/* Bid Amount with cyber styling */}
          <div className="text-right">
            <div className="text-lg font-bold text-cyber-accent font-mono">
              {bid.bidAmount} ETH
          </div>
            <div className={`text-xs px-2 py-1 rounded-cyber font-mono ${
              bid.bidStatus === 'ACTIVE' ? 'bg-success-minimal/20 text-success-minimal' :
              bid.bidStatus === 'ACCEPTED' ? 'bg-cyber-accent/20 text-cyber-accent' :
              bid.bidStatus === 'WITHDRAWN' ? 'bg-warning-minimal/20 text-warning-minimal' :
              'bg-error-minimal/20 text-error-minimal'
          }`}>
            {bid.bidStatus}
            </div>
          </div>
        </div>

        {/* NFT Image with hover effects */}
        <div className="mb-3 relative overflow-hidden rounded-cyber group">
          <NFTImage
            imageRef={bid.landListing.nftImageFileRef}
            alt={bid.landListing.nftTitle || 'NFT'}
            className="w-full h-32 object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Metadata */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm font-mono">
            <span className="text-text-light dark:text-text-dark opacity-60">Transaction</span>
            <a
              href={`https://etherscan.io/tx/${bid.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyber-accent hover:text-cyber-glow flex items-center gap-1 transition-colors duration-300"
            >
              {bid.transactionHash.slice(0, 8)}...
              <FiExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="flex justify-between text-sm font-mono">
            <span className="text-text-light dark:text-text-dark opacity-60">Received</span>
            <span className="text-text-light dark:text-text-dark">
              {formatTimeAgo(new Date(bid.createdAt))}
            </span>
          </div>
          </div>
          
        {/* Action buttons */}
        <div className="flex gap-2">
          <Link
            href={`/collections/${bid.landListing.collectionId}`}
            className="flex-1 px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-cyber text-center text-text-light dark:text-text-dark hover:bg-black/10 dark:hover:bg-white/10 hover:border-cyber-accent/30 transition-all duration-300 font-mono text-sm group"
          >
            <FiEye className="inline w-4 h-4 mr-1 group-hover:text-cyber-accent transition-colors duration-300" />
            View
          </Link>
          
          {bid.bidStatus === 'ACTIVE' && (
            <>
              <button
                onClick={handleAccept}
                disabled={isAccepting}
                className="flex-1 px-3 py-2 bg-success-minimal/10 border border-success-minimal/30 rounded-cyber text-success-minimal hover:bg-success-minimal/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-mono text-sm"
              >
                {isAccepting ? 'Accepting...' : 'Accept'}
              </button>
              {onRejectBid && (
                <button
                  onClick={handleReject}
                  disabled={isRejecting}
                  className="flex-1 px-3 py-2 bg-error-minimal/10 border border-error-minimal/30 rounded-cyber text-error-minimal hover:bg-error-minimal/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-mono text-sm"
                >
                  {isRejecting ? 'Rejecting...' : 'Reject'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Active Bid Card Component
interface ActiveBidCardProps {
  bid: ActiveReceivedBid;
  formatTimeAgo: (date: Date) => string;
  onAcceptBid: (bid: ActiveReceivedBid) => Promise<void>;
  onRejectBid?: (bid: ActiveReceivedBid) => Promise<void>;
}

const ActiveBidCard: React.FC<ActiveBidCardProps> = ({ bid, formatTimeAgo, onAcceptBid, onRejectBid }) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await onAcceptBid(bid);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReject = async () => {
    if (!onRejectBid) return;
    setIsRejecting(true);
    try {
      await onRejectBid(bid);
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-secondary-light dark:bg-secondary-dark border border-black/10 dark:border-white/10 rounded-cyber-lg p-4 shadow-xl hover:shadow-2xl transition-all duration-500 group cyber-grid backdrop-blur-cyber"
    >
      {/* Cyber scan line effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-cyber-lg overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyber-glow/10 to-transparent w-full h-full animate-cyber-scan" />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-text-light dark:text-text-dark mb-1 font-mono text-lg">
              {bid.landListing.nftTitle || `Collection ${bid.landListing.collectionId}`}
            </h3>
            <p className="text-sm text-text-light dark:text-text-dark opacity-60 font-mono">
              From: {bid.bidder.username || `${bid.bidder.evmAddress?.slice(0, 8)}...`}
            </p>
          </div>
          
          {/* Bid Amount with cyber styling */}
          <div className="text-right">
            <div className="text-lg font-bold text-cyber-accent font-mono">
              {bid.bidAmount} ETH
          </div>
            <div className="text-xs px-2 py-1 rounded-cyber font-mono bg-success-minimal/20 text-success-minimal animate-pulse">
            ACTIVE
            </div>
          </div>
        </div>

        {/* NFT Image with hover effects */}
        <div className="mb-3 relative overflow-hidden rounded-cyber group">
          <NFTImage
            imageRef={bid.landListing.nftImageFileRef}
            alt={bid.landListing.nftTitle || 'NFT'}
            className="w-full h-32 object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Metadata */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm font-mono">
            <span className="text-text-light dark:text-text-dark opacity-60">Transaction</span>
            <a
              href={`https://etherscan.io/tx/${bid.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyber-accent hover:text-cyber-glow flex items-center gap-1 transition-colors duration-300"
            >
              {bid.transactionHash.slice(0, 8)}...
              <FiExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="flex justify-between text-sm font-mono">
            <span className="text-text-light dark:text-text-dark opacity-60">Received</span>
            <span className="text-text-light dark:text-text-dark">
              {formatTimeAgo(new Date(bid.createdAt))}
            </span>
          </div>
          </div>
          
        {/* Action buttons */}
        <div className="flex gap-2">
          <Link
            href={`/collections/${bid.landListing.collectionId}`}
            className="flex-1 px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-cyber text-center text-text-light dark:text-text-dark hover:bg-black/10 dark:hover:bg-white/10 hover:border-cyber-accent/30 transition-all duration-300 font-mono text-sm group"
          >
            <FiEye className="inline w-4 h-4 mr-1 group-hover:text-cyber-accent transition-colors duration-300" />
            View
          </Link>
          
          <button
            onClick={handleAccept}
            disabled={isAccepting}
            className="flex-1 px-3 py-2 bg-success-minimal/10 border border-success-minimal/30 rounded-cyber text-success-minimal hover:bg-success-minimal/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-mono text-sm"
          >
            {isAccepting ? 'Accepting...' : 'Accept'}
          </button>
          
              {onRejectBid && (
            <button
              onClick={handleReject}
              disabled={isRejecting}
              className="flex-1 px-3 py-2 bg-error-minimal/10 border border-error-minimal/30 rounded-cyber text-error-minimal hover:bg-error-minimal/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-mono text-sm"
            >
              {isRejecting ? 'Rejecting...' : 'Reject'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// History Card Component
interface HistoryCardProps {
  historyItem: HistoryItem;
  formatTimeAgo: (date: Date) => string;
}

const HistoryCard: React.FC<HistoryCardProps> = ({ historyItem, formatTimeAgo }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'BID_PLACED': return <FiTag className="w-4 h-4 text-cyber-accent" />;
      case 'BID_RECEIVED': return <FiActivity className="w-4 h-4 text-cyber-glow" />;
      case 'BID_ACCEPTED': return <FiCheck className="w-4 h-4 text-success-minimal" />;
      default: return <FiClock className="w-4 h-4 text-text-light dark:text-text-dark opacity-60" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-success-minimal bg-success-minimal/20';
      case 'ACCEPTED': return 'text-cyber-accent bg-cyber-accent/20';
      case 'WITHDRAWN': return 'text-warning-minimal bg-warning-minimal/20';
      case 'OUTBID': return 'text-error-minimal bg-error-minimal/20';
      default: return 'text-text-light dark:text-text-dark bg-black/10 dark:bg-white/10';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02, x: 5 }}
      className="bg-secondary-light dark:bg-secondary-dark border border-black/10 dark:border-white/10 rounded-cyber-lg p-4 shadow-xl hover:shadow-2xl transition-all duration-500 group cyber-grid backdrop-blur-cyber"
    >
      {/* Cyber scan line effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-cyber-lg overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyber-glow/10 to-transparent w-full h-full animate-cyber-scan" />
      </div>

      <div className="relative z-10">
        {/* NFT Image with hover effects */}
        <div className="mb-3 relative overflow-hidden rounded-cyber group">
          <NFTImage
            imageRef={historyItem.landListing.nftImageFileRef}
            alt={historyItem.landListing.nftTitle || 'NFT'}
            className="w-full h-32 object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Type Icon Overlay */}
          <div className="absolute top-2 left-2 p-2 bg-black/50 backdrop-blur-sm rounded-cyber border border-white/20">
            {getTypeIcon(historyItem.type)}
          </div>
          
          {/* Status Badge */}
          <div className="absolute top-2 right-2">
            <div className={`text-xs px-2 py-1 rounded-cyber font-mono ${getStatusColor(historyItem.status)}`}>
            {historyItem.status}
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-text-light dark:text-text-dark font-mono text-lg">
              {historyItem.landListing.nftTitle || `Collection ${historyItem.landListing.collectionId}`}
            </h3>
            <p className="text-sm text-text-light dark:text-text-dark opacity-60 font-mono">
          {historyItem.description}
        </p>
        </div>

          {/* Amount */}
          <div className="text-center p-2 bg-cyber-accent/10 border border-cyber-accent/30 rounded-cyber">
            <div className="text-lg font-bold text-cyber-accent font-mono">
              {historyItem.amount} ETH
        </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm font-mono pt-2 border-t border-black/10 dark:border-white/10">
            <span className="text-text-light dark:text-text-dark opacity-60">
              {formatTimeAgo(new Date(historyItem.createdAt))}
            </span>
        {historyItem.transactionHash && (
            <a
                href={`https://etherscan.io/tx/${historyItem.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
                className="text-cyber-accent hover:text-cyber-glow flex items-center gap-1 transition-colors duration-300"
            >
                <FiExternalLink className="w-3 h-3" />
                View Tx
            </a>
        )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Collection Card Component
interface CollectionCardProps {
  collection: OwnedCollection;
  formatTimeAgo: (date: Date) => string;
}

const CollectionCard: React.FC<CollectionCardProps> = ({ collection, formatTimeAgo }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-secondary-light dark:bg-secondary-dark border border-black/10 dark:border-white/10 rounded-cyber-lg overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 group cyber-grid backdrop-blur-cyber"
    >
      {/* Image Section with cyber scan effect */}
      <div className="relative h-48 overflow-hidden">
          <NFTImage
            imageRef={collection.image}
            alt={collection.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Cyber scan line effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyber-glow/20 to-transparent w-full h-full animate-cyber-scan" />
          </div>

        {/* Collection ID Badge */}
        <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-cyber text-white text-xs font-mono">
          {collection.collectionId}
      </div>

        {/* Ownership Type Badge */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm border border-white/30 rounded-cyber text-white text-xs font-mono">
          {collection.ownershipType === 'COLLECTION_CREATOR' ? 'Creator' : 
           collection.ownershipType === 'BOTH' ? 'Creator & Holder' : 'Token Holder'}
          </div>
        </div>
        
      {/* Content Section */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-text-light dark:text-text-dark mb-1 font-mono">
            {collection.name}
          </h3>
          <p className="text-sm text-text-light dark:text-text-dark opacity-70 line-clamp-2 font-mono">
            {collection.description}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4 text-center">
          <div className="p-2 bg-black/5 dark:bg-white/5 rounded-cyber border border-black/10 dark:border-white/10">
            <div className="text-lg font-bold text-cyber-accent font-mono">{collection.totalSupply}</div>
            <div className="text-xs text-text-light dark:text-text-dark opacity-60 font-mono">Total</div>
          </div>
          <div className="p-2 bg-black/5 dark:bg-white/5 rounded-cyber border border-black/10 dark:border-white/10">
            <div className="text-lg font-bold text-cyber-accent font-mono">{collection.userTokenCount || collection.itemsOwned}</div>
            <div className="text-xs text-text-light dark:text-text-dark opacity-60 font-mono">Owned</div>
          </div>
          <div className="p-2 bg-black/5 dark:bg-white/5 rounded-cyber border border-black/10 dark:border-white/10">
            <div className="text-lg font-bold text-cyber-accent font-mono">{collection.listedItems}</div>
            <div className="text-xs text-text-light dark:text-text-dark opacity-60 font-mono">Listed</div>
          </div>
        </div>

        {/* Floor Price */}
        {collection.floorPrice && (
          <div className="mb-4 p-2 bg-cyber-accent/10 border border-cyber-accent/30 rounded-cyber">
            <div className="text-center">
              <div className="text-lg font-bold text-cyber-accent font-mono">{collection.floorPrice} ETH</div>
              <div className="text-xs text-cyber-accent font-mono">Floor Price</div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <Link href={`/collections/${collection.collectionId}`}>
          <AnimatedButton className="w-full bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white hover:bg-white hover:text-black hover:border-black dark:hover:bg-black dark:hover:text-white dark:hover:border-white font-mono">
            View Collection
          </AnimatedButton>
          </Link>
      </div>
    </motion.div>
  );
};

export default OrdersPage;