/**
 * RPC Rate Limiting Utility
 * 
 * This utility helps prevent exceeding blockchain provider rate limits by implementing
 * client-side rate limiting and backoff strategies.
 */

// Track API call counts per endpoint
const apiCallCounts: Record<string, { count: number; lastReset: number }> = {};
const MAX_CALLS_PER_SECOND = 5; // Adjust based on provider limits
const RESET_INTERVAL_MS = 1000; // 1 second

/**
 * Checks if an API call should be rate limited
 * @param endpointId Identifier for the API endpoint being called
 * @returns Boolean indicating if the call should proceed
 */
export function shouldRateLimit(endpointId: string): boolean {
  const now = Date.now();
  
  // Initialize tracking for this endpoint if it doesn't exist
  if (!apiCallCounts[endpointId]) {
    apiCallCounts[endpointId] = {
      count: 0,
      lastReset: now
    };
  }
  
  const endpoint = apiCallCounts[endpointId];
  
  // Reset counter if time window has passed
  if (now - endpoint.lastReset > RESET_INTERVAL_MS) {
    endpoint.count = 0;
    endpoint.lastReset = now;
  }
  
  // Check if we're over the limit
  if (endpoint.count >= MAX_CALLS_PER_SECOND) {
    console.log(`Rate limiting ${endpointId} - too many calls per second`);
    return true; // Should rate limit
  }
  
  // Increment counter and allow call
  endpoint.count++;
  return false; // No rate limiting needed
}

/**
 * Calculates backoff time for retries
 * @param retryCount Current retry attempt number
 * @param baseDelay Base delay in milliseconds
 * @param maxDelay Maximum delay in milliseconds
 * @returns Delay time in milliseconds
 */
export function calculateBackoff(retryCount: number, baseDelay = 1000, maxDelay = 30000): number {
  // Exponential backoff with jitter
  const delay = Math.min(
    maxDelay,
    baseDelay * Math.pow(2, retryCount) * (0.5 + Math.random() * 0.5)
  );
  return Math.floor(delay);
}

/**
 * Waits for a specified amount of time
 * @param ms Milliseconds to wait
 * @returns Promise that resolves after the wait time
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute a function with rate limiting and automatic retries
 * @param fn Function to execute
 * @param endpointId Identifier for the API endpoint
 * @param maxRetries Maximum number of retry attempts
 * @returns Result of the function call
 */
export async function withRateLimit<T>(
  fn: () => Promise<T>, 
  endpointId: string,
  maxRetries = 3
): Promise<T> {
  let retryCount = 0;
  
  while (true) {
    try {
      // Check if we should rate limit
      if (shouldRateLimit(endpointId)) {
        const backoffTime = calculateBackoff(retryCount);
        console.log(`Rate limited ${endpointId}, waiting ${backoffTime}ms`);
        await wait(backoffTime);
        continue;
      }
      
      // Execute the function
      return await fn();
    } catch (error) {
      // Check if we should retry
      if (retryCount >= maxRetries) {
        console.error(`Max retries (${maxRetries}) reached for ${endpointId}`);
        throw error;
      }
      
      retryCount++;
      const backoffTime = calculateBackoff(retryCount);
      console.log(`Error in ${endpointId}, retry ${retryCount}/${maxRetries} after ${backoffTime}ms`, error);
      await wait(backoffTime);
    }
  }
}

/**
 * Tracks the chunk size for blockchain log queries to adapt based on provider responses
 */
const chunkSizes: Record<string, number> = {};

/**
 * Gets the optimal chunk size for a provider based on previous successful/failed requests
 * @param providerId Identifier for the provider
 * @returns Chunk size in number of blocks
 */
export function getOptimalChunkSize(providerId: string): number {
  // Default is 500 blocks to stay within Alchemy limits
  if (!chunkSizes[providerId]) {
    chunkSizes[providerId] = 500;
  }
  return chunkSizes[providerId];
}

/**
 * Adjusts the chunk size based on success/failure of requests
 * @param providerId Identifier for the provider
 * @param success Whether the request was successful
 * @param errorMessage Optional error message from failed request
 */
export function adjustChunkSize(providerId: string, success: boolean, errorMessage?: string): void {
  const currentSize = getOptimalChunkSize(providerId);
  
  if (success) {
    // Slowly increase chunk size on success, up to a reasonable maximum
    chunkSizes[providerId] = Math.min(currentSize + 10, 500);
  } else {
    // Aggressively reduce chunk size on failure
    // Check for block range errors specifically
    if (errorMessage && 
        (errorMessage.includes('block range') || 
         errorMessage.includes('query returned more than') ||
         errorMessage.includes('up to a 500 block range'))) {
      // Cut size in half for block range errors
      chunkSizes[providerId] = Math.max(Math.floor(currentSize / 2), 100);
    } else {
      // Reduce by 20% for other errors
      chunkSizes[providerId] = Math.max(Math.floor(currentSize * 0.8), 100);
    }
  }
  
  console.log(`Adjusted chunk size for ${providerId} to ${chunkSizes[providerId]} blocks`);
} 