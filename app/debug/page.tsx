"use client";

import React from 'react';
import PackageVersions from '@/components/debug/PackageVersions';

export default function DebugPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Package Versions</h2>
        <PackageVersions />
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Environment</h2>
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p>Node.js Environment: {process.env.NODE_ENV}</p>
          <p>React Version: {React.version}</p>
        </div>
      </div>
    </div>
  );
}
