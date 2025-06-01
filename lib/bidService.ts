import { BidInfo, BidSubmissionData, BidSubmissionResponse } from '@/types/bid';

/**
 * Fetch comprehensive bid information for a token
 */
export const fetchBidInfo = async (tokenId: number): Promise<BidInfo> => {
  try {
    const response = await fetch(`/api/tokens/${tokenId}/bid-info`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching bid info:', error);
    
    // Return safe defaults on error
    return {
      tokenId,
      currentBid: null,
      minimumBid: 0.001,
      bidder: null,
      hasActiveBid: false,
      status: 'no_bids',
      message: 'Unable to load bid data. Minimum bid: 0.001 ETH',
      lastUpdated: null,
      source: 'database'
    };
  }
};

/**
 * Submit a bid to the API
 */
export const submitBid = async (bidData: BidSubmissionData): Promise<BidSubmissionResponse> => {
  try {
    const response = await fetch('/api/bids', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bidData),
    });

    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: result.message || `HTTP ${response.status}: ${response.statusText}`,
        currentBid: result.currentBid,
        minimumBid: result.minimumBid
      };
    }

    return {
      success: true,
      bid: result.bid
    };
  } catch (error) {
    console.error('Error submitting bid:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to submit bid'
    };
  }
};

/**
 * Validate bid amount against current requirements
 */
export const validateBidAmount = (amount: number, bidInfo: BidInfo): { valid: boolean; error?: string } => {
  if (isNaN(amount) || amount <= 0) {
    return { valid: false, error: 'Please enter a valid bid amount' };
  }

  if (amount < bidInfo.minimumBid) {
    return { 
      valid: false, 
      error: `Bid must be at least ${bidInfo.minimumBid} ETH` 
    };
  }

  // Check for reasonable maximum (prevent accidental large bids)
  if (amount > 1000) {
    return { 
      valid: false, 
      error: 'Bid amount seems unusually high. Please verify.' 
    };
  }

  return { valid: true };
};

/**
 * Format bid amount for display
 */
export const formatBidAmount = (amount: number | null): string => {
  if (amount === null) return 'No bids';
  return `${amount.toFixed(3)} ETH`;
};

/**
 * Format time since last update
 */
export const formatTimeSince = (timestamp: string | null): string => {
  if (!timestamp) return 'Unknown';
  
  const now = new Date();
  const updated = new Date(timestamp);
  const diffMs = now.getTime() - updated.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

/**
 * Get user-friendly status message
 */
export const getBidStatusMessage = (bidInfo: BidInfo): string => {
  if (!bidInfo.hasActiveBid) {
    return `No bids yet. Be the first to bid with ${formatBidAmount(bidInfo.minimumBid)}!`;
  }
  
  return `Current highest bid: ${formatBidAmount(bidInfo.currentBid)} by ${bidInfo.bidder?.username || 'Anonymous'}. Minimum next bid: ${formatBidAmount(bidInfo.minimumBid)}`;
}; 