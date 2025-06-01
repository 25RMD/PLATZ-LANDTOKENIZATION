import React, { useState, useEffect } from 'react';
import { useBidInfo } from '@/hooks/useBidInfo';
import { validateBidAmount, submitBid, formatBidAmount } from '@/lib/bidService';
import { BidFormState, BidSubmissionData } from '@/types/bid';

interface BidFormProps {
  tokenId: number;
  collectionId: string;
  userAddress?: string;
  onBidSuccess?: (bidAmount: number) => void;
  onBidError?: (error: string) => void;
  className?: string;
}

export const BidForm: React.FC<BidFormProps> = ({
  tokenId,
  collectionId,
  userAddress,
  onBidSuccess,
  onBidError,
  className = ''
}) => {
  const { bidInfo, loading: bidInfoLoading, refresh } = useBidInfo({ 
    tokenId, 
    autoRefresh: false 
  });

  const [formState, setFormState] = useState<BidFormState>({
    amount: '',
    isValid: false,
    error: null,
    isSubmitting: false
  });

  const [showConfirmation, setShowConfirmation] = useState(false);

  // Validate amount whenever it changes or bid info updates
  useEffect(() => {
    if (!bidInfo || !formState.amount) {
      setFormState(prev => ({ ...prev, isValid: false, error: null }));
      return;
    }

    const amount = parseFloat(formState.amount);
    const validation = validateBidAmount(amount, bidInfo);
    
    setFormState(prev => ({
      ...prev,
      isValid: validation.valid,
      error: validation.error || null
    }));
  }, [formState.amount, bidInfo]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormState(prev => ({ ...prev, amount: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bidInfo || !userAddress) {
      setFormState(prev => ({ 
        ...prev, 
        error: 'Missing required information' 
      }));
      return;
    }

    if (!formState.isValid) return;

    // Refresh bid info before submission to catch any recent changes
    await refresh();
    
    const amount = parseFloat(formState.amount);
    const latestValidation = validateBidAmount(amount, bidInfo);
    
    if (!latestValidation.valid) {
      setFormState(prev => ({ 
        ...prev, 
        error: latestValidation.error || 'Invalid bid amount' 
      }));
      return;
    }

    setShowConfirmation(true);
  };

  const confirmBid = async () => {
    if (!bidInfo || !userAddress) return;

    setFormState(prev => ({ ...prev, isSubmitting: true }));
    setShowConfirmation(false);

    try {
      // In a real implementation, you would:
      // 1. Connect to user's wallet
      // 2. Call the smart contract to place the bid
      // 3. Get the transaction hash
      // 4. Submit to API with transaction hash

      // For now, we'll simulate the transaction hash
      const mockTransactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;

      const bidData: BidSubmissionData = {
        collectionId,
        tokenId: tokenId.toString(),
        bidAmount: parseFloat(formState.amount),
        transactionHash: mockTransactionHash,
        bidderAddress: userAddress
      };

      const result = await submitBid(bidData);

      if (result.success) {
        setFormState({
          amount: '',
          isValid: false,
          error: null,
          isSubmitting: false
        });
        
        // Refresh bid info to show new bid
        await refresh();
        
        onBidSuccess?.(parseFloat(formState.amount));
      } else {
        setFormState(prev => ({ 
          ...prev, 
          error: result.message || 'Failed to submit bid',
          isSubmitting: false 
        }));
        onBidError?.(result.message || 'Failed to submit bid');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit bid';
      setFormState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isSubmitting: false 
      }));
      onBidError?.(errorMessage);
    }
  };

  if (bidInfoLoading) {
    return (
      <div className={`bid-form loading ${className}`}>
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!bidInfo) {
    return (
      <div className={`bid-form error ${className}`}>
        <p className="text-red-600">Unable to load bid information</p>
      </div>
    );
  }

  if (!userAddress) {
    return (
      <div className={`bid-form no-wallet ${className}`}>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            Please connect your wallet to place a bid
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bid-form ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bid-context bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-700">{bidInfo.message}</p>
        </div>

        <div className="input-group">
          <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700 mb-2">
            Your Bid Amount
          </label>
          <div className="relative">
            <input
              id="bidAmount"
              type="number"
              value={formState.amount}
              onChange={handleAmountChange}
              min={bidInfo.minimumBid}
              step="0.001"
              placeholder={`Minimum: ${formatBidAmount(bidInfo.minimumBid)}`}
              className={`
                w-full px-3 py-2 pr-12 border rounded-lg focus:outline-none focus:ring-2 
                ${formState.error 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
                }
              `}
              disabled={formState.isSubmitting}
            />
            <span className="absolute right-3 top-2 text-gray-500 text-sm">ETH</span>
          </div>
        </div>

        {formState.error && (
          <div className="error-message bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">⚠️ {formState.error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!formState.isValid || formState.isSubmitting}
          className={`
            w-full py-3 px-4 rounded-lg font-medium transition-colors
            ${formState.isValid && !formState.isSubmitting
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {formState.isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting Bid...
            </span>
          ) : (
            'Place Bid'
          )}
        </button>
      </form>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Your Bid</h3>
            <div className="space-y-3 mb-6">
              <p><span className="font-medium">Token:</span> #{tokenId}</p>
              <p><span className="font-medium">Your Bid:</span> {formatBidAmount(parseFloat(formState.amount))}</p>
              <p><span className="font-medium">Current Bid:</span> {formatBidAmount(bidInfo.currentBid)}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmBid}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirm Bid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 