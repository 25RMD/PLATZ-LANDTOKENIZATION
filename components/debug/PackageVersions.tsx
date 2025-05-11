"use client";

import React, { useEffect, useState } from 'react';

// This component will help us diagnose package version issues
const PackageVersions = () => {
  const [versions, setVersions] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkPackages = async () => {
      try {
        console.log("Checking package versions...");
        
        // Try to get package versions from package.json
        const packageJson = require('/home/rmd25/Documents/coding/PLATZ/PLATZ-LANDTOKENIZATION/package.json');
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        setVersions({
          nextjs: deps.next || 'unknown',
          react: deps.react || 'unknown',
          ethers: deps.ethers || 'unknown',
          prisma: deps.prisma || 'unknown',
          typescript: deps.typescript || 'unknown',
          'next-auth': deps['next-auth'] || 'unknown',
        });
      } catch (err) {
        console.error("Error in PackageVersions component:", err);
        setError(err instanceof Error ? err.message : String(err));
      }
    };

    checkPackages();
  }, []);

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg mt-4">
      <h2 className="text-lg font-semibold mb-2">Package Diagnostic Information</h2>
      {error ? (
        <div className="text-red-500">Error: {error}</div>
      ) : (
        <div>
          <h3 className="font-medium mb-1">Package Versions:</h3>
          <ul className="list-disc pl-5">
            {Object.entries(versions).map(([pkg, version]) => (
              <li key={pkg}>
                {pkg}: {version}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sm text-gray-500">
            Check browser console for more detailed diagnostic information.
          </p>
        </div>
      )}
    </div>
  );
};

export default PackageVersions;
