"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet, useSignMessage } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import { toast } from 'react-hot-toast';

// Define the User type based on what the /api/auth/me route returns
// Adjust fields based on your actual Prisma schema select in /api/auth/me
interface User {
  id: string;
  username?: string | null;
  email?: string | null;
  solanaPubKey?: string | null;
  fullName?: string | null;
  // Add potentially returned KYC fields (match the SELECT in /api/auth/me)
  dateOfBirth?: string | null; // Dates are stringified
  phone?: string | null;
  kycVerified?: boolean | null;
  isAdmin?: boolean | null; // Add isAdmin flag
  // Add other relevant fields returned by /api/auth/me if needed
  createdAt: string; // Prisma returns Date, but JSON stringifies it
  updatedAt: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isVerified: boolean;
  isAdmin: boolean; // Add isAdmin flag
  user: User | null;
  isLoading: boolean; // Loading state for initial auth check & actions
  error: string | null; // Store auth-related errors
  clearError: () => void;
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (username: string, email: string | null, pass: string) => Promise<boolean>;
  connectAndLoginWallet: () => Promise<boolean>;
  fetchUserProfile: () => Promise<User | null>; // Renamed for clarity
  updateUserProfile: (profileData: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start loading on mount
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Solana wallet hooks
  const { publicKey, signMessage, connected, disconnect } = useWallet();
  // Note: signMessage might not be available if wallet doesn't support it

  // Derive verification and admin status from user object
  const isVerified = !!user?.kycVerified;
  const isAdmin = !!user?.isAdmin;

  const clearError = () => setError(null);

  // Function to fetch user data (typically after login/refresh)
  const fetchCurrentUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData: User = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
        return userData;
      } else if (response.status === 401) {
        // Not authenticated or token expired
        setIsAuthenticated(false);
        setUser(null);
      } else {
        // Other server error
        setError('Failed to fetch user status.');
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (err) {
      console.error("Fetch current user error:", err);
      setError('Network error checking authentication status.');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
    return null;
  }, []);

  // Check auth status on initial load
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Username/Password Login
  const login = async (username: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: pass }),
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
        setIsLoading(false);
        return true;
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
        setError(errorData.message || 'Invalid username or password.');
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      console.error("Login API error:", err);
      setError('An network error occurred during login.');
      setIsLoading(false);
      return false;
    }
  };

  // Registration
  const register = async (username: string, email: string | null, pass: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      console.log("[AuthContext] Register function called with:", { username, email: email ?? 'N/A', password: '[REDACTED]' });
      try {
          const response = await fetch('/api/auth/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, email, password: pass }),
          });
          console.log("[AuthContext] API response status:", response.status);
          if (response.ok) {
              // Optionally log the user in automatically after registration
              // const loginSuccess = await login(username, pass);
              // return loginSuccess;
              console.log("[AuthContext] Registration API call successful.");
              setIsLoading(false);
              return true; // Indicate registration success
          } else {
              const errorData = await response.json().catch(() => ({ message: 'Registration failed with non-JSON response' }));
              console.error("[AuthContext] Registration API error data:", errorData);
              setError(errorData.message || 'Failed to register user.');
              setIsLoading(false);
              return false;
          }
      } catch (err) {
          console.error("[AuthContext] Register API network/fetch error:", err);
          setError('A network error occurred during registration.');
          setIsLoading(false);
          return false;
      }
  };

  // Solana Wallet Login Process
  const connectAndLoginWallet = async (): Promise<boolean> => {
    if (!connected || !publicKey || !signMessage) {
      setError('Wallet not connected or signMessage not available.');
      // Maybe trigger wallet connection modal here if desired
      console.error('Wallet connection or signMessage needed');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Get challenge (nonce) from backend
      const challengeResponse = await fetch('/api/auth/solana/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ solanaPubKey: publicKey.toBase58() }),
      });

      if (!challengeResponse.ok) {
        throw new Error('Failed to get sign-in challenge from server.');
      }
      const { nonce } = await challengeResponse.json();

      // 2. Prepare message and request signature
      const message = `Please sign this message to verify your identity.\nNonce: ${nonce}`;
      console.log(`[AuthContext] Frontend Login Message to Sign: "${message}"`);
      const messageBytes = new TextEncoder().encode(message);
      const signature = await signMessage(messageBytes); // Request signature

      // 3. Send signature to backend for verification
      const verifyResponse = await fetch('/api/auth/solana/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ solanaPubKey: publicKey.toBase58(), signature: bs58.encode(signature) }), // Send signature as base58 string
      });

      if (verifyResponse.ok) {
        const data = await verifyResponse.json();
        setUser(data.user);
        setIsAuthenticated(true);
        setIsLoading(false);
        return true;
      } else {
        const errorData = await verifyResponse.json().catch(() => ({ message: 'Verification failed' }));
        throw new Error(errorData.message || 'Failed to verify signature.');
      }
    } catch (err: any) {
      console.error("Solana Sign-In Error:", err);
      setError(err.message || 'An error occurred during wallet sign-in.');
      // Optional: Disconnect wallet on sign-in error?
      // await disconnect();
      setIsLoading(false);
      return false;
    }
  };

  // Logout
  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error("Logout API error:", err);
      // Even if API fails, log out on client
    }
    // Disconnect wallet if connected
    if (connected) {
      await disconnect().catch(err => console.error("Wallet disconnect error:", err));
    }
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
    // Optionally redirect to home or login page
    // router.push('/');
  };

  // Fetch detailed user profile
  const fetchUserProfile = async (): Promise<User | null> => {
      setIsLoading(true);
      setError(null);
      try {
          const response = await fetch('/api/profile');
          if (response.ok) {
              const profileData: User = await response.json();
              // Update the user state if needed, though /api/auth/me might suffice
              // setUser(currentUser => currentUser ? { ...currentUser, ...profileData } : null);
              setIsLoading(false);
              return profileData;
          } else {
              const errorData = await response.json().catch(() => ({ message: 'Failed to fetch profile' }));
              setError(errorData.message || 'Could not load profile data.');
              setIsLoading(false);
              return null;
          }
      } catch (err) {
          console.error("Fetch profile error:", err);
          setError('Network error fetching profile.');
          setIsLoading(false);
          return null;
      }
  };

  // Update user profile
  const updateUserProfile = async (profileData: Partial<User>): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
          const response = await fetch('/api/profile', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(profileData),
          });

          const responseData = await response.json(); // Always parse JSON body

          if (response.ok) {
              // --- ADD LOGGING --- 
              console.log("[AuthContext updateUserProfile] API Response OK. Data:", responseData);
              // --- END LOGGING --- 

              const updatedProfile: User = responseData.user; // Extract user data
              // Update local user state with the new profile info
              setUser(currentUser => currentUser ? { ...currentUser, ...updatedProfile } : null);
              setIsLoading(false);

              // Check response message for pending KYC
              if (responseData.message === 'Profile updated. KYC changes submitted for review.') {
                  // Add duration option (e.g., 10 seconds)
                  toast.success('Profile updated. KYC changes submitted for review (2-3 business days).', { duration: 10000 });
              } else {
                  // Assume standard success if message field is missing or different
                  toast.success('Profile updated successfully!'); 
              }
              return true;
          } else {
              // Use error message from response body if available
              setError(responseData.message || 'Could not update profile.');
              setIsLoading(false);
              return false;
          }
      } catch (err) {
          console.error("Update profile error:", err);
          // Handle potential non-JSON errors during fetch or parsing
          setError('Network error or invalid response updating profile.');
          setIsLoading(false);
          return false;
      }
  };


  return (
    <AuthContext.Provider value={{
        isAuthenticated,
        isVerified,
        isAdmin,
        user,
        isLoading,
        error,
        clearError,
        login,
        logout,
        register,
        connectAndLoginWallet,
        fetchUserProfile,
        updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 