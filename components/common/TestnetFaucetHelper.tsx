import React from 'react';
import { FiExternalLink, FiDroplet } from 'react-icons/fi';
import { useAccount } from 'wagmi';

interface TestnetFaucetHelperProps {
  className?: string;
}

const TestnetFaucetHelper: React.FC<TestnetFaucetHelperProps> = ({ className = '' }) => {
  const { address } = useAccount();

  const faucets = [
    {
      name: 'Sepolia Faucet',
      url: 'https://sepoliafaucet.com/',
      description: 'Get 0.5 ETH per day',
      requirements: 'Requires Alchemy account'
    },
    {
      name: 'Chainlink Faucet',
      url: 'https://faucets.chain.link/sepolia',
      description: 'Get 0.1 ETH per request',
      requirements: 'Connect wallet required'
    },
    {
      name: 'QuickNode Faucet',
      url: 'https://faucet.quicknode.com/ethereum/sepolia',
      description: 'Get 0.05 ETH per day',
      requirements: 'Twitter verification'
    }
  ];

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      // You could add a toast notification here
    }
  };

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800 ${className}`}>
      <div className="flex items-center mb-4">
        <FiDroplet className="text-blue-600 dark:text-blue-400 mr-2" size={20} />
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
          Get Sepolia Testnet ETH
        </h3>
      </div>
      
      <p className="text-blue-700 dark:text-blue-300 mb-4 text-sm">
        You need testnet ETH to place bids and interact with the marketplace. Here are some reliable faucets:
      </p>

      {address && (
        <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded border">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Your wallet address:</p>
          <div className="flex items-center justify-between">
            <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
              {address.slice(0, 6)}...{address.slice(-4)}
            </code>
            <button
              onClick={copyAddress}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-xs underline"
            >
              Copy Full Address
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {faucets.map((faucet, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border">
            <div className="flex-1">
              <div className="flex items-center">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                  {faucet.name}
                </h4>
                <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                  {faucet.description}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {faucet.requirements}
              </p>
            </div>
            <a
              href={faucet.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-3 inline-flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
            >
              Get ETH
              <FiExternalLink className="ml-1" size={12} />
            </a>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
        <p className="text-yellow-800 dark:text-yellow-200 text-xs">
          <strong>Note:</strong> These are testnet faucets for Sepolia network only. 
          The ETH has no real value and is only for testing purposes.
        </p>
      </div>
    </div>
  );
};

export default TestnetFaucetHelper; 