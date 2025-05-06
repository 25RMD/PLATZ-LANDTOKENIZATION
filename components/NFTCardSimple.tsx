import React from 'react';
import { NFT } from '@prisma/client'; // Import the NFT type from Prisma
import { Collection } from '@/lib/interdace'; // To get total items

interface NFTCardSimpleProps {
  nft: NFT;
  collectionTotalItems: number;
  collectionCurrency?: string | null; // Add collectionCurrency prop
  index?: number; // Optional index for animation delay
}

const NFTCardSimple: React.FC<NFTCardSimpleProps> = ({ nft, collectionTotalItems, collectionCurrency, index }) => {
  return (
    <div className="bg-primary-light dark:bg-card-dark rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-zinc-800 dark:hover:border-zinc-700">
      <div className="relative h-48 w-full">
        <img
          src={nft.image} // Use placeholder if needed: src={nft.image || '/images/placeholder.png'}
          alt={nft.name}
          className="w-full h-full object-cover"
        />
        {/* Optional: Add rarity or other indicators here later */}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="text-md font-semibold text-text-light dark:text-text-dark truncate" title={nft.name}>{nft.name}</h3>
          <span className="bg-gray-100 dark:bg-zinc-900 text-text-light dark:text-text-dark px-2 py-0.5 rounded-md text-xs whitespace-nowrap flex-shrink-0">
            {nft.itemNumber} of {collectionTotalItems}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm mt-3">
          <p className="text-text-light dark:text-text-dark opacity-60">Price</p>
          <p className="text-text-light dark:text-text-dark font-medium">
            {nft.price.toFixed(2)}{collectionCurrency ? ` ${collectionCurrency}` : ''}
          </p>
        </div>
        {/* Add Buy Now / Details Button later if needed */}
      </div>
    </div>
  );
};

export default NFTCardSimple; 