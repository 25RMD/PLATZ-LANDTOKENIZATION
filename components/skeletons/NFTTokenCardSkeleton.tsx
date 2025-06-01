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
      <div className={`bg-secondary-light dark:bg-secondary-dark border border-black/10 dark:border-white/10 rounded-cyber-lg overflow-hidden cyber-grid group ${className}`}>
        <div className="flex">
          <div className="w-24 h-24 flex-shrink-0 bg-black/5 dark:bg-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyber-glow/10 to-transparent w-full h-full animate-cyber-scan"></div>
            <div className="w-full h-full bg-gradient-to-br from-black/10 to-transparent dark:from-white/10 animate-pulse"></div>
          </div>
          <div className="flex-1 p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="h-5 bg-black/10 dark:bg-white/10 rounded-cyber w-2/3 animate-pulse"></div>
              {showPrice && (
                <div className="h-5 bg-black/10 dark:bg-white/10 rounded-cyber w-16 animate-pulse"></div>
              )}
            </div>
            <div className="h-3 bg-black/10 dark:bg-white/10 rounded-cyber w-1/2 animate-pulse"></div>
            {showButton && (
              <div className="h-8 bg-black/10 dark:bg-white/10 rounded-cyber w-20 animate-pulse"></div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-secondary-light dark:bg-secondary-dark border border-black/10 dark:border-white/10 rounded-cyber-lg overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 group cyber-grid ${className}`}>
      <div className="relative">
        <div className="aspect-square bg-black/5 dark:bg-white/5 relative overflow-hidden">
          {/* Cyber scan line effect */}
          <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyber-glow/20 to-transparent w-full h-full animate-cyber-scan"></div>
          </div>
          <div className="w-full h-full bg-gradient-to-br from-black/10 to-transparent dark:from-white/10 animate-pulse"></div>
        </div>
        
        {showBadges && (
          <>
            <div className="absolute top-2 left-2 h-6 bg-cyber-accent/20 rounded-cyber w-20 animate-pulse"></div>
            <div className="absolute top-2 right-2 h-6 bg-warning-minimal/20 rounded-cyber w-16 animate-pulse"></div>
          </>
        )}
      </div>
      
      <div className="p-3 space-y-3">
        <div className="flex justify-between items-start">
          <div className="h-5 bg-black/10 dark:bg-white/10 rounded-cyber w-2/3 animate-pulse"></div>
          {showPrice && (
            <div className="h-5 bg-black/10 dark:bg-white/10 rounded-cyber w-16 animate-pulse"></div>
          )}
        </div>
        <div className="h-3 bg-black/10 dark:bg-white/10 rounded-cyber w-3/4 animate-pulse"></div>
        {showButton && (
          <div className="flex gap-2">
            <div className="h-8 bg-black/10 dark:bg-white/10 rounded-cyber flex-1 animate-pulse"></div>
          </div>
        )}
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
  );
};

export default NFTTokenCardSkeleton; 