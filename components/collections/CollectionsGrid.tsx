import React from 'react';
import { useCollections } from '@/hooks/useCollections';
import CollectionLoadingWrapper from '@/components/CollectionLoadingWrapper';
import { Collection } from '@/lib/fetchCollections';
import Link from 'next/link';
import Image from 'next/image';

interface CollectionsGridProps {
  limit?: number;
  fromBlock?: number;
  showLoadMore?: boolean;
}

const CollectionsGrid: React.FC<CollectionsGridProps> = ({
  limit = 12,
  fromBlock,
  showLoadMore = true
}) => {
  const {
    collections,
    isLoading,
    error,
    hasMore,
    loadNextPage,
    refresh
  } = useCollections({
    limit,
    fromBlock
  });

  return (
    <div className="space-y-6">
      <CollectionLoadingWrapper
        isLoading={isLoading && collections.length === 0}
        error={error}
        isEmpty={!isLoading && collections.length === 0}
        variant="card"
        count={limit}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {collections.map((collection) => (
            <CollectionCard 
              key={collection.id} 
              collection={collection}
            />
          ))}
        </div>
      </CollectionLoadingWrapper>

      {/* Pagination */}
      {showLoadMore && hasMore && (
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
      {error && collections.length > 0 && (
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
  collection: Collection;
}

const CollectionCard: React.FC<CollectionCardProps> = ({ collection }) => {
  // Generate placeholders for missing data (in case of older contract)
  const name = `Collection #${collection.id}`;
  const imageUrl = collection.collectionURI || `/assets/placeholder-collection-${(Number(collection.id) % 5) + 1}.jpg`;
  const itemCount = collection.totalSupply || '?';

  return (
    <Link
      href={`/collections/${collection.id}`}
      className="block overflow-hidden rounded-xl bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="aspect-w-16 aspect-h-9 relative bg-gray-100 dark:bg-zinc-800 overflow-hidden">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
            onError={(e) => {
              // Fallback to placeholder on error
              const target = e.target as HTMLImageElement;
              target.src = `/assets/placeholder-collection-${(Number(collection.id) % 5) + 1}.jpg`;
            }}
          />
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-lg truncate">{name}</h3>
        
        <div className="mt-3 flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <div>
            <p>Items: {itemCount}</p>
          </div>
          <div className="text-xs bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded">
            ID: {collection.id}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CollectionsGrid; 