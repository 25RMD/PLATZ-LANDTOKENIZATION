import { decodeEventLog, PublicClient } from "viem";
import { getOptimalChunkSize, adjustChunkSize, withRateLimit } from "./rateLimit";

/**
 * Fetches blockchain logs in chunks to avoid exceeding RPC provider block range limits
 * 
 * @param client - Viem PublicClient instance
 * @param options - Options for the getLogs request
 * @param providerId - Identifier for the provider (default: "default")
 * @returns Combined logs from all chunks
 */
export async function getLogsInChunks(
  client: PublicClient,
  options: {
    address: `0x${string}`;
    event: any;
    fromBlock: bigint | 'earliest';
    toBlock: bigint | 'latest';
  },
  providerId: string = "default"
) {
  if (!client) throw new Error("Public client is required");

  // Convert block specifiers to actual block numbers
  const fromBlockNum = options.fromBlock === 'earliest' 
    ? 0n 
    : typeof options.fromBlock === 'bigint' 
      ? options.fromBlock 
      : 0n;
      
  const toBlockNum = options.toBlock === 'latest'
    ? await client.getBlockNumber()
    : typeof options.toBlock === 'bigint'
      ? options.toBlock
      : await client.getBlockNumber();

  // Get the optimal chunk size based on previous provider behavior
  const maxBlockRange = getOptimalChunkSize(providerId);
  console.log(`Using chunk size of ${maxBlockRange} blocks for provider ${providerId}`);

  // If range is smaller than max, just do a single query
  if (toBlockNum - fromBlockNum <= BigInt(maxBlockRange)) {
    try {
      const result = await withRateLimit(
        () => client.getLogs(options),
        `${providerId}-getLogs`,
        3
      );
      adjustChunkSize(providerId, true);
      return result;
    } catch (error) {
      adjustChunkSize(providerId, false, String(error));
      throw error;
    }
  }

  // Otherwise, break it into chunks
  console.log(`Fetching logs in chunks. Block range: ${fromBlockNum} to ${toBlockNum}`);
  const allLogs = [];
  let currentFromBlock = fromBlockNum;

  while (currentFromBlock <= toBlockNum) {
    const currentToBlock = currentFromBlock + BigInt(maxBlockRange) <= toBlockNum
      ? currentFromBlock + BigInt(maxBlockRange)
      : toBlockNum;
      
    console.log(`Fetching logs from block ${currentFromBlock} to ${currentToBlock}`);
    
    try {
      const logs = await withRateLimit(
        () => client.getLogs({
          ...options,
          fromBlock: currentFromBlock,
          toBlock: currentToBlock,
        }),
        `${providerId}-getLogs`,
        2
      );
      
      allLogs.push(...logs);
      console.log(`Found ${logs.length} logs in this chunk`);
      adjustChunkSize(providerId, true);
      
      // Move to the next chunk
      currentFromBlock = currentToBlock + 1n;
    } catch (error) {
      console.error(`Error fetching logs from ${currentFromBlock} to ${currentToBlock}:`, error);
      
      // Adjust chunk size based on error
      adjustChunkSize(providerId, false, String(error));
      
      // Get the new (smaller) chunk size
      const newMaxBlockRange = getOptimalChunkSize(providerId);
      
      // If the block range is still too large, try with a smaller chunk
      if (currentToBlock - currentFromBlock > BigInt(newMaxBlockRange)) {
        console.log(`Chunk size reduced to ${newMaxBlockRange} blocks, retrying with smaller chunk`);
        
        // Retry with smaller range
        const newToBlock = currentFromBlock + BigInt(newMaxBlockRange - 1);
        
        try {
          const retryLogs = await withRateLimit(
            () => client.getLogs({
              ...options, 
              fromBlock: currentFromBlock,
              toBlock: newToBlock,
            }),
            `${providerId}-getLogs-retry`,
            3
          );
          
          allLogs.push(...retryLogs);
          console.log(`Successfully retrieved ${retryLogs.length} logs with smaller chunk`);
          adjustChunkSize(providerId, true);
          
          // Continue from the new block
          currentFromBlock = newToBlock + 1n;
        } catch (retryError) {
          console.error(`Error with reduced block range (${currentFromBlock}-${newToBlock}):`, retryError);
          adjustChunkSize(providerId, false, String(retryError));
          
          // Even with smaller range failed, so skip this chunk
          currentFromBlock = newToBlock + 1n;
        }
      } else {
        // Skip this chunk if it's already small enough and still failing
        console.log(`Skipping problematic chunk from ${currentFromBlock} to ${currentToBlock}`);
        currentFromBlock = currentToBlock + 1n;
      }
    }
  }

  return allLogs;
}

/**
 * Helper function to decode event logs with error handling
 */
export function safeDecodeEventLog({ abi, data, topics, eventName }: { 
  abi: any; 
  data: string; 
  topics: string[];
  eventName: string;
}) {
  try {
    return decodeEventLog({
      abi,
      data,
      topics,
      eventName
    });
  } catch (error) {
    console.error(`Error decoding event log for ${eventName}:`, error);
    return { args: {} };
  }
} 