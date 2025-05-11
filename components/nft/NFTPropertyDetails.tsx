import React from 'react';
import { FiMapPin, FiMaximize, FiGrid, FiFileText, FiCalendar } from 'react-icons/fi';

interface NFTCollection {
  id: string;
  nftTitle: string;
  nftDescription: string;
  listingPrice: number;
  priceCurrency: string;
  nftImageFileRef: string;
  nftCollectionSize: number;
  country: string;
  state: string;
  localGovernmentArea: string;
  propertyAreaSqm: number;
  latitude: string;
  longitude: string;
  contractAddress: string;
  collectionId: string;
  mainTokenId: string;
  metadataUri: string;
  evmOwnerAddress: string;
  isListedForSale: boolean;
  listingPriceEth: number;
  mintTransactionHash: string;
  mintTimestamp: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    evmAddress: string;
  };
  evmCollectionTokens: {
    tokenId: string;
    tokenURI: string;
    ownerAddress: string;
    isListed: boolean;
    listingPrice: number;
  }[];
}

interface NFTPropertyDetailsProps {
  collection: NFTCollection;
}

const NFTPropertyDetails: React.FC<NFTPropertyDetailsProps> = ({ collection }) => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
        Property Details
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Location Information */}
        <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <FiMapPin className="mr-2 text-blue-600 dark:text-blue-400" /> Location Information
          </h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Country</p>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                {collection.country || 'Not specified'}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">State/Province</p>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                {collection.state || 'Not specified'}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Local Government Area</p>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                {collection.localGovernmentArea || 'Not specified'}
              </p>
            </div>
            
            {collection.latitude && collection.longitude && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Coordinates</p>
                <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {collection.latitude}, {collection.longitude}
                </p>
                <a
                  href={`https://maps.google.com/?q=${collection.latitude},${collection.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-1 inline-block"
                >
                  View on Google Maps
                </a>
              </div>
            )}
          </div>
        </div>
        
        {/* Property Specifications */}
        <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <FiMaximize className="mr-2 text-blue-600 dark:text-blue-400" /> Property Specifications
          </h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Property Area</p>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                {collection.propertyAreaSqm ? `${collection.propertyAreaSqm} square meters` : 'Not specified'}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Collection Size</p>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                {collection.nftCollectionSize} NFTs
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                1 main NFT + {collection.nftCollectionSize - 1} fractional ownership tokens
              </p>
            </div>
          </div>
        </div>
        
        {/* NFT Information */}
        <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <FiGrid className="mr-2 text-blue-600 dark:text-blue-400" /> NFT Information
          </h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Collection ID</p>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                {collection.collectionId}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Main Token ID</p>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                {collection.mainTokenId}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Contract Address</p>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100 break-all">
                {collection.contractAddress}
              </p>
              <a
                href={`https://sepolia.etherscan.io/address/${collection.contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-1 inline-block"
              >
                View on Etherscan
              </a>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Owner Address</p>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100 break-all">
                {collection.evmOwnerAddress}
              </p>
            </div>
          </div>
        </div>
        
        {/* Listing Information */}
        <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <FiFileText className="mr-2 text-blue-600 dark:text-blue-400" /> Listing Information
          </h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Listing Status</p>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                {collection.isListedForSale ? 'Listed for Sale' : 'Not Listed'}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Listing Price</p>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                {collection.listingPriceEth} ETH
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Created By</p>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                {collection.user?.username || 'Unknown'}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Created On</p>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                {new Date(collection.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTPropertyDetails;
