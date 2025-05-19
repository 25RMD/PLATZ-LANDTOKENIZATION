import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'card' | 'list' | 'text';
  count?: number;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  variant = 'card', 
  count = 1,
  className = ''
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className={`bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden ${className}`}>
            <div className="w-full aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-zinc-800 animate-pulse" />
            <div className="p-4">
              <div className="h-6 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse mb-3 w-3/4" />
              <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse mb-2 w-full" />
              <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse mb-4 w-5/6" />
              <div className="flex justify-between items-center">
                <div>
                  <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse mb-1 w-20" />
                  <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse w-16" />
                </div>
                <div>
                  <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse mb-1 w-14" />
                  <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse w-20" />
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'list':
        return (
          <div className={`bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden ${className}`}>
            <div className="flex flex-col md:flex-row">
              <div className="md:w-48 h-40 bg-gray-200 dark:bg-zinc-800 animate-pulse flex-shrink-0" />
              <div className="p-4 flex-1">
                <div className="h-6 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse mb-3 w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse mb-2 w-full" />
                <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse mb-4 w-5/6" />
                <div className="flex flex-wrap gap-4">
                  <div>
                    <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse mb-1 w-24" />
                    <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse w-20" />
                  </div>
                  <div>
                    <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse mb-1 w-16" />
                    <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse w-32" />
                  </div>
                  <div className="ml-auto">
                    <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse mb-1 w-14" />
                    <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse w-20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'text':
        return (
          <div className={`h-4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse w-full ${className}`} />
        );
        
      default:
        return null;
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>
          {renderSkeleton()}
        </React.Fragment>
      ))}
    </>
  );
};

export default SkeletonLoader; 