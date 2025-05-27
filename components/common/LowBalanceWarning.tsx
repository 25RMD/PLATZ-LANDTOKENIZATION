import React from 'react';
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import Link from 'next/link';
import AnimatedButton from './AnimatedButton';

interface LowBalanceWarningProps {
  threshold?: number; // ETH threshold below which to show warning
  onDismiss?: () => void;
  isDismissed?: boolean;
}

const LowBalanceWarning: React.FC<LowBalanceWarningProps> = ({ 
  threshold = 0.01, 
  onDismiss,
  isDismissed = false 
}) => {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });

  if (!isConnected || !balance || isDismissed) {
    return null;
  }

  const balanceInEth = parseFloat(formatEther(balance.value));
  
  if (balanceInEth >= threshold) {
    return null;
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <FiAlertTriangle className="text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5 flex-shrink-0" size={20} />
        <div className="flex-1">
          <h3 className="text-yellow-800 dark:text-yellow-200 font-medium text-sm mb-1">
            Low ETH Balance
          </h3>
          <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-3">
            Your balance is {balanceInEth.toFixed(4)} ETH. You may need more ETH to place bids or make transactions.
          </p>
          <Link href="/get-testnet-eth">
            <AnimatedButton className="bg-yellow-600 hover:bg-yellow-700 text-white py-1 px-3 rounded text-sm">
              Get Testnet ETH
            </AnimatedButton>
          </Link>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 ml-2"
          >
            <FiX size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default LowBalanceWarning; 