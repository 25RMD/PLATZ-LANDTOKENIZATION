'use client';

import { useState, useEffect } from 'react';

export default function TestSimplePage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        console.log('🔄 Fetching collections from API...');
        const response = await fetch('/api/collections');
        console.log('📡 Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Data received:', data);
          setCollections(data.collections || []);
        } else {
          const errorText = await response.text();
          console.error('❌ API error:', errorText);
          setError(`API returned ${response.status}: ${errorText}`);
        }
      } catch (err: any) {
        console.error('❌ Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Simple Test - Loading...</h1>
        <div className="animate-pulse">Fetching collections...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-500">Error</h1>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Simple Test - Success!</h1>
      <p className="mb-4">Found {collections.length} collections:</p>
      <div className="space-y-2">
        {collections.slice(0, 5).map((collection, index) => (
          <div key={index} className="p-3 border rounded">
            <strong>Collection ID:</strong> {collection.collectionId}<br/>
            <strong>Title:</strong> {collection.nftTitle || 'No title'}<br/>
            <strong>Description:</strong> {collection.nftDescription || 'No description'}
          </div>
        ))}
      </div>
    </div>
  );
} 