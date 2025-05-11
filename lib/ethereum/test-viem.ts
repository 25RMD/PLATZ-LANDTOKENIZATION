import { createPublicClient, http, Block } from "viem";
import { sepolia } from "viem/chains";

/**
 * Test function to verify Viem integration works correctly
 */
export async function testViemConnection() {
  console.log("Testing Viem connection to Sepolia...");
  
  try {
    // Create a Viem client with the Alchemy RPC URL
    const client = createPublicClient({
      chain: sepolia,
      transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/-9NA8V25gEEn6DZokD_cuOxFRFVzf5qo"),
      batch: {
        multicall: true,
      },
    });

    // Get the latest block number
    const blockNumber = await client.getBlockNumber();
    console.log(`Current block number: ${blockNumber}`);

    // Get the latest block
    const block = await client.getBlock();
    console.log(`Latest block hash: ${block.hash}`);
    console.log(`Block timestamp: ${new Date(Number(block.timestamp) * 1000).toISOString()}`);
    console.log(`Block transactions: ${block.transactions.length}`);

    // Test successful
    console.log("Viem connection test successful!");
    return {
      success: true,
      blockNumber: blockNumber.toString(), // Convert BigInt to string
      blockHash: block.hash,
      timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
      transactionCount: block.transactions.length
    };
  } catch (error) {
    console.error("Viem connection test failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// If this file is run directly, execute the test
if (require.main === module) {
  testViemConnection()
    .then(result => {
      console.log("Test result:", result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error("Unhandled error:", error);
      process.exit(1);
    });
}
