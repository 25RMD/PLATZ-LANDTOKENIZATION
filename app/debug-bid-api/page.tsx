'use client';

import React, { useState, useEffect } from 'react';

export default function DebugBidAPIPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testAPI = async () => {
      const testTokens = [104, 106, 102];
      const newResults: any[] = [];

      for (const tokenId of testTokens) {
        try {
          console.log(`Testing token ${tokenId}...`);
          
          const startTime = Date.now();
          const response = await fetch(`/api/tokens/${tokenId}/bid-info`);
          const endTime = Date.now();
          
          console.log(`Token ${tokenId} - Status: ${response.status}, Time: ${endTime - startTime}ms`);
          
          if (response.ok) {
            const data = await response.json();
            console.log(`Token ${tokenId} data:`, data);
            
            newResults.push({
              tokenId,
              status: response.status,
              success: true,
              data,
              responseTime: endTime - startTime
            });
          } else {
            const errorText = await response.text();
            console.error(`Token ${tokenId} error:`, errorText);
            
            newResults.push({
              tokenId,
              status: response.status,
              success: false,
              error: errorText,
              responseTime: endTime - startTime
            });
          }
        } catch (error) {
          console.error(`Token ${tokenId} fetch error:`, error);
          
          newResults.push({
            tokenId,
            status: 'ERROR',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            responseTime: 0
          });
        }
      }

      setResults(newResults);
      setLoading(false);
    };

    testAPI();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Bid API Debug Page</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">API Test Results</h2>
        
        {loading ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p>Testing API endpoints...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div 
                key={index}
                className={`border rounded-lg p-4 ${
                  result.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <h3 className="font-semibold mb-2">
                  Token {result.tokenId} - Status: {result.status}
                </h3>
                
                <p className="text-sm mb-2">
                  Response Time: {result.responseTime}ms
                </p>
                
                {result.success ? (
                  <div>
                    <p className="text-green-700 mb-2">✅ Success</p>
                    <div className="bg-white border rounded p-3">
                      <pre className="text-xs overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-red-700 mb-2">❌ Failed</p>
                    <div className="bg-white border rounded p-3">
                      <p className="text-sm text-red-600">{result.error}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Debug Information</h3>
        <ul className="text-sm space-y-1">
          <li><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</li>
          <li><strong>User Agent:</strong> {typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}</li>
          <li><strong>Timestamp:</strong> {new Date().toISOString()}</li>
        </ul>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Manual Test Links</h3>
        <div className="space-y-2">
          {[104, 106, 102].map(tokenId => (
            <div key={tokenId}>
              <a 
                href={`/api/tokens/${tokenId}/bid-info`}
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                GET /api/tokens/{tokenId}/bid-info
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 