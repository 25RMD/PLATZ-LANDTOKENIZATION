"use client";

import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PulsingDotsSpinner from '@/components/common/PulsingDotsSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If finished loading and the user is not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      console.log('ProtectedRoute: User not authenticated, redirecting to /login');
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // While loading the authentication status, show a loading indicator
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <PulsingDotsSpinner size={48} color="bg-black dark:bg-white" />
      </div>
    );
  }

  // If authenticated, render the child components (the actual page content)
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If not authenticated and not loading (should have been redirected, but return null as fallback)
  return null;
};

export default ProtectedRoute; 