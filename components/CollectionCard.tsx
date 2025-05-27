import Link from "next/link";
import React from "react";
import { formatEther } from 'viem';
import { CollectionDetail } from '../lib/types';
import { useCurrency } from '@/context/CurrencyContext'; 

const CollectionCard = ({ collection }: { collection: CollectionDetail }) => {
  const { formatPriceWithConversion } = useCurrency();
  
  const formatDisplayPrice = (priceInWei?: bigint): string => {
    if (!collection.isListed || typeof priceInWei === 'undefined' || priceInWei === 0n) return "Not Listed";
    const priceInEth = parseFloat(formatEther(priceInWei));
    return formatPriceWithConversion(priceInEth);
  }

  const displayCreator = (address?: string) => { 
    if (!address || address === "0x0000000000000000000000000000000000000000") return "Unknown Creator";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }

  const formatCollectionName = (name?: string): string => {
    if (!name) return 'Untitled Collection';
    if (name.toLowerCase().startsWith('collection: ')) {
      return name.substring('collection: '.length);
    }
    return name;
  };

  const linkHref = `/explore/${collection.collectionId.toString()}`;

  return (
    <Link href={linkHref} className="block bg-white dark:bg-zinc-900 rounded-xl overflow-hidden transition-all duration-300 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 shadow-lg hover:shadow-xl group transform hover:-translate-y-1">
      <div className="relative h-56 w-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
        <img
          src={collection.image || '/placeholder-image.png'}
          alt={collection.name || 'Collection Image'}
          className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
        />
        {collection.isListed && ( 
          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2.5 py-1 rounded-full font-semibold shadow-md">
            FOR SALE
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2 gap-3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex-shrink truncate" title={formatCollectionName(collection.name)}>
            {formatCollectionName(collection.name)}
          </h3>
          {collection.isListed && typeof collection.price === 'bigint' && (
            <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 whitespace-nowrap shadow-sm">
              {formatDisplayPrice(collection.price)}
            </span>
          )}
        </div>

        <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 truncate" title={displayCreator(collection.creator)}>
          Creator: {displayCreator(collection.creator)}
        </p>
        
        {collection.description && (
          <p className="text-gray-600 dark:text-gray-300 text-xs mb-4 line-clamp-2 h-8" title={collection.description || 'No description'}>
            {collection.description || 'No description available.'}
          </p>
        )}

        <div className="flex justify-between items-center text-sm border-t border-gray-200 dark:border-zinc-800 pt-3 mt-3">
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-xs">Items</p>
            <p className="text-gray-700 dark:text-gray-200 font-semibold">
              {collection.totalSupply?.toString() || 'N/A'} {/* Use collection.totalSupply, ensure it's a string */}
            </p>
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            ID: {collection.collectionId.toString()} 
          </div>
        </div>
      </div>
    </Link>
  );
}

export default CollectionCard;
