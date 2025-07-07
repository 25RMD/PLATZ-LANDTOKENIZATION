import { NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/getBaseUrl';

/**
 * API endpoint to check environment configuration
 * 
 * GET /api/admin/check-environment
 */
export async function GET() {
  const checks = {
    baseUrl: {
      name: 'Base URL',
      value: getBaseUrl(),
      status: (() => {
        const baseUrl = getBaseUrl();
        if (!baseUrl || baseUrl.includes('localhost')) return 'warning';
        if (baseUrl.includes('ngrok') || baseUrl.includes('vercel.app')) return 'success';
        return 'info';
      })(),
      message: (() => {
        const baseUrl = getBaseUrl();
        if (!baseUrl) return 'Base URL could not be determined. NFT minting will fail.';
        if (baseUrl.includes('localhost')) return 'Using localhost. External services cannot access metadata.';
        if (baseUrl.includes('ngrok')) return 'Using ngrok. Good for local development.';
        if (baseUrl.includes('vercel.app')) return 'Using Vercel URL. Ready for production.';
        return 'Custom URL detected. Ensure it is publicly accessible.';
      })(),
    },
    nftContract: {
      value: process.env.NFT_CONTRACT_ADDRESS || 'Not set',
      status: process.env.NFT_CONTRACT_ADDRESS ? 'success' : 'error',
      message: process.env.NFT_CONTRACT_ADDRESS 
        ? 'NFT contract address is set' 
        : 'NFT_CONTRACT_ADDRESS not set - required for NFT minting'
    },
    marketplaceContract: {
      value: process.env.MARKETPLACE_CONTRACT_ADDRESS || 'Not set',
      status: process.env.MARKETPLACE_CONTRACT_ADDRESS ? 'success' : 'error',
      message: process.env.MARKETPLACE_CONTRACT_ADDRESS 
        ? 'Marketplace contract address is set' 
        : 'MARKETPLACE_CONTRACT_ADDRESS not set - required for marketplace features'
    },
    rpcUrl: {
      value: (process.env.SEPOLIA_RPC_URL || process.env.RPC_URL) ? 'Set' : 'Not set',
      status: (process.env.SEPOLIA_RPC_URL || process.env.RPC_URL) ? 'success' : 'error',
      message: (process.env.SEPOLIA_RPC_URL || process.env.RPC_URL)
        ? 'RPC URL is set' 
        : 'Neither SEPOLIA_RPC_URL nor RPC_URL is set - required for blockchain communication'
    },
    serverWallet: {
      value: process.env.SERVER_WALLET_PRIVATE_KEY ? 'Set' : 'Not set',
      status: process.env.SERVER_WALLET_PRIVATE_KEY ? 'success' : 'error',
      message: process.env.SERVER_WALLET_PRIVATE_KEY
        ? 'Server wallet private key is set'
        : 'SERVER_WALLET_PRIVATE_KEY not set - required for sending transactions'
    },
    uploads: {
      value: 'Checking...',
      status: 'info',
      message: 'Checking if uploads directory exists and is writable'
    },
  };

  // Check uploads directory
  try {
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(process.cwd(), 'uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      checks.uploads.value = 'Directory does not exist';
      checks.uploads.status = 'error';
      checks.uploads.message = 'Uploads directory does not exist - NFT minting will fail';
    } else {
      // Check if directory is writable
      try {
        const testFile = path.join(uploadsDir, 'test-write.tmp');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        checks.uploads.value = 'Directory exists and is writable';
        checks.uploads.status = 'success';
        checks.uploads.message = 'Uploads directory is ready for NFT minting';
      } catch (e) {
        checks.uploads.value = 'Directory exists but is not writable';
        checks.uploads.status = 'error';
        checks.uploads.message = 'Uploads directory is not writable - NFT minting will fail';
      }
    }
  } catch (e) {
    checks.uploads.value = 'Error checking directory';
    checks.uploads.status = 'error';
    checks.uploads.message = `Error checking uploads directory: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Provide overall status
  const hasErrors = Object.values(checks).some(check => check.status === 'error');
  const hasWarnings = Object.values(checks).some(check => check.status === 'warning');
  
  const overall = {
    status: hasErrors ? 'error' : hasWarnings ? 'warning' : 'success',
    ready: !hasErrors,
    message: hasErrors 
      ? 'Environment is not properly configured for NFT minting'
      : hasWarnings
        ? 'Environment has some warnings but may work for NFT minting'
        : 'Environment is properly configured for NFT minting'
  };

  return NextResponse.json({
    checks,
    overall,
    timestamp: new Date().toISOString(),
  });
} 