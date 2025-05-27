'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiExternalLink, FiCopy, FiCheck, FiAlertCircle, FiDollarSign } from 'react-icons/fi';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import AnimatedButton from '@/components/common/AnimatedButton';
import toast from 'react-hot-toast';

const SEPOLIA_CHAIN_ID = 11155111;

interface Faucet {
  name: string;
  url: string;
  description: string;
  requirements: string[];
  dailyLimit: string;
  icon: string;
}

const faucets: Faucet[] = [
  {
    name: 'Sepolia Faucet (Alchemy)',
    url: 'https://sepoliafaucet.com/',
    description: 'Official Alchemy Sepolia faucet with social login',
    requirements: ['Sign in with Alchemy account', 'Twitter/GitHub verification'],
    dailyLimit: '0.5 ETH per day',
    icon: '🔮'
  },
  {
    name: 'Infura Sepolia Faucet',
    url: 'https://www.infura.io/faucet/sepolia',
    description: 'Infura\'s reliable Sepolia testnet faucet',
    requirements: ['Create Infura account', 'Email verification'],
    dailyLimit: '0.5 ETH per day',
    icon: '🌐'
  },
  {
    name: 'QuickNode Sepolia Faucet',
    url: 'https://faucet.quicknode.com/ethereum/sepolia',
    description: 'QuickNode\'s fast and reliable faucet',
    requirements: ['Twitter account verification'],
    dailyLimit: '0.25 ETH per day',
    icon: '⚡'
  },
  {
    name: 'Chainlink Sepolia Faucet',
    url: 'https://faucets.chain.link/sepolia',
    description: 'Chainlink\'s community faucet for Sepolia',
    requirements: ['reCAPTCHA verification'],
    dailyLimit: '0.1 ETH per day',
    icon: '🔗'
  },
  {
    name: 'Ethereum Sepolia Faucet',
    url: 'https://sepolia-faucet.pk910.de/',
    description: 'Community-run faucet with mining option',
    requirements: ['Browser mining or social verification'],
    dailyLimit: 'Variable based on mining',
    icon: '⛏️'
  }
];

const GetTestnetEthPage: React.FC = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [copiedAddress, setCopiedAddress] = useState(false);

  const isOnSepoliaNetwork = chainId === SEPOLIA_CHAIN_ID;

  const copyAddress = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        setCopiedAddress(true);
        toast.success('Address copied to clipboard!');
        setTimeout(() => setCopiedAddress(false), 2000);
      } catch (err) {
        toast.error('Failed to copy address');
      }
    }
  };

  const handleSwitchToSepolia = () => {
    switchChain({ chainId: SEPOLIA_CHAIN_ID });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
            <FiDollarSign className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Get Sepolia Testnet ETH
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Get free testnet ETH to interact with our NFT marketplace on the Sepolia network. 
            Choose from multiple reliable faucets below.
          </p>
        </motion.div>

        {/* Wallet Connection Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Your Wallet Status
          </h2>
          
          {!isConnected ? (
            <div className="flex items-center p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <FiAlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3" />
              <div>
                <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                  Wallet Not Connected
                </p>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                  Please connect your wallet using the button in the header to get your address for the faucets.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div>
                  <p className="text-green-800 dark:text-green-200 font-medium">
                    Wallet Connected ✅
                  </p>
                  <p className="text-green-700 dark:text-green-300 text-sm font-mono">
                    {address}
                  </p>
                </div>
                <AnimatedButton
                  onClick={copyAddress}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  {copiedAddress ? (
                    <>
                      <FiCheck className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <FiCopy className="w-4 h-4 mr-2" />
                      Copy Address
                    </>
                  )}
                </AnimatedButton>
              </div>

              {/* Network Status */}
              <div className={`flex items-center justify-between p-4 border rounded-lg ${
                isOnSepoliaNetwork 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
              }`}>
                <div>
                  <p className={`font-medium ${
                    isOnSepoliaNetwork 
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-orange-800 dark:text-orange-200'
                  }`}>
                    {isOnSepoliaNetwork ? 'On Sepolia Network ✅' : 'Wrong Network ⚠️'}
                  </p>
                  <p className={`text-sm ${
                    isOnSepoliaNetwork 
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-orange-700 dark:text-orange-300'
                  }`}>
                    {isOnSepoliaNetwork 
                      ? 'You\'re on the correct network for testnet ETH'
                      : `Currently on Chain ID: ${chainId}. Switch to Sepolia (${SEPOLIA_CHAIN_ID})`
                    }
                  </p>
                </div>
                {!isOnSepoliaNetwork && (
                  <AnimatedButton
                    onClick={handleSwitchToSepolia}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg"
                  >
                    Switch to Sepolia
                  </AnimatedButton>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            How to Get Testnet ETH
          </h2>
          <div className="space-y-3 text-gray-600 dark:text-gray-400">
            <div className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium mr-3 mt-0.5">1</span>
              <p>Choose a faucet from the list below based on your preferences and requirements.</p>
            </div>
            <div className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium mr-3 mt-0.5">2</span>
              <p>Copy your wallet address using the button above (if connected).</p>
            </div>
            <div className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium mr-3 mt-0.5">3</span>
              <p>Visit the faucet website and follow their verification process.</p>
            </div>
            <div className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium mr-3 mt-0.5">4</span>
              <p>Paste your wallet address and request testnet ETH.</p>
            </div>
            <div className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium mr-3 mt-0.5">5</span>
              <p>Wait for the transaction to complete (usually 1-2 minutes).</p>
            </div>
          </div>
        </motion.div>

        {/* Faucets List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Available Faucets
          </h2>
          
          {faucets.map((faucet, index) => (
            <motion.div
              key={faucet.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-3">{faucet.icon}</span>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {faucet.name}
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {faucet.description}
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Requirements:
                      </h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {faucet.requirements.map((req, idx) => (
                          <li key={idx} className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Daily Limit:
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {faucet.dailyLimit}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="ml-6">
                  <a
                    href={faucet.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    Visit Faucet
                    <FiExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mt-8"
        >
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            💡 Pro Tips
          </h3>
          <ul className="space-y-2 text-blue-800 dark:text-blue-200 text-sm">
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-2"></span>
              Try multiple faucets if one is rate-limited or temporarily unavailable.
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-2"></span>
              Some faucets require social media verification to prevent abuse.
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-2"></span>
              Testnet ETH has no real value - it's only for testing purposes.
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-2"></span>
              You typically need 0.01-0.1 ETH for gas fees when placing bids.
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default GetTestnetEthPage; 