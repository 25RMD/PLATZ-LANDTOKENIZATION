import Link from "next/link";
import React from "react";
import { LandListingForCollection } from "@/mainpages/CollectionsPage";
import { getImageUrl, getPlaceholderImage } from "@/lib/utils/imageUtils";
import { useCurrency } from '@/context/CurrencyContext';

interface CollectionListCardProps {
  collection: LandListingForCollection;
}

const CollectionListCard: React.FC<CollectionListCardProps> = ({ collection }) => {
  const { formatPriceWithConversion } = useCurrency();
  
  const formatPrice = (price: string | number | null | undefined, currency: string | null | undefined): string => {
    if (price === null || price === undefined) return "N/A";
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    // If it's ETH, use currency conversion, otherwise use the original format
    if (currency?.toUpperCase() === 'ETH') {
      return formatPriceWithConversion(numericPrice);
    }
    
    return `${numericPrice.toFixed(2)} ${currency || 'SOL'}`;
  };

  // Using the centralized getImageUrl utility function from lib/utils/imageUtils.ts

  return (
    <Link 
      href={`/collections/${collection.id}`}
      className="flex items-center p-3 bg-primary-light dark:bg-card-dark rounded-lg border border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 hover:shadow-sm transition-all duration-200 gap-4"
    >
      <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
        <img
          src={getImageUrl(collection.nftImageFileRef, getPlaceholderImage('collection'))}
          alt={collection.nftTitle || 'Collection Image'}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 items-center">
        <div className="col-span-2 md:col-span-1">
          <h3 className="text-sm font-semibold text-text-light dark:text-text-dark truncate" title={collection.nftTitle || ''}>
            {collection.nftTitle || 'Untitled Collection'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            by {collection.user?.username || 'Unknown Creator'}
          </p>
        </div>
        <div className="text-right md:text-left">
          <p className="text-sm text-text-light dark:text-text-dark opacity-60">Floor</p>
          <p className="text-sm font-semibold text-text-light dark:text-text-dark">
            {formatPrice(collection.listingPrice, collection.priceCurrency)}
          </p>
        </div>
        <div className="text-right md:text-left col-start-2 md:col-start-auto"> 
          <p className="text-xs text-gray-500 dark:text-gray-400">Items</p>
          <p className="text-sm font-medium text-text-light dark:text-text-dark">
            {(collection.nftCollectionSize ?? 0).toLocaleString()}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default CollectionListCard;
