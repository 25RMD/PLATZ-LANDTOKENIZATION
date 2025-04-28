"use client";

import React, { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import AnimatedButton from '@/components/common/AnimatedButton';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'; // Wallet connect button
import { useWallet } from '@solana/wallet-adapter-react';
import { FaWallet } from 'react-icons/fa'; // Icon for wallet button
import toast from 'react-hot-toast'; // Import toast
import { LoginSchema, FieldErrors } from '@/lib/schemas'; // Import schema and error type

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { user, login, connectAndLoginWallet, isLoading, error: contextError, clearError: clearContextError, isAuthenticated } = useAuth();
  const [formErrors, setFormErrors] = useState<FieldErrors>({}); // State for validation errors
  const { connected, publicKey } = useWallet(); // Get wallet connection status
  const router = useRouter();

  // Display context error toast when it changes
  useEffect(() => {
    if (contextError) {
      toast.error(contextError);
      clearContextError(); // Clear error after displaying
    }
  }, [contextError, clearContextError]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.isAdmin) {
        console.log("Login: Detected admin, redirecting to /admin/dashboard");
        router.push('/admin/dashboard');
      } else {
        console.log("Login: Detected regular user, redirecting to /profile");
        router.push('/profile');
      }
    }
  }, [isAuthenticated, user, router]);

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormErrors({}); // Clear previous form errors
    // clearContextError(); // Handled by useEffect

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
    // clearContextError(); // Handled by useEffect
    if (!connected || !publicKey) {
      toast.error('Please connect your Solana wallet first using the button above.');
      console.error('Wallet not connected for login attempt');
      return;
    }
    const loadingToastId = toast.loading("Requesting signature...");
    const success = await connectAndLoginWallet();
    toast.dismiss(loadingToastId);
    if (!success) {
      console.error("Wallet sign-in failed (toast displayed by context)");
    }
  };

  // Helper for input classes (same as signup)
  const inputClasses = (hasError: boolean) =>
    `w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-secondary-light dark:bg-zinc-800 text-text-light dark:text-text-dark placeholder-gray-400 dark:placeholder-gray-500 transition-colors duration-150 ${
      hasError
        ? 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400'
        : 'border-gray-300 dark:border-zinc-700 focus:border-transparent dark:focus:border-transparent'
    }`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto mt-12 mb-12 p-8 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-xl bg-primary-light dark:bg-card-dark"
    >
      <h1 className="text-3xl font-semibold text-center text-text-light dark:text-text-dark mb-8">
        Log In
      </h1>

      {/* Username/Password Form */}
      <form onSubmit={handleLoginSubmit} className="space-y-6">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
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
          {formErrors.username && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{formErrors.username[0]}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={inputClasses(!!formErrors.password)}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
          {formErrors.password && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{formErrors.password[0]}</p>}
           {/* Add Forgot Password link if needed */}
           {/* <div className="text-right mt-1"> <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">Forgot password?</Link> </div> */}
        </div>

        <div>
           {/* Use primary button style consistent with site */}
          <AnimatedButton
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60"
          >
            {isLoading ? 'Logging In...' : 'Log In'}
          </AnimatedButton>
        </div>
      </form>

      {/* Divider */}
      <div className="my-8 relative flex items-center justify-center">
         <div className="absolute inset-0 flex items-center" aria-hidden="true">
             <div className="w-full border-t border-gray-300 dark:border-zinc-700" />
         </div>
        <span className="relative px-3 text-sm font-medium text-gray-500 dark:text-gray-400 bg-primary-light dark:bg-card-dark">
            OR
        </span>
      </div>

       {/* Solana Wallet Login Section */}
      <div className="space-y-4">
         <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            Connect and sign in with your Solana wallet.
         </p>
         {/* Button to connect/disconnect wallet (uses wallet-adapter-react-ui styles) */}
         <div className="flex justify-center">
             {/* Apply custom styling or keep default wallet adapter styles */}
             <WalletMultiButton />
         </div>
          {/* Button to trigger sign-in message (only visible if connected) */}
         {connected && (
             <AnimatedButton
                onClick={handleWalletLogin}
                disabled={isLoading || !publicKey} // Disable if auth loading or no public key
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-60"
            >
                 <FaWallet className="w-4 h-4"/>
                 {isLoading ? 'Verifying...' : 'Sign In with Wallet'}
             </AnimatedButton>
         )}
      </div>

      {/* Link to Sign Up */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Don't have an account?{' '}
          <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2">
            Sign Up
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default LoginPage; 