'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

  useEffect(() => {
    console.log('[NftMintingSection] Received or updated landListingId prop:', landListingId);
  }, [landListingId]);
  
  const [mintStatus, setMintStatus] = useState<string>('NOT_STARTED');
  const [mintingInProgress, setMintingInProgress] = useState<boolean>(false);
  const [mintingError, setMintingError] = useState<string | null>(null);
  const [mintingResult, setMintingResult] = useState<any>(null);
  const [mintingProgressMessage, setMintingProgressMessage] = useState<string>('');

  // Function to convert file to base64
  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }, []);

  // Check minting status when component mounts or landListingId or status changes
  useEffect(() => {
    let intervalId: number | undefined;
    if (landListingId && (mintStatus === 'PENDING' || (mintStatus === 'NOT_STARTED' && !mintingResult))) {
      checkMintingStatus();
      intervalId = setInterval(checkMintingStatus, 7000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [landListingId, mintStatus, mintingResult]);

  // Function to check the minting status from the GET endpoint
  const checkMintingStatus = async () => {
    if (!landListingId) return;
    console.log(`Checking mint status for ${landListingId}... Current status: ${mintStatus}`);
    try {
      const response = await fetch(`/api/nft/mint?landListingId=${landListingId}`);
      const data = await response.json();

      if (data.success) {
        console.log('Mint status from API:', data.status, data.data);
        setMintStatus(data.status);
        if (data.status === 'COMPLETED' && data.data) {
          setMintingResult(data.data);
          setMintingProgressMessage('NFT Minted Successfully!');
          setMintingInProgress(false);
        } else if (data.status === 'FAILED') {
          setMintingError(data.error || 'Minting failed. Check server logs.');
          setMintingInProgress(false);
        }
      } else {
        console.warn('Failed to check minting status:', data.message);
      }
    } catch (error) {
      console.error('Error checking minting status:', error);
    }
  };

  // Function to initiate the minting process
  const handleMintNFT = async () => {
    console.log('[NftMintingSection] handleMintNFT called with landListingId:', landListingId);

    if (!landListingId || !isEvmWalletConnected || !connectedEvmAddress) {
      setMintingError("Land listing ID is missing or wallet not connected.");
      return;
    }

    const { nftTitle, nftDescription, nftImageFile } = formData;

    if (!nftTitle || !nftImageFile) {
      setMintingError("NFT Title and Image are required to mint.");
      return;
    }

    setMintingInProgress(true);
    setMintingError(null);
    setMintingResult(null);
    setMintStatus('PENDING');
    setMintingProgressMessage('Preparing NFT data...');

    try {
      setMintingProgressMessage('Converting image to Base64...');
      const imageBase64 = await fileToBase64(nftImageFile);

      console.log('[NftMintingSection] Value of formData.nftCollectionSize before payload construction:', formData.nftCollectionSize);
      const payload = {
        landListingId,
        nftTitle,
        nftDescription: nftDescription || '',
        imageBase64,
        ownerAddress: connectedEvmAddress,
      collectionSize: formData.nftCollectionSize, // Send the desired collection size
      };
      console.log('[NftMintingSection] Payload for /api/nft/mint-json:', payload);
      setMintingProgressMessage('Sending mint request to server...');
      const response = await fetch('/api/nft/mint-json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setMintingProgressMessage('Minting request accepted. Waiting for blockchain confirmation...');
        if(data.data && data.data.transactionHash){
          setMintingResult(data.data);
        }
      } else {
        setMintingError(data.details || data.error || 'Failed to mint NFT');
        setMintStatus('FAILED');
        setMintingInProgress(false);
      }
    } catch (error: any) {
      console.error('Error minting NFT:', error);
      setMintingError(error.message || 'An error occurred while minting NFT');
      setMintStatus('FAILED');
      setMintingInProgress(false);
    }
  };

  // Determine if minting is possible
  const canMint = landListingId && 
                  isEvmWalletConnected && 
                  formData.nftImageFile &&
                  formData.nftTitle &&
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
        NFT Minting (via Create Listing Page)
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

      {!landListingId && (
         <div className="mb-4 p-3 bg-amber-100 text-amber-700 rounded-md flex items-center">
            <FiInfo className="mr-2"/>
            <span>Please save the land listing first to enable NFT minting. The NFT details (title, description, image) are taken from the form sections above.</span>
        </div>
      )}

      {landListingId && (!formData.nftTitle || !formData.nftImageFile) && (
        <div className="mb-4 p-3 bg-amber-100 text-amber-700 rounded-md flex items-center">
            <FiAlertCircle className="mr-2"/>
            <span>Please provide an NFT Title and upload an NFT Image in the 'NFT Details' section above to enable minting.</span>
        </div>
      )}

      {/* Minting Information */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">About NFT Minting</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Minting will create a collection of 100 NFTs on the Ethereum Sepolia testnet. The main NFT will contain all property details, while the additional 99 NFTs represent fractional ownership shares.
        </p>
        
        {process.env.NEXT_PUBLIC_BASE_URL?.includes('ngrok') ? (
          <div className="flex items-start mb-4 p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
            <div className="mt-0.5 mr-3 flex-shrink-0 text-green-500">
              <FiCheckCircle size={18} />
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <p>Using ngrok for public access: <span className="font-mono text-xs">{process.env.NEXT_PUBLIC_BASE_URL}</span></p>
              <p className="text-xs mt-1">Your metadata and images will be accessible to the smart contract through this public URL.</p>
            </div>
          </div>
        ) : (
          <div className="flex items-start mb-4 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-md">
            <div className="mt-0.5 mr-3 flex-shrink-0 text-amber-500">
              <FiAlertCircle size={18} />
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <p>You appear to be using a local URL: <span className="font-mono text-xs">{process.env.NEXT_PUBLIC_BASE_URL || 'localhost'}</span></p>
              <p className="text-xs mt-1">For smart contracts to access your NFT data, set up ngrok and add the URL to <span className="font-mono text-xs">.env.local</span> as <span className="font-mono text-xs">NEXT_PUBLIC_BASE_URL</span>.</p>
            </div>
          </div>
        )}
        
        <div className="flex items-start mb-4">
          <div className="mt-0.5 mr-3 flex-shrink-0 text-blue-500">
            <FiInfo size={18} />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>Minting is only available after the land listing has been created and approved. The minting process may take a few minutes to complete.</p>
          </div>
        </div>
      </div>

      {/* Minting Status Display */}
      {landListingId && (
        <div className="mb-6 p-4 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Minting Status</h3>
          
          <div className="flex items-center mb-2">
            <div className={`mr-3 flex-shrink-0 ${
              mintStatus === 'COMPLETED' ? 'text-green-500' : 
              mintStatus === 'PENDING' ? 'text-amber-500 animate-pulse' : 
              mintStatus === 'FAILED' ? 'text-red-500' : 
              'text-gray-400'
            }`}>
              {mintStatus === 'COMPLETED' ? <FiCheckCircle size={18} /> : 
               mintStatus === 'FAILED' ? <FiAlertCircle size={18} /> : 
               mintStatus === 'PENDING' ? <span className="inline-block w-4 h-4 border-2 border-current rounded-full border-t-transparent animate-spin"></span> :
               <FiInfo size={18}/>
              }
            </div>
            <span className="text-sm font-medium">
              {mintStatus === 'NOT_STARTED' ? 'Ready to Mint' : 
               mintStatus === 'PENDING' ? `Minting in Progress... ${mintingProgressMessage}` : 
               mintStatus === 'COMPLETED' ? 'Minting Completed' : 
               mintStatus === 'FAILED' ? 'Minting Failed' :
               mintStatus
              }
            </span>
          </div>
          
          {mintingError && (
            <p className="text-sm text-red-500 mt-2">{mintingError}</p>
          )}
          
          {mintingResult && mintStatus === 'COMPLETED' && (
            <div className="mt-4 text-sm space-y-1">
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-800 dark:text-gray-200">Transaction Hash:</span>{' '}
                <a 
                  href={`https://sepolia.etherscan.io/tx/${mintingResult.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {mintingResult.transactionHash?.slice(0,10)}...{mintingResult.transactionHash?.slice(-8)}
                </a>
              </p>
              {mintingResult.tokenId && <p className="text-gray-600 dark:text-gray-400"><span className="font-medium text-gray-800 dark:text-gray-200">Token ID:</span> {mintingResult.tokenId}</p>}
              {mintingResult.listingId && <p className="text-gray-600 dark:text-gray-400"><span className="font-medium text-gray-800 dark:text-gray-200">Marketplace Listing ID:</span> {mintingResult.listingId}</p>}
            </div>
          )}
        </div>
      )}

      {/* Minting Button */}
      <div className="mt-6">
        <AnimatedButton
          onClick={handleMintNFT}
          disabled={!canMint}
          className={`px-6 py-3 text-lg rounded-lg font-semibold transition-all duration-150 ease-in-out ${
            canMint
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
              : 'bg-gray-300 dark:bg-zinc-700 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-70'
          }`}
          loading={mintingInProgress}
          loadingText="Processing..."
        >
          {mintStatus === 'COMPLETED' ? 'Minted Successfully' : mintStatus === 'FAILED' ? 'Retry Mint' : 'Mint Land NFT'}
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
