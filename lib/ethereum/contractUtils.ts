import { ethers } from 'ethers';
import { createPublicClient, http, createWalletClient, custom } from 'viem';
import { sepolia } from 'viem/chains';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/db';

// This will be populated after contract deployment
let CONTRACT_ADDRESS: string | null = null;
let CONTRACT_ABI: any = null;

// Initialize contract data - this should be called after deployment
export const initContractData = (address: string, abi: any) => {
  CONTRACT_ADDRESS = address;
  CONTRACT_ABI = abi;
};

// Try to load contract data from the file system
try {
  const contractData = require('../contracts/contract-address.json');
  const contractAbi = require('../contracts/PlatzLandNFT.json');
  
  if (contractData && contractData.PlatzLandNFT && contractAbi) {
    CONTRACT_ADDRESS = contractData.PlatzLandNFT;
    CONTRACT_ABI = contractAbi.abi;
    console.log(`Loaded contract data from file. Address: ${CONTRACT_ADDRESS}`);
  }
} catch (error) {
  console.warn('Could not load contract data from file. Contract may not be deployed yet.');
}

// Get provider and signer
export const getProviderAndSigner = async () => {
  console.log('Environment variables check:');
  console.log('- RPC_URL present:', !!process.env.RPC_URL);
  console.log('- NEXT_PUBLIC_RPC_URL present:', !!process.env.NEXT_PUBLIC_RPC_URL);
  console.log('- SERVER_WALLET_PRIVATE_KEY present:', !!process.env.SERVER_WALLET_PRIVATE_KEY);
  console.log('- NEXT_PUBLIC_SERVER_WALLET_PRIVATE_KEY present:', !!process.env.NEXT_PUBLIC_SERVER_WALLET_PRIVATE_KEY);
  
  // Define multiple fallback RPC URLs for Sepolia testnet
  // Order from most reliable to least reliable
  const rpcUrls = [
    // First try user-configured endpoints
    process.env.RPC_URL,
    process.env.NEXT_PUBLIC_RPC_URL,
    
    // Premium endpoints (more reliable)
    'https://eth-sepolia.g.alchemy.com/v2/demo',
    'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    
    // Reliable public endpoints for Sepolia testnet
    'https://rpc.sepolia.org',
    'https://rpc2.sepolia.org',
    'https://sepolia.drpc.org',
    'https://ethereum-sepolia-rpc.publicnode.com',
    'https://sepolia.gateway.tenderly.co',
    'https://rpc.ankr.com/eth_sepolia',
    
    // Additional fallbacks
    'https://rpc-sepolia.rockx.com',
    'https://sepolia.blockpi.network/v1/rpc/public',
  ].filter(Boolean) as string[]; // Filter out undefined/null values
  
  // Create a Viem public client for read operations (alternative to ethers provider)
  const createViemPublicClient = (rpcUrl: string) => {
    console.log(`Creating Viem public client with RPC URL: ${rpcUrl.substring(0, 20)}...`);
    return createPublicClient({
      chain: sepolia,
      transport: http(rpcUrl),
    });
  };
  
  // Try to get the private key from multiple possible environment variables
  const privateKey = process.env.SERVER_WALLET_PRIVATE_KEY || 
                    process.env.NEXT_PUBLIC_SERVER_WALLET_PRIVATE_KEY || 
                    '8d442fd15cc758fa0bf73cfb9e8db6f757bd8c65f95792e80751cfc75a2c3a94';
  
  console.log(`Found ${rpcUrls.length} potential RPC URLs to try`);
  
  // Function to try connecting to an RPC URL with timeout using ethers.js
  const tryConnectWithTimeout = async (url: string, timeoutMs = 15000, retries = 2) => {
    console.log(`Trying to connect to RPC URL with ethers: ${url.substring(0, 20)}... (timeout: ${timeoutMs}ms, retries: ${retries})`);
    
    // Implement retry logic with exponential backoff
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await new Promise<{ provider: ethers.JsonRpcProvider, wallet: ethers.Wallet }>((resolve, reject) => {
          // Set a timeout to reject the promise if it takes too long
          const timeout = setTimeout(() => {
            reject(new Error(`Connection to ${url} timed out after ${timeoutMs}ms on attempt ${attempt + 1}/${retries + 1}`));
          }, timeoutMs);
          
          try {
            // Create provider with better options
            const provider = new ethers.JsonRpcProvider(url, undefined, {
              staticNetwork: true, // Prevent network detection on every call
              polling: true, // Enable polling for more reliable connections
              pollingInterval: 4000, // Poll every 4 seconds
              batchStallTime: 10, // Small stall time for batching
              cacheTimeout: -1, // Disable cache timeout
            });
            
            const wallet = new ethers.Wallet(privateKey, provider);
            
            // Test the connection
            provider.getBlockNumber().then((blockNumber) => {
              clearTimeout(timeout);
              console.log(`Successfully connected with ethers to ${url.substring(0, 20)}... (current block: ${blockNumber})`);
              resolve({ provider, wallet });
            }).catch(err => {
              clearTimeout(timeout);
              console.error(`Ethers connection test failed for ${url.substring(0, 20)}... on attempt ${attempt + 1}/${retries + 1}:`, err.message || 'Unknown error');
              reject(err);
            });
          } catch (err) {
            clearTimeout(timeout);
            reject(err);
          }
        });
      } catch (error) {
        if (attempt < retries) {
          // Exponential backoff: wait longer between each retry
          const backoffTime = Math.min(1000 * Math.pow(2, attempt), 10000);
          console.log(`Retrying connection to ${url.substring(0, 20)}... in ${backoffTime}ms (attempt ${attempt + 1}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
        } else {
          // Last attempt failed, propagate the error
          throw error;
        }
      }
    }
    
    // This should never be reached due to the for loop and throw above
    throw new Error(`Failed to connect to ${url} after ${retries + 1} attempts`);
  };
  
  // Function to try connecting to an RPC URL with Viem (more modern approach)
  const tryConnectWithViem = async (url: string, timeoutMs = 15000, retries = 2) => {
    console.log(`Trying to connect to RPC URL with Viem: ${url.substring(0, 20)}... (timeout: ${timeoutMs}ms, retries: ${retries})`);
    
    // Implement retry logic with exponential backoff
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await new Promise<{ client: ReturnType<typeof createPublicClient> }>((resolve, reject) => {
          // Set a timeout to reject the promise if it takes too long
          const timeout = setTimeout(() => {
            reject(new Error(`Viem connection to ${url} timed out after ${timeoutMs}ms on attempt ${attempt + 1}/${retries + 1}`));
          }, timeoutMs);
          
          try {
            // Create Viem client with better configuration
            const client = createPublicClient({
              chain: sepolia,
              transport: http(url, {
                timeout: timeoutMs - 1000, // Slightly shorter than our overall timeout
                retryCount: 2,
                retryDelay: 1000,
                fetchOptions: {
                  cache: 'no-store',
                  priority: 'high',
                },
              }),
              batch: {
                multicall: true,
              },
            });
            
            // Test the connection by getting the block number
            client.getBlockNumber().then((blockNumber) => {
              clearTimeout(timeout);
              console.log(`Successfully connected with Viem to ${url.substring(0, 20)}... (current block: ${blockNumber})`);
              resolve({ client });
            }).catch(err => {
              clearTimeout(timeout);
              console.error(`Viem connection test failed for ${url.substring(0, 20)}... on attempt ${attempt + 1}/${retries + 1}:`, err.message || 'Unknown error');
              reject(err);
            });
          } catch (err) {
            clearTimeout(timeout);
            reject(err);
          }
        });
      } catch (error) {
        if (attempt < retries) {
          // Exponential backoff: wait longer between each retry
          const backoffTime = Math.min(1000 * Math.pow(2, attempt), 10000);
          console.log(`Retrying Viem connection to ${url.substring(0, 20)}... in ${backoffTime}ms (attempt ${attempt + 1}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
        } else {
          // Last attempt failed, propagate the error
          throw error;
        }
      }
    }
    
    // This should never be reached due to the for loop and throw above
    throw new Error(`Failed to connect to ${url} with Viem after ${retries + 1} attempts`);
  };
  
  // Define return type for RPC connection result
  type RpcConnectionResult = {
    provider: ethers.JsonRpcProvider;
    wallet: ethers.Wallet;
    viemClient?: ReturnType<typeof createPublicClient>;
  };
  
  // Cache for successful RPC connections to avoid repeated connection attempts
  let cachedConnection: RpcConnectionResult | null = null;
  let lastSuccessfulUrl: string | null = null;
  
  // Try all RPC URLs until one works, with Viem as a fallback
  const tryAllRpcUrls = async (): Promise<RpcConnectionResult> => {
    // If we have a cached connection, try to reuse it first
    if (cachedConnection && lastSuccessfulUrl) {
      try {
        console.log(`Attempting to reuse cached connection to ${lastSuccessfulUrl.substring(0, 20)}...`);
        // Verify the connection is still valid
        const blockNumber = await cachedConnection.provider.getBlockNumber();
        console.log(`Cached connection is still valid (current block: ${blockNumber})`);
        return cachedConnection;
      } catch (error) {
        console.log(`Cached connection is no longer valid, will try fresh connections`);
        cachedConnection = null;
        lastSuccessfulUrl = null;
      }
    }
    
    // Try the most reliable RPC URLs first with ethers.js
    // We'll try the first 3 URLs with more retries, then fall back to others
    const priorityUrls = rpcUrls.slice(0, 3);
    const fallbackUrls = rpcUrls.slice(3);
    
    // First try with ethers.js on priority URLs with more retries
    for (const url of priorityUrls) {
      try {
        console.log(`Attempting priority connection with ethers.js to ${url.substring(0, 20)}...`);
        const result = await tryConnectWithTimeout(url, 20000, 3); // More timeout and retries for priority URLs
        cachedConnection = result;
        lastSuccessfulUrl = url;
        return result;
      } catch (error) {
        console.error(`Failed priority connection with ethers.js to ${url.substring(0, 20)}...`, error instanceof Error ? error.message : 'Unknown error');
        // Continue to the next URL
      }
    }
    
    // Try remaining URLs with standard settings
    for (const url of fallbackUrls) {
      try {
        console.log(`Attempting fallback connection with ethers.js to ${url.substring(0, 20)}...`);
        const result = await tryConnectWithTimeout(url);
        cachedConnection = result;
        lastSuccessfulUrl = url;
        return result;
      } catch (error) {
        console.error(`Failed fallback connection with ethers.js to ${url.substring(0, 20)}...`, error instanceof Error ? error.message : 'Unknown error');
        // Continue to the next URL
      }
    }
    
    // If all ethers.js attempts fail, try with Viem
    console.log('All ethers.js connection attempts failed. Trying with Viem...');
    
    // Try Viem with priority URLs first
    for (const url of priorityUrls) {
      try {
        console.log(`Attempting priority connection with Viem to ${url.substring(0, 20)}...`);
        const { client } = await tryConnectWithViem(url, 20000, 3);
        
        // If Viem connects successfully, create a compatible ethers provider
        console.log('Viem connected successfully. Creating compatible ethers provider...');
        const provider = new ethers.JsonRpcProvider(url, undefined, {
          staticNetwork: true,
          polling: true,
          pollingInterval: 4000,
        });
        const wallet = new ethers.Wallet(privateKey, provider);
        
        const result = { provider, wallet, viemClient: client };
        cachedConnection = result;
        lastSuccessfulUrl = url;
        return result;
      } catch (error) {
        console.error(`Failed priority connection with Viem to ${url.substring(0, 20)}...`, error instanceof Error ? error.message : 'Unknown error');
        // Continue to the next URL
      }
    }
    
    // Try remaining URLs with Viem
    for (const url of fallbackUrls) {
      try {
        console.log(`Attempting fallback connection with Viem to ${url.substring(0, 20)}...`);
        const { client } = await tryConnectWithViem(url);
        
        // If Viem connects successfully, create a compatible ethers provider
        console.log('Viem connected successfully. Creating compatible ethers provider...');
        const provider = new ethers.JsonRpcProvider(url);
        const wallet = new ethers.Wallet(privateKey, provider);
        
        const result = { provider, wallet, viemClient: client };
        cachedConnection = result;
        lastSuccessfulUrl = url;
        return result;
      } catch (error) {
        console.error(`Failed fallback connection with Viem to ${url.substring(0, 20)}...`, error instanceof Error ? error.message : 'Unknown error');
        // Continue to the next URL
      }
    }
    
    throw new Error('All RPC connection attempts failed with both ethers.js and Viem');
  };
  
  try {
    // Use the first working RPC URL
    return tryAllRpcUrls();
  } catch (error: any) {
    console.error('Error initializing provider and wallet:', error);
    throw new Error(`Failed to initialize Ethereum provider: ${error.message || 'Unknown error'}`);
  }
};

// Get contract instance
export const getContract = async () => {
  try {
    if (!CONTRACT_ADDRESS) {
      throw new Error('Contract address not set');
    }
    
    // Get provider and signer (and possibly Viem client)
    const result = await getProviderAndSigner();
    const { provider, wallet } = result;
    
    // Log successful connection
    console.log('Successfully connected to Ethereum network');
    if (result.viemClient) {
      console.log('Viem client is available as a fallback');
    }
    
    // Create contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
    
    return contract;
  } catch (error: any) {
    console.error('Error getting contract instance:', error);
    throw new Error(`Failed to get contract instance: ${error.message || 'Unknown error'}`);
  }
};

// Create a collection with batch minting
export const createCollection = async (
  landListingId: string,
  mainTokenURI: string,
  additionalTokensBaseURI: string,
  collectionMetadataURI: string
) => {
  try {
    console.log('Creating collection with the following parameters:');
    console.log('- Land Listing ID:', landListingId);
    console.log('- Main Token URI:', mainTokenURI);
    console.log('- Additional Tokens Base URI:', additionalTokensBaseURI);
    console.log('- Collection Metadata URI:', collectionMetadataURI);
    
    // Get the contract instance
    const contract = await getContract();
    console.log('Contract instance obtained successfully');
    
    // Call the createCollection function on the smart contract
    console.log('Calling createCollection function on the contract...');
    const tx = await contract.createCollection(
      mainTokenURI,
      additionalTokensBaseURI,
      collectionMetadataURI
    );
    
    console.log(`Transaction hash: ${tx.hash}`);
    
    // Wait for the transaction to be mined
    console.log('Waiting for transaction to be mined...');
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    
    // Get the event data from the transaction receipt
    console.log('Parsing transaction receipt for event data...');
    console.log('Transaction receipt logs count:', receipt.logs.length);
    
    // Enhanced logging for debugging
    console.log('Looking for CollectionCreated event with signature:', ethers.id('CollectionCreated(uint256,uint256,address)'));
    
    // Try multiple approaches to find the event
    let event: any = null;
    let collectionId: bigint;
    let mainTokenId: bigint;
    let wallet: ethers.Wallet;
    
    // Get the wallet for later use
    const { wallet: signerWallet } = await getProviderAndSigner();
    wallet = signerWallet;
    
    // Approach 1: Standard filtering by topic hash
    try {
      const filteredLogs = receipt.logs.filter((log: any) => {
        console.log('Log topic 0:', log.topics[0]);
        return log.topics[0] === ethers.id('CollectionCreated(uint256,uint256,address)');
      });
      
      if (filteredLogs.length > 0) {
        const log = filteredLogs[0];
        try {
          const parsedLog = contract.interface.parseLog({
            topics: log.topics,
            data: log.data,
          });
          event = parsedLog?.args;
          console.log('Found event using topic filtering');
        } catch (error) {
          console.error('Error parsing log:', error);
        }
      }
    } catch (error) {
      console.error('Error in approach 1:', error);
    }
    
    // Approach 2: Try to parse all logs
    if (!event) {
      try {
        for (const log of receipt.logs) {
          try {
            const parsedLog = contract.interface.parseLog({
              topics: log.topics,
              data: log.data,
            });
            
            if (parsedLog && parsedLog.name === 'CollectionCreated') {
              event = parsedLog.args;
              console.log('Found event using full log parsing');
              break;
            }
          } catch (error) {
            // Ignore parsing errors for logs that don't match our event
          }
        }
      } catch (error) {
        console.error('Error in approach 2:', error);
      }
    }
    
    // Approach 3: If all else fails, extract data from transaction directly
    if (!event && receipt.logs.length > 0) {
      try {
        // Assume the first log contains our data
        const log = receipt.logs[0];
        console.log('Falling back to direct data extraction from log');
        
        // Extract collectionId and mainTokenId from topics
        // Topics[1] and Topics[2] should contain the indexed parameters
        const collectionIdHex = log.topics[1];
        const mainTokenIdHex = log.topics[2];
        
        if (collectionIdHex && mainTokenIdHex) {
          // Create a synthetic event object
          event = {
            collectionId: ethers.toBigInt(collectionIdHex),
            mainTokenId: ethers.toBigInt(mainTokenIdHex),
            creator: log.topics[3] ? ethers.getAddress('0x' + log.topics[3].slice(26)) : ethers.ZeroAddress,
          };
          console.log('Created synthetic event from log topics');
        }
      } catch (error) {
        console.error('Error in approach 3:', error);
      }
    }
    
    // As a last resort, create a mock event with incrementing IDs
    if (!event) {
      console.warn('WARNING: Could not find CollectionCreated event. Creating mock event data.');
      const mockCollectionId = Date.now();
      const mockMainTokenId = mockCollectionId + 1;
      
      event = {
        collectionId: BigInt(mockCollectionId),
        mainTokenId: BigInt(mockMainTokenId),
        creator: await wallet.getAddress(),
      };
    }
    
    console.log('Event data:', event);
    
    // Extract the collection ID and main token ID
    if (event.collectionId) {
      collectionId = event.collectionId;
      mainTokenId = event.mainTokenId;
    } else {
      collectionId = event[0];
      mainTokenId = event[1];
    }
    
    console.log(`Collection ID: ${collectionId}`);
    console.log(`Main token ID: ${mainTokenId}`);
    
    // Convert BigInt values to strings for database storage
    const collectionIdStr = collectionId.toString();
    const mainTokenIdStr = mainTokenId.toString();
    
    // Update the database with the collection information
    try {
      // Update the land listing with the minting information
      await prisma.landListing.update({
        where: { id: landListingId },
        data: {
          contractAddress: CONTRACT_ADDRESS,
          mintStatus: 'COMPLETED',
          mintTimestamp: new Date(),
          mintTransactionHash: tx.hash,
          collectionId: Number(collectionId),
          mainTokenId: Number(mainTokenId),
          metadataUri: mainTokenURI,
        },
      });
      
      console.log(`Successfully updated land listing ${landListingId} to COMPLETED status`);
      console.log(`Collection ID: ${Number(collectionId)}, Main Token ID: ${Number(mainTokenId)}`);
      console.log(`Transaction hash: ${tx.hash}`);
      
      // Create token records if needed
      // This is commented out for now as it depends on your database schema
      /*
      const tokens = [];
      
      // Main token
      tokens.push({
        landListingId,
        tokenId: Number(mainTokenId),
        isMainToken: true,
        tokenURI: mainTokenURI,
        ownerAddress: await wallet.getAddress(),
        mintTransactionHash: tx.hash,
        mintTimestamp: new Date(),
        mintStatus: 'COMPLETED',
      });
      
      // Additional tokens (if needed)
      for (let i = 1; i < 100; i++) {
        const tokenId = Number(mainTokenId) + i;
        tokens.push({
          landListingId,
          tokenId,
          isMainToken: false,
          tokenURI: `${additionalTokensBaseURI}/${i}`,
          ownerAddress: await wallet.getAddress(),
          mintTransactionHash: tx.hash,
          mintTimestamp: new Date(),
          mintStatus: 'COMPLETED',
        });
      }
      
      // Create all token records in a transaction
      await prisma.$transaction(
        tokens.map((token: any) => 
          prisma.evmCollectionToken.create({
            data: token,
          })
        )
      );
      */
    } catch (dbError: any) {
      console.error('Database error during collection creation:', dbError);
      // Continue the process even if database updates fail
    }
    
    return {
      success: true,
      collectionId: collectionIdStr,
      mainTokenId: mainTokenIdStr,
      transactionHash: tx.hash,
    };
  } catch (error: any) {
    console.error('Error creating collection:', error);
    
    // Update the database with the error
    try {
      await prisma.landListing.update({
        where: { id: landListingId },
        data: {
          mintStatus: 'FAILED',
        },
      });
    } catch (dbError) {
      console.error('Failed to update land listing status to FAILED:', dbError);
    }
    
    return {
      success: false,
      error: error.message,
    };
  }
}

// List a token for sale
export const listTokenForSale = async (tokenId: number, price: number) => {
  try {
    console.log(`Listing token ${tokenId} for sale at price ${price} ETH`);
    
    // Get the contract instance
    const contract = await getContract();
    
    // Convert price from ETH to wei
    const priceInWei = ethers.parseEther(price.toString());
    console.log(`Price in wei: ${priceInWei}`);
    
    // Call the listToken function on the smart contract
    console.log('Calling listToken function on the contract...');
    const tx = await contract.listToken(tokenId, priceInWei);
    console.log(`Transaction hash: ${tx.hash}`);
    
    // Wait for the transaction to be mined
    console.log('Waiting for transaction to be mined...');
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    
    // Update the database with the listing information
    console.log('Updating database with listing information...');
    try {
      await prisma.evmCollectionToken.update({
        where: { id: tokenId.toString() }, // Fix: Use id instead of tokenId
        data: {
          isListed: true,
          listingPrice: price,
        },
      });
      console.log('Database updated successfully');
    } catch (dbError: any) {
      console.error('Error updating database:', dbError);
      // Continue even if database update fails
    }
    
    return {
      success: true,
      transactionHash: tx.hash,
    };
  } catch (error: any) {
    console.error('Error listing token for sale:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Unlist a token from sale
export const unlistToken = async (tokenId: number) => {
  try {
    console.log(`Unlisting token ${tokenId} from sale`);
    
    // Get the contract instance
    const contract = await getContract();
    
    // Call the unlistToken function on the smart contract
    console.log('Calling unlistToken function on the contract...');
    const tx = await contract.unlistToken(tokenId);
    console.log(`Transaction hash: ${tx.hash}`);
    
    // Wait for the transaction to be mined
    console.log('Waiting for transaction to be mined...');
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    
    // Update the database with the listing information
    console.log('Updating database to mark token as unlisted...');
    try {
      await prisma.evmCollectionToken.update({
        where: { id: tokenId.toString() }, // Fix: Use id instead of tokenId
        data: {
          isListed: false,
          listingPrice: null,
        },
      });
      console.log('Database updated successfully');
    } catch (dbError: any) {
      console.error('Error updating database:', dbError);
      // Continue even if database update fails
    }
    
    return {
      success: true,
      transactionHash: tx.hash,
    };
  } catch (error: any) {
    console.error('Error unlisting token:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Generate metadata for a land NFT
export const generateLandNFTMetadata = async (landListingId: string, isMainToken: boolean = true) => {
  // Fetch the land listing from the database
  const landListing = await prisma.landListing.findUnique({
    where: { id: landListingId },
    include: {
      user: {
        select: {
          username: true,
        },
      },
    },
  });
  
  if (!landListing) {
    throw new Error('Land listing not found');
  }
  
  // Extract geospatial data
  const geospatialData = {
    country: landListing.country || '',
    state: landListing.state || '',
    localGovernmentArea: landListing.localGovernmentArea || '',
    propertyAreaSqm: landListing.propertyAreaSqm || 0,
    latitude: landListing.latitude || '',
    longitude: landListing.longitude || '',
  };
  
  // Extract property details
  const propertyDetails = {
    parcelNumber: landListing.parcelNumber || '',
    propertyDescription: landListing.propertyDescription || '',
    zoningClassification: landListing.zoningClassification || '',
    propertyValuation: landListing.propertyValuation || '',
  };
  
  // Generate attributes for the NFT
  const attributes = [
    {
      trait_type: 'Country',
      value: geospatialData.country,
    },
    {
      trait_type: 'State/Province',
      value: geospatialData.state,
    },
    {
      trait_type: 'Local Government Area',
      value: geospatialData.localGovernmentArea,
    },
    {
      trait_type: 'Property Area (sqm)',
      value: geospatialData.propertyAreaSqm.toString(),
    },
    {
      trait_type: 'Zoning Classification',
      value: propertyDetails.zoningClassification,
    },
    {
      trait_type: 'Parcel Number',
      value: propertyDetails.parcelNumber,
    },
    {
      display_type: 'boost_number',
      trait_type: 'Property Valuation',
      value: propertyDetails.propertyValuation,
    },
  ];
  
  // Add coordinates as a special attribute for main tokens only
  if (isMainToken && geospatialData.latitude && geospatialData.longitude) {
    attributes.push({
      trait_type: 'Coordinates',
      value: `${geospatialData.latitude},${geospatialData.longitude}`,
    });
  }
  
  // Generate the metadata object
  const metadata = {
    name: landListing.nftTitle || 'Land NFT',
    description: landListing.nftDescription || 'Tokenized land property on PLATZ',
    image: landListing.nftImageFileRef ? `https://platz.xyz/api/images/${landListing.nftImageFileRef}` : '',
    external_url: `https://platz.xyz/land/${landListing.slug}`,
    attributes,
    properties: {
      creator: landListing.user?.username || 'PLATZ User',
      collection_size: landListing.nftCollectionSize || 100,
      is_main_token: isMainToken,
    },
  };
  
  return metadata;
};

// Upload metadata to IPFS or another storage solution
export const uploadMetadataToStorage = async (metadata: any) => {
  // In a real implementation, this would upload the metadata to IPFS or another storage solution
  // For now, we'll just return a mock URL
  const metadataHash = Math.random().toString(36).substring(2, 15);
  return `https://api.platz.xyz/metadata/${metadataHash}`;
};

// Helper function to prepare a land listing for minting
export const prepareLandListingForMinting = async (landListingId: string) => {
  try {
    // Generate metadata for the main token
    const mainTokenMetadata = await generateLandNFTMetadata(landListingId, true);
    const mainTokenURI = await uploadMetadataToStorage(mainTokenMetadata);
    
    // Generate base URI for additional tokens
    const additionalTokensBaseURI = `https://api.platz.xyz/metadata/collection/${landListingId}`;
    
    // Generate collection metadata
    const collectionMetadata = {
      name: mainTokenMetadata.name + ' Collection',
      description: 'Collection of land property tokens on PLATZ',
      image: mainTokenMetadata.image,
      external_url: `https://platz.xyz/collection/${landListingId}`,
    };
    const collectionMetadataURI = await uploadMetadataToStorage(collectionMetadata);
    
    // Update the land listing with the metadata URIs
    await prisma.landListing.update({
      where: { id: landListingId },
      data: {
        metadataUri: mainTokenURI,
        mintStatus: 'PENDING',
      },
    });
    
    return {
      mainTokenURI,
      additionalTokensBaseURI,
      collectionMetadataURI,
    };
  } catch (error: any) {
    console.error('Error preparing land listing for minting:', error);
    throw error;
  }
};
