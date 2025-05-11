require('dotenv').config();

// Hardcode the private key directly for debugging purposes
const PRIVATE_KEY = "8d442fd15cc758fa0bf73cfb9e8db6f757bd8c65f95792e80751cfc75a2c3a94";
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/-9NA8V25gEEn6DZokD_cuOxFRFVzf5qo";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

require("@nomicfoundation/hardhat-toolbox");

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
      accounts: [`0x${PRIVATE_KEY}`], // Using the hardcoded private key
      chainId: 11155111, // Sepolia chain ID
      timeout: 60000, // 60 seconds timeout
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
};

task("checkchainId", "Prints the chain ID of the current network", async (taskArgs, hre) => {
  const chainId = await hre.ethers.provider.send("eth_chainId", []);
  console.log(`Chain ID: ${chainId}`);
  const network = await hre.ethers.provider.getNetwork();
  console.log(`Network name: ${network.name}`);
  console.log(`Network chainId (from provider): ${network.chainId}`);
});

module.exports = config; 