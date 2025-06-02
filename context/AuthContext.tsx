"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useConnect, useDisconnect, useSignMessage as useWagmiSignMessage } from 'wagmi';
import { injected } from '@wagmi/connectors';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  username?: string | null;
  email?: string | null;
  evmAddress?: string | null;
  fullName?: string | null;
  dateOfBirth?: string | null; 
  phone?: string | null;
  kycVerified?: boolean | null;
  isAdmin?: boolean | null; 
  createdAt: string; 
  updatedAt: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isVerified: boolean;
  isAdmin: boolean; 
  user: User | null;
  userId: string | null;
  isLoading: boolean; 
  error: string | null; 
  clearError: () => void;
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (username: string, email: string | null, pass: string) => Promise<boolean>;
  connectAndLoginEvmWallet: () => Promise<boolean>;
  fetchUserProfile: () => Promise<User | null>; 
  updateUserProfile: (profileData: Partial<User>) => Promise<boolean>;
  fetchCurrentUser: () => Promise<User | null>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); 
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Wagmi hooks
  const { address: evmAddress, isConnected: isEvmWalletConnected, connector: activeConnector } = useAccount();
  const { signMessageAsync } = useWagmiSignMessage();
  const { connectAsync } = useConnect(); 
  const { disconnectAsync } = useDisconnect(); 

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const isVerified = !!user?.kycVerified;
  const isAdmin = !!user?.isAdmin;

  const clearError = () => setError(null);

  const fetchCurrentUser = useCallback(async () => {
    if (!mounted) {
      return null;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData: User = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
        console.log('[AuthProvider] User loaded successfully:', userData.username);
        return userData;
      } else if (response.status === 401) {
        setIsAuthenticated(false);
        setUser(null);
      } else {
        setError('Failed to fetch user status.');
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (err) {
      console.error("[Fetch current user error:", err);
      setError('Network error checking authentication status.');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
    return null;
  }, [mounted]);

  useEffect(() => {
    if (mounted) {
      fetchCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, [fetchCurrentUser, mounted]);

  const login = async (username: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    console.log("[AuthContext Login] Attempting login for username:", username);
    console.log("[AuthContext Login] Password length:", pass.length); 
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: pass }),
      });
      console.log("[AuthContext Login] API Response Status:", response.status);
      const responseData = await response.json();
      console.log("[AuthContext Login] API Response Data:", responseData);
      if (response.ok) {
        setUser(responseData.user); 
        setIsAuthenticated(true);
        console.log("[AuthContext Login] Login successful for user:", responseData.user?.username, "Is Admin:", responseData.user?.isAdmin);
        if (responseData.user?.isAdmin) {
          console.log("[AuthContext Login] User is identified as Admin.");
        } else {
          console.log("[AuthContext Login] User is NOT identified as Admin.");
        }
        setIsLoading(false);
        return true;
      } else {
        setError(responseData.message || 'Login failed');
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      console.error("[AuthContext Login] Login API network/fetch error:", err);
      let errorMessage = 'A network error occurred during login.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setIsLoading(false);
      return false;
    }
  };

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
        console.log("[AuthContext] Registration API call successful.");
        setIsLoading(false);
        return true; 
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

  const connectAndLoginEvmWallet = async (): Promise<boolean> => {
    if (!mounted) {
      setError('Wallet functionality not available during page load. Please wait and try again.');
      return false;
    }

    if (!isEvmWalletConnected || !evmAddress) {
      setError('EVM Wallet not connected. Please connect your wallet first.');
      console.error('EVM Wallet connection needed');
      return false;
    }

    if (!signMessageAsync) {
      setError('Wallet signing functionality not available. Please refresh the page.');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[AuthContext EVM Login] Requesting challenge nonce for address:', evmAddress);
      const challengeResponse = await fetch('/api/auth/evm/challenge', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: evmAddress }),
      });

      if (!challengeResponse.ok) {
        const errorData = await challengeResponse.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to get EVM login challenge.');
      }
      const { nonce } = await challengeResponse.json();
      console.log('[AuthContext EVM Login] Received nonce:', nonce);

      const messageToSign = `Please sign this message to log in.\nNonce: ${nonce}`;
      console.log(`[AuthContext EVM Login] Frontend Message to Sign: "${messageToSign}"`);
      const signature = await signMessageAsync({ message: messageToSign });
      console.log('[AuthContext EVM Login] Signature obtained:', signature);

      const loginResponse = await fetch('/api/auth/evm/login', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: evmAddress, signature }),
      });

      const loginData = await loginResponse.json();
      if (loginResponse.ok) {
        console.log('[AuthContext EVM Login] Setting user and authentication state...');
        console.log('[AuthContext EVM Login] User data:', loginData.user);
        setUser(loginData.user);
        setIsAuthenticated(true);
        console.log('[AuthContext EVM Login] Authentication state updated - isAuthenticated: true');
        toast.success('Logged in with EVM Wallet successfully!');
        console.log('[AuthContext EVM Login] EVM Wallet login successful for user:', loginData.user?.username);
        setIsLoading(false);
        console.log('[AuthContext EVM Login] Returning true from connectAndLoginEvmWallet');
        return true;
      } else {
        setError(loginData.message || 'EVM Wallet login failed.');
        setIsLoading(false);
        return false;
      }
    } catch (err: any) {
      console.error('[AuthContext EVM Login] EVM Wallet login error:', err);
      setError(err.message || 'An error occurred during EVM wallet login.');
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error("Logout API error:", err);
    }
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
    router.push('/'); 
    toast.success('Logged out successfully.');
  };

  const fetchUserProfile = useCallback(async (): Promise<User | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const profileData: User = await response.json();
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
  }, []);

  const updateUserProfile = async (profileData: Partial<User>): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    let loadingToastId: string | undefined;
    try {
      loadingToastId = toast.loading('Updating profile...');
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      const responseData = await response.json();
      if (response.ok) {
        setUser(responseData.user); 
        toast.success('Profile updated successfully!', { id: loadingToastId });
        setIsLoading(false);
        return true;
      } else {
        setError(responseData.message || 'Failed to update profile.');
        toast.error(responseData.message || 'Failed to update profile.', { id: loadingToastId });
        setIsLoading(false);
        return false;
      }
    } catch (err: any) {
      console.error("Update profile error:", err);
      setError(err.message || 'A network error occurred during profile update.');
      toast.error(err.message || 'A network error occurred.', { id: loadingToastId });
      setIsLoading(false);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isVerified: user?.kycVerified || false,
        isAdmin: user?.isAdmin || false,
        user,
        userId: user?.id || null,
        isLoading,
        error,
        clearError,
        login,
        logout,
        register,
        connectAndLoginEvmWallet, 
        fetchUserProfile,
        updateUserProfile,
        fetchCurrentUser
      }}
    >
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