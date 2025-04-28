import React from 'react';

const CollectionCardSkeleton = () => {
  return (
    <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-zinc-800 animate-pulse">
      {/* Image Placeholder */}
      <div className="h-48 w-full bg-gray-300 dark:bg-zinc-700"></div>
      <div className="p-4">
        {/* Avatar Placeholder */}
        <div className="flex items-center mb-3">
          <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-zinc-700 mr-3"></div>
          {/* Name Placeholder */}
          <div className="h-5 bg-gray-300 dark:bg-zinc-700 rounded w-3/4"></div>
        </div>
        {/* Stats Placeholders */}
        <div className="flex justify-between text-sm">
          <div className="flex flex-col items-center">
            <div className="h-4 bg-gray-300 dark:bg-zinc-700 rounded w-12 mb-1"></div>
            <div className="h-3 bg-gray-300 dark:bg-zinc-700 rounded w-16"></div>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-4 bg-gray-300 dark:bg-zinc-700 rounded w-12 mb-1"></div>
            <div className="h-3 bg-gray-300 dark:bg-zinc-700 rounded w-16"></div>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-4 bg-gray-300 dark:bg-zinc-700 rounded w-12 mb-1"></div>
            <div className="h-3 bg-gray-300 dark:bg-zinc-700 rounded w-16"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionCardSkeleton; 