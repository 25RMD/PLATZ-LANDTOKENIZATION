import React from 'react';

interface ImageSkeletonProps {
  className?: string;
  variant?: 'default' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'shimmer' | 'none';
  aspectRatio?: string;
  showIcon?: boolean;
}

const ImageSkeleton: React.FC<ImageSkeletonProps> = ({ 
  className = '', 
  variant = 'default',
  animation = 'shimmer',
  aspectRatio,
  showIcon = true
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-zinc-700';
  const variantClasses = {
    default: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none'
  };
  
  const animationClasses = {
    pulse: 'animate-pulse',
    shimmer: 'relative overflow-hidden',
    none: ''
  };

  const containerStyle: React.CSSProperties = {};
  if (aspectRatio) {
    containerStyle.aspectRatio = aspectRatio;
  }

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={containerStyle}
    >
      {animation === 'shimmer' && (
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      )}
      {showIcon && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-8 h-8 bg-gray-300 dark:bg-zinc-600 rounded animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

export default ImageSkeleton; 