"use client";

import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PulsingDotsSpinner from '@/components/common/PulsingDotsSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('ProtectedRoute useEffect triggered:', {
      isLoading,
      isAuthenticated,
      hasUser: !!user,
      userDetails: user ? { id: user.id, username: user.username, evmAddress: user.evmAddress } : null
    });

    // If finished loading and the user is not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      console.log('ProtectedRoute: User not authenticated, redirecting to /login');
      console.log('ProtectedRoute: Final state check - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);
      router.push('/login');
    } else if (!isLoading && isAuthenticated) {
      console.log('ProtectedRoute: User is authenticated, allowing access to protected content');
    }
  }, [isLoading, isAuthenticated, router, user]);

  // While loading the authentication status, show a loading indicator
  if (isLoading) {
    console.log('ProtectedRoute: Showing loading spinner - isLoading:', isLoading);
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