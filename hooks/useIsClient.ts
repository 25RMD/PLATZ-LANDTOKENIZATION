import { useEffect, useState } from 'react';

/**
 * Hook to safely detect if we're on the client side
 * Prevents hydration mismatches by starting with false and updating after hydration
 */
export const useIsClient = (): boolean => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
};

export default useIsClient; 