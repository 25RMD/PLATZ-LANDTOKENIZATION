import React from 'react';
import ImageSkeleton from './ImageSkeleton';
import NFTTokenCardSkeleton from './NFTTokenCardSkeleton';

const CollectionDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
      {/* Back Button Skeleton */}
      <div className="h-6 bg-gray-200 dark:bg-zinc-700 rounded w-32 mb-6"></div>
      
      {/* Collection Header Skeleton */}
      <div className="bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden mb-8">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 h-64 md:h-auto bg-gray-200 dark:bg-zinc-800 flex-shrink-0">
            <ImageSkeleton className="w-full h-full" aspectRatio="4/3" />
          </div>
          <div className="p-6 flex-1">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                {/* Title */}
                <div className="h-8 bg-gray-200 dark:bg-zinc-700 rounded w-3/4 mb-2"></div>
                {/* Description */}
                <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-2/3"></div>
              </div>
              {/* Price */}
              <div className="h-8 bg-gray-200 dark:bg-zinc-700 rounded w-24 ml-4"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index}>
                  <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-16 mb-1"></div>
                  <div className="h-5 bg-gray-200 dark:bg-zinc-700 rounded w-24"></div>
                </div>
              ))}
            </div>

            {/* Purchase Button */}
            <div className="h-12 bg-gray-200 dark:bg-zinc-700 rounded w-48"></div>
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="mb-6 border-b border-gray-200 dark:border-zinc-800">
        <nav className="flex space-x-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="py-4 px-1">
              <div className="h-5 bg-gray-200 dark:bg-zinc-700 rounded w-20"></div>
            </div>
          ))}
        </nav>
      </div>

      {/* Tab Content Skeleton */}
      <div className="bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6">
        {/* Section Title */}
        <div className="h-6 bg-gray-200 dark:bg-zinc-700 rounded w-48 mb-4"></div>
        {/* Section Description */}
        <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-3/4 mb-6"></div>
        
        {/* Token Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <NFTTokenCardSkeleton
              key={index}
              showBadges={index === 0} // Show badges only for first item (main token)
              showPrice={index % 3 === 0} // Deterministic price display (every 3rd item)
              showButton={index % 4 === 0} // Deterministic button display (every 4th item)
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollectionDetailSkeleton; 