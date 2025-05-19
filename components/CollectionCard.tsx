import Link from "next/link";
import React from "react";
import { formatEther } from 'viem';

// Define the NFTCollection interface (copied from ExploreNFTPage.tsx)
interface NFTCollection {
  id: string;
  nftTitle: string;
  nftDescription: string;
  listingPrice: number; // This is listingPriceEth from transformation
  priceCurrency: string;
  nftImageFileRef: string;
  nftCollectionSize: number;
  country: string;
  state: string;
  localGovernmentArea: number;
  latitude: string;
  longitude: string;
  contractAddress: string;
  collectionId: string; // String version of the bigint collectionId
  mainTokenId: string;
  metadataUri: string;
  evmOwnerAddress: string;
  isListedForSale: boolean;
  listingPriceEth: number; // This is the primary price to use for display
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

const CollectionCard = ({ collection }: { collection: NFTCollection }) => {
  const formatDisplayPrice = (priceInEth?: number): string => {
    if (!collection.isListedForSale || typeof priceInEth === 'undefined' || priceInEth === 0) return "Not Listed";
    // priceInEth is already in ETH from the transformation
    return `${priceInEth.toFixed(4)} ETH`;
  };

  const displayCreator = (address: string) => {
    if (!address || address === "0x0000000000000000000000000000000000000000") return "Unknown Creator";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const linkHref = `/explore/collection/${collection.collectionId}`; // collectionId is already a string

  return (
    <Link href={linkHref} className="block bg-white dark:bg-zinc-900 rounded-xl overflow-hidden transition-all duration-300 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 shadow-lg hover:shadow-xl group transform hover:-translate-y-1">
      <div className="relative h-56 w-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
        <img
          src={collection.nftImageFileRef || '/placeholder-image.png'} // Use nftImageFileRef
          alt={collection.nftTitle || 'Collection Image'} // Use nftTitle
          className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
        />
        {collection.isListedForSale && ( // Use isListedForSale
          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2.5 py-1 rounded-full font-semibold shadow-md">
            FOR SALE
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2 gap-3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex-shrink truncate" title={collection.nftTitle || ''}> {/* Use nftTitle */}
            {collection.nftTitle || 'Untitled Collection'} {/* Use nftTitle */}
          </h3>
          {collection.isListedForSale && ( // Use isListedForSale
            <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 whitespace-nowrap shadow-sm">
              {formatDisplayPrice(collection.listingPriceEth)} {/* Use listingPriceEth */}
            </span>
          )}
        </div>

        <p className="text-gray-500 dark:text-gray-400 text-sm mb-3" title={collection.evmOwnerAddress}> {/* Use evmOwnerAddress */}
          Creator: {displayCreator(collection.evmOwnerAddress)} {/* Use evmOwnerAddress */}
        </p>
        
        {collection.nftDescription && ( // Use nftDescription
          <p className="text-gray-600 dark:text-gray-300 text-xs mb-4 line-clamp-2 h-8">
            {collection.nftDescription} {/* Use nftDescription */}
          </p>
        )}

        <div className="flex justify-between items-center text-sm border-t border-gray-200 dark:border-zinc-800 pt-3 mt-3">
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-xs">Items</p>
            <p className="text-gray-700 dark:text-gray-200 font-semibold">
              {collection.nftCollectionSize.toString()} {/* Use nftCollectionSize */}
            </p>
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            ID: {collection.collectionId} {/* collectionId is already a string */}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CollectionCard;
