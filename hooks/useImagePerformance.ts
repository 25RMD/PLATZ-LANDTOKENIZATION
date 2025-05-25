import { useEffect, useRef, useCallback } from 'react';

interface ImageLoadMetrics {
  url: string;
  loadTime: number;
  size?: number;
  fromCache: boolean;
  timestamp: number;
}

interface PerformanceMetrics {
  averageLoadTime: number;
  cacheHitRate: number;
  totalImagesLoaded: number;
  slowestLoad: ImageLoadMetrics | null;
  fastestLoad: ImageLoadMetrics | null;
}

class ImagePerformanceMonitor {
  private static instance: ImagePerformanceMonitor;
  private metrics: ImageLoadMetrics[] = [];
  private maxMetrics = 100; // Keep only last 100 metrics

  static getInstance(): ImagePerformanceMonitor {
    if (!ImagePerformanceMonitor.instance) {
      ImagePerformanceMonitor.instance = new ImagePerformanceMonitor();
    }
    return ImagePerformanceMonitor.instance;
  }

  recordImageLoad(url: string, loadTime: number, fromCache: boolean = false, size?: number): void {
    const metric: ImageLoadMetrics = {
      url,
      loadTime,
      size,
      fromCache,
      timestamp: Date.now()
    };

    this.metrics.push(metric);

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow loads for debugging
    if (loadTime > 3000 && !fromCache) {
      console.warn(`[ImagePerformance] Slow image load detected: ${url} took ${loadTime}ms`);
    }
  }

  getMetrics(): PerformanceMetrics {
    if (this.metrics.length === 0) {
      return {
        averageLoadTime: 0,
        cacheHitRate: 0,
        totalImagesLoaded: 0,
        slowestLoad: null,
        fastestLoad: null
      };
    }

    const totalLoadTime = this.metrics.reduce((sum, metric) => sum + metric.loadTime, 0);
    const cacheHits = this.metrics.filter(metric => metric.fromCache).length;
    const sortedByLoadTime = [...this.metrics].sort((a, b) => a.loadTime - b.loadTime);

    return {
      averageLoadTime: totalLoadTime / this.metrics.length,
      cacheHitRate: (cacheHits / this.metrics.length) * 100,
      totalImagesLoaded: this.metrics.length,
      slowestLoad: sortedByLoadTime[sortedByLoadTime.length - 1] || null,
      fastestLoad: sortedByLoadTime[0] || null
    };
  }

  getRecentSlowLoads(threshold: number = 2000): ImageLoadMetrics[] {
    const recentTime = Date.now() - 60000; // Last minute
    return this.metrics.filter(
      metric => metric.timestamp > recentTime && metric.loadTime > threshold && !metric.fromCache
    );
  }

  clearMetrics(): void {
    this.metrics = [];
  }
}

export const useImagePerformance = () => {
  const monitorRef = useRef<ImagePerformanceMonitor>();

  if (!monitorRef.current) {
    monitorRef.current = ImagePerformanceMonitor.getInstance();
  }

  const recordImageLoad = useCallback((url: string, loadTime: number, fromCache?: boolean, size?: number) => {
    monitorRef.current!.recordImageLoad(url, loadTime, fromCache, size);
  }, []);

  const getMetrics = useCallback(() => {
    return monitorRef.current!.getMetrics();
  }, []);

  const getRecentSlowLoads = useCallback((threshold?: number) => {
    return monitorRef.current!.getRecentSlowLoads(threshold);
  }, []);

  const clearMetrics = useCallback(() => {
    monitorRef.current!.clearMetrics();
  }, []);

  return {
    recordImageLoad,
    getMetrics,
    getRecentSlowLoads,
    clearMetrics
  };
};

// Hook for tracking individual image load performance
export const useImageLoadTracking = (url: string) => {
  const { recordImageLoad } = useImagePerformance();
  const startTimeRef = useRef<number>();

  const onLoadStart = useCallback(() => {
    startTimeRef.current = performance.now();
  }, []);

  const onLoad = useCallback((fromCache: boolean = false) => {
    if (startTimeRef.current) {
      const loadTime = performance.now() - startTimeRef.current;
      recordImageLoad(url, loadTime, fromCache);
    }
  }, [url, recordImageLoad]);

  const onError = useCallback(() => {
    if (startTimeRef.current) {
      const loadTime = performance.now() - startTimeRef.current;
      recordImageLoad(url, loadTime, false);
    }
  }, [url, recordImageLoad]);

  return {
    onLoadStart,
    onLoad,
    onError
  };
};

// Hook for adaptive image quality based on performance
export const useAdaptiveImageQuality = () => {
  const { getMetrics, getRecentSlowLoads } = useImagePerformance();

  const getOptimalQuality = useCallback(() => {
    const metrics = getMetrics();
    const slowLoads = getRecentSlowLoads(1500);

    // If we have many slow loads recently, reduce quality
    if (slowLoads.length > 3) {
      return 'low';
    }

    // If average load time is good, use high quality
    if (metrics.averageLoadTime < 1000) {
      return 'high';
    }

    // Default to medium quality
    return 'medium';
  }, [getMetrics, getRecentSlowLoads]);

  const getQualitySettings = useCallback((quality: 'low' | 'medium' | 'high') => {
    switch (quality) {
      case 'low':
        return {
          format: 'webp',
          quality: 60,
          progressive: true,
          placeholder: true
        };
      case 'medium':
        return {
          format: 'webp',
          quality: 80,
          progressive: true,
          placeholder: true
        };
      case 'high':
        return {
          format: 'webp',
          quality: 95,
          progressive: false,
          placeholder: false
        };
      default:
        return {
          format: 'webp',
          quality: 80,
          progressive: true,
          placeholder: true
        };
    }
  }, []);

  return {
    getOptimalQuality,
    getQualitySettings
  };
};

export default useImagePerformance; 