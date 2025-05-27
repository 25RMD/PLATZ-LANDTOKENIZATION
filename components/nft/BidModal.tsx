import React, { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient, useBalance, useChainId, useSwitchChain } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { FiX, FiDollarSign, FiAlertTriangle, FiExternalLink } from 'react-icons/fi';
import AnimatedButton from '@/components/common/AnimatedButton';
import PulsingDotsSpinner from '@/components/common/PulsingDotsSpinner';
import CurrencyInput from '@/components/common/CurrencyInput';
import { useCurrency } from '@/context/CurrencyContext';
import Link from 'next/link';
import { LAND_MARKETPLACE_ADDRESS, PLATZ_LAND_NFT_ADDRESS } from '@/config/contracts';
import { LandMarketplaceABI } from '@/contracts/LandMarketplaceABI';

// Sepolia chain ID constant
const SEPOLIA_CHAIN_ID = 11155111;

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBidPlaced: () => void;
  tokenId: string;
  tokenName: string;
  currentHighestBid?: number;
  floorPrice?: number;
  collectionId: string;
}

const BidModal: React.FC<BidModalProps> = ({
  isOpen,
  onClose,
  onBidPlaced,
  tokenId,
  tokenName,
  currentHighestBid = 0,
  floorPrice = 0,
  collectionId
}) => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { formatCurrencyAmount, formatEthAmount, formatPriceWithConversion } = useCurrency();
  
  // Get wallet balance
  const { data: balance, isLoading: balanceLoading } = useBalance({
    address: address,
  });

  // Check if user is on the correct network
  const isOnSepoliaNetwork = chainId === SEPOLIA_CHAIN_ID;

  const [bidAmount, setBidAmount] = useState<string>('');
  const [bidEthValue, setBidEthValue] = useState<number>(0);
  const [isPlacingBid, setIsPlacingBid] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [estimatedGasCost, setEstimatedGasCost] = useState<bigint | null>(null);

  // Calculate minimum bid (higher than current highest bid)
  const minimumBid = Math.max(currentHighestBid * 1.05, floorPrice * 0.8, 0.001);

  // Check if user has sufficient balance
  const userBalance = balance ? parseFloat(formatEther(balance.value)) : 0;
  const bidValue = bidEthValue; // Use the ETH value from CurrencyInput
  const estimatedGasInEth = estimatedGasCost ? parseFloat(formatEther(estimatedGasCost)) : 0.01; // Estimate 0.01 ETH for gas
  const totalCost = bidValue + estimatedGasInEth;
  const hasInsufficientFunds = userBalance < totalCost;

  // Debug logging (only when there's an issue)
  useEffect(() => {
    if (bidAmount && parseFloat(bidAmount) > 0 && hasInsufficientFunds && isOnSepoliaNetwork) {
      console.log('[BidModal] Insufficient funds debug:', {
        userBalance,
        bidValue,
        estimatedGasInEth,
        totalCost,
        minimumBid,
        chainId,
        isOnSepoliaNetwork
      });
    }
  }, [hasInsufficientFunds, userBalance, bidValue, estimatedGasInEth, totalCost, minimumBid, bidAmount, chainId, isOnSepoliaNetwork]);

  // Estimate gas cost when bid amount changes
  useEffect(() => {
    const estimateGas = async () => {
      if (!publicClient || !address || !bidEthValue || bidEthValue <= 0) {
        setEstimatedGasCost(null);
        return;
      }

      try {
        const bidValueWei = parseEther(bidEthValue.toString());
        const gasEstimate = await publicClient.estimateContractGas({
          address: LAND_MARKETPLACE_ADDRESS,
          abi: LandMarketplaceABI,
          functionName: 'placeBid',
          args: [PLATZ_LAND_NFT_ADDRESS, BigInt(tokenId)],
          value: bidValueWei,
          account: address,
        });
        
        // Get current gas price
        const gasPrice = await publicClient.getGasPrice();
        setEstimatedGasCost(gasEstimate * gasPrice);
      } catch (error) {
        // If estimation fails, use a conservative estimate
        setEstimatedGasCost(parseEther('0.01'));
      }
    };

    estimateGas();
  }, [bidEthValue, publicClient, address, tokenId]);

  const handlePlaceBid = async () => {
    if (!isConnected || !address || !walletClient || !publicClient) {
      setError('Please connect your wallet');
      return;
    }

    if (isNaN(bidEthValue) || bidEthValue <= 0) {
      setError('Please enter a valid bid amount');
      return;
    }

    if (bidEthValue < minimumBid) {
      setError(`Bid must be at least ${minimumBid.toFixed(4)} ETH`);
      return;
    }

    // Check for insufficient funds
    if (hasInsufficientFunds) {
      setError(`Insufficient funds. You need ${totalCost.toFixed(4)} ETH (${bidEthValue.toFixed(4)} ETH bid + ~${estimatedGasInEth.toFixed(4)} ETH gas) but only have ${userBalance.toFixed(4)} ETH`);
      return;
    }

    setIsPlacingBid(true);
    setError(null);

    try {
      const bidValueWei = parseEther(bidEthValue.toString());

      // Place bid on the smart contract
      const { request } = await publicClient.simulateContract({
        address: LAND_MARKETPLACE_ADDRESS,
        abi: LandMarketplaceABI,
        functionName: 'placeBid',
        args: [PLATZ_LAND_NFT_ADDRESS, BigInt(tokenId)],
        value: bidValueWei,
        account: address,
      });

      const transactionHash = await walletClient.writeContract(request);

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: transactionHash,
      });

      if (receipt.status === 'success') {
        // Record bid in database
        await fetch('/api/bids', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            collectionId,
            tokenId,
            bidAmount: bidEthValue, // Use bidEthValue instead of bidValue
            transactionHash,
            bidderAddress: address,
          }),
        });

        // Also record as a transaction (bid placement)
        try {
          await fetch('/api/transactions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              transactionType: 'BID_PLACED' as any, // Note: You may need to add this to the enum
              tokenId,
              collectionId,
              fromAddress: address!,
              toAddress: address!, // Bid is from self to self (placeholder)
              price: bidEthValue, // Use bidEthValue instead of bidValue
              currency: 'ETH',
              transactionHash,
              blockNumber: receipt.blockNumber ? Number(receipt.blockNumber) : undefined,
              gasUsed: receipt.gasUsed ? Number(receipt.gasUsed) : undefined
            }),
          });
        } catch (recordError) {
          console.error('Failed to record bid transaction:', recordError);
        }

        onBidPlaced();
        onClose();
        
        // Reset form
        setBidAmount('');
      } else {
        throw new Error('Transaction failed');
      }
    } catch (err: any) {
      console.error('Error placing bid:', err);
      
      // Provide more specific error messages
      if (err.message?.includes('insufficient funds')) {
        setError(`Insufficient funds. You need ${totalCost.toFixed(4)} ETH but only have ${userBalance.toFixed(4)} ETH. Please add more ETH to your wallet.`);
      } else if (err.message?.includes('User rejected')) {
        setError('Transaction was rejected. Please try again.');
      } else if (err.message?.includes('gas')) {
        setError('Transaction failed due to gas issues. Please try increasing gas limit or price.');
      } else {
        setError(err.message || 'Failed to place bid');
      }
    } finally {
      setIsPlacingBid(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Place Bid</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Token Info */}
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              You are placing a bid on:
            </p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {tokenName}
            </p>
          </div>

          {/* Current Market Info */}
          <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-500">Current High Bid</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {currentHighestBid > 0 ? formatPriceWithConversion(currentHighestBid) : 'No bids yet'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-500">Floor Price</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {floorPrice > 0 ? formatPriceWithConversion(floorPrice) : 'Not listed'}
                </p>
              </div>
            </div>
          </div>

          {/* Wallet Balance Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Your Wallet Balance {!isOnSepoliaNetwork && '(Wrong Network)'}
                </p>
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  {balanceLoading ? 'Loading...' : 
                   !isOnSepoliaNetwork ? 'Switch to Sepolia' :
                   `${userBalance.toFixed(4)} ETH`}
                </p>
                {isOnSepoliaNetwork && (
                  <p className="text-xs text-blue-500 dark:text-blue-300">
                    Sepolia Testnet
                  </p>
                )}
              </div>
              {bidAmount && parseFloat(bidAmount) > 0 && isOnSepoliaNetwork && (
                <div className="text-right">
                  <p className="text-sm text-blue-600 dark:text-blue-400">Total Cost</p>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    ~{totalCost.toFixed(4)} ETH
                  </p>
                  <p className="text-xs text-blue-500 dark:text-blue-300">
                    ({bidValue.toFixed(4)} bid + ~{estimatedGasInEth.toFixed(4)} gas)
                  </p>
                </div>
              )}
            </div>
            {hasInsufficientFunds && bidAmount && parseFloat(bidAmount) > 0 && isOnSepoliaNetwork && (
              <div className="mt-3 flex items-center text-red-600 dark:text-red-400">
                <FiAlertTriangle className="mr-2" size={16} />
                <span className="text-sm">
                  Insufficient funds for this bid. Need {totalCost.toFixed(4)} ETH, have {userBalance.toFixed(4)} ETH.
                </span>
              </div>
            )}
          </div>

          {/* Bid Amount Input */}
          <div className="mb-6">
            <CurrencyInput
              value={bidAmount}
              onChange={(value, ethValue) => {
                setBidAmount(value);
                setBidEthValue(ethValue);
                setError(null);
              }}
              label="Your Bid Amount"
              placeholder="0.0000"
              minEthAmount={minimumBid}
              showConversion={true}
              allowCurrencyToggle={true}
              error={bidEthValue > 0 && bidEthValue < minimumBid ? `Minimum bid: ${formatPriceWithConversion(minimumBid)}` : undefined}
            />
          </div>

          {/* Network Warning */}
          {isConnected && !isOnSepoliaNetwork && (
            <div className="mb-4 p-3 bg-orange-100 border border-orange-300 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-orange-700 text-sm">
                    <strong>Wrong Network:</strong> Please switch to Sepolia testnet to place bids.
                  </p>
                  <p className="text-orange-600 text-xs mt-1">
                    Current: Chain ID {chainId} | Required: Sepolia ({SEPOLIA_CHAIN_ID})
                  </p>
                </div>
                <AnimatedButton
                  onClick={() => switchChain({ chainId: SEPOLIA_CHAIN_ID })}
                  className="bg-orange-600 hover:bg-orange-700 text-white py-1 px-3 rounded text-sm"
                >
                  Switch Network
                </AnimatedButton>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isPlacingBid}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 text-gray-800 dark:text-gray-200 rounded-lg disabled:opacity-50"
            >
              Cancel
            </button>
            <AnimatedButton
              onClick={handlePlaceBid}
              disabled={isPlacingBid || !bidAmount || parseFloat(bidAmount) < minimumBid || hasInsufficientFunds || !isOnSepoliaNetwork}
              className={`flex-1 py-2 px-4 rounded-lg disabled:opacity-50 flex items-center justify-center ${
                !isOnSepoliaNetwork
                  ? 'bg-orange-600 hover:bg-orange-700 text-white'
                  : hasInsufficientFunds 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isPlacingBid ? (
                <>
                  <PulsingDotsSpinner size={16} color="bg-white" />
                  <span className="ml-2">Placing Bid...</span>
                </>
              ) : !isOnSepoliaNetwork ? (
                'Switch to Sepolia'
              ) : hasInsufficientFunds ? (
                'Insufficient Funds'
              ) : (
                'Place Bid'
              )}
            </AnimatedButton>
          </div>

          {/* Bid Info */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              <strong>Note:</strong> If your bid is outbid, your ETH will be automatically refunded to your wallet.
            </p>
            {hasInsufficientFunds && (
              <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm mb-3">
                  <strong>Need more ETH?</strong> You need testnet ETH to place bids on the Sepolia network.
                </p>
                <Link href="/get-testnet-eth">
                  <AnimatedButton className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded text-sm">
                    <FiExternalLink className="mr-2" size={14} />
                    Get Testnet ETH from Faucets
                  </AnimatedButton>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BidModal;