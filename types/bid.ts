export interface BidInfo {
  tokenId: number;
  currentBid: number | null;
  minimumBid: number;
  bidder: {
    address: string;
    username: string;
  } | null;
  hasActiveBid: boolean;
  status: 'has_bids' | 'no_bids';
  message: string;
  lastUpdated: string | null;
  source: 'database';
}

export interface BidSubmissionData {
  collectionId: string;
  tokenId: string;
  bidAmount: number;
  transactionHash: string;
  bidderAddress: string;
}

export interface BidSubmissionResponse {
  success: boolean;
  bid?: {
    id: string;
    tokenId: number;
    bidAmount: number;
    bidStatus: string;
    transactionHash: string;
    createdAt: string;
    bidder: {
      id: string;
      username: string;
      evmAddress: string;
    };
  };
  message?: string;
  currentBid?: number;
  minimumBid?: number;
}

export interface BidValidationError {
  field: string;
  message: string;
}

export interface BidFormState {
  amount: string;
  isValid: boolean;
  error: string | null;
  isSubmitting: boolean;
} 