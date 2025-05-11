import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiImage } from 'react-icons/fi';

interface NFTImageProps {
  imageRef: string | null | undefined;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

/**
 * NFTImage component with robust error handling and fallbacks
 * 
 * Features:
 * - Uses Next.js Image component for performance
 * - Shows loading state while image is loading
 * - Handles broken images with a fallback
 * - Handles missing image references with a placeholder
 * - Provides proper image URL encoding
 */
export default function NFTImage({ 
  imageRef, 
  alt, 
  className = "w-full h-full object-cover",
  width = 500,
  height = 500,
  priority = false
}: NFTImageProps) {
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Reset error state if imageRef changes
  useEffect(() => {
    setError(false);
    setLoading(true);
  }, [imageRef]);

  // Create a properly encoded URL if imageRef exists
  const imageUrl = imageRef 
    ? `/api/images/${encodeURIComponent(imageRef)}` 
    : '/placeholder-nft.png'; // Fallback to static placeholder

  // Handle successful image load
  const handleImageLoad = () => {
    setLoading(false);
  };

  // Handle image loading error
  const handleImageError = () => {
    setError(true);
    setLoading(false);
  };

  // Render placeholder if error or no imageRef
  if (error || !imageRef) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-zinc-800 ${className}`}>
        <FiImage className="w-10 h-10 text-gray-400 dark:text-gray-600" />
        <span className="text-sm text-gray-500 ml-2">No Image</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Image with error handling */}
      <Image
        src={imageUrl}
        alt={alt || "NFT Image"}
        width={width}
        height={height}
        className={className}
        onLoad={handleImageLoad}
        onError={handleImageError}
        priority={priority}
      />
      
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-zinc-800 bg-opacity-50 dark:bg-opacity-50">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
