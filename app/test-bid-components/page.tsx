'use client';

import React, { useState } from 'react';
import { BidInterface, BidDisplay, BidForm } from '@/components';

export default function TestBidComponentsPage() {
  const [selectedToken, setSelectedToken] = useState(104);
  const [userAddress] = useState('0x1234567890123456789012345678901234567890');

  const testTokens = [
    { id: 104, name: 'Token with Active Bid', description: 'Has 0.004 ETH bid' },
    { id: 106, name: 'Token with No Bids', description: 'Clean slate for testing' },
    { id: 102, name: 'Another Active Bid', description: 'Has 0.001 ETH bid' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Bid Components Test Page</h1>
      
      {/* Token Selector */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Select Test Token</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testTokens.map(token => (
            <button
              key={token.id}
              onClick={() => setSelectedToken(token.id)}
              className={`p-4 border rounded-lg text-left transition-colors ${
                selectedToken === token.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <h3 className="font-medium">{token.name}</h3>
              <p className="text-sm text-gray-600">Token #{token.id}</p>
              <p className="text-xs text-gray-500">{token.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Component Demonstrations */}
      <div className="space-y-12">
        
        {/* Complete Bid Interface */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Complete Bid Interface</h2>
          <p className="text-gray-600 mb-6">
            The `BidInterface` component combines display and form for a complete solution.
          </p>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <BidInterface
              tokenId={selectedToken}
              collectionId="16"
              userAddress={userAddress}
            />
          </div>
        </section>

        {/* Separate Components */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Individual Components</h2>
          <p className="text-gray-600 mb-6">
            Use `BidDisplay` and `BidForm` separately for custom layouts.
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bid Display Only */}
            <div>
              <h3 className="text-lg font-medium mb-3">Bid Display Component</h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <BidDisplay tokenId={selectedToken} />
              </div>
            </div>

            {/* Bid Form Only */}
            <div>
              <h3 className="text-lg font-medium mb-3">Bid Form Component</h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <BidForm
                  tokenId={selectedToken}
                  collectionId="16"
                  userAddress={userAddress}
                  onBidSuccess={(amount) => {
                    alert(`Bid of ${amount} ETH placed successfully!`);
                  }}
                  onBidError={(error) => {
                    alert(`Bid failed: ${error}`);
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Multiple Token Display */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Token Grid Example</h2>
          <p className="text-gray-600 mb-6">
            How bid displays look in a token grid layout.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testTokens.map(token => (
              <div key={token.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">#{token.id}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-medium mb-2">{token.name}</h3>
                  <BidDisplay 
                    tokenId={token.id} 
                    autoRefresh={false}
                    className="text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* API Information */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">API Information</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="font-medium mb-3">Current Token #{selectedToken} API Response:</h3>
            <div className="bg-white border rounded p-3 font-mono text-sm">
              <a 
                href={`/api/tokens/${selectedToken}/bid-info`}
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                GET /api/tokens/{selectedToken}/bid-info
              </a>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Click the link above to see the raw API response for the selected token.
            </p>
          </div>
        </section>

        {/* Usage Instructions */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Usage Instructions</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-medium mb-3">Quick Integration:</h3>
            <pre className="bg-white border rounded p-3 text-sm overflow-x-auto">
{`import { BidInterface } from '@/components';

<BidInterface
  tokenId={tokenId}
  collectionId="16"
  userAddress={userAddress}
/>`}
            </pre>
            
            <p className="text-sm text-gray-700 mt-4">
              See <code>/docs/bid-components-usage.md</code> for comprehensive documentation.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
} 