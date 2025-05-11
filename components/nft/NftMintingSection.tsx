'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';
import AnimatedButton from '@/components/common/AnimatedButton';
import { FormDataInterface } from '@/types/createListing';

interface NftMintingProps {
  landListingId?: string;
  formData: FormDataInterface;
  isSubmitting: boolean;
  isEditMode: boolean;
  inputFieldStyles: string;
  inputFieldDisabledStyles: string;
}

const NftMintingSection: React.FC<NftMintingProps> = ({
  landListingId,
  formData,
  isSubmitting,
  isEditMode,
  inputFieldStyles,
  inputFieldDisabledStyles,
}) => {
  const { address: connectedEvmAddress, isConnected: isEvmWalletConnected } = useAccount();
  
  const [mintStatus, setMintStatus] = useState<string>('NOT_STARTED');
  const [mintingInProgress, setMintingInProgress] = useState<boolean>(false);
  const [mintingError, setMintingError] = useState<string | null>(null);
  const [mintingResult, setMintingResult] = useState<any>(null);
  const [mintingProgress, setMintingProgress] = useState<number>(0);

  // Check minting status when component mounts or landListingId or status changes
  useEffect(() => {
    let interval: number;
    if (landListingId && (mintStatus === 'PENDING' || mintStatus === 'NOT_STARTED')) {
      checkMintingStatus();
      interval = setInterval(checkMintingStatus, 5000);
    }
    return () => clearInterval(interval);
  }, [landListingId, mintStatus]);

  // Function to check the minting status
  const checkMintingStatus = async () => {
    if (!landListingId) return;

    try {
      const response = await fetch(`/api/nft/mint?landListingId=${landListingId}`);
      const data = await response.json();

      if (data.success) {
        setMintStatus(data.status);
        if (data.status === 'COMPLETED' && data.data) {
          setMintingResult(data.data);
        }
      }
    } catch (error) {
      console.error('Error checking minting status:', error);
    }
  };

  // Function to initiate the minting process
  const handleMintNFT = async () => {
    if (!landListingId || !isEvmWalletConnected) return;

    setMintingInProgress(true);
    setMintingError(null);
    setMintingProgress(10);

    try {
      // Call the API to initiate minting
      const response = await fetch('/api/nft/mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          landListingId,
        }),
      });

      setMintingProgress(50);

      const data = await response.json();

      if (data.success) {
        // Rely on server-driven status updates
        setMintStatus('PENDING');
        setMintingProgress(50);
      } else {
        setMintingError(data.message || 'Failed to mint NFT collection');
        setMintStatus('FAILED');
      }
    } catch (error: any) {
      console.error('Error minting NFT collection:', error);
      setMintingError(error.message || 'An error occurred while minting NFT collection');
      setMintStatus('FAILED');
    } finally {
      setMintingInProgress(false);
    }
  };

  // Determine if minting is possible
  const canMint = landListingId && 
                  isEvmWalletConnected && 
                  mintStatus !== 'COMPLETED' && 
                  mintStatus !== 'PENDING' && 
                  !isSubmitting && 
                  !mintingInProgress;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="pt-8 px-8 pb-6 border-t border-gray-200 dark:border-zinc-800"
    >
      <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-6 flex items-center">
        <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full mr-3 flex items-center justify-center text-sm font-bold">9</span>
        Ethereum NFT Minting
      </h2>

      {/* Wallet Connection Status */}
      <div className="mb-6 p-4 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700">
        <div className="flex items-start">
          <div className={`mt-0.5 mr-3 flex-shrink-0 ${isEvmWalletConnected ? 'text-green-500' : 'text-amber-500'}`}>
            {isEvmWalletConnected ? <FiCheckCircle size={20} /> : <FiAlertCircle size={20} />}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {isEvmWalletConnected ? 'Wallet Connected' : 'Wallet Not Connected'}
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {isEvmWalletConnected 
                ? `Connected with address: ${connectedEvmAddress?.slice(0, 6)}...${connectedEvmAddress?.slice(-4)}`
                : 'Please connect your Ethereum wallet to mint NFTs. You can connect your wallet from the profile page.'}
            </p>
          </div>
        </div>
      </div>

      {/* Minting Information */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">About NFT Minting</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Minting will create a collection of 100 NFTs on the Ethereum Sepolia testnet. The main NFT will contain all property details, while the additional 99 NFTs represent fractional ownership shares.
        </p>
        
        <div className="flex items-start mb-4">
          <div className="mt-0.5 mr-3 flex-shrink-0 text-blue-500">
            <FiInfo size={18} />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>Minting is only available after the land listing has been created and approved. The minting process may take a few minutes to complete.</p>
          </div>
        </div>
      </div>

      {/* Minting Status */}
      {landListingId && (
        <div className="mb-6 p-4 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Minting Status</h3>
          
          <div className="flex items-center mb-2">
            <div className={`mr-3 flex-shrink-0 ${
              mintStatus === 'COMPLETED' ? 'text-green-500' : 
              mintStatus === 'PENDING' ? 'text-amber-500' : 
              mintStatus === 'FAILED' ? 'text-red-500' : 
              'text-gray-400'
            }`}>
              {mintStatus === 'COMPLETED' ? <FiCheckCircle size={18} /> : 
               mintStatus === 'FAILED' ? <FiAlertCircle size={18} /> : 
               <span className="inline-block w-4 h-4 border-2 border-current rounded-full border-b-transparent animate-spin"></span>}
            </div>
            <span className="text-sm font-medium">
              {mintStatus === 'NOT_STARTED' ? 'Not Started' : 
               mintStatus === 'PENDING' ? 'Minting in Progress' : 
               mintStatus === 'COMPLETED' ? 'Minting Completed' : 
               'Minting Failed'}
            </span>
          </div>
          
          {mintingInProgress && (
            <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2.5 mb-4">
              <div 
                className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full" 
                style={{ width: `${mintingProgress}%` }}
              ></div>
            </div>
          )}
          
          {mintingError && (
            <p className="text-sm text-red-500 mt-2">{mintingError}</p>
          )}
          
          {mintingResult && (
            <div className="mt-4 text-sm">
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">Collection ID:</span> {mintingResult.collectionId}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">Main Token ID:</span> {mintingResult.mainTokenId}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">Transaction:</span>{' '}
                <a 
                  href={`https://sepolia.etherscan.io/tx/${mintingResult.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View on Etherscan
                </a>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Minting Button */}
      <div className="mt-6">
        <AnimatedButton
          onClick={handleMintNFT}
          disabled={!canMint}
          className={`px-6 py-2 rounded-lg font-medium ${
            canMint
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 dark:bg-zinc-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }`}
          loading={mintingInProgress}
          loadingText="Minting..."
        >
          Mint NFT Collection
        </AnimatedButton>
        
        {!landListingId && (
          <p className="mt-2 text-sm text-amber-500">
            Save the land listing first before minting.
          </p>
        )}
        
        {!isEvmWalletConnected && landListingId && (
          <p className="mt-2 text-sm text-amber-500">
            Connect your Ethereum wallet to mint NFTs.
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default NftMintingSection;
