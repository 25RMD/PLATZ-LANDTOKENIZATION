'use client';

import { useState, useEffect } from 'react';

export default function TestNoProvidersPage() {
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

    // Add a small delay to ensure the component has mounted
    const timer = setTimeout(fetchCollections, 100);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Test No Providers - Loading...</h1>
        <div>Fetching collections...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'red' }}>Error</h1>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Test No Providers - Success!</h1>
      <p style={{ marginBottom: '1rem' }}>Found {collections.length} collections:</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {collections.slice(0, 5).map((collection, index) => (
          <div key={index} style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
            <strong>Collection ID:</strong> {collection.collectionId}<br/>
            <strong>Title:</strong> {collection.nftTitle || 'No title'}<br/>
            <strong>Description:</strong> {collection.nftDescription || 'No description'}
          </div>
        ))}
      </div>
    </div>
  );
} 