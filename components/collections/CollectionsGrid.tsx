import React from 'react';
import { useCollections } from '@/hooks/useCollections';
import CollectionLoadingWrapper from '@/components/CollectionLoadingWrapper';
import { Collection } from '@/lib/fetchCollections';
import { CollectionDetail } from '@/lib/types'; // Import CollectionDetail
import Link from 'next/link';
import Image from 'next/image';

interface CollectionsGridProps {
  collectionsData?: CollectionDetail[]; // Allow passing pre-fetched detailed collections
  limit?: number;
  fromBlock?: number;
  showLoadMore?: boolean;
}

// Type guard to check if it's CollectionDetail
const isDetailedCollection = (col: any): col is CollectionDetail => {
  return col && typeof col.name === 'string' && typeof col.description === 'string' && typeof col.image === 'string';
};

const CollectionsGrid: React.FC<CollectionsGridProps> = ({
  collectionsData, // Use the passed data if available
  limit = 12,
  fromBlock,
  showLoadMore = true
}) => {
  const {
    collections: collectionsFromHook,
    isLoading: isLoadingHook,
    error: errorHook,
    hasMore: hasMoreHook,
    loadNextPage: loadNextPageHook,
    refresh: refreshHook
  } = useCollections({
    limit,
    fromBlock
  });

  // Determine which data source to use
  const displayCollections = collectionsData || collectionsFromHook;
  const isLoading = collectionsData ? false : isLoadingHook;
  const error = collectionsData ? null : errorHook;
  const hasMore = collectionsData ? false : hasMoreHook;
  const loadNextPage = collectionsData ? () => {} : loadNextPageHook;
  const refresh = collectionsData ? () => {} : refreshHook;
  const showPaginationControls = !collectionsData && showLoadMore; // Only show pagination if using hook


  return (
    <div className="space-y-6">
      <CollectionLoadingWrapper
        isLoading={isLoading && displayCollections.length === 0}
        error={error}
        isEmpty={!isLoading && displayCollections.length === 0}
        variant="card"
        count={limit}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayCollections.map((collection) => (
            <CollectionCard 
              key={isDetailedCollection(collection) ? collection.collectionId.toString() : collection.id.toString()} 
              collection={collection}
            />
          ))}
        </div>
      </CollectionLoadingWrapper>

      {/* Pagination */}
      {showPaginationControls && hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadNextPage}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {/* Error message for loading more */}
      {error && displayCollections.length > 0 && (
        <div className="flex justify-center mt-4">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg">
            <span>{error}</span>
            <button 
              onClick={refresh}
              className="text-sm underline hover:no-underline"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface CollectionCardProps {
  collection: CollectionDetail | Collection; // Allow both types for now, prioritize CollectionDetail
}

const CollectionCard: React.FC<CollectionCardProps> = ({ collection }) => {

  let name, imageUrl, description, creatorAddress, itemCount, collectionIdString;

  if (isDetailedCollection(collection)) {
    name = collection.name || 'Untitled Collection';
    imageUrl = collection.image || `/assets/placeholder-collection-${(Number(collection.collectionId) % 5) + 1}.jpg`;
    description = collection.description || 'No description available.';
    creatorAddress = collection.creator;
    itemCount = collection.totalSupply?.toString() || '?';
    collectionIdString = collection.collectionId.toString();
  } else {
    // Fallback for the simpler 'Collection' type from useCollections hook (if collectionsData is not provided)
    const c = collection as Collection;
    name = `Collection #${c.id}`;
    imageUrl = c.collectionURI || `/assets/placeholder-collection-${(Number(c.id) % 5) + 1}.jpg`;
    description = 'Description not available for this view.'; // Placeholder for simpler type
    creatorAddress = 'N/A'; // Not available in simpler type
    itemCount = c.totalSupply?.toString() || '?';
    collectionIdString = c.id.toString();
  }

  const displayCreator = (address?: string) => {
    if (!address || address === "0x0000000000000000000000000000000000000000") return "Unknown Creator";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <Link
      href={`/explore/collection/${collectionIdString}`}
      className="block overflow-hidden rounded-xl bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="aspect-w-16 aspect-h-9 relative bg-gray-100 dark:bg-zinc-800 overflow-hidden">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={name || 'Collection Image'}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
            onError={(e) => {
              // Fallback to placeholder on error
              const target = e.target as HTMLImageElement;
              target.src = `/assets/placeholder-collection-${(Number(collectionIdString) % 5) + 1}.jpg`;
            }}
          />
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-lg truncate" title={name}>{name}</h3>
        
        {isDetailedCollection(collection) && creatorAddress && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1" title={creatorAddress}>
            Creator: {displayCreator(creatorAddress)}
          </p>
        )}

        {description && (
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 line-clamp-2 h-8" title={description}>
            {description}
          </p>
        )}
        
        <div className="mt-3 flex justify-between text-sm text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-zinc-700">
          <div>
            <p className="text-xs">Items: <span className="font-semibold text-gray-700 dark:text-gray-200">{itemCount}</span></p>
          </div>
          <div className="text-xs bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded">
            ID: {collectionIdString}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CollectionsGrid; 