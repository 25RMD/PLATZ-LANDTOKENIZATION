/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: {
    allowedDevOrigins: [
      // Allow requests from localhost and common local IPs
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      // Add the specific IP from the error message if it's consistent
      'http://172.20.10.2:3000',
      'http://172.20.10.2:3001',
    ],
  },
  webpack: (config, { isServer }) => {
    // The externals configuration was removed as it was causing SyntaxErrors.
    // We are relying on package.json overrides and explicit wallet adapter
    // selection in lib/wallet-config.ts to manage mobile wallet adapters.

    // Re-enable resolve.fallback configuration
    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "buffer": require.resolve("buffer/"), // Ensure trailing slash for buffer
        "fs": false,
        "path": false,
        "os": false,
        "http": false,
        "https": false,
        "assert": false,
        "url": false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;
