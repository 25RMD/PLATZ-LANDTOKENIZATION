import React, { useState, useEffect } from 'react';
import { FiExternalLink, FiFileText, FiCode } from 'react-icons/fi';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface NFTMetadataSectionProps {
  contractAddress: string;
  tokenId: string;
  metadataUri: string;
  mintTransactionHash: string;
}

interface Metadata {
  name: string;
  description: string;
  image: string;
  attributes: {
    trait_type: string;
    value: string | number;
  }[];
  [key: string]: any;
}

const NFTMetadataSection: React.FC<NFTMetadataSectionProps> = ({
  contractAddress,
  tokenId,
  metadataUri,
  mintTransactionHash,
}) => {
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch metadata on mount
  useEffect(() => {
    if (metadataUri) {
      fetchMetadata();
    } else {
      setLoading(false);
    }
  }, [metadataUri]);

  // Function to fetch metadata
  const fetchMetadata = async () => {
    setLoading(true);
    setError(null);

    try {
      // Handle different URI formats
      let uri = metadataUri;
      
      // If it's an IPFS URI, use a public gateway
      if (uri.startsWith('ipfs://')) {
        uri = uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
      }
      
      // If it's an Arweave URI, use Arweave gateway
      if (uri.startsWith('ar://')) {
        uri = uri.replace('ar://', 'https://arweave.net/');
      }
      
      // For local storage, we're already using the correct API path format

      // For demo purposes, we're simulating metadata if it's not available
      if (!uri || uri === 'placeholder') {
        // Simulate metadata for demo purposes
        setMetadata({
          name: `Land Token #${tokenId}`,
          description: "This is a placeholder metadata for the land token.",
          image: "",
          attributes: [
            { trait_type: "Collection ID", value: "Placeholder" },
            { trait_type: "Token ID", value: tokenId },
            { trait_type: "Contract", value: contractAddress },
          ]
        });
        setLoading(false);
        return;
      }

      const response = await fetch(uri);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.status}`);
      }

      const data = await response.json();
      setMetadata(data);
    } catch (err: any) {
      console.error('Error fetching metadata:', err);
      setError(err.message || 'An error occurred while fetching the metadata');
      
      // Set placeholder metadata on error
      setMetadata({
        name: `Land Token #${tokenId}`,
        description: "Could not load metadata. This is a placeholder.",
        image: "",
        attributes: [
          { trait_type: "Collection ID", value: "Error loading" },
          { trait_type: "Token ID", value: tokenId },
          { trait_type: "Contract", value: contractAddress },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  // Format JSON for display
  const formatJSON = (obj: any) => {
    return JSON.stringify(obj, null, 2);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
        NFT Metadata
      </h2>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Transaction Information */}
          <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <FiFileText className="mr-2 text-blue-600 dark:text-blue-400" /> Transaction Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Contract Address</p>
                <div className="flex items-center">
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100 break-all mr-2">
                    {contractAddress}
                  </p>
                  <a
                    href={`https://sepolia.etherscan.io/address/${contractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    <FiExternalLink size={16} />
                  </a>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Token ID</p>
                <div className="flex items-center">
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100 mr-2">
                    {tokenId}
                  </p>
                  <a
                    href={`https://sepolia.etherscan.io/token/${contractAddress}?a=${tokenId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    <FiExternalLink size={16} />
                  </a>
                </div>
              </div>
              
              {mintTransactionHash && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Mint Transaction</p>
                  <div className="flex items-center">
                    <p className="text-base font-medium text-gray-900 dark:text-gray-100 break-all mr-2">
                      {mintTransactionHash}
                    </p>
                    <a
                      href={`https://sepolia.etherscan.io/tx/${mintTransactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      <FiExternalLink size={16} />
                    </a>
                  </div>
                </div>
              )}
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Metadata URI</p>
                <div className="flex items-center">
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100 break-all mr-2">
                    {metadataUri || 'Not available'}
                  </p>
                  {metadataUri && !metadataUri.startsWith('placeholder') && (
                    <a
                      href={metadataUri.startsWith('ipfs://') 
                        ? metadataUri.replace('ipfs://', 'https://ipfs.io/ipfs/') 
                        : metadataUri.startsWith('ar://') 
                          ? metadataUri.replace('ar://', 'https://arweave.net/') 
                          : metadataUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      <FiExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Metadata Content */}
          {metadata && (
            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <FiCode className="mr-2 text-blue-600 dark:text-blue-400" /> Metadata Content
              </h3>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                {/* Metadata Attributes */}
                {metadata.attributes && metadata.attributes.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-3">Attributes</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {metadata.attributes.map((attr, index) => (
                        <div 
                          key={index} 
                          className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg p-3"
                        >
                          <p className="text-xs text-gray-500 dark:text-gray-400">{attr.trait_type}</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {attr.value.toString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Raw JSON */}
                <div>
                  <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-3">Raw JSON</h4>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                    {formatJSON(metadata)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NFTMetadataSection;
