import React from 'react';
import ImageSkeleton from './ImageSkeleton';

interface NFTTokenCardSkeletonProps {
  className?: string;
  showBadges?: boolean;
  showPrice?: boolean;
  showButton?: boolean;
  variant?: 'grid' | 'list';
}

const NFTTokenCardSkeleton: React.FC<NFTTokenCardSkeletonProps> = ({
  className = '',
  showBadges = true,
  showPrice = true,
  showButton = true,
  variant = 'grid'
}) => {
  if (variant === 'list') {
    return (
      <div className={`bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg overflow-hidden animate-pulse ${className}`}>
        <div className="flex">
          <ImageSkeleton 
            className="w-24 h-24 flex-shrink-0" 
            aspectRatio="1/1"
            animation="shimmer"
          />
          <div className="flex-1 p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="h-5 bg-gray-200 dark:bg-zinc-700 rounded w-2/3"></div>
              {showPrice && (
                <div className="h-5 bg-gray-200 dark:bg-zinc-700 rounded w-16"></div>
              )}
            </div>
            <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-1/2 mb-3"></div>
            {showButton && (
              <div className="h-8 bg-gray-200 dark:bg-zinc-700 rounded w-20"></div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg overflow-hidden animate-pulse ${className}`}>
      <div className="relative">
        <ImageSkeleton 
          className="w-full" 
          aspectRatio="1/1"
          animation="shimmer"
        />
        {showBadges && (
          <>
            <div className="absolute top-2 left-2 h-6 bg-gray-300 dark:bg-zinc-600 rounded w-20"></div>
            <div className="absolute top-2 right-2 h-6 bg-gray-300 dark:bg-zinc-600 rounded w-16"></div>
          </>
        )}
      </div>
      <div className="p-3">
        <div className="flex justify-between items-start mb-2">
          <div className="h-5 bg-gray-200 dark:bg-zinc-700 rounded w-2/3"></div>
          {showPrice && (
            <div className="h-5 bg-gray-200 dark:bg-zinc-700 rounded w-16"></div>
          )}
        </div>
        <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-3/4 mb-3"></div>
        {showButton && (
          <div className="h-8 bg-gray-200 dark:bg-zinc-700 rounded w-full"></div>
        )}
      </div>
    </div>
  );
};

export default NFTTokenCardSkeleton; 