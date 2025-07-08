/** @type {import('next').NextConfig} */

// This utility is duplicated from lib/getBaseUrl.ts to avoid module resolution
// issues in this CommonJS config file.
const getBaseUrl = () => {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.BASE_URL) return process.env.BASE_URL;
  return null; // Return null if no specific URL is set
};

const devOrigin = getBaseUrl();

const initialAllowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://172.20.10.2:3000',
  'http://172.20.10.2:3001',
];

if (devOrigin) {
  if (!initialAllowedOrigins.includes(devOrigin)) {
    initialAllowedOrigins.push(devOrigin);
    console.log(`[next.config.js] Added dynamic origin ${devOrigin} to allowedDevOrigins.`);
  } else {
    console.log(`[next.config.js] Dynamic origin ${devOrigin} is already in allowedDevOrigins.`);
  }
} else {
  console.log('[next.config.js] No dynamic origin (VERCEL_URL or BASE_URL) found to add to allowedDevOrigins.');
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
