import React from 'react';
import NFTTokenCardSkeleton from './NFTTokenCardSkeleton';

const CollectionDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
      {/* Back Button Skeleton */}
      <div className="h-6 bg-black/10 dark:bg-white/10 rounded-cyber w-32 mb-6 animate-pulse"></div>
      
      {/* Collection Header Skeleton */}
      <div className="bg-secondary-light dark:bg-secondary-dark rounded-cyber-lg shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden mb-8 cyber-grid">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 h-64 md:h-auto bg-black/5 dark:bg-white/5 flex-shrink-0 relative overflow-hidden group">
            {/* Cyber scan line effect */}
            <div className="absolute inset-0 z-10 opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyber-glow/10 to-transparent w-full h-full animate-cyber-scan"></div>
            </div>
            <div className="w-full h-full bg-gradient-to-br from-black/10 to-transparent dark:from-white/10 animate-pulse"></div>
          </div>
          <div className="p-6 flex-1 space-y-6">
            <div className="flex justify-between items-start">
              <div className="flex-1 space-y-4">
                {/* Title */}
                <div className="h-8 bg-black/10 dark:bg-white/10 rounded-cyber w-3/4 animate-pulse"></div>
                {/* Description */}
                <div className="space-y-2">
                  <div className="h-4 bg-black/10 dark:bg-white/10 rounded-cyber w-full animate-pulse"></div>
                  <div className="h-4 bg-black/10 dark:bg-white/10 rounded-cyber w-2/3 animate-pulse"></div>
                </div>
              </div>
              {/* Price */}
              <div className="h-8 bg-black/10 dark:bg-white/10 rounded-cyber w-24 ml-4 animate-pulse"></div>
            </div>

            {/* Market Statistics Skeleton */}
            <div className="bg-black/5 dark:bg-white/5 rounded-cyber p-4 border border-black/10 dark:border-white/10">
              <div className="h-6 bg-black/10 dark:bg-white/10 rounded-cyber w-48 mb-4 animate-pulse"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <div className="h-3 bg-black/10 dark:bg-white/10 rounded-cyber w-20 animate-pulse"></div>
                    <div className="h-5 bg-black/10 dark:bg-white/10 rounded-cyber w-16 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="h-3 bg-black/10 dark:bg-white/10 rounded-cyber w-16 animate-pulse"></div>
                  <div className="h-5 bg-black/10 dark:bg-white/10 rounded-cyber w-24 animate-pulse"></div>
                </div>
              ))}
            </div>

            {/* Purchase Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="h-12 bg-black/10 dark:bg-white/10 rounded-cyber w-48 animate-pulse"></div>
              <div className="h-12 bg-black/10 dark:bg-white/10 rounded-cyber w-36 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="mb-6 border-b border-black/20 dark:border-white/20">
        <nav className="flex space-x-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="py-4 px-1">
              <div className="h-5 bg-black/10 dark:bg-white/10 rounded-cyber w-20 animate-pulse"></div>
            </div>
          ))}
        </nav>
      </div>

      {/* Tab Content Skeleton */}
      <div className="bg-secondary-light dark:bg-secondary-dark rounded-cyber-lg shadow-xl border border-black/10 dark:border-white/10 p-6 cyber-grid">
        {/* Section Title */}
        <div className="h-8 bg-black/10 dark:bg-white/10 rounded-cyber w-56 mb-4 animate-pulse"></div>
        {/* Section Description */}
        <div className="space-y-2 mb-6">
          <div className="h-4 bg-black/10 dark:bg-white/10 rounded-cyber w-full animate-pulse"></div>
          <div className="h-4 bg-black/10 dark:bg-white/10 rounded-cyber w-3/4 animate-pulse"></div>
        </div>
        
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
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none">
          <div className="w-full h-full" 
               style={{
                 backgroundImage: `
                   linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                   linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                 `,
                 backgroundSize: '20px 20px'
               }}>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionDetailSkeleton; 