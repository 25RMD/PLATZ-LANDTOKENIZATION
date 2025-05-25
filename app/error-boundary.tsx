'use client';

import { useEffect } from 'react';

export default function ErrorBoundary({ 
  error, 
  reset 
}: { 
  error: Error; 
  reset: () => void 
}) {
  useEffect(() => {
    console.error('Error boundary caught:', error);
  }, [error]);

  return (
    <div className="p-4 bg-red-50 text-red-700 rounded">
      <h2 className="font-bold">Something went wrong</h2>
      <p>{error.message}</p>
      <button 
        onClick={reset}
        className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded"
      >
        Try again
      </button>
    </div>
  );
}
