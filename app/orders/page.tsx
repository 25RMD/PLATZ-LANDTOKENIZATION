"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAccount, usePublicClient } from 'wagmi';
import { useAuth } from '@/context/AuthContext';
import { PLATZ_LAND_NFT_ADDRESS } from '@/config/contracts';
import { PlatzLandNFTABI } from '@/contracts/PlatzLandNFTABI';
import { FiGrid, FiSearch, FiFilter, FiChevronDown, FiChevronUp, FiClock, FiEye, FiExternalLink, FiTag, FiX, FiDollarSign, FiCheck, FiActivity } from 'react-icons/fi';
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
  ownershipType?: 'TOKEN_OWNER' | 'COLLECTION_OWNER';
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
      console.log('Fetching user owned collections...');
      const response = await fetch(`/api/collections/user-owned?userAddress=${connectedAddress}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.collections) {
          setOwnedCollections(data.collections);
          console.log(`Found ${data.collections.length} owned collections`);
        } else {
          console.error('Failed to fetch owned collections:', data.error);
          setOwnedCollections([]);
        }
      } else {
        console.error('Failed to fetch owned collections:', response.statusText);
        setOwnedCollections([]);
      }
    } catch (err: any) {
      console.error('Error scanning NFTs:', err);
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
        toast.success('Bid withdrawn successfully!');
        fetchUserBids(); // Refresh bids
        fetchBidHistory(); // Refresh history
      } else {
        toast.error(data.error || 'Failed to withdraw bid');
      }
    } catch (error) {
      console.error('Error withdrawing bid:', error);
      toast.error('Error withdrawing bid');
    }
  };

  // Handle accept bid (updated to refresh both sections)
  const handleAcceptBid = async (bid: AllReceivedBid | ActiveReceivedBid) => {
    if (!connectedAddress) {
      toast.error('Please connect your wallet');
      return;
    }

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
        toast.success('Bid accepted successfully!');
        fetchAllReceivedBids(); // Refresh all received bids
        fetchActiveBids(); // Refresh active bids
        fetchUserBids(); // Also refresh user bids in case they have any
        fetchBidHistory(); // Refresh history
      } else {
        toast.error(data.message || 'Failed to accept bid');
      }
    } catch (error) {
      console.error('Error accepting bid:', error);
      toast.error('Error accepting bid');
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
      scanUserNFTs();
      fetchUserBids();
      fetchAllReceivedBids();
      fetchActiveBids();
      fetchBidHistory();
    }
  }, [isConnected, connectedAddress, authLoading, scanUserNFTs, fetchUserBids, fetchAllReceivedBids, fetchActiveBids, fetchBidHistory]);

  const filteredData = filteredAndSortedData();

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
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          My Orders & Bids
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Manage your NFT collections, tokens, and bidding activity
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200 dark:border-zinc-700 mb-4 sm:mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('collections')}
          className={`px-3 sm:px-6 py-2 sm:py-3 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
            activeTab === 'collections'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Collections ({ownedCollections.length})
        </button>
        <button
          onClick={() => setActiveTab('bids')}
          className={`px-3 sm:px-6 py-2 sm:py-3 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
            activeTab === 'bids'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          My Bids ({userBids.length})
        </button>
        <button
          onClick={() => setActiveTab('all-received-bids')}
          className={`px-3 sm:px-6 py-2 sm:py-3 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
            activeTab === 'all-received-bids'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Received Bids ({allReceivedBids.length})
        </button>
        <button
          onClick={() => setActiveTab('active-bids')}
          className={`px-3 sm:px-6 py-2 sm:py-3 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
            activeTab === 'active-bids'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Active Bids ({activeBids.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-3 sm:px-6 py-2 sm:py-3 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
            activeTab === 'history'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          History ({bidHistory.length})
        </button>
      </div>

      {/* Collections Analytics Section */}
      {activeTab === 'collections' && ownedCollections.length > 0 && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Collections Overview</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">{ownedCollections.length}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Collections</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                {ownedCollections.reduce((sum, col) => sum + col.itemsOwned, 0)}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                {ownedCollections.reduce((sum, col) => sum + col.listedItems, 0)}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Listed Items</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
                {ownedCollections.reduce((sum, col) => sum + col.totalValue, 0).toFixed(3)} ETH
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Value</div>
            </div>
          </div>
        </div>
      )}

      {/* Bid Analytics Section */}
      {activeTab === 'bids' && bidAnalytics && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Bid Analytics</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{bidAnalytics.totalBids}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Bids</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">{bidAnalytics.activeBids}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Active</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400">{bidAnalytics.acceptedBids}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Accepted</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-orange-600 dark:text-orange-400">{bidAnalytics.successRate.toFixed(1)}%</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
            </div>
          </div>
        </div>
      )}



      {/* History Analytics Section */}
      {activeTab === 'history' && historySummary && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Bid History Summary</h3>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400">{historySummary.totalBidsPlaced}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Bids Placed</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-pink-600 dark:text-pink-400">{historySummary.totalBidsReceived}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Bids Received</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">{historySummary.activeBids}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Active</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{historySummary.acceptedBids}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Accepted</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-orange-600 dark:text-orange-400">{historySummary.withdrawnBids}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Withdrawn</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">{historySummary.totalTransactions}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Transactions</div>
            </div>
          </div>
        </div>
      )}

      {/* All Received Bid Analytics Section */}
      {activeTab === 'all-received-bids' && allReceivedBidAnalytics && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Received Bids Analytics</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400">{allReceivedBidAnalytics.totalReceived}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Received</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">{allReceivedBidAnalytics.acceptedReceived}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Accepted</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{allReceivedBidAnalytics.activeReceived}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Active</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-orange-600 dark:text-orange-400">{allReceivedBidAnalytics.uniqueBidders}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Unique Bidders</div>
            </div>
          </div>
        </div>
      )}

      {/* Active Bid Analytics Section */}
      {activeTab === 'active-bids' && activeBidAnalytics && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Active Bids Analytics</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">{activeBidAnalytics.totalActive}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Active Bids</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{activeBidAnalytics.highestBid.toFixed(3)} ETH</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Highest Bid</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400">{activeBidAnalytics.averageBidValue.toFixed(3)} ETH</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Average Bid</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-orange-600 dark:text-orange-400">{activeBidAnalytics.uniqueBidders}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Unique Bidders</div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-4 sm:mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Filter and Sort Controls */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <FiFilter size={16} />
            <span className="text-sm">Filters</span>
            {showFilters ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
            {/* Filter Type */}
            <div className="flex flex-col space-y-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Filter</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All</option>
                <option value="listed">Listed</option>
                <option value="unlisted">Unlisted</option>
              </select>
            </div>

            {/* Sort Type */}
            <div className="flex flex-col space-y-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Sort By</label>
              <select
                value={sortType}
                onChange={(e) => setSortType(e.target.value as SortType)}
                className="px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="name">Name</option>
                <option value="date">Date</option>
                {activeTab === 'collections' && <option value="tokenCount">Token Count</option>}
                <option value="price">Price</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="flex flex-col space-y-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
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
              />
            ) : activeTab === 'active-bids' ? (
              <ActiveBidCard
                key={`active-bid-${(item as ActiveReceivedBid).id}`}
                bid={item as ActiveReceivedBid}
                formatTimeAgo={formatTimeAgo}
                onAcceptBid={handleAcceptBid}
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-100 mb-1 truncate" title={bid.landListing.nftTitle || undefined}>
          {bid.landListing.nftTitle}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          Bid: {bid.bidAmount} ETH
        </p>

        <div className="flex items-center justify-between mb-3 sm:mb-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <FiClock size={12} />
            <span>{formatTimeAgo(new Date(bid.createdAt))}</span>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            bid.bidStatus === 'ACTIVE' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
              : bid.bidStatus === 'ACCEPTED'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
              : bid.bidStatus === 'WITHDRAWN'
              ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
          }`}>
            {bid.bidStatus}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex space-x-2">
            <a
              href={`https://sepolia.etherscan.io/tx/${bid.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center"
            >
              <FiExternalLink className="mr-1" size={12} />
              <span className="hidden sm:inline">View Transaction</span>
              <span className="sm:hidden">View Tx</span>
            </a>
          </div>
          
          {bid.bidStatus === 'ACTIVE' && (
            <div className="flex space-x-2">
              <AnimatedButton
                onClick={() => onWithdrawBid(bid)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-xs sm:text-sm disabled:opacity-50"
              >
                <FiX className="mr-1" size={12} />
                <span className="hidden sm:inline">Withdraw Bid</span>
                <span className="sm:hidden">Withdraw</span>
              </AnimatedButton>
            </div>
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
}

const AllReceivedBidCard: React.FC<AllReceivedBidCardProps> = ({ bid, formatTimeAgo, onAcceptBid }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-100 mb-1 truncate" title={bid.landListing.nftTitle || undefined}>
          {bid.landListing.nftTitle}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          Bid: {bid.bidAmount} ETH
        </p>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 truncate">
          From: {bid.bidder.username || `${bid.bidder.evmAddress?.slice(0, 6)}...${bid.bidder.evmAddress?.slice(-4)}`}
        </p>

        <div className="flex items-center justify-between mb-3 sm:mb-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <FiClock size={12} />
            <span>{formatTimeAgo(new Date(bid.createdAt))}</span>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            bid.bidStatus === 'ACTIVE' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
              : bid.bidStatus === 'ACCEPTED'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
              : bid.bidStatus === 'WITHDRAWN'
              ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
          }`}>
            {bid.bidStatus}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex space-x-2">
            <a
              href={`https://sepolia.etherscan.io/tx/${bid.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center"
            >
              <FiExternalLink className="mr-1" size={12} />
              <span className="hidden sm:inline">View Transaction</span>
              <span className="sm:hidden">View Tx</span>
            </a>
          </div>
          
          {bid.bidStatus === 'ACTIVE' && (
            <div className="flex space-x-2">
              <AnimatedButton
                onClick={() => onAcceptBid(bid)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-xs sm:text-sm disabled:opacity-50"
              >
                <FiTag className="mr-1" size={12} />
                <span className="hidden sm:inline">Accept Bid</span>
                <span className="sm:hidden">Accept</span>
              </AnimatedButton>
            </div>
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
}

const ActiveBidCard: React.FC<ActiveBidCardProps> = ({ bid, formatTimeAgo, onAcceptBid }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-100 mb-1 truncate" title={bid.landListing.nftTitle || undefined}>
          {bid.landListing.nftTitle}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          Bid: {bid.bidAmount} ETH
        </p>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 truncate">
          From: {bid.bidder.username || `${bid.bidder.evmAddress?.slice(0, 6)}...${bid.bidder.evmAddress?.slice(-4)}`}
        </p>

        <div className="flex items-center justify-between mb-3 sm:mb-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <FiClock size={12} />
            <span>{formatTimeAgo(new Date(bid.createdAt))}</span>
          </div>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            ACTIVE
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex space-x-2">
            <a
              href={`https://sepolia.etherscan.io/tx/${bid.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center"
            >
              <FiExternalLink className="mr-1" size={12} />
              <span className="hidden sm:inline">View Transaction</span>
              <span className="sm:hidden">View Tx</span>
            </a>
          </div>
          
          <div className="flex space-x-2">
            <AnimatedButton
              onClick={() => onAcceptBid(bid)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-xs sm:text-sm disabled:opacity-50"
            >
              <FiTag className="mr-1" size={12} />
              <span className="hidden sm:inline">Accept Bid</span>
              <span className="sm:hidden">Accept</span>
            </AnimatedButton>
          </div>
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
      case 'BID_PLACED':
        return <FiTag className="text-blue-500" size={16} />;
      case 'BID_RECEIVED':
        return <FiDollarSign className="text-green-500" size={16} />;
      case 'BID_ACCEPTED':
        return <FiCheck className="text-purple-500" size={16} />;
      default:
        return <FiActivity className="text-gray-500" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'accepted':
      case 'completed':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'outbid':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            {getTypeIcon(historyItem.type)}
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100">
              {historyItem.type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
            </h3>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(historyItem.status)}`}>
            {historyItem.status}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          {historyItem.description}
        </p>

        <div className="flex items-center justify-between mb-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <span className="font-medium">{historyItem.amount} ETH</span>
          </div>
          <div className="flex items-center space-x-2">
            <FiClock size={12} />
            <span>{formatTimeAgo(new Date(historyItem.createdAt))}</span>
          </div>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 truncate">
          Collection: {historyItem.landListing.nftTitle || `#${historyItem.landListing.collectionId}`}
        </div>

        {historyItem.bidder && !historyItem.isUserAction && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 truncate">
            Bidder: {historyItem.bidder.username || `${historyItem.bidder.evmAddress?.slice(0, 6)}...${historyItem.bidder.evmAddress?.slice(-4)}`}
          </div>
        )}

        {historyItem.transactionHash && (
          <div className="flex space-x-2">
            <a
              href={`https://sepolia.etherscan.io/tx/${historyItem.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center"
            >
              <FiExternalLink className="mr-1" size={12} />
              <span className="hidden sm:inline">View Transaction</span>
              <span className="sm:hidden">View Tx</span>
            </a>
          </div>
        )}
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
      className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Collection Image */}
      <div className="aspect-square relative bg-gray-100 dark:bg-zinc-800">
        {collection.image ? (
          <NFTImage
            imageRef={collection.image}
            alt={collection.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FiGrid className="w-16 h-16 text-gray-400" />
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-100 truncate" title={collection.name}>
            {collection.name}
          </h3>
          <div className="flex items-center space-x-2 ml-2">
            {/* Ownership Type Indicator */}
            {collection.ownershipType && (
              <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                collection.ownershipType === 'COLLECTION_OWNER' 
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
              }`}>
                {collection.ownershipType === 'COLLECTION_OWNER' ? 'Collection Owner' : 'Token Owner'}
              </span>
            )}
            <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full whitespace-nowrap">
              #{collection.collectionId}
            </span>
          </div>
        </div>
        
        {collection.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
            {collection.description}
          </p>
        )}

        {/* Items Summary */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{collection.itemsOwned}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Items Owned</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">{collection.listedItems}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Listed</div>
          </div>
        </div>

        {/* Price Information */}
        {collection.floorPrice && (
          <div className="mb-3 p-2 bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">Floor Price:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{collection.floorPrice} ETH</span>
            </div>
            {collection.totalValue > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Total Value:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{collection.totalValue.toFixed(3)} ETH</span>
              </div>
            )}
          </div>
        )}

        {/* Time */}
        <div className="flex items-center justify-between mb-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <FiClock size={12} />
            <span>Created {formatTimeAgo(new Date(collection.createdAt))}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Link
            href={`/collections/${collection.collectionId}`}
            className="block w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center"
          >
            <FiEye className="mr-1" size={12} />
            <span>View Collection</span>
          </Link>
          
          {collection.contractAddress && (
            <a
              href={`https://sepolia.etherscan.io/address/${collection.contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center"
            >
              <FiExternalLink className="mr-1" size={12} />
              <span className="hidden sm:inline">View on Etherscan</span>
              <span className="sm:hidden">Etherscan</span>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default OrdersPage; 