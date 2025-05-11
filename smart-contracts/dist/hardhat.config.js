"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("@nomicfoundation/hardhat-toolbox");
require("dotenv/config"); // Import and configure dotenv
require("ts-node/register"); // Add this for explicit ts-node registration
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org"; // Fallback if not set
const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY || "0000000000000000000000000000000000000000000000000000000000000001"; // A different invalid, but non-zero, raw hex key
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const config = {
    solidity: {
        version: "0.8.20",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
            metadata: {
                // Not recommended for large contracts, but good for verification
                bytecodeHash: "none", // Can be "ipfs" or "bzzr1" for Sourcify, "none" is default
            },
        },
    },
    networks: {
        hardhat: {
            // Specific Hardhat Network configurations can go here
            chainId: 1337, // Standard for Hardhat Network
        },
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [`0x${SEPOLIA_PRIVATE_KEY}`], // Hardhat expects accounts to be 0x-prefixed hex strings
            chainId: 11155111, // Sepolia chain ID
        },
    },
    etherscan: {
        apiKey: {
            sepolia: ETHERSCAN_API_KEY,
        },
    },
    sourcify: {
    // Disabled by default
    // Enabled: true
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts",
    },
    mocha: {
        timeout: 40000,
    },
    // tsNode: {} // Removed as it caused TS error
};
exports.default = config;
