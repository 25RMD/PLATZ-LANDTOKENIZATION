import React, { useState } from 'react';
import { BidDisplay } from './BidDisplay';
import { BidForm } from './BidForm';

interface BidInterfaceProps {
  tokenId: number;
  collectionId: string;
  userAddress?: string;
  className?: string;
}

export const BidInterface: React.FC<BidInterfaceProps> = ({
  tokenId,
  collectionId,
  userAddress,
  className = ''
}) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleBidSuccess = (bidAmount: number) => {
    setSuccessMessage(`🎉 Bid of ${bidAmount.toFixed(3)} ETH placed successfully!`);
    setErrorMessage(null);
    
    // Clear success message after 5 seconds
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleBidError = (error: string) => {
    setErrorMessage(error);
    setSuccessMessage(null);
    
    // Clear error message after 10 seconds
    setTimeout(() => setErrorMessage(null), 10000);
  };

  return (
    <div className={`bid-interface space-y-6 ${className}`}>
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">{successMessage}</p>
        </div>
      )}
      
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{errorMessage}</p>
        </div>
      )}

      {/* Current Bid Display */}
      <div className="bid-display-section">
        <BidDisplay 
          tokenId={tokenId} 
          autoRefresh={true}
        />
      </div>

      {/* Bid Form */}
      <div className="bid-form-section">
        <BidForm
          tokenId={tokenId}
          collectionId={collectionId}
          userAddress={userAddress}
          onBidSuccess={handleBidSuccess}
          onBidError={handleBidError}
        />
      </div>
    </div>
  );
}; 