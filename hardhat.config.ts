import path from "path";
import * as dotenv from "dotenv";
// import { fileURLToPath } from 'url'; // No longer needed

// ESM-compatible way to get __dirname - REMOVED
// const __filename = fileURLToPath(import.meta.url); // REMOVED
// const __dirname = path.dirname(__filename); // REMOVED

// Explicitly load .env.temp from the project root
const projectRoot = process.cwd(); // Use process.cwd() as hardhat.config.ts is at the root
dotenv.config({ path: path.join(projectRoot, ".env.local") });

// The console.log we added for debugging
console.log("[DEBUG] SEPOLIA_RPC_URL from process.env (after explicit load of .env.local):", process.env.SEPOLIA_RPC_URL);
console.log("[DEBUG] ETHERSCAN_API_KEY from process.env (after explicit load of .env.local):", process.env.ETHERSCAN_API_KEY);

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

// console.log("[DEBUG] SEPOLIA_RPC_URL from process.env:", process.env.SEPOLIA_RPC_URL); // Original debug line, now superseded

const PRIVATE_KEY = process.env.PRIVATE_KEY || "8d442fd15cc758fa0bf73cfb9e8db6f757bd8c65f95792e80751cfc75a2c3a94";
// Using more reliable public RPC endpoints with fallbacks
const SEPOLIA_RPC_URLS = [
  process.env.SEPOLIA_RPC_URL,
  "https://eth-sepolia.public.blastapi.io", 
  "https://ethereum-sepolia-rpc.publicnode.com",
  "https://rpc2.sepolia.org",
  "https://rpc.sepolia.org"
];

// Find the first working RPC URL
let SEPOLIA_RPC_URL = SEPOLIA_RPC_URLS[0]; // Default to the first one from .env.temp
// We can't easily test all URLs synchronously in this config, so we'll keep the first one for now

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

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
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      timeout: 120000, // 120 seconds (increased from 60s)
      gasMultiplier: 1.2, // Add 20% to gas estimates to prevent failures
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config; // ESM-style export
// module.exports = config; // Explicit CommonJS export (commented out or removed) 