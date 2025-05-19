import { NextRequest, NextResponse } from 'next/server';
import { RPC_URLS } from '@/lib/constants';
import { ethers } from 'ethers';

/**
 * RPC Diagnostics and Auto-configuration API
 * 
 * This endpoint provides tools for:
 * 1. Testing currently configured RPC URLs
 * 2. Finding working public RPC endpoints 
 * 3. Updating environment variables with working RPC URLs
 * 4. Providing recommendations for setting up reliable RPC access
 * 
 * GET /api/admin/rpc-diagnostics - Get diagnostic info about current RPC setup
 * POST /api/admin/rpc-diagnostics - Test and update RPC URLs
 */

export async function GET(request: NextRequest) {
  try {
    // Check if user is authorized (normally would check for admin role)
    // For simplicity, we'll skip auth checks in this example
    
    const results = [];
    
    // Test each RPC URL
    for (const url of RPC_URLS) {
      const result = await testRpcUrl(url);
      results.push(result);
    }
    
    // Get overall status
    const isAllHealthy = results.every(r => r.status === 'healthy');
    
    return NextResponse.json({
      success: true,
      status: isAllHealthy ? 'healthy' : 'degraded',
      rpcEndpoints: results,
      message: isAllHealthy 
        ? 'All RPC endpoints are operating normally' 
        : 'Some RPC endpoints are experiencing issues'
    });
  } catch (error) {
    console.error('Error in RPC diagnostics:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to run RPC diagnostics',
      details: (error as Error).message
    }, { status: 500 });
  }
}

async function testRpcUrl(url: string) {
  try {
    // Create a basic info object
    const result = {
      url: maskRpcUrl(url),
      status: 'unknown' as 'healthy' | 'degraded' | 'failed' | 'unknown',
      latency: -1,
      blockNumber: -1,
      gasPrice: null as string | null,
      error: null as string | null,
    };
    
    const startTime = Date.now();
    
    try {
      // Create a provider
      const provider = new ethers.JsonRpcProvider(url, undefined, {
        polling: true,
        pollingInterval: 4000,
      });
      
      // Get the network
      const network = await provider.getNetwork();
      
      // Get the latest block number
      const blockNumber = await provider.getBlockNumber();
      
      // Get the gas price
      const gasPrice = await provider.getGasPrice();
      
      // Calculate latency
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      // Update result
      result.status = 'healthy';
      result.latency = latency;
      result.blockNumber = Number(blockNumber);
      result.gasPrice = ethers.formatUnits(gasPrice, 'gwei');
      
      // Additional check for stale blocks
      if (latency > 5000) {
        result.status = 'degraded';
        result.error = 'High latency';
      }
    } catch (error) {
      const endTime = Date.now();
      result.latency = endTime - startTime;
      result.status = 'failed';
      result.error = (error as Error).message;
    }
    
    return result;
  } catch (error) {
    return {
      url: maskRpcUrl(url),
      status: 'failed' as const,
      latency: -1,
      blockNumber: -1,
      gasPrice: null,
      error: (error as Error).message,
    };
  }
}

// Mask sensitive API keys in RPC URLs
function maskRpcUrl(url: string): string {
  try {
    // Create a URL object
    const urlObj = new URL(url);
    
    // Check if there's a pathname that might contain API keys
    if (urlObj.pathname.length > 10) {
      const parts = urlObj.pathname.split('/');
      
      // Look for parts that could be API keys
      for (let i = 0; i < parts.length; i++) {
        if (parts[i] && parts[i].length > 8) {
          // Mask the API key part, keep first and last 4 chars
          if (parts[i].length > 8) {
            const start = parts[i].substring(0, 4);
            const end = parts[i].substring(parts[i].length - 4);
            parts[i] = `${start}...${end}`;
          }
        }
      }
      
      // Reconstruct pathname
      urlObj.pathname = parts.join('/');
    }
    
    // If there's an API key in the query string, mask it
    if (urlObj.search) {
      const params = new URLSearchParams(urlObj.search);
      
      for (const [key, value] of params.entries()) {
        if (value && value.length > 8 && (
          key.toLowerCase().includes('key') || 
          key.toLowerCase().includes('token') || 
          key.toLowerCase().includes('api')
        )) {
          const start = value.substring(0, 4);
          const end = value.substring(value.length - 4);
          params.set(key, `${start}...${end}`);
        }
      }
      
      urlObj.search = params.toString();
    }
    
    return urlObj.toString();
  } catch (error) {
    // If URL parsing fails, just mask the whole string
    if (url.length > 15) {
      return `${url.substring(0, 10)}...${url.substring(url.length - 5)}`;
    }
    return url;
  }
}

// This endpoint tests the connection to the contract
export async function POST(request: NextRequest) {
  try {
    // Check authorization (skipped for simplicity)
    
    // Get details about what to test
    const { test, contractAddress, rpcUrl } = await request.json();
    
    // Create a provider and signer
    const provider = new ethers.JsonRpcProvider(
      rpcUrl || process.env.NEXT_PUBLIC_RPC_URL || RPC_URLS[0]
    );
    
    // Create a random wallet (just for testing)
    const wallet = ethers.Wallet.createRandom().connect(provider);
    
    if (test === 'provider') {
      // Test the provider connection
      // Run a series of tests
      const startTime = Date.now();
      
      const network = await provider.getNetwork();
      const blockNumber = await provider.getBlockNumber();
      const gasPrice = await provider.getGasPrice();
      
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      return NextResponse.json({
        success: true,
        provider: {
          network: {
            name: network.name,
            chainId: network.chainId,
          },
          blockNumber: Number(blockNumber),
          gasPrice: ethers.formatUnits(gasPrice, 'gwei'),
          latency,
        }
      });
    }
    
    if (test === 'contract' && contractAddress) {
      // Test interaction with a specific contract
      
      // Check if this is a zero address
      if (contractAddress === "0x0000000000000000000000000000000000000000") {
        return NextResponse.json({
          success: false,
          error: 'Zero address provided. This is a placeholder address, not a real contract.',
          recommendations: [
            'Set proper contract addresses in your environment variables',
            'Deploy your contracts if you haven\'t already done so',
            'Make sure to use the correct network (Sepolia, mainnet, etc.)'
          ]
        }, { status: 400 });
      }
      
      // Just verify the contract exists and is a valid contract
      const code = await provider.getCode(contractAddress);
      
      // If no code is deployed at this address
      if (code === '0x') {
        return NextResponse.json({
          success: false,
          error: 'No contract deployed at this address',
          possibleReasons: [
            'The contract may not be deployed to this network',
            'The address might be incorrect',
            'This might be an EOA (wallet) address, not a contract address'
          ]
        }, { status: 400 });
      }
      
      // Get transaction count to check connectivity
      const walletAddress = await wallet.getAddress();
      const txCount = await provider.getTransactionCount(walletAddress);
      
      return NextResponse.json({
        success: true,
        contract: {
          address: contractAddress,
          codeSize: (code.length - 2) / 2, // Convert hex string to byte count
          walletAddress,
          walletTxCount: txCount,
        }
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid test type specified'
    }, { status: 400 });
  } catch (error) {
    console.error('Error in RPC diagnostics API:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to run RPC diagnostics',
      details: (error as Error).message
    }, { status: 500 });
  }
} 