'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useImageLoadTracking } from '@/hooks/useImagePerformance';
import { useIsClient } from '@/hooks/useIsClient';

// Skeleton component with shimmer effect
interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'shimmer' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  variant = 'default',
  animation = 'shimmer'
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

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}>
      {animation === 'shimmer' && (
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      )}
      {animation === 'shimmer' && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-8 h-8 bg-gray-300 dark:bg-zinc-600 rounded animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

// Image size variants for progressive loading
type ImageSize = 'thumbnail' | 'small' | 'medium' | 'large' | 'original';

interface ImageDimensions {
  width?: number;
  height?: number;
  aspectRatio?: string;
}

interface AdvancedImageProps {
  src: string;
  alt: string;
  className?: string;
  dimensions?: ImageDimensions;
  lazy?: boolean;
  progressive?: boolean;
  preload?: boolean;
  placeholder?: string;
  fallback?: string;
  sizes?: Partial<Record<ImageSize, string>>;
  onLoad?: () => void;
  onError?: (error: Event) => void;
  onLoadStart?: () => void;
  priority?: boolean;
}

// URL processing utility for consistent image URL handling
const processImageUrl = (url: string, isClient: boolean = true): string => {
  if (!url) return '';
  
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', 'https://gateway.ipfs.io/ipfs/');
  } else if (url.startsWith('ar://')) {
    return url.replace('ar://', 'https://arweave.net/');
  } else if (url.includes('ngrok-free.app') && isClient) {
    try {
      const oldUrl = new URL(url);
      // Extract the path after /uploads/
      const pathMatch = oldUrl.pathname.match(/\/uploads\/(.+)/);
      if (pathMatch) {
        // Use our API static route instead
        return `${window.location.protocol}//${window.location.host}/api/static/${pathMatch[1]}`;
      }
      return url; // Return original URL if no uploads path found
    } catch (e) {
      console.warn(`[ImagePreloader] Error rewriting ngrok URL ${url}:`, e);
      return url; // Return original URL if rewrite fails
    }
  } else if (url.includes('localhost') && url.includes('/uploads/')) {
    // Convert localhost uploads URLs to API route
    return url.replace('/uploads/', '/api/static/');
  } else if (url.startsWith('http')) {
    return url;
  } else {
    return `/api/images/${url}`;
  }
};

// Image preloader utility
class ImagePreloader {
  private static cache = new Set<string>();
  private static preloadQueue = new Map<string, Promise<void>>();

  static preload(src: string): Promise<void> {
    // For preloading, we assume client-side context
    const processedSrc = processImageUrl(src, true);
    
    if (this.cache.has(processedSrc)) {
      return Promise.resolve();
    }

    if (this.preloadQueue.has(processedSrc)) {
      return this.preloadQueue.get(processedSrc)!;
    }

    const promise = new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.cache.add(processedSrc);
        this.preloadQueue.delete(processedSrc);
        resolve();
      };
      img.onerror = () => {
        this.preloadQueue.delete(processedSrc);
        console.warn(`[ImagePreloader] Failed to preload image: ${processedSrc} (original: ${src})`);
        resolve(); // Resolve instead of reject to prevent breaking chains
      };
      img.src = processedSrc;
    });

    this.preloadQueue.set(processedSrc, promise);
    return promise;
  }

  static isPreloaded(src: string): boolean {
    // For cache checking, we assume client-side context
    const processedSrc = processImageUrl(src, true);
    return this.cache.has(processedSrc);
  }
}

// Intersection Observer hook for lazy loading
const useIntersectionObserver = (
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options]);

  return isIntersecting;
};

// Progressive image loading hook
const useProgressiveImage = (src: string, placeholder?: string) => {
  const [currentSrc, setCurrentSrc] = useState(placeholder || '');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!src) return;

    setIsLoading(true);
    
    // If image is already preloaded, use it immediately
    if (ImagePreloader.isPreloaded(src)) {
      setCurrentSrc(src);
      setIsLoading(false);
      return;
    }

    // Load the full image
    const img = new Image();
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoading(false);
    };
    img.onerror = () => {
      setIsLoading(false);
    };
    img.src = src;
  }, [src, placeholder]);

  return { currentSrc, isLoading };
};

export const AdvancedImage: React.FC<AdvancedImageProps> = ({
  src,
  alt,
  className = '',
  dimensions,
  lazy = true,
  progressive = true,
  preload = false,
  placeholder,
  fallback = 'https://placehold.co/400x300/gray/white?text=No+Image',
  sizes,
  onLoad,
  onError,
  onLoadStart,
  priority = false
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Performance tracking
  const performanceTracking = useImageLoadTracking(src);
  
  // Lazy loading
  const isInView = useIntersectionObserver(containerRef, {
    threshold: 0.1,
    rootMargin: '100px'
  });
  
  // Progressive loading
  const { currentSrc, isLoading } = useProgressiveImage(
    progressive && (lazy ? isInView : true) ? src : '',
    placeholder
  );

  // Preload image if requested
  useEffect(() => {
    if (preload || priority) {
      ImagePreloader.preload(src).catch(console.warn);
    }
  }, [src, preload, priority]);

  // Handle image load
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    performanceTracking.onLoad(ImagePreloader.isPreloaded(currentSrc || src));
    onLoad?.();
  }, [onLoad, performanceTracking, src, currentSrc]);

  // Handle image error
  const handleError = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    setIsLoaded(false);
    performanceTracking.onError();
    onError?.(e.nativeEvent);
    
    // Try fallback image
    if (imgRef.current && imgRef.current.src !== fallback) {
      imgRef.current.src = fallback;
      setHasError(false);
    }
  }, [onError, fallback, performanceTracking]);

  // Handle load start
  const handleLoadStart = useCallback(() => {
    performanceTracking.onLoadStart();
    onLoadStart?.();
  }, [onLoadStart, performanceTracking]);

  // Determine which source to use
  const imageSrc = hasError ? fallback : currentSrc || placeholder;
  const shouldShowSkeleton = (lazy && !isInView) || (isLoading && !currentSrc) || (!imageSrc);

  // Calculate container styles
  const containerStyle: React.CSSProperties = {};
  if (dimensions?.aspectRatio) {
    containerStyle.aspectRatio = dimensions.aspectRatio;
  } else if (dimensions?.width && dimensions?.height) {
    containerStyle.aspectRatio = `${dimensions.width} / ${dimensions.height}`;
  }

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={containerStyle}
    >
      {shouldShowSkeleton ? (
        <Skeleton className="absolute inset-0 w-full h-full" animation="shimmer" />
      ) : (
        <>
          {/* Low quality placeholder while loading */}
          {isLoading && placeholder && (
            <img
              src={placeholder}
              alt={alt}
              className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110 transition-opacity duration-300"
              style={{ opacity: isLoaded ? 0 : 1 }}
            />
          )}
          
          {/* Main image */}
          <img
            ref={imgRef}
            src={imageSrc}
            alt={alt}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleLoad}
            onError={handleError}
            onLoadStart={handleLoadStart}
            loading={lazy ? 'lazy' : 'eager'}
            decoding="async"
          />
        </>
      )}
    </div>
  );
};

// Specialized image component for NFT collections
interface NFTImageProps extends Omit<AdvancedImageProps, 'sizes'> {
  tokenId?: string;
  collectionId?: string;
  isMainToken?: boolean;
}

export const NFTImage: React.FC<NFTImageProps> = ({
  src,
  alt,
  tokenId,
  collectionId,
  isMainToken = false,
  className = '',
  ...props
}) => {
  const isClient = useIsClient();
  
  // Generate placeholder based on token/collection info
  const placeholder = `https://placehold.co/300x300/e5e7eb/6b7280?text=${
    isMainToken ? 'Main Token' : `Token ${tokenId || '...'}`
  }`;

  // Handle different URI formats
  const processedSrc = React.useMemo(() => {
    return processImageUrl(src, isClient);
  }, [src, isClient]);

  return (
    <AdvancedImage
      src={processedSrc}
      alt={alt}
      placeholder={placeholder}
      className={className}
      priority={isMainToken} // Prioritize main token images
      {...props}
    />
  );
};

export default AdvancedImage; 