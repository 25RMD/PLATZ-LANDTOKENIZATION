/** @type {import('next').NextConfig} */

// Read the ngrok URL from environment variable
const ngrokDevOrigin = process.env.NEXT_PUBLIC_BASE_URL;

const initialAllowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://172.20.10.2:3000',
  'http://172.20.10.2:3001',
];

if (ngrokDevOrigin) {
  // Ensure we don't add duplicates if it's already localhost or similar
  if (!initialAllowedOrigins.includes(ngrokDevOrigin)) {
    initialAllowedOrigins.push(ngrokDevOrigin);
  }
  console.log(`[next.config.js] Added ${ngrokDevOrigin} to allowedDevOrigins.`);
} else {
  console.log('[next.config.js] NEXT_PUBLIC_BASE_URL not set, ngrok origin not added to allowedDevOrigins.');
}

const nextConfig = {
  devIndicators: {
    allowedDevOrigins: initialAllowedOrigins,
  },
  async rewrites() {
    return [
      {
        source: '/uploads/collections/:path*',
        destination: '/api/fallback-upload/collections/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-Requested-With, Content-Type, Authorization' },
        ],
      },
    ];
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
