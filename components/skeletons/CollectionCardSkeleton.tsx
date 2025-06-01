import React from 'react';

const CollectionCardSkeleton = () => {
  return (
    <div className="rounded-cyber-lg overflow-hidden shadow-2xl border border-black/10 dark:border-white/10 bg-secondary-light dark:bg-secondary-dark cyber-grid group">
      {/* Image Placeholder with cyber scan effect */}
      <div className="h-48 w-full bg-black/5 dark:bg-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyber-glow/10 to-transparent w-full h-full animate-cyber-scan"></div>
        <div className="w-full h-full bg-gradient-to-br from-black/10 to-transparent dark:from-white/10 animate-pulse"></div>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Collection ID Badge */}
        <div className="flex items-center justify-between">
          <div className="h-5 bg-black/10 dark:bg-white/10 rounded-cyber w-20 animate-pulse"></div>
          <div className="h-4 bg-black/10 dark:bg-white/10 rounded-cyber w-16 animate-pulse"></div>
        </div>
        
        {/* Title Placeholder */}
        <div className="space-y-2">
          <div className="h-6 bg-black/10 dark:bg-white/10 rounded-cyber w-3/4 animate-pulse"></div>
          <div className="h-4 bg-black/10 dark:bg-white/10 rounded-cyber w-full animate-pulse"></div>
        </div>
        
        {/* Stats Placeholders */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-black/10 dark:border-white/10">
          <div className="text-center space-y-2">
            <div className="h-5 bg-black/10 dark:bg-white/10 rounded-cyber w-full animate-pulse"></div>
            <div className="h-3 bg-black/10 dark:bg-white/10 rounded-cyber w-12 mx-auto animate-pulse"></div>
          </div>
          <div className="text-center space-y-2">
            <div className="h-5 bg-black/10 dark:bg-white/10 rounded-cyber w-full animate-pulse"></div>
            <div className="h-3 bg-black/10 dark:bg-white/10 rounded-cyber w-16 mx-auto animate-pulse"></div>
          </div>
          <div className="text-center space-y-2">
            <div className="h-5 bg-black/10 dark:bg-white/10 rounded-cyber w-full animate-pulse"></div>
            <div className="h-3 bg-black/10 dark:bg-white/10 rounded-cyber w-14 mx-auto animate-pulse"></div>
          </div>
        </div>
        
        {/* Button Placeholder */}
        <div className="pt-2">
          <div className="h-10 bg-black/10 dark:bg-white/10 rounded-cyber w-full animate-pulse"></div>
        </div>
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

export default CollectionCardSkeleton; 