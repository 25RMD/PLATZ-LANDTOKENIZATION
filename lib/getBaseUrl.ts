/**
 * Returns the base URL for the application, which is used for constructing metadata URLs
 * that are accessible from the blockchain.
 *
 * It prioritizes the Vercel-provided URL in production, falls back to the ngrok URL
 * for local development, and finally defaults to localhost.
 */
export const getBaseUrl = () => {
  // 1. Vercel deployment URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 2. Local development with ngrok
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  // 3. Default to localhost
  return 'http://localhost:3001';
};
