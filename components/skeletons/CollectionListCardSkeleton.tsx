import React from 'react';

const CollectionListCardSkeleton = () => {
  return (
    <div className="flex items-center p-4 border rounded-lg border-gray-200 dark:border-zinc-800 shadow-sm animate-pulse">
      {/* Image Placeholder */}
      <div className="w-16 h-16 rounded-md bg-gray-300 dark:bg-zinc-700 mr-4 flex-shrink-0"></div>
      <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
        {/* Name Placeholder */}
        <div className="h-5 bg-gray-300 dark:bg-zinc-700 rounded w-full"></div>
        {/* Stats Placeholders */}
        <div className="flex flex-col items-end">
          <div className="h-4 bg-gray-300 dark:bg-zinc-700 rounded w-12 mb-1"></div>
          <div className="h-3 bg-gray-300 dark:bg-zinc-700 rounded w-16"></div>
        </div>
        <div className="flex flex-col items-end">
          <div className="h-4 bg-gray-300 dark:bg-zinc-700 rounded w-12 mb-1"></div>
          <div className="h-3 bg-gray-300 dark:bg-zinc-700 rounded w-16"></div>
        </div>
        <div className="flex flex-col items-end">
          <div className="h-4 bg-gray-300 dark:bg-zinc-700 rounded w-12 mb-1"></div>
          <div className="h-3 bg-gray-300 dark:bg-zinc-700 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
};

export default CollectionListCardSkeleton; 