/**
 * Utility functions for handling images and file references
 */

// Types for image optimization options
export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
}

/**
 * Determines if a string is a valid UUID format
 * This helps identify UUID-based filenames more reliably
 */
export const isUuid = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str) || str.includes('-') && str.split('-').length >= 5;
};

/**
 * Converts a file reference to a proper URL for display
 * Handles various formats including:
 * - Full URLs (http/https)
 * - API routes
 * - UUID-based filenames (typical for uploaded files)
 * - Regular paths with leading slashes
 * 
 * @param imageRef - The image reference from the database
 * @param defaultPlaceholder - Optional placeholder image to use if imageRef is null/undefined
 * @param options - Optional image optimization parameters
 * @param debug - Whether to log debug information
 * @returns A properly formatted URL for the image
 */
export const getImageUrl = (
  imageRef: string | null | undefined, 
  defaultPlaceholder: string = '/placeholder-image.png',
  options?: ImageOptimizationOptions,
  debug: boolean = false
): string => {
  // Return default placeholder if no image reference
  if (!imageRef) {
    if (debug) console.log('No image reference provided, using placeholder:', defaultPlaceholder);
    return defaultPlaceholder;
  }

  // Already a full URL
  if (imageRef.startsWith('http://') || imageRef.startsWith('https://')) {
    if (debug) console.log('Using external URL:', imageRef);
    return imageRef;
  }

  // Already an API path
  if (imageRef.startsWith('/api/')) {
    if (debug) console.log('Using API path:', imageRef);
    return imageRef;
  }

  // UUID-based filename (typical for uploaded files)
  if (isUuid(imageRef) && !imageRef.startsWith('/')) {
    const apiPath = `/api/files/${imageRef}`;
    if (debug) console.log('UUID-based filename detected, using API path:', apiPath);
    return apiPath;
  }

  // Path with leading slash
  if (imageRef.startsWith('/')) {
    if (debug) console.log('Using path with leading slash:', imageRef);
    return imageRef;
  }

  // Default case: assume it's a filename that needs the /api/files/ prefix
  const apiPath = `/api/files/${imageRef}`;
  if (debug) console.log('Using default API path for filename:', apiPath);
  return apiPath;
};

/**
 * Gets an appropriate placeholder image based on content type
 * 
 * @param contentType - The type of content (e.g., 'profile', 'banner', 'nft')
 * @returns Path to an appropriate placeholder image
 */
export const getPlaceholderImage = (contentType: 'profile' | 'banner' | 'nft' | 'collection' | 'default'): string => {
  switch (contentType) {
    case 'profile':
      return '/placeholder-profile.png';
    case 'banner':
      return '/placeholder-banner.png';
    case 'nft':
      return '/placeholder-nft.png';
    case 'collection':
      return '/placeholder-collection.png';
    default:
      return '/placeholder-image.png';
  }
};
