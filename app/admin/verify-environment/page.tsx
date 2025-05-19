'use client';

import { useState, useEffect } from 'react';
import { FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';

type CheckStatus = 'success' | 'warning' | 'error' | 'info';

type Check = {
  value: string;
  status: CheckStatus;
  message: string;
};

type EnvironmentCheckResult = {
  checks: {
    baseUrl: Check;
    nftContract: Check;
    marketplaceContract: Check;
    rpcUrl: Check;
    serverWallet: Check;
    uploads: Check;
  };
  overall: {
    status: CheckStatus;
    ready: boolean;
    message: string;
  };
  timestamp: string;
};

export default function VerifyEnvironmentPage() {
  const [results, setResults] = useState<EnvironmentCheckResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkEnvironment = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/check-environment');
        if (!response.ok) {
          throw new Error(`Failed to check environment: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setResults(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to check environment');
        setResults(null);
      } finally {
        setLoading(false);
      }
    };

    checkEnvironment();
  }, []);

  const getStatusIcon = (status: CheckStatus) => {
    switch (status) {
      case 'success':
        return <FiCheckCircle className="text-green-500 h-5 w-5" />;
      case 'warning':
        return <FiAlertCircle className="text-amber-500 h-5 w-5" />;
      case 'error':
        return <FiAlertCircle className="text-red-500 h-5 w-5" />;
      case 'info':
      default:
        return <FiInfo className="text-blue-500 h-5 w-5" />;
    }
  };

  const getStatusBgClass = (status: CheckStatus) => {
    switch (status) {
      case 'success': return 'bg-green-50 dark:bg-green-900/20';
      case 'warning': return 'bg-amber-50 dark:bg-amber-900/20';
      case 'error': return 'bg-red-50 dark:bg-red-900/20';
      case 'info':
      default: return 'bg-blue-50 dark:bg-blue-900/20';
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">NFT Minting Environment Verification</h1>
      
      {loading && (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md mb-6">
          <div className="flex items-center">
            <FiAlertCircle className="mr-2 h-5 w-5" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {results && (
        <>
          <div className={`p-4 rounded-md mb-6 ${getStatusBgClass(results.overall.status)}`}>
            <div className="flex items-center">
              {getStatusIcon(results.overall.status)}
              <div className="ml-3">
                <h3 className="font-medium">Overall Status: {results.overall.status.toUpperCase()}</h3>
                <p>{results.overall.message}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {Object.entries(results.checks).map(([key, check]) => (
              <div 
                key={key} 
                className={`p-4 rounded-md border ${getStatusBgClass(check.status)}`}
              >
                <div className="flex items-start">
                  <div className="mt-0.5">{getStatusIcon(check.status)}</div>
                  <div className="ml-3">
                    <h3 className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{check.message}</p>
                    <div className="mt-2 text-xs font-mono truncate">
                      {key === 'nftContract' || key === 'marketplaceContract' 
                        ? check.value.startsWith('0x') 
                          ? (
                            <a 
                              href={`https://sepolia.etherscan.io/address/${check.value}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              {check.value}
                            </a>
                          )
                          : check.value
                        : check.value
                      }
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-sm text-gray-500 dark:text-gray-400">
            <p>Last updated: {new Date(results.timestamp).toLocaleString()}</p>
            
            <div className="mt-4">
              <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Instructions for using ngrok:</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Install ngrok: <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">npm install -g ngrok</code></li>
                <li>Start your Next.js development server: <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">npm run dev</code></li>
                <li>In a separate terminal, run: <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">ngrok http 3001</code></li>
                <li>Copy the HTTPS URL from ngrok (looks like <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">https://abc123.ngrok.io</code>)</li>
                <li>Add to your <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">.env.local</code> file: <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">NEXT_PUBLIC_BASE_URL=https://abc123.ngrok.io</code></li>
                <li>Restart your Next.js server for the environment variable to take effect</li>
              </ol>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 