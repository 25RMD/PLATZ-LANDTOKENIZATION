const { ethers } = require("ethers");
require('dotenv').config({ path: '../.env.local' }); // Adjust path as necessary, assuming script is in 'scripts' dir

// Custom provider with better timeout settings
function getProvider() {
  const rpcUrl = process.env.RPC_URL || process.env.SEPOLIA_RPC_URL;
  if (!rpcUrl) {
    throw new Error("RPC_URL or SEPOLIA_RPC_URL environment variable not set");
  }
  
  return new ethers.JsonRpcProvider(rpcUrl, undefined, {
    batchMaxCount: 1,
    cacheTimeout: 0,
    polling: false,
    staticNetwork: true,
    timeout: 60000, // 60 seconds timeout
  });
}

// Retry utility function
async function withRetry(operation, maxRetries = 3, delayMs = 5000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} of ${maxRetries}...`);
      return await operation();
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        console.log(`Retrying in ${delayMs / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  console.error(`All ${maxRetries} attempts failed.`);
  throw lastError;
}

async function main() {
  const provider = getProvider();
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || process.env.SEPOLIA_PRIVATE_KEY, provider);
  console.log("Using account:", wallet.address);

  const contractAddress = process.env.NFT_CONTRACT_ADDRESS;
  if (!contractAddress) {
    console.error("NFT_CONTRACT_ADDRESS not found in .env.local or environment.");
    process.exit(1);
  }
  console.log("Interacting with contract at:", contractAddress);

  // Load the contract ABI
  const contractArtifact = require("../artifacts/contracts/PlatzLandNFTWithCollections.sol/PlatzLandNFTWithCollections.json");
  const platzLandNFT = new ethers.Contract(
    contractAddress,
    contractArtifact.abi,
    wallet
  );

  const recipientAddress = wallet.address;
  
  const currentNgrokUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!currentNgrokUrl) {
    console.error("NEXT_PUBLIC_BASE_URL (ngrok URL) not found in .env.local or environment.");
    process.exit(1);
  }

  const metadataFileName = "384a58ab-fd63-4c0e-b586-c7e89f2419c2-collection-metadata-cmb04r17j0000czn9ih85qcjs.json";
  const collectionUploadPath = "collections/cmb04r17j0000czn9ih85qcjs"; // Path for the specific metadata file
  const mainTokenMetadataURI = `${currentNgrokUrl}/uploads/${collectionUploadPath}/${metadataFileName}`;
  
  const quantity = 1; // Mint 1 main token and 1 child token
  const collectionMetadataURI = `${currentNgrokUrl}/uploads/${collectionUploadPath}/test_collection_metadata.json`; // Placeholder for collection metadata
  const childTokenBaseURI = `${currentNgrokUrl}/uploads/${collectionUploadPath}/tokens/`; // Base for child token URIs (e.g., .../tokens/<tokenId>.json)

  console.log(`Attempting to create collection and mint main token for ${recipientAddress}`);
  console.log(`  Main Token URI: ${mainTokenMetadataURI}`);
  console.log(`  Quantity (child tokens): ${quantity}`);
  console.log(`  Collection URI: ${collectionMetadataURI}`);
  console.log(`  Child Token Base URI: ${childTokenBaseURI}`);

  try {
    // Wrap the transaction in a retry block
    const result = await withRetry(async () => {
      console.log("Sending createCollection transaction...");
      const tx = await platzLandNFT.createCollection(
        recipientAddress,
        mainTokenMetadataURI,
        quantity,
        collectionMetadataURI,
        childTokenBaseURI
      );
      const txHash = tx.hash;
      console.log("Transaction sent:", txHash);
      
      console.log("Waiting for transaction confirmation (this may take a few minutes)...");
      const receipt = await tx.wait();
      console.log("Transaction confirmed in block:", receipt.blockNumber);
      console.log("Receipt status:", receipt.status === 1 ? "Success" : "Failed");
      
      if (receipt.status !== 1) {
        throw new Error(`Transaction failed with status ${receipt.status}`);
      }
      
      return { receipt, txHash: tx.hash };
    }, 3, 10000); // Retry up to 3 times with 10 second delay between retries
    
    console.log("Transaction hash:", result.txHash);

    let mainTokenId = null;
    let collectionId = null;

    const receipt = result.receipt;
    console.log(`Attempting to query CollectionCreated events in block ${receipt.blockNumber}...`);
    
    // Get the contract interface to parse events
    const contractInterface = new ethers.Interface(contractArtifact.abi);
    
    // Get the transaction receipt to get the logs
    const txReceipt = await provider.getTransactionReceipt(result.txHash);
    
    // Parse the logs to find the CollectionCreated event
    let collectionCreatedEvent = null;
    for (const log of txReceipt.logs) {
      try {
        const event = contractInterface.parseLog({
          data: log.data,
          topics: [...log.topics]
        });
        
        if (event && event.name === 'CollectionCreated') {
          collectionCreatedEvent = event;
          break;
        }
      } catch (e) {
        // Not a matching event, continue to next log
        continue;
      }
    }
    
    if (collectionCreatedEvent) {
      collectionId = collectionCreatedEvent.args.collectionId.toString();
      mainTokenId = collectionCreatedEvent.args.mainTokenId.toString();
      console.log("CollectionCreated event found:");
      console.log("  Transaction Hash:", result.txHash);
      console.log("  Collection ID:", collectionId);
      console.log("  Main Token ID (for testing):", mainTokenId);
      console.log("  Creator:", collectionCreatedEvent.args.creator);
    } else {
      console.warn("Warning: CollectionCreated event not found in transaction logs");
      console.log("Transaction logs:", JSON.stringify(txReceipt.logs, null, 2));
    }

    if (mainTokenId) {
      console.log(`\nSuccessfully created collection ${collectionId} and minted Main Token ID: ${mainTokenId}`);
      console.log(`This Main Token ID (${mainTokenId}) will be used for testing updateTokenURI.`);
      console.log(`View Main Token on Etherscan (Sepolia): https://sepolia.etherscan.io/token/${contractAddress}?a=${mainTokenId}`);
    } else {
      console.error("Could not find CollectionCreated event in transaction receipt. Manual check required.");
    }

  } catch (error) {
    console.error("Error in createCollection:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
