async function main() {
  try {
    console.log("Attempting to connect to provider and get block number...");
    const provider = ethers.provider;
    const network = await provider.getNetwork();
    console.log(`Connected to network: ${network.name} (chainId: ${network.chainId})`);
    const blockNumber = await provider.getBlockNumber();
    console.log("Current block number:", blockNumber);
    console.log("Connection test successful.");
  } catch (error) {
    console.error("Error during connection test:", error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Unhandled error in main:", error);
  process.exitCode = 1;
});
