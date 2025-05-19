import React from 'react';
import CollectionCardSkeleton from '@/components/skeletons/CollectionCardSkeleton';
import CollectionListCardSkeleton from '@/components/skeletons/CollectionListCardSkeleton';

interface CollectionLoadingWrapperProps {
  isLoading: boolean;
  error: string | null;
  isEmpty?: boolean;
  children: React.ReactNode;
  variant?: 'card' | 'list';
  count?: number;
  emptyMessage?: string;
}

const CollectionLoadingWrapper: React.FC<CollectionLoadingWrapperProps> = ({
  isLoading,
  error,
  isEmpty = false,
  children,
  variant = 'card',
  count = 6,
  emptyMessage = "No collections found"
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, index) => (
          variant === 'card' 
            ? <CollectionCardSkeleton key={index} /> 
            : <CollectionListCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 my-4">
        <h3 className="text-red-800 dark:text-red-400 font-medium">Error loading collections</h3>
        <p className="text-red-700 dark:text-red-300 mt-1">{error}</p>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg p-6 my-4 text-center">
        <p className="text-gray-600 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default CollectionLoadingWrapper; 