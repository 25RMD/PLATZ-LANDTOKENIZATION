'use client';

import React, { useState, useEffect } from 'react';

export default function SimpleTestPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Starting fetch...');
        const response = await fetch('/api/tokens/104/bid-info');
        console.log('Response received:', response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log('Data received:', result);
          setData(result);
        } else {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          setError(`HTTP ${response.status}: ${errorText}`);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Simple API Test</h1>
      
      {loading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p>Loading...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error: {error}</p>
        </div>
      )}
      
      {data && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h2 className="font-semibold mb-2">Success!</h2>
          <pre className="text-sm overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Test Info</h3>
        <p>This page tests a simple fetch to /api/tokens/104/bid-info</p>
        <p>Check the browser console for detailed logs.</p>
      </div>
    </div>
  );
} 