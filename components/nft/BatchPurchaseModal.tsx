import React, { useState } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { parseEther } from 'viem';
import { FiX, FiShoppingCart, FiCheck } from 'react-icons/fi';
import AnimatedButton from '@/components/common/AnimatedButton';
import PulsingDotsSpinner from '@/components/common/PulsingDotsSpinner';
import { NFTImage } from '@/components/ui/image';
import { LAND_MARKETPLACE_ADDRESS, PLATZ_LAND_NFT_ADDRESS } from '@/config/contracts';
import { LandMarketplaceABI } from '@/contracts/LandMarketplaceABI';

interface BatchPurchaseToken {
  tokenId: string;
  tokenURI: string;
  listingPrice: number;
  metadata?: {
    name: string;
    description: string;
    image: string;
  };
}

interface BatchPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchasesComplete: () => void;
  availableTokens: BatchPurchaseToken[];
  collectionName: string;
  collectionId: string;
}

const BatchPurchaseModal: React.FC<BatchPurchaseModalProps> = ({
  isOpen,
  onClose,
  onPurchasesComplete,
  availableTokens,
  collectionName,
  collectionId
}) => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  
  const [selectedTokens, setSelectedTokens] = useState<Set<string>>(new Set());
  const [isPurchasing, setIsPurchasing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [purchaseProgress, setPurchaseProgress] = useState<{
    current: number;
    total: number;
    currentToken: string;
  } | null>(null);

  // Calculate total cost
  const totalCost = availableTokens
    .filter(token => selectedTokens.has(token.tokenId))
    .reduce((sum, token) => sum + token.listingPrice, 0);

  // Toggle token selection
  const toggleTokenSelection = (tokenId: string) => {
    const newSelected = new Set(selectedTokens);
    if (newSelected.has(tokenId)) {
      newSelected.delete(tokenId);
    } else {
      newSelected.add(tokenId);
    }
    setSelectedTokens(newSelected);
  };

  // Select all tokens
  const selectAll = () => {
    setSelectedTokens(new Set(availableTokens.map(token => token.tokenId)));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedTokens(new Set());
  };

  // Handle batch purchase
  const handleBatchPurchase = async () => {
    if (!isConnected || !address || !walletClient || !publicClient) {
      setError('Please connect your wallet');
      return;
    }

    if (selectedTokens.size === 0) {
      setError('Please select at least one token to purchase');
      return;
    }

    setIsPurchasing(true);
    setError(null);
    
    const selectedTokensList = availableTokens.filter(token => selectedTokens.has(token.tokenId));
    let successfulPurchases = 0;
    let failedPurchases = 0;

    try {
      setPurchaseProgress({
        current: 0,
        total: selectedTokensList.length,
        currentToken: ''
      });

      for (let i = 0; i < selectedTokensList.length; i++) {
        const token = selectedTokensList[i];
        
        setPurchaseProgress({
          current: i + 1,
          total: selectedTokensList.length,
          currentToken: token.metadata?.name || `Token #${token.tokenId}`
        });

        try {
          const tokenId = BigInt(token.tokenId);
          const price = parseEther(token.listingPrice.toString());

          // Simulate the purchase transaction
          const { request } = await publicClient.simulateContract({
            address: LAND_MARKETPLACE_ADDRESS,
            abi: LandMarketplaceABI,
            functionName: 'purchaseListing',
            args: [PLATZ_LAND_NFT_ADDRESS, tokenId],
            value: price,
            account: address,
          });

          // Execute the transaction
          const transactionHash = await walletClient.writeContract(request);

          // Wait for confirmation
          const receipt = await publicClient.waitForTransactionReceipt({
            hash: transactionHash,
          });

          if (receipt.status === 'success') {
            successfulPurchases++;
            
            // Record transaction in database
            try {
              await fetch('/api/transactions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  transactionType: 'PURCHASE',
                  tokenId: token.tokenId,
                  collectionId,
                  fromAddress: LAND_MARKETPLACE_ADDRESS, // Purchase from marketplace
                  toAddress: address,
                  price: token.listingPrice,
                  currency: 'ETH',
                  transactionHash,
                  blockNumber: receipt.blockNumber ? Number(receipt.blockNumber) : undefined,
                  gasUsed: receipt.gasUsed ? Number(receipt.gasUsed) : undefined
                }),
              });
            } catch (recordError) {
              console.error('Failed to record transaction:', recordError);
              // Don't fail the whole process if recording fails
            }
          } else {
            failedPurchases++;
            console.error(`Failed to purchase token ${token.tokenId}`);
          }

          // Small delay between transactions
          if (i < selectedTokensList.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }

        } catch (tokenError: any) {
          console.error(`Error purchasing token ${token.tokenId}:`, tokenError);
          failedPurchases++;
        }
      }

      // Show completion message
      if (successfulPurchases > 0) {
        alert(`Successfully purchased ${successfulPurchases} tokens!${failedPurchases > 0 ? ` ${failedPurchases} purchases failed.` : ''}`);
        onPurchasesComplete();
        onClose();
      } else {
        setError('All purchases failed. Please try again.');
      }

    } catch (err: any) {
      console.error('Batch purchase error:', err);
      setError(err.message || 'Batch purchase failed');
    } finally {
      setIsPurchasing(false);
      setPurchaseProgress(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Batch Purchase</h2>
              <p className="text-gray-600 dark:text-gray-400">{collectionName}</p>
            </div>
            <button
              onClick={onClose}
              disabled={isPurchasing}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Selection Controls */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                disabled={isPurchasing}
                className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 rounded disabled:opacity-50"
              >
                Select All
              </button>
              <button
                onClick={clearSelection}
                disabled={isPurchasing}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded disabled:opacity-50"
              >
                Clear
              </button>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedTokens.size} of {availableTokens.length} selected
            </div>
          </div>

          {/* Token Grid */}
          <div className="max-h-96 overflow-y-auto mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {availableTokens.map((token) => (
                <div
                  key={token.tokenId}
                  className={`relative border-2 rounded-lg p-2 cursor-pointer transition-all ${
                    selectedTokens.has(token.tokenId)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600'
                  } ${isPurchasing ? 'pointer-events-none opacity-50' : ''}`}
                  onClick={() => !isPurchasing && toggleTokenSelection(token.tokenId)}
                >
                  {/* Selection Indicator */}
                  {selectedTokens.has(token.tokenId) && (
                    <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-1 z-10">
                      <FiCheck size={12} />
                    </div>
                  )}
                  
                  {/* Token Image */}
                  <div className="aspect-square bg-gray-100 dark:bg-zinc-800 rounded mb-2">
                    <NFTImage
                      src={token.metadata?.image || ''}
                      alt={token.metadata?.name || `Token #${token.tokenId}`}
                      className="w-full h-full rounded"
                      fallback="https://placehold.co/150x150/gray/white?text=NFT"
                    />
                  </div>
                  
                  {/* Token Info */}
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {token.metadata?.name || `Token #${token.tokenId}`}
                    </p>
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {token.listingPrice} ETH
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Purchase Progress */}
          {purchaseProgress && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-blue-800 dark:text-blue-200 font-medium">
                  Purchasing: {purchaseProgress.currentToken}
                </span>
                <span className="text-blue-600 dark:text-blue-400 text-sm">
                  {purchaseProgress.current} of {purchaseProgress.total}
                </span>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(purchaseProgress.current / purchaseProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Total Cost and Actions */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Total: {totalCost.toFixed(4)} ETH
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  + Gas fees (est. ~{(selectedTokens.size * 0.001).toFixed(3)} ETH)
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                disabled={isPurchasing}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 text-gray-800 dark:text-gray-200 rounded-lg disabled:opacity-50"
              >
                Cancel
              </button>
              <AnimatedButton
                onClick={handleBatchPurchase}
                disabled={isPurchasing || selectedTokens.size === 0}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg disabled:opacity-50 flex items-center justify-center"
              >
                {isPurchasing ? (
                  <>
                    <PulsingDotsSpinner size={16} color="bg-white" />
                    <span className="ml-2">Purchasing...</span>
                  </>
                ) : (
                  <>
                    <FiShoppingCart className="mr-2" />
                    Purchase {selectedTokens.size} Token{selectedTokens.size !== 1 ? 's' : ''}
                  </>
                )}
              </AnimatedButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchPurchaseModal; 