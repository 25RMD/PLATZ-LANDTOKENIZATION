import React from 'react';

const NFTCardSimpleSkeleton = () => {
  return (
    <div className="bg-primary-light dark:bg-card-dark rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-zinc-800 animate-pulse">
      {/* Image Placeholder */}
      <div className="relative h-48 w-full bg-gray-300 dark:bg-zinc-700"></div>
      <div className="p-4">
        {/* Title and Badge Placeholder */}
        <div className="flex justify-between items-start mb-2 gap-2">
          <div className="h-5 bg-gray-300 dark:bg-zinc-700 rounded w-3/4"></div>
          <div className="h-5 bg-gray-300 dark:bg-zinc-700 rounded w-1/4"></div>
        </div>
        {/* Price Placeholder */}
        <div className="flex justify-between items-center text-sm mt-3">
          <div className="h-4 bg-gray-300 dark:bg-zinc-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-300 dark:bg-zinc-700 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  );
};

export default NFTCardSimpleSkeleton; 