// Test script to verify RPC connection using ethers v6
const { ethers } = require("ethers");

async function testRpc() {
  const rpcUrl = process.env.RPC_URL || process.env.SEPOLIA_RPC_URL;
  if (!rpcUrl) {
    console.error("RPC_URL or SEPOLIA_RPC_URL environment variable not set");
    process.exit(1);
  }

  console.log(`Testing RPC connection to: ${rpcUrl}`);
  
  try {
    // Create a provider with a longer timeout
    const provider = new ethers.JsonRpcProvider(rpcUrl, undefined, {
      batchMaxCount: 1,
      cacheTimeout: 0,
      polling: false,
      staticNetwork: true,
      timeout: 30000, // 30 seconds timeout
    });

    // Test 1: Get the current block number
    console.log("Fetching latest block number...");
    const blockNumber = await provider.getBlockNumber();
    console.log("✓ Current block number:", blockNumber);
    
    // Test 2: Get the network ID
    console.log("Fetching network info...");
    const network = await provider.getNetwork();
    console.log("✓ Network ID:", network.chainId);
    console.log("✓ Network name:", network.name);
    
    // Test 3: Get the gas price
    console.log("Fetching current gas price...");
    const gasPrice = await provider.getFeeData();
    console.log("✓ Current gas price:", ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei'), "gwei");
    
    console.log("\n✅ RPC connection test successful!");
  } catch (error) {
    console.error("\n❌ RPC connection test failed:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    
    if (error.code) console.error("Error code:", error.code);
    if (error.reason) console.error("Reason:", error.reason);
    
    // Log more details for common errors
    if (error.code === 'ECONNREFUSED') {
      console.error("\nThe connection was refused. This usually means:"
        + "\n1. The RPC URL is incorrect"
        + "\n2. The RPC server is not running"
        + "\n3. A firewall is blocking the connection"
      );
    } else if (error.code === 'ETIMEDOUT' || error.code === 'TIMEOUT') {
      console.error("\nThe request timed out. This could be due to:"
        + "\n1. Network connectivity issues"
        + "\n2. The RPC server is overloaded"
        + "\n3. The RPC URL is incorrect"
      );
    } else if (error.code === 'NETWORK_ERROR') {
      console.error("\nA network error occurred. Please check your internet connection.");
    }
    
    process.exit(1);
  }
}

// Run the test
testRpc().catch(console.error);
