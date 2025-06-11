"use client";

import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PulsingDotsSpinner from '@/components/common/PulsingDotsSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [redirectDelay, setRedirectDelay] = useState(false);

  useEffect(() => {
    console.log('ProtectedRoute useEffect triggered:', {
      isLoading,
      isAuthenticated,
      hasUser: !!user,
      userDetails: user ? { id: user.id, username: user.username, evmAddress: user.evmAddress } : null,
      redirectDelay
    });

    // Add a small delay before redirecting to avoid race conditions
    // especially after EVM wallet login
    if (!isLoading && !isAuthenticated && !redirectDelay) {
      console.log('ProtectedRoute: Starting redirect delay for authentication check...');
      setRedirectDelay(true);
      
      // Wait a moment to ensure authentication state has fully updated
      const timeoutId = setTimeout(() => {
        // Re-check authentication state after delay
        if (!isAuthenticated) {
          console.log('ProtectedRoute: User still not authenticated after delay, redirecting to /login');
          console.log('ProtectedRoute: Final state check - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);
      router.push('/login');
        } else {
          console.log('ProtectedRoute: User became authenticated during delay, allowing access');
          setRedirectDelay(false);
        }
      }, 1000); // 1 second delay to allow authentication state to settle

      return () => clearTimeout(timeoutId);
    } else if (!isLoading && isAuthenticated) {
      console.log('ProtectedRoute: User is authenticated, allowing access to protected content');
      setRedirectDelay(false);
    }
  }, [isLoading, isAuthenticated, router, user, redirectDelay]);

  // While loading the authentication status or during redirect delay, show a loading indicator
  if (isLoading || redirectDelay) {
    console.log('ProtectedRoute: Showing loading spinner - isLoading:', isLoading, 'redirectDelay:', redirectDelay);
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <PulsingDotsSpinner size={48} color="bg-black dark:bg-white" />
      </div>
    );
  }

  // If authenticated, render the child components (the actual page content)
  if (isAuthenticated) {
    console.log('ProtectedRoute: Rendering protected content for authenticated user');
    return <>{children}</>;
  }

  // If not authenticated and not loading (should have been redirected, but return null as fallback)
  console.log('ProtectedRoute: Returning null - not authenticated and not loading');
  return null;
};

export default ProtectedRoute; 