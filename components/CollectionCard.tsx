import Link from "next/link";
import React from "react";
import { LandListingForCollection } from "@/mainpages/CollectionsPage"; 

const CollectionCard = ({ collection }: { collection: LandListingForCollection }) => {
  const formatPrice = (price: string | number | null | undefined, currency: string | null | undefined): string => {
    if (price === null || price === undefined) return "N/A";
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `${numericPrice.toFixed(2)} ${currency || 'SOL'}`;
  };

  const getImageUrl = (imageRef: string | null | undefined): string => {
    if (!imageRef) return '/placeholder-image.png'; 
    return imageRef; 
  };

  return (
    <Link href={`/collections/${collection.id}`} passHref legacyBehavior>
      <a className="block bg-primary-light dark:bg-card-dark rounded-lg overflow-hidden transition-all duration-300 border border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 hover:shadow-md group">
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={getImageUrl(collection.nftImageFileRef)}
            alt={collection.nftTitle || 'Collection Image'}
            className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
          />

          {/* Verified badge removed for now - can be re-added based on LandListing kycStatus or a new field */}
          {/* {collection.verified && ( ... )} */}
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start mb-1 gap-2">
            <h3 className="text-base font-semibold text-text-light dark:text-text-dark flex-shrink truncate" title={collection.nftTitle || ''}>{collection.nftTitle || 'Untitled Collection'}</h3>
            <span className="bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-md text-xs font-medium flex-shrink-0 whitespace-nowrap">
              {formatPrice(collection.listingPrice, collection.priceCurrency)} floor
            </span>
          </div>

          <p className="text-text-light dark:text-text-dark opacity-70 text-sm mb-3">
            by {collection.user?.username || 'Unknown Creator'}
          </p>
          <div className="flex justify-between text-sm">
            <div>
              <p className="text-text-light dark:text-text-dark opacity-60">Items</p>
              <p className="text-text-light dark:text-text-dark font-medium">
                {(collection.nftCollectionSize ?? 0).toLocaleString()}
              </p>
            </div>
            {/* Volume display removed for now - not directly available on LandListingForCollection */}
            {/* <div className="text-right">
              <p className="text-text-light dark:text-text-dark opacity-60">Volume</p>
              <p className="text-text-light dark:text-text-dark font-medium">
                {collection.volume.toLocaleString()} SOL
              </p>
            </div> */}
          </div>
        </div>
      </a>
    </Link>
  );
};

export default CollectionCard;
