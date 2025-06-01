'use client';

import { useState, useEffect } from 'react';

export default function TestApiPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        console.log('Fetching collections...');
        const response = await fetch('/api/collections');
        console.log('Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Data received:', data);
          setCollections(data.collections || []);
        } else {
          setError(`API returned ${response.status}`);
        }
      } catch (err: any) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Test</h1>
      <p>Found {collections.length} collections:</p>
      <ul>
        {collections.slice(0, 3).map((collection, index) => (
          <li key={index} className="mb-2">
            Collection ID: {collection.collectionId}, Title: {collection.nftTitle || 'No title'}
          </li>
        ))}
      </ul>
    </div>
  );
} 