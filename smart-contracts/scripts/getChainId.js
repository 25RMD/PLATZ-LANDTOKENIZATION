// Simple script to test basic network connectivity
// Just fetches the chain ID - much simpler than a full deployment

// When running with hardhat, these variables are injected into the global scope
// But we need to access them through hre when imported explicitly
const hre = require("hardhat");
const { ethers, network } = hre;

async function main() {
  console.log("Starting simple chain ID query test...");
  console.log("Network config:", network.config.url); // Log the RPC URL being used
  console.log("Environment SEPOLIA_RPC_URL:", process.env.SEPOLIA_RPC_URL); // Check what's in .env
  
  try {
    // Attempt to get the chain ID via a JSON-RPC call
    const chainId = await ethers.provider.send("eth_chainId", []);
    console.log("Chain ID (hex):", chainId);
    console.log("Chain ID (decimal):", parseInt(chainId, 16));
    
    // Also try a basic network call using the provider's getNetwork
    const networkInfo = await ethers.provider.getNetwork();
    console.log("Network info:", {
      name: networkInfo.name,
      chainId: networkInfo.chainId,
    });
    
    console.log("SUCCESS: Basic RPC connectivity is working!");
  } catch (error) {
    console.error("FAILED: Error connecting to the network:");
    console.error(error);
    process.exit(1);
  }
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 