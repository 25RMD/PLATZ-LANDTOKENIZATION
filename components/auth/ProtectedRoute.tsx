"use client";

import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PulsingDotsSpinner from '@/components/common/PulsingDotsSpinner';
import { motion } from 'framer-motion';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoading, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [redirectDelay, setRedirectDelay] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Add a shorter timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading && !isAuthenticated) {
        console.log('ProtectedRoute: Loading timeout reached, assuming not authenticated');
        setLoadingTimeout(true);
      }
    }, 1500); // Reduced from 3000ms to 1500ms for faster response

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    console.log('ProtectedRoute useEffect triggered:', {
      isLoading,
      isAuthenticated,
      hasUser: !!user,
      userDetails: user ? { id: user.id, username: user.username, evmAddress: user.evmAddress } : null,
      redirectDelay,
      loadingTimeout
    });

    // If clearly not authenticated (not loading and no auth), show login prompt immediately
    if (!isLoading && !isAuthenticated && !redirectDelay && !loadingTimeout) {
      console.log('ProtectedRoute: User clearly not authenticated, showing login prompt');
      setLoadingTimeout(true);
      return;
    }

    // Add a small delay before redirecting to avoid race conditions
    // especially after EVM wallet login
    if ((!isLoading || loadingTimeout) && !isAuthenticated && !redirectDelay) {
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
      }, 500); // Reduced from 1000ms to 500ms for faster response

      return () => clearTimeout(timeoutId);
    } else if (!isLoading && isAuthenticated) {
      console.log('ProtectedRoute: User is authenticated, allowing access to protected content');
      setRedirectDelay(false);
      setLoadingTimeout(false);
    }
  }, [isLoading, isAuthenticated, router, user, redirectDelay, loadingTimeout]);

  // Show loading spinner only for a very short time
  if (isLoading && !loadingTimeout && !redirectDelay) {
    console.log('ProtectedRoute: Showing loading spinner - isLoading:', isLoading, 'redirectDelay:', redirectDelay);
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <PulsingDotsSpinner size={48} color="bg-black dark:bg-white" />
      </div>
    );
  }

  // If loading timed out or clearly not authenticated, show cyber-themed login prompt
  if (loadingTimeout || (!isLoading && !isAuthenticated && !redirectDelay)) {
    console.log('ProtectedRoute: Showing login prompt - loadingTimeout:', loadingTimeout, 'isAuthenticated:', isAuthenticated);
    return (
      <div className="min-h-[calc(100vh-80px)] sm:min-h-[calc(100vh-96px)] bg-white dark:bg-black relative overflow-hidden flex items-center justify-center">
        {/* Cyber background effects */}
        <motion.div
          className="fixed inset-0 pointer-events-none z-0"
          animate={{
            background: [
              "radial-gradient(circle at 20% 20%, rgba(0, 0, 0, 0.05) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 80%, rgba(0, 0, 0, 0.03) 0%, transparent 50%)",
              "radial-gradient(circle at 40% 60%, rgba(0, 0, 0, 0.04) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 20%, rgba(0, 0, 0, 0.05) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Cyber grid pattern */}
        <motion.div
          className="fixed inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none z-0"
          animate={{
            backgroundPosition: ["0px 0px", "50px 50px"],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '25px 25px'
          }}
        />

        {/* Main content */}
        <motion.div 
          className="relative z-10 max-w-md mx-auto px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="border border-black/20 dark:border-white/20 rounded-cyber-lg bg-white/95 dark:bg-black/95 backdrop-blur-cyber p-8 text-center">
            {/* Minimalistic lock icon */}
            <motion.div 
              className="mb-6 flex justify-center"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="w-16 h-16 border-2 border-black/30 dark:border-white/30 rounded-cyber flex items-center justify-center">
                <svg 
                  className="w-8 h-8 text-black dark:text-white" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" 
                  />
                </svg>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h2 
              className="text-2xl font-mono uppercase tracking-wider text-black dark:text-white mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              ACCESS_DENIED
            </motion.h2>

            {/* Message */}
            <motion.p 
              className="text-black/70 dark:text-white/70 mb-8 font-mono text-sm leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              AUTHENTICATION REQUIRED<br />
              TO ACCESS CREATION MODULE
            </motion.p>

            {/* Action buttons */}
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <button
                onClick={() => router.push('/login')}
                className="w-full px-6 py-3 bg-black dark:bg-white text-white dark:text-black border border-black dark:border-white hover:bg-black/90 dark:hover:bg-white/90 rounded-cyber font-mono uppercase tracking-wider text-sm transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                AUTHENTICATE
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full px-6 py-3 border border-black/30 dark:border-white/30 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-cyber font-mono uppercase tracking-wider text-sm transition-all duration-300"
              >
                RETURN_HOME
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  // If authenticated, render the child components (the actual page content)
  if (isAuthenticated) {
    console.log('ProtectedRoute: Rendering protected content for authenticated user');
    return <>{children}</>;
  }

  // Fallback
  console.log('ProtectedRoute: Returning null as fallback');
  return null;
}