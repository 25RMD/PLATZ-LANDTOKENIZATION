"use client";

import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PulsingDotsSpinner from '@/components/common/PulsingDotsSpinner';
import LoginPrompt from './LoginPrompt'; // Added import for LoginPrompt

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  // Removed router and redirectDelay state and useEffect as we are no longer redirecting from here.

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

  // If not authenticated and not loading, show the LoginPrompt component
  console.log('ProtectedRoute: User not authenticated, showing LoginPrompt');
  return <LoginPrompt />;
};

export default ProtectedRoute; 