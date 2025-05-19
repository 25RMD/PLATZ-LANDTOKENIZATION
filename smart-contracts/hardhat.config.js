require("@nomicfoundation/hardhat-toolbox");

// ABSOLUTELY MINIMAL CONFIG
const config = {
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
    // Hardhat will use its default hardhat network if no --network is specified.
    // For --network localhost, it expects a node running at http://127.0.0.1:8545/
    // No explicit localhost definition needed unless overriding defaults.
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

module.exports = config; 