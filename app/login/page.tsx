"use client";

import React, { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import AnimatedButton from '@/components/common/AnimatedButton';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { FaWallet, FaEye, FaEyeSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { LoginSchema, FieldErrors } from '@/lib/schemas';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { 
    user, 
    login, 
    isLoading, 
    error: contextError, 
    clearError: clearContextError, 
    isAuthenticated, 
    connectAndLoginEvmWallet, 
    fetchCurrentUser 
  } = useAuth();
  const [formErrors, setFormErrors] = useState<FieldErrors>({});
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  // Display context error toast when it changes
  useEffect(() => {
    if (contextError) {
      toast.error(contextError);
      clearContextError();
    }
  }, [contextError, clearContextError]);

  // Redirect if already authenticated when page loads
  useEffect(() => {
    if (isAuthenticated && user && !hasRedirected && !isLoading) {
      setHasRedirected(true);
      
      if (user.isAdmin) {
        router.push('/admin/dashboard');
      } else {
        router.push('/profile');
      }
    }
  }, [isAuthenticated, user, router, hasRedirected, isLoading]);

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Frontend Validation
    const validationResult = LoginSchema.safeParse({ username, password });

    if (!validationResult.success) {
      setFormErrors(validationResult.error.flatten().fieldErrors);
      return;
    }

    // Validation passed
    const loadingToastId = toast.loading("Logging in...");
    const success = await login(validationResult.data.username, validationResult.data.password);
    toast.dismiss(loadingToastId);
    if (!success) {
      console.error("Login failed (toast displayed by context)");
    }
  };

  const handleWalletLogin = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your EVM wallet first using the button below.');
      console.error('EVM Wallet not connected for login attempt');
      return;
    }
    
    console.log("Starting EVM wallet login process...");
    const loadingToastId = toast.loading("Requesting signature...");
    
    try {
      const success = await connectAndLoginEvmWallet();
      toast.dismiss(loadingToastId);
      
      if (success) {
        console.log("EVM Wallet login successful, refreshing authentication state...");
        
        // Wait for state to update properly
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Force a fresh authentication state fetch
        const refreshedUser = await fetchCurrentUser();
        
        if (refreshedUser) {
          console.log("Authentication state refreshed, setting redirect flag...");
          setHasRedirected(true);
          
          // Use a more reliable redirect mechanism
          if (refreshedUser.isAdmin) {
            console.log("EVM Wallet login: Detected admin, redirecting to /admin/dashboard");
            window.location.href = '/admin/dashboard';
          } else {
            console.log("EVM Wallet login: Detected regular user, redirecting to /profile");
            window.location.href = '/profile';
          }
        } else {
          console.error("Failed to refresh user data after EVM wallet login");
          toast.error("Login successful but failed to load user data. Please refresh the page.");
        }
      } else {
        console.error("EVM Wallet sign-in failed (toast displayed by context)");
      }
    } catch (error) {
    toast.dismiss(loadingToastId);
      console.error("Error during EVM wallet login:", error);
    }
  };

  // Helper for input classes with consistent styling
  const inputClasses = (hasError: boolean) =>
    `w-full px-4 py-3 border rounded-cyber-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 bg-white dark:bg-primary-dark text-text-light dark:text-text-dark placeholder-text-light/60 dark:placeholder-text-dark/60 transition-all duration-200 ${
      hasError
        ? 'border-red-500 dark:border-red-400 focus:ring-red-500/20 dark:focus:ring-red-400/20'
        : 'border-black/20 dark:border-white/20 hover:border-black/30 dark:hover:border-white/30'
    }`;

  return (
    <div className="min-h-[calc(100vh-80px)] sm:min-h-[calc(100vh-96px)] bg-gray-50 dark:bg-primary-dark">
      {/* Background cyber grid pattern */}
      <div className="fixed inset-0 cyber-grid opacity-30 dark:opacity-20 pointer-events-none" />
      
      <div className="relative z-10 container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full"
        >
          {/* Login Card */}
          <div className="p-8 sm:p-10 border border-black/20 dark:border-white/20 rounded-cyber-xl shadow-2xl bg-white/95 dark:bg-primary-dark/95 backdrop-blur-cyber">
            <motion.h1 
              className="text-3xl sm:text-4xl font-bold text-center text-text-light dark:text-text-dark mb-8 font-mono uppercase tracking-wider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                textShadow: "0 0 20px rgba(0, 0, 0, 0.3)",
              }}
            >
              LOGIN
            </motion.h1>

      {/* Username/Password Form */}
            <motion.form 
              onSubmit={handleLoginSubmit} 
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
        <div>
                <label htmlFor="username" className="block text-sm font-medium text-text-light/80 dark:text-text-dark/80 mb-2 font-mono uppercase tracking-wide">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            className={inputClasses(!!formErrors.username)}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
                {formErrors.username && (
                  <motion.p 
                    className="mt-2 text-sm text-red-500 dark:text-red-400 font-mono"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {formErrors.username[0]}
                  </motion.p>
                )}
        </div>

        <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-light/80 dark:text-text-dark/80 mb-2 font-mono uppercase tracking-wide">
            Password
          </label>
                <div className="relative">
          <input
            id="password"
            name="password"
                    type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className={inputClasses(!!formErrors.password)}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-light/60 dark:text-text-dark/60 hover:text-text-light dark:hover:text-text-dark transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-4 w-4" />
                    ) : (
                      <FaEye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {formErrors.password && (
                  <motion.p 
                    className="mt-2 text-sm text-red-500 dark:text-red-400 font-mono"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {formErrors.password[0]}
                  </motion.p>
                )}
        </div>

        <div>
          <AnimatedButton
            type="submit"
            disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-cyber-lg shadow-sm text-sm font-bold text-white bg-black hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black/20 dark:focus:ring-white/20 disabled:opacity-60 transition-all duration-200 font-mono uppercase tracking-wider"
          >
                  {isLoading ? 'ACCESSING...' : 'INITIALIZE LOGIN'}
          </AnimatedButton>
        </div>
            </motion.form>

      {/* Divider */}
            <motion.div 
              className="my-8 relative flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
         <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-black/20 dark:border-white/20" />
         </div>
              <span className="relative px-4 text-sm font-medium text-text-light/60 dark:text-text-dark/60 bg-white dark:bg-primary-dark font-mono uppercase tracking-wider">
            OR
        </span>
            </motion.div>

            {/* EVM Wallet Login Section */}
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <p className="text-sm text-center text-text-light/70 dark:text-text-dark/70 font-mono">
                Connect and authenticate with your EVM wallet
              </p>
              
              {!isConnected ? (
                <AnimatedButton
                  onClick={() => connect({ connector: connectors[0] })}
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-black/20 dark:border-white/20 rounded-cyber-lg shadow-sm text-sm font-medium text-text-light dark:text-text-dark hover:bg-black/5 dark:hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black/20 dark:focus:ring-white/20 disabled:opacity-60 transition-all duration-200 font-mono uppercase tracking-wide"
                >
                  <FaWallet className="w-4 h-4"/>
                  Connect Wallet
                </AnimatedButton>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-center p-3 border border-black/20 dark:border-white/20 rounded-cyber-lg bg-gray-50 dark:bg-primary-dark/50">
                    <FaWallet className="text-text-light dark:text-text-dark mr-2" />
                    <span className="text-sm text-text-light dark:text-text-dark font-mono">
                      {address?.slice(0,6)}...{address?.slice(-4)}
                    </span>
         </div>
             <AnimatedButton
                onClick={handleWalletLogin}
                    disabled={isLoading}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-cyber-lg shadow-sm text-sm font-bold text-white bg-black hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black/20 dark:focus:ring-white/20 disabled:opacity-60 transition-all duration-200 font-mono uppercase tracking-wider"
            >
                 <FaWallet className="w-4 h-4"/>
                    {isLoading ? 'VERIFYING...' : 'AUTHENTICATE WALLET'}
             </AnimatedButton>
      </div>
              )}
            </motion.div>

      {/* Link to Sign Up */}
            <motion.div 
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
            >
              <p className="text-sm text-text-light/60 dark:text-text-dark/60 font-mono">
                Need access credentials?{' '}
                <Link 
                  href="/signup" 
                  className="font-medium text-black dark:text-white hover:text-black/80 dark:hover:text-white/80 underline underline-offset-2 font-mono uppercase tracking-wide transition-colors"
                >
                  Register Here
          </Link>
        </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage; 