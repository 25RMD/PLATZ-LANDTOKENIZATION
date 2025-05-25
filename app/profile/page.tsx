"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import PulsingDotsSpinner from '@/components/common/PulsingDotsSpinner';
import AnimatedButton from '@/components/common/AnimatedButton';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import toast from 'react-hot-toast';
import { ProfileUpdateSchema, FieldErrors } from '@/lib/schemas'; 
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi'; 
import { useAccount, useSignMessage } from 'wagmi'; 

import { RegisterSchema } from '@/lib/schemas';
import { z } from 'zod';

interface ProfileFormData {
    username?: string | null;
    email?: string | null;
    evmAddress?: string | null; 
    fullName?: string | null;
    dateOfBirth?: string | null; 
    phone?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    stateProvince?: string | null;
    postalCode?: string | null;
    country?: string | null;
    govIdType?: string | null;
    govIdRef?: string | null;
    sofDocRef?: string | null;
}

const ProfileContent = () => {
  const { user, isVerified, fetchUserProfile, updateUserProfile, error: contextError, clearError: clearContextError, isLoading: actionLoading } = useAuth();
  const { address: connectedEvmAddress, isConnected: isEvmWalletConnected } = useAccount(); 
  const { 
    data, 
    signMessageAsync, 
    isPending: isSigningMessage, 
    isError: isSignMessageError, 
    error: signMessageHookError, 
    status: signMessageStatus 
  } = useSignMessage(); 

  const [profileData, setProfileData] = useState<ProfileFormData>({});
  const [isEditing, setIsEditing] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [formErrors, setFormErrors] = useState<FieldErrors>({});
  const [linkWalletLoading, setLinkWalletLoading] = useState(false);
  const [unlinkWalletLoading, setUnlinkWalletLoading] = useState(false); 
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [setCredsLoading, setSetCredsLoading] = useState(false);
  const [setCredsFormErrors, setSetCredsFormErrors] = useState<FieldErrors>({});

  useEffect(() => {
      if (contextError) {
          toast.error(contextError);
          clearContextError(); 
      }
  }, [contextError, clearContextError]);

  useEffect(() => {
    setPageLoading(true);
    fetchUserProfile().then(data => {
      if (data) {
        const dob = data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : null;

        setProfileData({
          username: data.username,
          email: data.email,
          evmAddress: data.evmAddress, 
          fullName: data.fullName,
          dateOfBirth: dob,
          phone: (data as any).phone, 
          addressLine1: (data as any).addressLine1,
          addressLine2: (data as any).addressLine2,
          city: (data as any).city,
          stateProvince: (data as any).stateProvince,
          postalCode: (data as any).postalCode,
          country: (data as any).country,
          govIdType: (data as any).govIdType,
          govIdRef: (data as any).govIdRef,
          sofDocRef: (data as any).sofDocRef,
        });
      }
      setPageLoading(false);
    });
  }, [fetchUserProfile]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
     if (formErrors[name]) {
         setFormErrors(prev => ({ ...prev, [name]: undefined }));
     }
  };

  const handleLinkWallet = async () => {
    console.log("handleLinkWallet: Function called");
    setLinkWalletLoading(true);
    console.log("[Profile Page] Initiating EVM wallet link...");
    clearContextError();

    if (!isEvmWalletConnected || !connectedEvmAddress) {
      console.error("handleLinkWallet: EVM Wallet not connected or address not available.");
      toast.error("Please connect your EVM wallet first using the button in the header.");
      setLinkWalletLoading(false);
      return;
    }

    let nonce = '';
    try {
      console.log("[Profile Page] Requesting challenge nonce for EVM... Address:", connectedEvmAddress);
      const challengeResponse = await fetch('/api/profile/evm/challenge', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: connectedEvmAddress })
      }); 
      console.log("handleLinkWallet: Challenge response status:", challengeResponse.status);

      if (!challengeResponse.ok) {
        const errorData = await challengeResponse.json().catch(() => ({ message: 'Failed to parse error response' }));
        console.error("handleLinkWallet: Challenge request failed", errorData);
        throw new Error(errorData.message || `Failed to get verification challenge (status: ${challengeResponse.status})`);
      }
      const data = await challengeResponse.json();
      console.log("handleLinkWallet: Challenge data received:", data);
      nonce = data.nonce;
      if (!nonce) {
        console.error("handleLinkWallet: Nonce missing in challenge response");
        throw new Error('Nonce not received from server.');
      }
      console.log("[Profile Page] Received nonce for EVM:", nonce);
    } catch (error: any) {  
      console.error("[Profile Page] Error fetching EVM challenge:", error);
      toast.error(`Error getting challenge: ${error.message}`);
      setLinkWalletLoading(false);
      return;
    }

    let signature: `0x${string}` | undefined = undefined;
    try {
      console.log("[Profile Page] Requesting EVM signature...");
      const messageToSign = `Please sign this message to link your EVM wallet to your profile.\nNonce: ${nonce}`;
      console.log(`[Profile Page] Frontend EVM Message to Sign: "${messageToSign}"`);
      
      console.log("[Profile Page] useAccount state before signing: address:", connectedEvmAddress, "isConnected?", isEvmWalletConnected);
      console.log("[Profile Page] signMessageAsync function type:", typeof signMessageAsync);
      console.log("[Profile Page] useSignMessage hook state BEFORE signing: isLoading?", isSigningMessage, "isError?", isSignMessageError, "error object:", signMessageHookError, "status:", signMessageStatus);
      
      // Add a try/catch specifically for the signMessageAsync call
      try {
        console.log("[Profile Page] ABOUT TO CALL signMessageAsync with message:", messageToSign);
        signature = await signMessageAsync({ message: messageToSign });
        console.log("[Profile Page] AFTER signMessageAsync: Signature received:", signature);
      } catch (signError) {
        console.error("[Profile Page] CAUGHT ERROR directly from signMessageAsync:", signError);
        
        // Fallback: Try direct Ethereum provider if Wagmi hook fails
        if (typeof window !== 'undefined' && window.ethereum) {
          try {
            console.log("[Profile Page] Attempting FALLBACK with direct ethereum provider");
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            console.log("[Profile Page] FALLBACK - Connected accounts:", accounts);
            
            if (accounts && accounts.length > 0) {
              const from = accounts[0];
              console.log("[Profile Page] FALLBACK - Using account:", from);
              
              // Convert message to hex format
              const msgHex = '0x' + Buffer.from(messageToSign).toString('hex');
              console.log("[Profile Page] FALLBACK - Message in hex:", msgHex);
              
              // Call personal_sign method
              const result = await window.ethereum.request({
                method: 'personal_sign',
                params: [msgHex, from, 'PLATZ Authentication'],
              });
              
              console.log("[Profile Page] FALLBACK - Signature result:", result);
              signature = result as `0x${string}`;
              return; // Continue with the outer function
            }
          } catch (fallbackError) {
            console.error("[Profile Page] FALLBACK signing also failed:", fallbackError);
          }
        } else {
          console.error("[Profile Page] No window.ethereum available for fallback");
        }
        
        throw signError; // Re-throw to be caught by outer catch
      }
      
      console.log("[Profile Page] useSignMessage hook state AFTER successful signing: isLoading?", isSigningMessage, "isError?", isSignMessageError, "error object:", signMessageHookError, "status:", signMessageStatus, "data:", data);

    } catch (error: any) {
      console.error("[Profile Page] Error DURING EVM message signing process. Full error object:", error); 
      console.error("[Profile Page] useSignMessage hook state IN CATCH BLOCK: isLoading?", isSigningMessage, "isError?", isSignMessageError, "error object from hook:", signMessageHookError, "status:", signMessageStatus);
      
      let specificErrorMessage = "Signing failed.";
      if (signMessageHookError?.message) {
        specificErrorMessage += ` Details: ${signMessageHookError.message}`;
      } else if (error?.message) {
        specificErrorMessage += ` Details: ${error.message}`;
      } else {
        specificErrorMessage += " An unknown error occurred during signing.";
      }
      toast.error(specificErrorMessage);
      setLinkWalletLoading(false);
      return;
    }

    if (!signature) {
      console.error("[Profile Page] Signature not obtained after signing attempt, stopping wallet link.");
      toast.error("Failed to obtain signature. Please try again.");
      setLinkWalletLoading(false);
      return;
    }

    try {
      console.log("[Profile Page] Sending EVM signature for verification...");
      const linkResponse = await fetch('/api/profile/evm/link-wallet', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: connectedEvmAddress, signature: signature }),
      });
      console.log("handleLinkWallet: Link wallet response status:", linkResponse.status);

      if (!linkResponse.ok) {
        const errorData = await linkResponse.json().catch(() => ({ message: 'Failed to parse error response' }));
        console.error("handleLinkWallet: Link wallet request failed", errorData);
        throw new Error(errorData.message || 'Failed to link EVM wallet.');
      }

      const linkData = await linkResponse.json();
      console.log("handleLinkWallet: Wallet linked successfully:", linkData);
      toast.success('EVM Wallet linked successfully!');
      if (linkData.user && linkData.user.evmAddress) {
        setProfileData(prev => ({...prev, evmAddress: linkData.user.evmAddress }));
      } else {
        const updatedProfile = await fetchUserProfile(); 
        if (updatedProfile) {
          setProfileData(prev => ({...prev, evmAddress: updatedProfile.evmAddress }));
        }
      }
    } catch (error: any) {
      console.error("[Profile Page] Error linking EVM wallet:", error);
      toast.error(`Linking failed: ${error.message}`);
    } finally {
      console.log("handleLinkWallet: Function finished.");
      setLinkWalletLoading(false);
    }
  };

  const handleUnlinkWallet = async () => {
    setUnlinkWalletLoading(true);
    console.log("[Profile Page] Initiating EVM wallet unlink...");
    clearContextError();
    const loadingToastId = toast.loading("Unlinking EVM wallet...");

    try {
      const success = await updateUserProfile({ evmAddress: null }); 

      if (success) {
        toast.success('EVM Wallet unlinked successfully!', { id: loadingToastId });
        const updatedProfile = await fetchUserProfile();
        if (updatedProfile) {
          setProfileData(prev => ({ ...prev, evmAddress: updatedProfile.evmAddress }));
        }
      } else {
        throw new Error(contextError || 'Failed to unlink EVM wallet. Check console for details.');
      }
    } catch (error: any) {
      console.error("[Profile Page] Error unlinking EVM wallet:", error);
      toast.error(`Unlinking failed: ${error.message}`, { id: loadingToastId });
    } finally {
      setUnlinkWalletLoading(false);
    }
  };

  const handleSetCredentials = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setSetCredsFormErrors({}); 
      clearContextError();
      console.log("[Profile Page] Attempting to set credentials...");

      const validationSchema = RegisterSchema.pick({ username: true, password: true }).extend({
          confirmPassword: z.string().min(1, { message: "Please confirm your password" })
      }).refine(data => data.password === data.confirmPassword, {
          message: "Passwords don't match",
          path: ["confirmPassword"], 
      });

      const validationResult = validationSchema.safeParse({
          username: newUsername,
          password: newPassword,
          confirmPassword: confirmNewPassword
      });

      if (!validationResult.success) {
          setSetCredsFormErrors(validationResult.error.flatten().fieldErrors);
          toast.error("Please fix the errors in the form.");
          return;
      }

      setSetCredsLoading(true);
      const loadingToastId = toast.loading("Setting credentials...");
      try {
          const response = await fetch('/api/profile/set-credentials', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  username: validationResult.data.username,
                  password: validationResult.data.password
              }),
          });
          const data = await response.json();
          if (!response.ok) {
              throw new Error(data.message || 'Failed to set credentials.');
          }
          toast.success('Credentials set successfully!');
          setNewUsername('');
          setNewPassword('');
          setConfirmNewPassword('');
          await fetchUserProfile(); 
      } catch (error: any) {
          console.error("[Profile Page] Error setting credentials:", error);
          toast.error(`Failed: ${error.message}`);
      } finally {
          setSetCredsLoading(false);
          toast.dismiss(loadingToastId);
      }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormErrors({}); 
    clearContextError();
    console.log("[Profile Page] Attempting to update profile with data:", profileData);

    const validationResult = ProfileUpdateSchema.safeParse(profileData);

    if (!validationResult.success) {
        const newErrors: FieldErrors = {};
        validationResult.error.errors.forEach(err => {
            if (err.path.length > 0) {
                newErrors[String(err.path[0])] = [err.message]; 
            }
        });
        setFormErrors(newErrors);
        toast.error("Please correct the errors in the form.");
        return;
    }
        
    const dataToSend = { ...validationResult.data };
    if (profileData.evmAddress) {
        (dataToSend as any).evmAddress = profileData.evmAddress;
    } else {
        delete (dataToSend as any).evmAddress; 
    }

    try {
        const success = await updateUserProfile(dataToSend as ProfileFormData);
        if (success) {
            toast.success('Profile updated successfully!');
            setIsEditing(false);
            await fetchUserProfile(); 
        } else {
            toast.error(contextError || 'Failed to update profile.');
        }
    } catch (err: any) {
        console.error("[Profile Page] Error calling updateUserProfile:", err);
        toast.error(err.message || 'An unexpected error occurred during update.');
    }
  };

  const renderField = (label: string, name: keyof ProfileFormData, type: string = 'text', disabled: boolean = false, options?: {value: string, label: string}[]) => {
    const hasError = !!formErrors[name];
    const isDisabled = disabled || !isEditing || actionLoading;
    const commonClasses = `w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-secondary-light dark:bg-zinc-800 text-text-light dark:text-text-dark placeholder-gray-400 dark:placeholder-gray-500 transition-colors duration-150`;
    const errorClasses = hasError ? 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400' : 'border-gray-300 dark:border-zinc-700 focus:border-transparent dark:focus:border-transparent';
    const disabledClasses = isDisabled ? 'opacity-70 bg-gray-100 dark:bg-zinc-700 cursor-not-allowed' : '';

    return (
      <div className="mb-4">
        <label htmlFor={name} className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
          {label}
        </label>
        {type === 'select' && options ? (
            <select
                id={name}
                name={name}
                value={profileData[name] ?? ''}
                onChange={handleInputChange as any} 
                disabled={isDisabled}
                className={`${commonClasses} ${errorClasses} ${disabledClasses} appearance-none`}
            >
                 <option value="" disabled={!isEditing}>-- Select {label} --</option>
                 {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                 ))}
            </select>
        ) : (
            <input
              type={type}
              id={name}
              name={name}
              value={profileData[name] ?? ''}
              onChange={handleInputChange}
              disabled={isDisabled}
              className={`${commonClasses} ${errorClasses} ${disabledClasses}`}
            />
        )}
        {hasError && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{formErrors[name]?.[0]}</p>}
      </div>
    );
  };

  const inputClasses = (hasError: boolean) =>
      `w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-secondary-light dark:bg-zinc-800 text-text-light dark:text-text-dark placeholder-gray-400 dark:placeholder-gray-500 transition-colors duration-150 ${
        hasError
          ? 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400'
          : 'border-gray-300 dark:border-zinc-700 focus:border-transparent dark:focus:border-transparent'
      }`;

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <PulsingDotsSpinner size={48} color="bg-black dark:bg-white" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto mt-12 mb-12 p-8 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-xl bg-primary-light dark:bg-card-dark"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
              <h1 className="text-3xl font-semibold text-text-light dark:text-text-dark mb-4 sm:mb-0">
                User Profile
              </h1>
               {/* Verification Status Badge */}
               <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${isVerified
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                }`}>
                  {isVerified ? <FiCheckCircle className="w-3 h-3"/> : <FiAlertCircle className="w-3 h-3"/>}
                  {isVerified ? 'Verified' : 'Not Verified'}
               </div>
          </div>
           <AnimatedButton
             onClick={() => {
                 setIsEditing(!isEditing);
                 if (isEditing) setFormErrors({}); 
             }}
             className={`px-5 py-2 text-sm rounded-lg border transition-colors duration-150 ${isEditing
                ? 'bg-gray-200 dark:bg-zinc-700 border-gray-400 dark:border-zinc-600 text-text-light dark:text-text-dark hover:bg-gray-300 dark:hover:bg-zinc-600'
                : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
              }`}
            >
             {isEditing ? 'Cancel Edit' : 'Edit Profile'}
           </AnimatedButton>
      </div>

      {/* Guidance for unverified users */} 
      {!isVerified && !isEditing && (
         <div className="mb-6 p-4 border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-sm text-blue-700 dark:text-blue-200">
             <p className="font-medium mb-1">Verification Required for Listings</p>
             <p>To create property listings, please complete your profile and submit KYC documents (references). Verification is typically processed within 1-2 business days.</p>
             {/* Optionally link to a dedicated KYC/Document Upload page */} 
             {/* <Link href="/kyc-upload" className="font-medium underline mt-1 inline-block">Upload Documents Now</Link> */}
         </div>
      )}

      <div className="space-y-1">
        {/* Section 1: Basic Info (Non-Editable) */}
        <h2 className="text-xl font-medium text-text-light dark:text-text-dark pt-2 pb-3 border-b border-gray-300 dark:border-zinc-700 mb-4">
             Account Information
         </h2>
        {renderField('Username', 'username', 'text', true)}
        {renderField('EVM Wallet', 'evmAddress', 'text', true)}

        {/* EVM Wallet Section */}
        <div className="mb-6 p-4 border border-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-primary-accent">EVM Wallet</h3>
          {profileData.evmAddress ? (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <p className="text-gray-300 break-all">
                Linked Address: <span className="font-mono text-secondary-accent">{profileData.evmAddress}</span>
              </p>
              <AnimatedButton 
                onClick={handleUnlinkWallet}
                disabled={unlinkWalletLoading || actionLoading}
                className="mt-2 sm:mt-0 sm:ml-4 bg-red-600 hover:bg-red-700 text-white"
              >
                Unlink EVM Wallet
              </AnimatedButton>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <p className="text-gray-400">No EVM wallet linked.</p>
              <AnimatedButton 
                onClick={handleLinkWallet}
                disabled={!isEvmWalletConnected || linkWalletLoading || actionLoading}
                className="mt-2 sm:mt-0 sm:ml-4"
              >
                Link EVM Wallet
              </AnimatedButton>
            </div>
          )}
          {!isEvmWalletConnected && !profileData.evmAddress && (
              <p className="text-sm text-yellow-500 mt-2">Please connect your wallet (in the header) to link it.</p>
          )}
        </div>

        {/* Section/Form to Set Credentials (shown if no username/password) */}
        {!profileData.username && profileData.evmAddress && (
             <div className="mt-6 pt-6 border-t border-gray-300 dark:border-zinc-700">
                <h2 className="text-xl font-medium text-text-light dark:text-text-dark mb-4">
                    Set Username & Password
                </h2>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">You logged in with your wallet. Set a username and password for an alternative login method.</p>
                 
                 {/* --- Add Set Credentials Form --- */}
                 <form onSubmit={handleSetCredentials} className="space-y-4 max-w-sm">
                     {/* New Username Field */}
                     <div>
                         <label htmlFor="newUsername" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                             Choose Username <span className="text-red-500">*</span>
                         </label>
                         <input
                             id="newUsername"
                             name="newUsername"
                             type="text"
                             required
                             className={inputClasses(!!setCredsFormErrors.username)} 
                             value={newUsername}
                             onChange={(e) => {
                                 setNewUsername(e.target.value);
                                 if (setCredsFormErrors.username) setSetCredsFormErrors(p => ({...p, username: undefined}));
                             }}
                             placeholder="Create a username"
                         />
                         {setCredsFormErrors.username && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{setCredsFormErrors.username[0]}</p>}
                     </div>
                     {/* New Password Field */}
                     <div>
                         <label htmlFor="newPassword" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                             Create Password <span className="text-red-500">*</span>
                         </label>
                         <input
                             id="newPassword"
                             name="newPassword"
                             type="password"
                             required
                             className={inputClasses(!!setCredsFormErrors.password)}
                             value={newPassword}
                             onChange={(e) => {
                                 setNewPassword(e.target.value);
                                 if (setCredsFormErrors.password) setSetCredsFormErrors(p => ({...p, password: undefined}));
                             }}
                             placeholder="Min. 8 characters"
                         />
                         {setCredsFormErrors.password && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{setCredsFormErrors.password[0]}</p>}
                     </div>
                     {/* Confirm New Password Field */}
                     <div>
                         <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                             Confirm Password <span className="text-red-500">*</span>
                         </label>
                         <input
                             id="confirmNewPassword"
                             name="confirmNewPassword"
                             type="password"
                             required
                             className={inputClasses(!!setCredsFormErrors.confirmPassword)}
                             value={confirmNewPassword}
                             onChange={(e) => {
                                 setConfirmNewPassword(e.target.value);
                                 if (setCredsFormErrors.confirmPassword) setSetCredsFormErrors(p => ({...p, confirmPassword: undefined}));
                             }}
                             placeholder="Re-enter password"
                         />
                         {setCredsFormErrors.confirmPassword && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{setCredsFormErrors.confirmPassword[0]}</p>}
                     </div>
                     {/* Submit Button */}
                     <div>
                         <AnimatedButton type="submit" disabled={setCredsLoading || actionLoading}>
                             {setCredsLoading ? 'Setting Credentials...' : 'Set Credentials'}
                         </AnimatedButton>
                     </div>
                 </form>
                 {/* --- END Set Credentials Form --- */}
             </div>
        )}

        {/* Wrap editable sections in a form */}
        <form onSubmit={handleSubmit}>
          {/* Section 2: Personal Details (Editable) */}
           <h2 className="text-xl font-medium text-text-light dark:text-text-dark pt-5 pb-3 border-b border-gray-300 dark:border-zinc-700 mb-4">
               Personal Details
           </h2>
          {renderField('Full Legal Name', 'fullName', 'text')}
          {renderField('Date of Birth', 'dateOfBirth', 'date')} 
          {renderField('Email', 'email', 'email')}
          {renderField('Phone Number', 'phone', 'tel')} 

           {/* Section 3: Address (Editable) */}
           <h2 className="text-xl font-medium text-text-light dark:text-text-dark pt-5 pb-3 border-b border-gray-300 dark:border-zinc-700 mb-4">
               Residential / Business Address
           </h2>
          {renderField('Address Line 1', 'addressLine1')}
          {renderField('Address Line 2', 'addressLine2')}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
              {renderField('City', 'city')}
              {renderField('State/Province', 'stateProvince')}
              {renderField('Postal Code', 'postalCode')}
          </div>
          {renderField('Country', 'country')}

          {/* Section 4: Documents (Editable References) */}
           <h2 className="text-xl font-medium text-text-light dark:text-text-dark pt-5 pb-3 border-b border-gray-300 dark:border-zinc-700 mb-4">
               KYC Documents (References)
           </h2>
           <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Provide references (e.g., file IDs, secure links) to your uploaded documents. Actual document upload requires a separate process.</p>
           {/* Example Select for ID Type */}
           {renderField('Government ID Type', 'govIdType', 'select', false, [
               {value: 'passport', label: 'Passport'},
               {value: 'drivers_license', label: "Driver's License"},
               {value: 'national_id', label: 'National ID Card'},
               // Add other relevant types
           ])}
           {renderField('Government ID Reference', 'govIdRef', 'text')}
           {renderField('Source of Funds Document Reference', 'sofDocRef', 'text')}

          {isEditing && (
            <div className="pt-6 text-right border-t border-gray-300 dark:border-zinc-700 mt-8">
               <AnimatedButton
                 type="submit" 
                 disabled={actionLoading || !isEditing}
                 className="inline-flex justify-center py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60"
               >
                 {actionLoading ? 'Saving...' : 'Save Changes'}
               </AnimatedButton>
            </div>
          )}
        </form> 
      </div>
    </motion.div>
  );
};

const ProfilePage = () => {
    return (
        <ProtectedRoute>
            <ProfileContent />
        </ProtectedRoute>
    );
};

export default ProfilePage; 