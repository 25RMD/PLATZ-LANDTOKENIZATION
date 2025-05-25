import { ethers } from 'ethers';
import { createPublicClient, http, createWalletClient, custom } from 'viem';
import { sepolia } from 'viem/chains';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/db';
import PlatzLandNFTAbi from '../../artifacts/contracts/PlatzLandNFTWithCollections.sol/PlatzLandNFTWithCollections.json';
import LandMarketplaceAbi from '../../artifacts/contracts/LandMarketplace.sol/LandMarketplace.json';

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

// Load contract addresses from environment variables
const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;
const MARKETPLACE_CONTRACT_ADDRESS = process.env.MARKETPLACE_CONTRACT_ADDRESS;
const NETWORK_RPC_URL = process.env.SEPOLIA_RPC_URL || process.env.RPC_URL;
const FALLBACK_RPC_URL_1 = process.env.FALLBACK_RPC_URL_1 || "https://rpc.sepolia.org";
const FALLBACK_RPC_URL_2 = process.env.FALLBACK_RPC_URL_2 || "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161";

// Additional public Sepolia RPC endpoints
const ADDITIONAL_PUBLIC_RPCS = [
  "https://ethereum-sepolia-rpc.publicnode.com",
  "https://sepolia.gateway.tenderly.co",
  "https://rpc.ankr.com/eth_sepolia",
  "https://sepolia.drpc.org",
  "https://1rpc.io/sepolia",
  "https://eth-sepolia.public.blastapi.io"
];

const SERVER_WALLET_PRIVATE_KEY = process.env.SERVER_WALLET_PRIVATE_KEY;

// List of RPC URLs to try in order, including additional fallbacks
const RPC_URLS = [
  NETWORK_RPC_URL,
  FALLBACK_RPC_URL_1,
  FALLBACK_RPC_URL_2,
  ...ADDITIONAL_PUBLIC_RPCS
].filter(Boolean) as string[];

// Utility to get provider and signer with improved error handling
const getProviderAndSigner = async () => {
  if (RPC_URLS.length === 0) {
    throw new Error('No RPC URLs provided in environment variables');
  }
  if (!SERVER_WALLET_PRIVATE_KEY) {
    throw new Error('No wallet private key provided in environment variables');
  }

  // Try each RPC URL until one works
  let lastError: Error | null = null;
  for (const rpcUrl of RPC_URLS) {
    try {
      console.log(`Trying to connect to RPC URL: ${rpcUrl.substring(0, 20)}...`);
      const provider = new ethers.JsonRpcProvider(rpcUrl, undefined, {
        polling: true,
        pollingInterval: 4000,
        staticNetwork: true, // Better perf by avoiding network detection
      });
      
      // Verify provider connectivity
      await provider.getBlockNumber();
      console.log(`Successfully connected to network via ${rpcUrl.substring(0, 20)}...`);
      
      const signer = new ethers.Wallet(SERVER_WALLET_PRIVATE_KEY, provider);
      return { provider, signer };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      // console.warn(`Failed to connect to RPC URL ${rpcUrl.substring(0, 20)}...: ${errorMsg}`); // Commented out for less noise
      
      // Check for quota or rate limit issues
      if (errorMsg.includes('quota') || 
          errorMsg.includes('rate') || 
          errorMsg.includes('limit') || 
          errorMsg.includes('exceeded')) {
        console.log(`Quota/rate limit detected with ${rpcUrl.substring(0, 20)}..., trying next endpoint`);
      }
      
      lastError = error instanceof Error ? error : new Error(String(error));
      // Continue to next URL
    }
  }

  // If we get here, all RPC URLs failed
  throw new Error(`Failed to connect to any RPC URL: ${lastError?.message}. Please try again later or contact support.`);
};

// Get NFT contract instance
export const getNFTContract = async (signerOrProvider?: ethers.Signer | ethers.Provider) => {
  if (!NFT_CONTRACT_ADDRESS || NFT_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
    throw new Error('Invalid NFT contract address. Please set NFT_CONTRACT_ADDRESS environment variable to a valid address.');
  }
  
  if (signerOrProvider) {
    return new ethers.Contract(NFT_CONTRACT_ADDRESS, PlatzLandNFTAbi.abi, signerOrProvider);
  }
  
  const { signer } = await getProviderAndSigner();
  return new ethers.Contract(NFT_CONTRACT_ADDRESS, PlatzLandNFTAbi.abi, signer);
};

// Get Marketplace contract instance
export const getMarketplaceContract = async (signerOrProvider?: ethers.Signer | ethers.Provider) => {
  if (!MARKETPLACE_CONTRACT_ADDRESS || MARKETPLACE_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
    throw new Error('Invalid marketplace contract address. Please set MARKETPLACE_CONTRACT_ADDRESS environment variable to a valid address.');
  }
  
  if (signerOrProvider) {
    return new ethers.Contract(MARKETPLACE_CONTRACT_ADDRESS, LandMarketplaceAbi.abi, signerOrProvider);
  }
  
  const { signer } = await getProviderAndSigner();
  return new ethers.Contract(MARKETPLACE_CONTRACT_ADDRESS, LandMarketplaceAbi.abi, signer);
};

// Mint a new land NFT
export const mintLandNFT = async (
  metadataUri: string,
  ownerAddress: string,
  retryCount = 3
): Promise<{ tokenId: number; transactionHash: string }> => {
  let lastError: Error | null = null;
  
  // Log the mint recipient
  console.log('Minting NFT to address:', ownerAddress);
  
  // Remove mock implementation and check contract address
  if (NFT_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
    throw new Error("Invalid NFT contract address. Please set NFT_CONTRACT_ADDRESS environment variable to a valid address.");
  }
  
  // Validate that the metadata URI is accessible to smart contracts
  if (metadataUri.includes('localhost')) {
    console.error("Cannot use localhost URLs for metadata. Smart contracts cannot access local resources.");
    throw new Error("Invalid metadata URI: Contains localhost. Please use ngrok or another public URL service.");
  }

  // Check if we're using ngrok correctly
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl || baseUrl.includes('localhost')) {
    console.warn("NEXT_PUBLIC_BASE_URL is not set or using localhost. Smart contracts may not be able to access your metadata.");
  } else if (baseUrl.includes('ngrok') && !metadataUri.includes('ngrok')) {
    console.warn("NEXT_PUBLIC_BASE_URL contains 'ngrok' but metadata URI doesn't. Check your configuration.");
  }

  // Optional: Validate URI is publicly accessible (commented out for simplicity)
  // Try fetching the metadata to ensure it's accessible (in production, you might want to skip this)
  /*
  try {
    console.log(`Verifying metadata URI is accessible: ${metadataUri}`);
    const response = await fetch(metadataUri, { method: 'HEAD' });
    if (!response.ok) {
      throw new Error(`Metadata URI returned ${response.status}: ${response.statusText}`);
    }
    console.log(`Metadata URI is accessible. Status: ${response.status}`);
  } catch (error) {
    console.error(`Metadata URI is not accessible: ${metadataUri}`, error);
    throw new Error(`Metadata URI is not publicly accessible. Please ensure your ngrok tunnel is running and NEXT_PUBLIC_BASE_URL is set correctly.`);
  }
  */
  
  for (let attempt = 0; attempt < retryCount; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`Mint attempt ${attempt + 1}/${retryCount}...`);
        // Wait longer between each retry using exponential backoff
        const delay = Math.min(2000 * Math.pow(2, attempt - 1), 10000);
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      console.log(`Getting NFT contract for mint attempt ${attempt + 1}...`);
      const nftContract = await getNFTContract();
      
      // Verify the contract is valid before proceeding
      try {
        const name = await nftContract.name();
        const symbol = await nftContract.symbol();
        console.log(`Verified NFT contract: ${name} (${symbol})`);
      } catch (e) {
        console.error("Error verifying NFT contract:", e);
        throw new Error(`Invalid NFT contract at ${NFT_CONTRACT_ADDRESS}. Please check your contract address.`);
      }
      
      // Verify the contract has the mintLand function
      if (!nftContract.mintLand) {
        throw new Error(`NFT contract at ${NFT_CONTRACT_ADDRESS} does not have a mintLand function.`);
      }
      
      // Mint the NFT to the owner
      // The contract expects 3 parameters: to (address), uri (string), propertyRef (string)
      const propertyRef = `land-listing-ref-${Date.now()}`;
      console.log(`Calling mintLand with owner=${ownerAddress}, propertyRef=${propertyRef}, URI=${metadataUri}`);
      
      // Estimate gas to catch potential errors before sending
      try {
        console.log("[DEBUG] Estimating gas for mintLand with params:");
        console.log(`[DEBUG]   to (ownerAddress): ${ownerAddress}`);
        console.log(`[DEBUG]   propertyReference: ${propertyRef}`);
        console.log(`[DEBUG]   metadataURI: ${metadataUri}`);
        const gasEstimate = await nftContract.mintLand.estimateGas(
          ownerAddress, 
          propertyRef,
          metadataUri
        );
        console.log(`Gas estimate for minting: ${gasEstimate}`);
      } catch (gasError) {
        console.error("Error estimating gas for mint transaction:", gasError);
        console.error("[DEBUG] Parameters during gas estimation error:");
        console.error(`[DEBUG]   to (ownerAddress): ${ownerAddress}`);
        console.error(`[DEBUG]   propertyReference: ${propertyRef}`);
        console.error(`[DEBUG]   metadataURI: ${metadataUri}`);
        throw new Error(`Transaction would fail: ${String(gasError)}`);
      }
      
      // Set gas limit higher than the estimate
      console.log("[DEBUG] Calling actual mintLand contract function with params:");
      console.log(`[DEBUG]   to (ownerAddress): ${ownerAddress}`);
      console.log(`[DEBUG]   propertyReference: ${propertyRef}`);
      console.log(`[DEBUG]   metadataURI: ${metadataUri}`);
      const tx = await nftContract.mintLand(
        ownerAddress, 
        propertyRef,
        metadataUri,
        { 
          gasLimit: 500000 // Higher gas limit to avoid out-of-gas errors
        }
      );
      console.log(`Transaction submitted: ${tx.hash}`);
      
      console.log(`Waiting for transaction confirmation...`);
      const receipt = await tx.wait();
      
      if (receipt.status === 0) {
        throw new Error(`Transaction reverted. Hash: ${tx.hash}`);
      }
      
      console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
      
      // Extract the token ID from the event logs
      console.log(`Parsing transaction logs for Transfer event...`);
      const transferEvents = receipt.logs
        .filter((log: any) => {
          try {
            const decoded = nftContract.interface.parseLog(log);
            return decoded && decoded.name === 'Transfer';
          } catch (e) {
            return false;
          }
        })
        .map((log: any) => nftContract.interface.parseLog(log));
      
      if (transferEvents.length === 0) {
        throw new Error('Could not find Transfer event in transaction logs');
      }
      
      const event = transferEvents[0];
      console.log('Found Transfer event with args:', event.args);
      
      // Support both named and positional access for tokenId
      const tokenId = event.args.tokenId ?? event.args[2];
      if (tokenId === undefined) {
        throw new Error('Transfer event does not contain tokenId');
      }
      
      console.log(`Successfully extracted token ID: ${tokenId}`);
      
      return {
        tokenId: Number(tokenId),
        transactionHash: receipt.hash,
      };
    } catch (error) {
      console.error(`Error in mint attempt ${attempt + 1}:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Check if this is a potentially recoverable error
      const errorMsg = String(error);
      const isRecoverable = 
        errorMsg.includes('quota') || 
        errorMsg.includes('rate') || 
        errorMsg.includes('limit') || 
        errorMsg.includes('exceeded') ||
        errorMsg.includes('timeout') ||
        errorMsg.includes('network') ||
        errorMsg.includes('connect');
      
      if (!isRecoverable) {
        // If we have a transaction revert, provide more helpful error info
        if (errorMsg.includes('reverted') || errorMsg.includes('CALL_EXCEPTION')) {
          console.error('Contract execution reverted. This could be due to:');
          console.error('1. The contract address is incorrect');
          console.error('2. The contract does not have the expected functions');
          console.error('3. The caller does not have permissions to mint');
          console.error('4. Invalid metadata URI format');
          console.error('5. The contract has hit a limit or is paused');
        }
        
        console.error('Encountered non-recoverable error, aborting retry attempts');
        break; // Exit the retry loop for non-recoverable errors
      }
    }
  }
  
  // All retry attempts failed
  console.error('Error minting land NFT after all retry attempts:', lastError);
  throw lastError || new Error('Failed to mint NFT after multiple attempts');
};

// Create a new listing in the marketplace
export const createListing = async (
  tokenId: number,
  price: string,
  currency: string,
  retryCount = 3
): Promise<{ listingId: number; transactionHash: string }> => {
  let lastError: Error | null = null;
  
  // Log the server wallet address (listing sender)
  const { signer } = await getProviderAndSigner();
  const serverWalletAddress = await signer.getAddress();
  console.log('Server wallet address (listing sender):', serverWalletAddress);
  
  // Remove mock implementation and check contract addresses
  if (NFT_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000" || 
      MARKETPLACE_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
    throw new Error("Invalid contract addresses. Please set both NFT_CONTRACT_ADDRESS and MARKETPLACE_CONTRACT_ADDRESS environment variables to valid addresses.");
  }
  
  for (let attempt = 0; attempt < retryCount; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`Create listing attempt ${attempt + 1}/${retryCount}...`);
        // Wait longer between each retry
        const delay = Math.min(2000 * Math.pow(2, attempt - 1), 10000);
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      console.log(`Getting contracts for create listing attempt ${attempt + 1}...`);
      const marketplaceContract = await getMarketplaceContract();
      const nftContract = await getNFTContract();
      
      // First, approve the marketplace to transfer the NFT
      console.log('Approving marketplace contract:', MARKETPLACE_CONTRACT_ADDRESS, 'for token:', tokenId);
      const approveTx = await nftContract.approve(MARKETPLACE_CONTRACT_ADDRESS, tokenId);
      console.log(`Approval transaction submitted: ${approveTx.hash}`);
      await approveTx.wait();
      console.log(`Approval transaction confirmed`);
      // Check the actual approved address on-chain
      const approved = await nftContract.getApproved(tokenId);
      console.log('Approved address for token', tokenId, 'is', approved);
      
      // Convert price to wei
      const priceInWei = ethers.parseEther(price);
      console.log(`Converted price ${price} to wei: ${priceInWei}`);
      
      // Create the listing
      const currencyAddress = currency.toLowerCase() === 'eth' 
        ? ethers.ZeroAddress 
        : currency; // For ETH use zero address, otherwise use the token address
      
      console.log('Calling createListing with:', NFT_CONTRACT_ADDRESS, tokenId, priceInWei, currencyAddress);
      const tx = await marketplaceContract.createListing(
        NFT_CONTRACT_ADDRESS,
        tokenId,
        priceInWei,
        currencyAddress
      );
      
      console.log(`Create listing transaction submitted: ${tx.hash}`);
      
      console.log(`Waiting for listing transaction confirmation...`);
      const receipt = await tx.wait();
      console.log(`Listing transaction confirmed in block ${receipt.blockNumber}`);
      
      // Extract the listing ID from the event logs
      console.log(`Parsing transaction logs for ListingCreated event...`);
      
      // Look for ListingCreated event (was NFTListed)
      const listingEvents = receipt.logs
        .filter((log: any) => {
          try {
            const decoded = marketplaceContract.interface.parseLog(log);
            return decoded && decoded.name === 'ListingCreated';
          } catch (e) {
            return false;
          }
        })
        .map((log: any) => marketplaceContract.interface.parseLog(log));
        
      if (listingEvents.length === 0) {
        throw new Error('Could not find ListingCreated event in transaction logs');
      }
      
      const event = listingEvents[0];
      console.log('Found ListingCreated event with args:', event.args);
      
      // In the ListingCreated event, the listing ID is the same as the token ID
      // This assumes there's a one-to-one mapping between tokens and listings
      let listingId = tokenId; // Default to the provided tokenId
      
      // If the event contains the tokenId, use that
      if (event.args.tokenId !== undefined) {
        listingId = event.args.tokenId;
      }
      
      console.log(`Successfully extracted listing ID: ${listingId}`);
      
      // Extra debug logs before creating the listing
      const nftOwner = await nftContract.ownerOf(tokenId);
      console.log('NFT contract address:', NFT_CONTRACT_ADDRESS);
      console.log('Token ID:', tokenId);
      console.log('Owner of token:', nftOwner);
      const approvedAddress = await nftContract.getApproved(tokenId);
      console.log('Approved address for token:', tokenId, approvedAddress);
      // Try to fetch existing listing info if the function exists
      if (typeof marketplaceContract.listings === 'function') {
        try {
          const listingInfo = await marketplaceContract.listings(NFT_CONTRACT_ADDRESS, tokenId);
          console.log('Existing listing info:', listingInfo);
        } catch (e) {
          console.log('Could not fetch existing listing info:', e);
        }
      }
      
      return {
        listingId: Number(listingId),
        transactionHash: receipt.hash,
      };
    } catch (error) {
      console.error(`Error in create listing attempt ${attempt + 1}:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Check if this is a potentially recoverable error
      const errorMsg = String(error);
      const isRecoverable = 
        errorMsg.includes('quota') || 
        errorMsg.includes('rate') || 
        errorMsg.includes('limit') || 
        errorMsg.includes('exceeded') ||
        errorMsg.includes('timeout') ||
        errorMsg.includes('network') ||
        errorMsg.includes('connect');
      
      if (!isRecoverable) {
        console.error('Encountered non-recoverable error, aborting retry attempts');
        break; // Exit the retry loop for non-recoverable errors
      }
    }
  }
  
  // All retry attempts failed
  console.error('Error creating listing after all retry attempts:', lastError);
  throw lastError || new Error('Failed to create listing after multiple attempts');
};

// Get listing details
export const getListingDetails = async (listingId: number) => {
  try {
    const marketplaceContract = await getMarketplaceContract();
    
    // The marketplace contract likely has a different function signature
    // It probably expects the NFT contract address and tokenId
    const listing = await marketplaceContract.listings(NFT_CONTRACT_ADDRESS, listingId);
    
    return {
      tokenId: listingId, // Use the provided ID since it's likely the token ID
      seller: listing.seller,
      price: ethers.formatEther(listing.price),
      currency: listing.paymentToken === ethers.ZeroAddress ? 'ETH' : listing.paymentToken,
      isActive: listing.isActive,
    };
  } catch (error) {
    console.error('Error getting listing details:', error);
    // Try a fallback approach if the first attempt fails
    try {
      console.log('Trying alternative approach to get listing details...');
      const marketplaceContract = await getMarketplaceContract();
      
      // Try to call a getListing function if it exists
      if (typeof marketplaceContract.getListing === 'function') {
        const listing = await marketplaceContract.getListing(NFT_CONTRACT_ADDRESS, listingId);
        return {
          tokenId: listingId,
          seller: listing.seller,
          price: ethers.formatEther(listing.price),
          currency: listing.paymentToken === ethers.ZeroAddress ? 'ETH' : listing.paymentToken,
          isActive: listing.isActive,
        };
      }
      
      throw new Error('No compatible function found to get listing details');
    } catch (fallbackError) {
      console.error('Fallback approach also failed:', fallbackError);
      throw new Error(`Failed to get listing details: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
};

// Buy a listing
export const buyListing = async (
  listingId: number,
  buyerAddress: string,
  value: string
): Promise<{ success: boolean; transactionHash: string }> => {
  try {
    const marketplaceContract = await getMarketplaceContract();
    
    // Convert price to wei
    const valueInWei = ethers.parseEther(value);
    
    // Buy the listing
    // The marketplace contract expects tokenId and has a payable function
    const tx = await marketplaceContract.buyNFT(
      listingId, 
      { value: valueInWei }
    );
    
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.hash,
    };
  } catch (error) {
    console.error('Error buying listing:', error);
    throw error;
  }
};

// Cancel a listing
export const cancelListing = async (
  listingId: number
): Promise<{ success: boolean; transactionHash: string }> => {
  try {
    const marketplaceContract = await getMarketplaceContract();
    
    // Cancel the listing
    // The marketplace contract likely expects: (nftContract, tokenId)
    const tx = await marketplaceContract.cancelListing(NFT_CONTRACT_ADDRESS, listingId);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.hash,
    };
  } catch (error) {
    console.error('Error canceling listing:', error);
    throw error;
  }
};

// Place a bid on a listing
export const placeBid = async (
  listingId: number,
  bidAmount: string
): Promise<{ success: boolean; transactionHash: string }> => {
  try {
    const marketplaceContract = await getMarketplaceContract();
    
    // Convert bid amount to wei
    const bidAmountInWei = ethers.parseEther(bidAmount);
    
    // Place the bid
    const tx = await marketplaceContract.placeBid(listingId, { value: bidAmountInWei });
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.hash,
    };
  } catch (error) {
    console.error('Error placing bid:', error);
    throw error;
  }
};

// Accept a bid
export const acceptBid = async (
  listingId: number,
  bidder: string
): Promise<{ success: boolean; transactionHash: string }> => {
  try {
    const marketplaceContract = await getMarketplaceContract();
    
    // Accept the bid
    const tx = await marketplaceContract.acceptBid(listingId, bidder);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.hash,
    };
  } catch (error) {
    console.error('Error accepting bid:', error);
    throw error;
  }
};

// Get all bids for a listing
export const getListingBids = async (listingId: number) => {
  try {
    const marketplaceContract = await getMarketplaceContract();
    const bidders = await marketplaceContract.getListingBidders(listingId);
    
    const bids = await Promise.all(
      bidders.map(async (bidder: string) => {
        const bidAmount = await marketplaceContract.getBidAmount(listingId, bidder);
        return {
          bidder,
          amount: ethers.formatEther(bidAmount),
        };
      })
    );
    
    return bids;
  } catch (error) {
    console.error('Error getting listing bids:', error);
    throw error;
  }
};

// Get provider and signer
export const getProviderAndSignerV2 = async () => {
  console.log('Environment variables check:');
  console.log('- RPC_URL present:', !!process.env.RPC_URL);
  console.log('- SEPOLIA_RPC_URL present:', !!process.env.SEPOLIA_RPC_URL);
  console.log('- SERVER_WALLET_PRIVATE_KEY present:', !!process.env.SERVER_WALLET_PRIVATE_KEY);
  
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
              // console.error(`Ethers connection test failed for ${url.substring(0, 20)}... on attempt ${attempt + 1}/${retries + 1}:`, err.message || 'Unknown error'); // Commented out
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
          // console.log(`Retrying connection to ${url.substring(0, 20)}... in ${backoffTime}ms (attempt ${attempt + 1}/${retries})`); // Optionally comment out for even less noise
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
              // console.error(`Viem connection test failed for ${url.substring(0, 20)}... on attempt ${attempt + 1}/${retries + 1}:`, err.message || 'Unknown error'); // Commented out
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
          // console.log(`Retrying Viem connection to ${url.substring(0, 20)}... in ${backoffTime}ms (attempt ${attempt + 1}/${retries})`); // Optionally comment out
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
        // console.error(`Failed priority connection with ethers.js to ${url.substring(0, 20)}...`, error instanceof Error ? error.message : 'Unknown error'); // Commented out
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
        // console.error(`Failed fallback connection with ethers.js to ${url.substring(0, 20)}...`, error instanceof Error ? error.message : 'Unknown error'); // Commented out
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
        // console.error(`Failed priority connection with Viem to ${url.substring(0, 20)}...`, error instanceof Error ? error.message : 'Unknown error'); // Commented out
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
        // console.error(`Failed fallback connection with Viem to ${url.substring(0, 20)}...`, error instanceof Error ? error.message : 'Unknown error'); // Commented out
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
  if (!NFT_CONTRACT_ADDRESS || NFT_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
    throw new Error('Invalid NFT contract address. Please set NFT_CONTRACT_ADDRESS environment variable to a valid address.');
  }
  const { signer } = await getProviderAndSigner();
  return new ethers.Contract(NFT_CONTRACT_ADDRESS, PlatzLandNFTAbi.abi, signer);
};

// Create a collection with batch minting
export const createCollection = async (
  landListingId: string,
  toAddress: string,
  mainTokenURI: string,
  quantity: number,
  collectionMetadataURI: string,
  childTokensBaseURI: string
) => {
  try {
    console.log('=== Starting Collection Creation ===');
    console.log('Land Listing ID:', landListingId);
    console.log('To Address:', toAddress);
    console.log('Main Token URI:', mainTokenURI);
    console.log('Quantity:', quantity);
    console.log('Collection Metadata URI:', collectionMetadataURI);
    console.log('Child Tokens Base URI:', childTokensBaseURI);
    
    // Get contract instance
    console.log('Getting contract instance...');
    const contract = await getContract();
    const provider = contract.runner?.provider;
    
    // Get signer address if available
    let signerAddress = '';
    try {
      if (contract.runner) {
        signerAddress = await contract.runner.getAddress();
        console.log('Signer address:', signerAddress);
      }
    } catch (error) {
      console.warn('Could not get signer address:', error);
    }
    
    // Log network information
    if (provider) {
      try {
        const network = await provider.getNetwork();
        console.log('Connected to network:', {
          name: network.name,
          chainId: network.chainId
          // Removed ensAddress as it's not available in the Network type
        });
      } catch (error) {
        console.warn('Could not get network info:', error);
      }
    }
    
    // Validate parameters before contract call
    console.log('Validating parameters...');
    if (!toAddress || !ethers.isAddress(toAddress)) {
      const error = 'Invalid or missing toAddress for createCollection.';
      console.error('Validation error:', error);
      throw new Error(error);
    }
    if (quantity <= 0) {
      const error = 'Quantity of child tokens must be greater than 0.';
      console.error('Validation error:', error);
      throw new Error(error);
    }
    
    // Log contract call details
    console.log('\n=== Contract Call Details ===');
    console.log('Contract Address:', contract.target);
    console.log('From Address (signer):', await contract.runner?.getAddress());
    console.log('To Address (recipient):', toAddress);
    console.log('Main Token URI Length:', mainTokenURI.length);
    console.log('Collection URI Length:', collectionMetadataURI.length);
    console.log('Base URI Length:', childTokensBaseURI.length);
    
    // Estimate gas before making the actual call
    let estimatedGas;
    try {
      estimatedGas = await contract.createCollection.estimateGas(
        toAddress,
        mainTokenURI,
        quantity,
        collectionMetadataURI,
        childTokensBaseURI
      );
      console.log(`Estimated gas: ${estimatedGas.toString()}`);
    } catch (error) {
      const estimateError = error as Error;
      console.error('Gas estimation failed:', estimateError);
      throw new Error(`Gas estimation failed: ${estimateError.message}`);
    }

    // Make the contract call
    console.log('\n=== Sending Transaction ===');
    let tx;
    try {
      // Convert estimatedGas to number for calculation, then back to bigint
      const gasBuffer = BigInt(Math.floor(Number(estimatedGas) * 1.2));
      
      tx = await contract.createCollection(
        toAddress,
        mainTokenURI,
        quantity,
        collectionMetadataURI,
        childTokensBaseURI,
        { gasLimit: gasBuffer }
      );
      console.log(`Transaction sent. Hash: ${tx.hash}`);
    } catch (error) {
      const txError = error as Error;
      console.error('Transaction failed:', txError);
      throw new Error(`Transaction failed: ${txError.message}`);
    }
    
    // Wait for transaction to be mined
    console.log('\n=== Waiting for Transaction ===');
    let receipt;
    try {
      receipt = await tx.wait();
      console.log(`Transaction confirmed in block ${receipt?.blockNumber}`);
      console.log('Transaction status:', receipt?.status === 1 ? 'Success' : 'Failed');
      console.log('Gas used:', receipt?.gasUsed?.toString() || 'N/A');
      console.log('Cumulative gas used:', receipt?.cumulativeGasUsed?.toString() || 'N/A');
      
      if (!receipt || receipt.status !== 1) {
        throw new Error('Transaction reverted or receipt not available');
      }
    } catch (error) {
      const receiptError = error as Error;
      console.error('Error waiting for transaction receipt:', receiptError);
      throw new Error(`Transaction receipt error: ${receiptError.message}`);
    }
    
    console.log('\n=== Parsing Transaction Logs ===');
    console.log(`Found ${receipt.logs.length} logs in transaction`);
    
    let event: any = null;
    let parsedCollectionId: string | null = null;
    let parsedMainTokenId: string | null = null;

    // First try: Parse the CollectionCreated event
    for (let i = 0; i < receipt.logs.length; i++) {
      const log = receipt.logs[i];
      console.log(`\n--- Log ${i} ---`);
      console.log('Address:', log.address);
      console.log('Topics:', log.topics);
      console.log('Data:', log.data);
      
      try {
        const parsedLog = contract.interface.parseLog({
          data: log.data,
          topics: [...log.topics]
        });
        
        console.log('Parsed Log:', {
          name: parsedLog?.name,
          signature: parsedLog?.signature,
          args: parsedLog?.args ? Object.keys(parsedLog.args) : 'No args'
        });
        
        if (parsedLog && parsedLog.name === 'CollectionCreated') {
          event = parsedLog.args;
          console.log('Found CollectionCreated event:', {
            collectionId: event.collectionId?.toString(),
            mainTokenId: event.mainTokenId?.toString(),
            creator: event.creator
          });
          
          parsedCollectionId = event.collectionId?.toString();
          parsedMainTokenId = event.mainTokenId?.toString();
          break;
        }
      } catch (e) {
        console.debug('Could not parse log:', e);
      }
    }

    // If we didn't find the CollectionCreated event, try to find a Transfer event
    if (!event || !parsedMainTokenId) {
      console.log('\n=== Looking for Transfer events ===');
      
      for (let i = 0; i < receipt.logs.length; i++) {
        const log = receipt.logs[i];
        console.log(`\n--- Checking Log ${i} for Transfer event ---`);
        
        try {
          const parsedLog = contract.interface.parseLog({
            data: log.data,
            topics: [...log.topics]
          });
          
          if (parsedLog) {
            console.log('Parsed Log:', {
              name: parsedLog.name,
              signature: parsedLog.signature,
              args: parsedLog.args ? Object.keys(parsedLog.args) : 'No args'
            });
            
            if (parsedLog.name === 'Transfer') {
              const [from, to, tokenId] = parsedLog.args as [string, string, bigint];
              console.log('Found Transfer event:', {
                from,
                to,
                tokenId: tokenId.toString(),
                isMint: from === ethers.ZeroAddress
              });
              
              if (from === ethers.ZeroAddress) {
                parsedMainTokenId = tokenId.toString();
                console.log('Identified as mint event. Using tokenId as mainTokenId:', parsedMainTokenId);
                break;
              }
            }
          }
        } catch (e) {
          console.debug('Could not parse log as Transfer event:', e);
        }
      }
    }

    // If we still don't have a mainTokenId, we can't proceed
    if (!parsedMainTokenId) {
      const errorMsg = 'Could not determine mainTokenId from transaction events. No mint events found.';
      console.error(errorMsg);
      console.log('Raw transaction logs:', JSON.stringify(receipt.logs, null, 2));
      
      // Update the database to reflect the failure
      await prisma.landListing.update({
        where: { id: landListingId },
        data: {
          mintStatus: 'FAILED_COLLECTION',
          mintErrorReason: errorMsg.substring(0, 255)
        }
      });
      
      throw new Error(errorMsg);
    }
    
    // If we don't have a collectionId, we can't proceed
    if (!parsedCollectionId) {
      const errorMsg = 'Could not determine collectionId from transaction events. No CollectionCreated event found.';
      console.error(errorMsg);
      console.log('Raw transaction logs:', JSON.stringify(receipt.logs, null, 2));
      
      // Update the database to reflect the failure
      try {
        await prisma.landListing.update({
          where: { id: landListingId },
          data: {
            mintStatus: 'FAILED_COLLECTION',
            mintErrorReason: errorMsg.substring(0, 255)
          }
        });
      } catch (dbUpdateError) { 
        console.error("DB update to FAILED_COLLECTION status failed:", dbUpdateError);
      }
      
      return { 
        success: false, 
        error: errorMsg,
        transactionHash: tx.hash
      };
    }
    
    console.log(`Parsed Collection ID: ${parsedCollectionId}`);
    console.log(`Parsed Main Token ID: ${parsedMainTokenId}`);

    try {
      // First, check if this land listing already has a collectionId to avoid unique constraint violation
      const existingListing = await prisma.landListing.findUnique({
        where: { id: landListingId },
        select: { collectionId: true, mintStatus: true }
      });

      if (existingListing?.collectionId && existingListing.collectionId !== parsedCollectionId) {
        console.warn(`Land listing ${landListingId} already has collectionId ${existingListing.collectionId}, but trying to set ${parsedCollectionId}`);
        // If the collection was already created successfully, just return success
        if (existingListing.mintStatus === 'COMPLETED') {
          return {
            success: true,
            collectionId: existingListing.collectionId,
            mainTokenId: parsedMainTokenId,
            transactionHash: tx.hash,
          };
        }
      }

      // Prepare update data - only include collectionId if it's not already set
      const updateData: any = {
        mintStatus: 'COMPLETED',
        mintTimestamp: new Date(),
        mintTransactionHash: tx.hash,
        mainTokenId: parsedMainTokenId,
        contractAddress: NFT_CONTRACT_ADDRESS,
      };

      // Only update collectionId if it's not already set or if it's different
      if (!existingListing?.collectionId || existingListing.collectionId !== parsedCollectionId) {
        updateData.collectionId = parsedCollectionId;
      }

      await prisma.landListing.update({
        where: { id: landListingId },
        data: updateData,
      });
      
      console.log(`Successfully updated land listing ${landListingId} in createCollection utility (status COMPLETED etc.)`);
    } catch (dbError) {
      console.error('Failed to update land listing status to COMPLETED:', dbError);
      throw new Error(`Collection created but failed to update database: ${dbError.message}`);
    }
    
    return {
      success: true,
      collectionId: parsedCollectionId,
      mainTokenId: parsedMainTokenId,
      transactionHash: tx.hash,
    };
    
  } catch (error: any) {
    console.error('Error creating collection in contractUtils:', error);
    const errorMessage = error.message || 'Unknown error during collection creation utility';
    try {
      await prisma.landListing.update({
        where: { id: landListingId },
        data: { 
          mintStatus: 'FAILED_COLLECTION', 
          mintErrorReason: errorMessage.substring(0, 255) 
        },
      });
    } catch (dbError) {
      console.error('Failed to update land listing status to FAILED_COLLECTION:', dbError);
    }
    return { success: false, error: errorMessage };
  }
};

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
    latitude: landListing.latitude || 0,
    longitude: landListing.longitude || 0,
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

// New function to list a collection on the marketplace
export const listCollectionOnMarketplace = async (
  collectionId: string, // Collection ID from PlatzLandNFTWithCollections
  price: string,        // Listing price as a string (e.g., "0.1" for ETH)
  currency: string,     // Currency symbol, e.g., "ETH". If ETH, paymentToken is address(0)
  retryCount = 3
): Promise<{ success: boolean; transactionHash: string; error?: string }> => {
  let lastError: Error | null = null;
  console.log(`Listing collection ${collectionId} for sale at ${price} ${currency}`);

  // Validate marketplace contract address
  if (!MARKETPLACE_CONTRACT_ADDRESS || MARKETPLACE_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
    throw new Error("Invalid marketplace contract address. Please set MARKETPLACE_CONTRACT_ADDRESS.");
  }

  for (let attempt = 0; attempt < retryCount; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`Marketplace listing attempt ${attempt + 1}/${retryCount} for collection ${collectionId}...`);
        const delay = Math.min(2000 * Math.pow(2, attempt - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const marketplaceContract = await getMarketplaceContract(); // Uses LandMarketplaceAbi.abi by default
      const nftContract = await getNFTContract();
      
      // Verify the contract has the listCollection function (assuming ABI is updated)
      if (typeof marketplaceContract.listCollection !== 'function') {
        console.error('LandMarketplaceABI might be outdated or contract at', MARKETPLACE_CONTRACT_ADDRESS, 'does not have listCollection function.');
        throw new Error(`Marketplace contract at ${MARKETPLACE_CONTRACT_ADDRESS} does not have a listCollection function. Ensure ABI is updated after contract changes.`);
      }

      // First, get the collection details to find the main token ID
      console.log(`Getting collection details for collection ${collectionId}...`);
      const collectionDetails = await nftContract.getCollection(BigInt(collectionId));
      const mainTokenId = collectionDetails[2]; // mainTokenId is the 3rd element (index 2)
      console.log(`Collection ${collectionId} main token ID: ${mainTokenId}`);

      // Check if the main token is already approved for the marketplace
      const approvedAddress = await nftContract.getApproved(mainTokenId);
      console.log(`Current approved address for token ${mainTokenId}: ${approvedAddress}`);
      
      if (approvedAddress.toLowerCase() !== MARKETPLACE_CONTRACT_ADDRESS.toLowerCase()) {
        console.log(`Approving marketplace ${MARKETPLACE_CONTRACT_ADDRESS} for main token ${mainTokenId}...`);
        const approveTx = await nftContract.approve(MARKETPLACE_CONTRACT_ADDRESS, mainTokenId);
        console.log(`Approval transaction submitted: ${approveTx.hash}`);
        await approveTx.wait();
        console.log(`Approval transaction confirmed`);
        
        // Verify approval was successful
        const newApprovedAddress = await nftContract.getApproved(mainTokenId);
        console.log(`New approved address for token ${mainTokenId}: ${newApprovedAddress}`);
        if (newApprovedAddress.toLowerCase() !== MARKETPLACE_CONTRACT_ADDRESS.toLowerCase()) {
          throw new Error(`Failed to approve marketplace for main token ${mainTokenId}`);
        }
      } else {
        console.log(`Main token ${mainTokenId} is already approved for marketplace`);
      }

      const priceInWei = ethers.parseEther(price); // Assuming price is in ETH
      const paymentTokenAddress = currency.toUpperCase() === 'ETH' ? ethers.ZeroAddress : currency; // Placeholder for other ERC20s

      console.log(`Calling listCollection on marketplace with: collectionId=${collectionId}, priceInWei=${priceInWei}, paymentToken=${paymentTokenAddress}`);

      const tx = await marketplaceContract.listCollection(
        BigInt(collectionId), // Ensure collectionId is passed as BigInt if the contract expects uint256
        priceInWei,
        paymentTokenAddress,
        { gasLimit: 600000 } // Adjust gas limit as needed
      );

      console.log(`Marketplace listing transaction submitted: ${tx.hash} for collection ${collectionId}`);
      const receipt = await tx.wait();
      console.log(`Marketplace listing transaction confirmed in block ${receipt.blockNumber} for collection ${collectionId}`);
      
      // Optionally, parse logs for CollectionListed event if needed here, or handle in API route.
      // For now, success is based on transaction confirmation.

      return { success: true, transactionHash: tx.hash };

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Error listing collection ${collectionId} on marketplace (attempt ${attempt + 1}):`, lastError.message);
      if (attempt === retryCount - 1) {
        // This was the last attempt
        return { success: false, transactionHash: "", error: lastError.message };
      }
    }
  }
  // Should not be reached if retry logic is correct, but as a fallback:
  return { success: false, transactionHash: "", error: lastError?.message || "Max retries reached for listing collection." };
};
