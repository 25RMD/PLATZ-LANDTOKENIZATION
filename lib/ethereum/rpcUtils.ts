import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

/**
 * This utility file provides functions to help with RPC URL management
 * - Testing connection to various RPC URLs
 * - Instructions for getting free API keys from providers
 * - Saving working RPC URLs to environment variables
 */

// List of public Sepolia RPC URLs
export const PUBLIC_SEPOLIA_RPCS = [
  "https://ethereum-sepolia-rpc.publicnode.com",
  "https://sepolia.gateway.tenderly.co",
  "https://rpc.ankr.com/eth_sepolia",
  "https://sepolia.drpc.org",
  "https://1rpc.io/sepolia",
  "https://eth-sepolia.public.blastapi.io"
];

// Instructions for getting free RPC URLs from major providers
export const FREE_RPC_PROVIDERS = [
  {
    name: "Alchemy",
    signupUrl: "https://alchemy.com/?r=f320c9d5a160a4c9",
    instructionsUrl: "https://docs.alchemy.com/docs/alchemy-quickstart-guide",
    instructions: [
      "1. Sign up for a free Alchemy account",
      "2. Create a new app for Sepolia testnet",
      "3. Copy the HTTPS URL from your dashboard",
      "4. Add it to your .env.local file as SEPOLIA_RPC_URL"
    ]
  },
  {
    name: "Infura",
    signupUrl: "https://infura.io/register",
    instructionsUrl: "https://docs.infura.io/networks/ethereum/how-to/secure-a-project/project-id",
    instructions: [
      "1. Sign up for a free Infura account",
      "2. Create a new project",
      "3. Select the Sepolia network endpoint",
      "4. Copy the HTTPS endpoint URL",
      "5. Add it to your .env.local file as SEPOLIA_RPC_URL"
    ]
  },
  {
    name: "QuickNode",
    signupUrl: "https://www.quicknode.com/",
    instructionsUrl: "https://www.quicknode.com/guides/ethereum/getting-started-with-ethereum",
    instructions: [
      "1. Sign up for a free QuickNode account",
      "2. Create a new endpoint for Sepolia testnet",
      "3. Copy the HTTP Provider URL",
      "4. Add it to your .env.local file as SEPOLIA_RPC_URL"
    ]
  }
];

// Function to test connection to an RPC URL
export const testRpcConnection = async (rpcUrl: string): Promise<boolean> => {
  try {
    console.log(`Testing connection to ${rpcUrl}...`);
    const provider = new ethers.JsonRpcProvider(rpcUrl, undefined, {
      polling: true,
      pollingInterval: 4000,
      timeout: 10000,
    });
    
    const blockNumber = await provider.getBlockNumber();
    console.log(`Successfully connected to ${rpcUrl} (Block #${blockNumber})`);
    return true;
  } catch (error) {
    console.error(`Failed to connect to ${rpcUrl}:`, error);
    return false;
  }
};

// Function to test all public RPC URLs and return working ones
export const findWorkingRpcUrls = async (): Promise<string[]> => {
  const results = await Promise.all(
    PUBLIC_SEPOLIA_RPCS.map(async (url) => {
      const isWorking = await testRpcConnection(url);
      return { url, isWorking };
    })
  );
  
  return results.filter(r => r.isWorking).map(r => r.url);
};

// Function to update environment variables with working RPC URLs
export const updateRpcEnvironmentVariables = async (workingUrls: string[]): Promise<boolean> => {
  if (workingUrls.length === 0) return false;
  
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    let envContent = '';
    
    // Read existing .env.local file if it exists
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update or add RPC URL variables
    const rpcVars = [
      'FALLBACK_RPC_URL_1',
      'FALLBACK_RPC_URL_2',
      'FALLBACK_RPC_URL_3'
    ];
    
    // Remove existing fallback RPC URLs
    rpcVars.forEach(varName => {
      const regex = new RegExp(`^${varName}=.*$`, 'gm');
      envContent = envContent.replace(regex, '');
    });
    
    // Add new fallback RPC URLs
    const newVars = workingUrls.slice(0, 3).map((url, index) => {
      return `${rpcVars[index]}=${url}`;
    }).join('\n');
    
    // Ensure the file ends with a newline
    if (envContent && !envContent.endsWith('\n')) {
      envContent += '\n';
    }
    
    // Append the new variables
    envContent += `\n# Auto-configured fallback RPC URLs (updated ${new Date().toISOString()})\n${newVars}\n`;
    
    // Write the updated content back to the file
    fs.writeFileSync(envPath, envContent);
    
    console.log(`Updated .env.local with ${workingUrls.length} working RPC URLs`);
    return true;
  } catch (error) {
    console.error('Failed to update .env.local file:', error);
    return false;
  }
};

// Function to get RPC provider recommendations
export const getRpcProviderRecommendations = (): { message: string, providers: typeof FREE_RPC_PROVIDERS } => {
  return {
    message: "We recommend signing up for a free RPC provider to improve reliability. Here are some options:",
    providers: FREE_RPC_PROVIDERS
  };
};

// Export default object with all utilities
export default {
  testRpcConnection,
  findWorkingRpcUrls,
  updateRpcEnvironmentVariables,
  getRpcProviderRecommendations,
  PUBLIC_SEPOLIA_RPCS,
  FREE_RPC_PROVIDERS
}; 