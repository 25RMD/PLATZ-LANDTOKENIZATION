import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import PlatzLandNFTAbi from '@/artifacts/contracts/PlatzLandNFT.sol/PlatzLandNFT.json';
import LandMarketplaceAbi from '@/artifacts/contracts/LandMarketplace.sol/LandMarketplace.json';

/**
 * Contract Verification API
 * 
 * This endpoint verifies that the NFT and marketplace contracts are:
 * 1. Deployed at the specified addresses
 * 2. Have the expected functions
 * 3. Are accessible from the configured RPC endpoint
 * 
 * GET /api/admin/verify-contracts - Verify both contracts
 */

// Function to verify provider connection
const verifyProvider = async () => {
  const rpcUrl = process.env.SEPOLIA_RPC_URL || process.env.RPC_URL;
  if (!rpcUrl) {
    throw new Error('No RPC URL configured in environment variables');
  }
  
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    return {
      success: true,
      network: {
        name: network.name,
        chainId: Number(network.chainId)
      },
      blockNumber,
      rpcUrl: rpcUrl.substring(0, 20) + '...'
    };
  } catch (error) {
    throw new Error(`Failed to connect to provider: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Function to verify NFT contract
const verifyNFTContract = async () => {
  const contractAddress = process.env.NFT_CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error('NFT_CONTRACT_ADDRESS not configured in environment variables');
  }
  
  try {
    const rpcUrl = process.env.SEPOLIA_RPC_URL || process.env.RPC_URL;
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(contractAddress, PlatzLandNFTAbi.abi, provider);
    
    // Verify basic contract information
    const name = await contract.name();
    const symbol = await contract.symbol();
    const totalSupply = await contract.totalSupply();
    
    // Check if required functions exist
    const hasSafeMint = typeof contract.safeMint === 'function';
    const hasTokenURI = typeof contract.tokenURI === 'function';
    
    return {
      success: true,
      address: contractAddress,
      name,
      symbol,
      totalSupply: Number(totalSupply),
      functions: {
        safeMint: hasSafeMint,
        tokenURI: hasTokenURI
      }
    };
  } catch (error) {
    throw new Error(`Failed to verify NFT contract: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Function to verify Marketplace contract
const verifyMarketplaceContract = async () => {
  const contractAddress = process.env.MARKETPLACE_CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error('MARKETPLACE_CONTRACT_ADDRESS not configured in environment variables');
  }
  
  try {
    const rpcUrl = process.env.SEPOLIA_RPC_URL || process.env.RPC_URL;
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(contractAddress, LandMarketplaceAbi.abi, provider);
    
    // Check if required functions exist
    const hasCreateListing = typeof contract.createListing === 'function';
    const hasGetListing = typeof contract.getListing === 'function';
    const hasCancelListing = typeof contract.cancelListing === 'function';
    
    // Check function parameter count
    let createListingParams = [];
    try {
      // Try to inspect function parameters (this is imperfect but gives some info)
      const fragment = contract.interface.getFunction('createListing');
      createListingParams = fragment.inputs.map((input: any) => ({
        name: input.name,
        type: input.type
      }));
    } catch (e) {
      console.error('Error getting createListing parameters:', e);
    }
    
    return {
      success: true,
      address: contractAddress,
      functions: {
        createListing: hasCreateListing,
        getListing: hasGetListing,
        cancelListing: hasCancelListing
      },
      createListingParams
    };
  } catch (error) {
    throw new Error(`Failed to verify Marketplace contract: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export async function GET(request: NextRequest) {
  try {
    // Run all verifications in parallel
    const [providerInfo, nftContract, marketplaceContract] = await Promise.all([
      verifyProvider().catch(error => ({ success: false, error: String(error) })),
      verifyNFTContract().catch(error => ({ success: false, error: String(error) })),
      verifyMarketplaceContract().catch(error => ({ success: false, error: String(error) }))
    ]);
    
    return NextResponse.json({
      success: true,
      provider: providerInfo,
      nftContract,
      marketplaceContract,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error verifying contracts:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 