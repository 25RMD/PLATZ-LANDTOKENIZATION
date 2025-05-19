import React, { useState, useCallback } from 'react';
import NFTImageUploader from './NFTImageUploader';

interface MintNFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMint: (data: MintNFTData) => Promise<void>;
  listingId: string;
  listingTitle: string;
  listingDescription?: string;
  isSubmitting: boolean;
}

export interface MintNFTData {
  nftTitle: string;
  nftDescription: string;
  imageFile: File;
  landListingId: string;
}

const MintNFTModal: React.FC<MintNFTModalProps> = ({
  isOpen,
  onClose,
  onMint,
  listingId,
  listingTitle,
  listingDescription = '',
  isSubmitting
}) => {
  const [nftTitle, setNftTitle] = useState<string>(listingTitle || '');
  const [nftDescription, setNftDescription] = useState<string>(listingDescription || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = useCallback((file: File) => {
    setImageFile(file);
    setError(null);
  }, []);

  // Function to convert file to base64
  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!nftTitle.trim()) {
      setError('Please enter a title for your NFT');
      return;
    }
    
    if (!imageFile) {
      setError('Please upload an image for your NFT');
      return;
    }
    
    try {
      await onMint({
        nftTitle: nftTitle.trim(),
        nftDescription: nftDescription.trim(),
        imageFile,
        landListingId: listingId
      });
    } catch (err) {
      console.error('Error in modal submit:', err);
      setError('Failed to mint NFT. Please try again.');
    }
  }, [nftTitle, nftDescription, imageFile, listingId, onMint]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Mint Land NFT</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="nft-title" className="block text-sm font-medium text-gray-700 mb-1">
                NFT Title
              </label>
              <input
                type="text"
                id="nft-title"
                value={nftTitle}
                onChange={(e) => setNftTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter a title for your NFT"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="nft-description" className="block text-sm font-medium text-gray-700 mb-1">
                NFT Description
              </label>
              <textarea
                id="nft-description"
                value={nftDescription}
                onChange={(e) => setNftDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter a description for your NFT"
                rows={3}
                disabled={isSubmitting}
              />
            </div>
            
            <NFTImageUploader onImageSelected={handleImageSelected} />
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                disabled={isSubmitting || !imageFile}
              >
                {isSubmitting ? 'Minting...' : 'Mint NFT'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MintNFTModal; 