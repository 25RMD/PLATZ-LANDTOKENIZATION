import { useEffect, useCallback, useRef } from 'react';

interface PreloadOptions {
  priority?: 'high' | 'medium' | 'low';
  delay?: number;
  maxConcurrent?: number;
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

interface ImagePreloadManager {
  preload: (urls: string[], options?: PreloadOptions) => Promise<void>;
  preloadSingle: (url: string, options?: PreloadOptions) => Promise<void>;
  isPreloaded: (url: string) => boolean;
  clearCache: () => void;
  getCacheSize: () => number;
}

class ImagePreloadService {
  private static instance: ImagePreloadService;
  private cache = new Set<string>();
  private preloadQueue = new Map<string, Promise<void>>();
  private activePreloads = 0;
  private maxConcurrent = 3;

  static getInstance(): ImagePreloadService {
    if (!ImagePreloadService.instance) {
      ImagePreloadService.instance = new ImagePreloadService();
    }
    return ImagePreloadService.instance;
  }

  async preloadSingle(url: string, options: PreloadOptions = {}): Promise<void> {
    // Process the URL to handle different formats (assume client-side for preloading)
    const processedUrl = processImageUrl(url, true);
    
    if (this.cache.has(processedUrl)) {
      return Promise.resolve();
    }

    if (this.preloadQueue.has(processedUrl)) {
      return this.preloadQueue.get(processedUrl)!;
    }

    const { delay = 0, maxConcurrent = this.maxConcurrent } = options;

    // Wait for available slot if at max concurrent
    while (this.activePreloads >= maxConcurrent) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const promise = new Promise<void>((resolve, reject) => {
      const executePreload = () => {
        this.activePreloads++;
        const img = new Image();
        
        img.onload = () => {
          this.cache.add(processedUrl);
          this.preloadQueue.delete(processedUrl);
          this.activePreloads--;
          resolve();
        };
        
        img.onerror = () => {
          this.preloadQueue.delete(processedUrl);
          this.activePreloads--;
          // Don't reject for preload failures, just log and resolve
          console.warn(`[ImagePreloader] Failed to preload image: ${processedUrl} (original: ${url})`);
          resolve(); // Resolve instead of reject to prevent breaking the preload chain
        };
        
        img.src = processedUrl;
      };

      if (delay > 0) {
        setTimeout(executePreload, delay);
      } else {
        executePreload();
      }
    });

    this.preloadQueue.set(processedUrl, promise);
    return promise;
  }

  async preload(urls: string[], options: PreloadOptions = {}): Promise<void> {
    const { priority = 'medium' } = options;
    
    // Sort URLs by priority
    const sortedUrls = [...urls];
    if (priority === 'high') {
      // Preload immediately
      await Promise.allSettled(sortedUrls.map(url => this.preloadSingle(url, options)));
    } else if (priority === 'medium') {
      // Preload with small delays
      for (let i = 0; i < sortedUrls.length; i++) {
        this.preloadSingle(sortedUrls[i], { ...options, delay: i * 100 });
      }
    } else {
      // Low priority - preload with longer delays
      for (let i = 0; i < sortedUrls.length; i++) {
        this.preloadSingle(sortedUrls[i], { ...options, delay: i * 500 });
      }
    }
  }

  isPreloaded(url: string): boolean {
    // Assume client-side for cache checking
    const processedUrl = processImageUrl(url, true);
    return this.cache.has(processedUrl);
  }

  clearCache(): void {
    this.cache.clear();
    this.preloadQueue.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

export const useImagePreloading = (): ImagePreloadManager => {
  const serviceRef = useRef<ImagePreloadService>();

  if (!serviceRef.current) {
    serviceRef.current = ImagePreloadService.getInstance();
  }

  const preload = useCallback(async (urls: string[], options?: PreloadOptions) => {
    return serviceRef.current!.preload(urls, options);
  }, []);

  const preloadSingle = useCallback(async (url: string, options?: PreloadOptions) => {
    return serviceRef.current!.preloadSingle(url, options);
  }, []);

  const isPreloaded = useCallback((url: string) => {
    return serviceRef.current!.isPreloaded(url);
  }, []);

  const clearCache = useCallback(() => {
    serviceRef.current!.clearCache();
  }, []);

  const getCacheSize = useCallback(() => {
    return serviceRef.current!.getCacheSize();
  }, []);

  return {
    preload,
    preloadSingle,
    isPreloaded,
    clearCache,
    getCacheSize
  };
};

// Hook for preloading collection images
export const useCollectionImagePreloading = (collections: any[]) => {
  const { preload } = useImagePreloading();

  useEffect(() => {
    if (!collections.length) return;

    // Extract image URLs from collections and process them
    const imageUrls = collections
      .map(collection => collection.nftImageFileRef)
      .filter(Boolean); // Don't process URLs here, let preloadSingle handle it

    // Preload first 5 images with high priority, rest with medium priority
    const highPriorityUrls = imageUrls.slice(0, 5);
    const mediumPriorityUrls = imageUrls.slice(5);

    if (highPriorityUrls.length > 0) {
      preload(highPriorityUrls, { priority: 'high', maxConcurrent: 3 }).catch(console.warn);
    }

    if (mediumPriorityUrls.length > 0) {
      preload(mediumPriorityUrls, { priority: 'medium', maxConcurrent: 2 }).catch(console.warn);
    }
  }, [collections, preload]);
};

export default useImagePreloading; 