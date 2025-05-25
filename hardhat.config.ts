import path from "path";
import * as dotenv from "dotenv";

// Load .env.local as early as possible, assuming hardhat commands are run from project root
const projectRoot = process.cwd();
const envPath = path.join(projectRoot, ".env.local");
const envConfig = dotenv.config({ path: envPath });

if (envConfig.error) {
  console.error("[ERROR] Failed to load .env.local in hardhat.config.ts:", envConfig.error);
} else {
  console.log("[DEBUG] .env.local loaded in hardhat.config.ts. Parsed keys:", Object.keys(envConfig.parsed || {}));
}

console.log("[DEBUG] SEPOLIA_RPC_URL from process.env (in hardhat.config.ts):", process.env.SEPOLIA_RPC_URL);
console.log("[DEBUG] ETHERSCAN_API_KEY from process.env (in hardhat.config.ts):", process.env.ETHERSCAN_API_KEY);
console.log("[DEBUG] PRIVATE_KEY from process.env (in hardhat.config.ts):", process.env.PRIVATE_KEY);

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const DEFAULT_SEPOLIA_RPC_URL = "https://eth-sepolia.public.blastapi.io";
// IMPORTANT: This default private key is for placeholder/fallback only. 
// Ensure your actual private key is loaded from .env.local for transactions.
const DEFAULT_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; 

const sepoliaRpcUrl = process.env.FALLBACK_RPC_URL_1 || process.env.RPC_URL || process.env.NEXT_PUBLIC_RPC_URL || process.env.FALLBACK_RPC_URL_2 || "https://rpc.sepolia.org";
const privateKey = process.env.PRIVATE_KEY || DEFAULT_PRIVATE_KEY;
const etherscanApiKey = process.env.ETHERSCAN_API_KEY || "";

if (!process.env.SEPOLIA_RPC_URL) {
  console.warn(`[WARN] SEPOLIA_RPC_URL not found in environment variables. Using default: ${DEFAULT_SEPOLIA_RPC_URL}`);
}
if (!process.env.PRIVATE_KEY) {
  console.warn(`[WARN] PRIVATE_KEY not found in environment variables. Using a default (unsafe) key for configuration. Ensure your actual key is used for signing transactions.`);
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    sepolia: {
      url: sepoliaRpcUrl,
      // Ensure accounts array is populated correctly based on whether privateKey is the default or loaded one
      accounts: (privateKey && privateKey !== DEFAULT_PRIVATE_KEY) ? [privateKey] : [],
      timeout: 180000, // 180 seconds (3 minutes) - increased to handle slower connections
      gasMultiplier: 1.2,
    },
  },
  etherscan: {
    apiKey: etherscanApiKey,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config; 