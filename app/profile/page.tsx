"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import AnimatedButton from '@/components/common/AnimatedButton';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import toast from 'react-hot-toast';
import { ProfileUpdateSchema, FieldErrors } from '@/lib/schemas';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi'; // Icons for status
import { useWallet } from '@solana/wallet-adapter-react'; // Import wallet hooks
import bs58 from 'bs58'; // For encoding the signature
import { RegisterSchema } from '@/lib/schemas';
import { z } from 'zod';

// Update interface to include all fields from schema
interface ProfileFormData {
    username?: string | null;
    email?: string | null;
    solanaPubKey?: string | null;
    fullName?: string | null;
    dateOfBirth?: string | null; // Use string for date input type
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

// This component now renders the actual profile content
const ProfileContent = () => {
  const { user, isVerified, fetchUserProfile, updateUserProfile, error: contextError, clearError: clearContextError, isLoading: actionLoading } = useAuth();
  const { publicKey, connected, connect, signMessage } = useWallet(); // Get wallet state and functions
  const [profileData, setProfileData] = useState<ProfileFormData>({});
  const [isEditing, setIsEditing] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [formErrors, setFormErrors] = useState<FieldErrors>({});
  const [linkWalletLoading, setLinkWalletLoading] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [setCredsLoading, setSetCredsLoading] = useState(false);
  const [setCredsFormErrors, setSetCredsFormErrors] = useState<FieldErrors>({});

  // Display context error toast when context error changes
  useEffect(() => {
      if (contextError) {
          toast.error(contextError);
          clearContextError(); // Clear error after displaying
      }
  }, [contextError, clearContextError]);

  // Fetch profile data on load (user guaranteed to be authenticated here)
  useEffect(() => {
    setPageLoading(true);
    fetchUserProfile().then(data => {
      if (data) {
        // Format date for input type='date' (YYYY-MM-DD)
        const dob = data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : null;

        setProfileData({
          username: data.username,
          email: data.email,
          solanaPubKey: data.solanaPubKey,
          fullName: data.fullName,
          dateOfBirth: dob,
          phone: (data as any).phone, // Cast if needed based on API return
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
     // Clear error for the field being edited
     if (formErrors[name]) {
         setFormErrors(prev => ({ ...prev, [name]: undefined }));
     }
  };

  // --- Wallet Linking Handler --- 
  const handleLinkWallet = async () => {
      setLinkWalletLoading(true);
      console.log("[Profile Page] Initiating wallet link...");
      clearContextError(); // Clear previous context errors

      // 1. Ensure wallet is connected
      if (!connected) {
          try {
              await connect(); // Prompt connection if not connected
              // Note: We might need to wait briefly for publicKey to be available after connect?
              // Or rely on the user clicking the button *again* after connecting.
              // For simplicity, let's assume connect() makes publicKey available shortly.
              toast("Wallet connected. Please click Link Wallet again to sign.", { icon: 'ℹ️' });
              setLinkWalletLoading(false);
              return;
          } catch (error) {
              console.error("[Profile Page] Wallet connection error:", error);
              toast.error("Failed to connect wallet. Please try again.");
              setLinkWalletLoading(false);
              return;
          }
      }

      // 2. Check if publicKey is available AND wallet supports signing
      if (!publicKey || !signMessage) {
          toast.error('Wallet key not available or wallet does not support signing. Please try connecting again.');
          setLinkWalletLoading(false);
          return;
      }

      // 3. Request challenge nonce from the new profile challenge endpoint
      let nonce = '';
      try {
          console.log("[Profile Page] Requesting challenge nonce...");
          const challengeResponse = await fetch('/api/profile/challenge', { method: 'GET' });
          if (!challengeResponse.ok) {
              const errorData = await challengeResponse.json().catch(() => ({}));
              throw new Error(errorData.message || 'Failed to get verification challenge.');
          }
          const data = await challengeResponse.json();
          nonce = data.nonce;
          console.log("[Profile Page] Received nonce:", nonce);
      } catch (error: any) {  
          console.error("[Profile Page] Error fetching challenge:", error);
          toast.error(`Error getting challenge: ${error.message}`);
          setLinkWalletLoading(false);
          return;
      }

      // 4. Request signature
      let signature: Uint8Array | undefined = undefined;
      try {
          console.log("[Profile Page] Requesting signature...");
          const message = `Please sign this message to link your wallet.\nNonce: ${nonce}`;
          console.log(`[Profile Page] Frontend Message to Sign: "${message}"`);
          const messageBytes = new TextEncoder().encode(message);
          // Ensure signMessage is available before calling
          if (!signMessage) throw new Error('Signing not supported by wallet.'); 
          signature = await signMessage(messageBytes);
          console.log("[Profile Page] Signature received.");
      } catch (error: any) {
          console.error("[Profile Page] Error signing message:", error);
          toast.error(`Signing failed: ${error.message || 'User rejected the request.'}`);
          setLinkWalletLoading(false);
          return;
      }

      // 5. Send signature to backend for verification and linking
      try {
          console.log("[Profile Page] Sending signature for verification...");
          const linkResponse = await fetch('/api/profile/link-wallet', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ solanaPubKey: publicKey.toBase58(), signature: bs58.encode(signature) }),
          });

          const linkData = await linkResponse.json();
          if (!linkResponse.ok) {
              throw new Error(linkData.message || 'Failed to link wallet.');
          }

          console.log("[Profile Page] Wallet linked successfully!");
          toast.success('Wallet linked successfully!');
          // Refresh user profile data to show the linked wallet
          await fetchUserProfile(); 
      } catch (error: any) {
          console.error("[Profile Page] Error linking wallet:", error);
          toast.error(`Linking failed: ${error.message}`);
      } finally {
          setLinkWalletLoading(false);
      }
  };

  // --- Set Credentials Handler --- 
  const handleSetCredentials = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setSetCredsFormErrors({}); // Clear previous errors
      clearContextError();
      console.log("[Profile Page] Attempting to set credentials...");

      // 1. Frontend Validation (similar to signup)
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

      // 2. Call API
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
          // Reset form fields
          setNewUsername('');
          setNewPassword('');
          setConfirmNewPassword('');
          // Refresh user profile data to show the new username
          await fetchUserProfile(); 

      } catch (error: any) {
          console.error("[Profile Page] Error setting credentials:", error);
          toast.error(`Failed: ${error.message}`);
          // Potentially set context error if needed, though toast might suffice
          // setError(error.message);
      } finally {
          setSetCredsLoading(false);
          toast.dismiss(loadingToastId);
      }
  };
  // --- END Added Handlers --- 

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormErrors({}); // Clear previous form errors
    // clearContextError(); // Handled by useEffect

    // Prepare data for validation (handle potential empty date string)
    const dataToValidate = {
        ...profileData,
        dateOfBirth: profileData.dateOfBirth || null,
    };

    const validationResult = ProfileUpdateSchema.safeParse(dataToValidate);

    if (!validationResult.success) {
        setFormErrors(validationResult.error.flatten().fieldErrors);
        return;
    }

    // Validation passed, proceed with update
    const loadingToastId = toast.loading("Saving profile...");
    
    // Prepare data for the API call, ensuring dateOfBirth is string | null
    const updateData = {
        ...validationResult.data,
        // Explicitly format Date object back to string if it exists
        dateOfBirth: validationResult.data.dateOfBirth instanceof Date 
                      ? validationResult.data.dateOfBirth.toISOString().split('T')[0] 
                      : validationResult.data.dateOfBirth, // Keep null as null
    };

    // Now updateData should match Partial<User> expected by updateUserProfile
    const success = await updateUserProfile(updateData);
    toast.dismiss(loadingToastId);
    if (success) {
      toast.success('Profile updated successfully!');
      setIsEditing(false); 
    } else {
      // Context error handles API errors
      console.error("Profile update failed (toast displayed by context)");
    }
  };

  // Loading state specific to fetching profile data
  if (pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
        <p className="ml-4 text-text-light dark:text-text-dark">Loading profile data...</p>
      </div>
    );
  }

  // Helper function to render form fields with consistent styles
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
                onChange={handleInputChange as any} // Cast might be needed for select
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

  // Helper function needs to be accessible to the form
  const inputClasses = (hasError: boolean) =>
      `w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-secondary-light dark:bg-zinc-800 text-text-light dark:text-text-dark placeholder-gray-400 dark:placeholder-gray-500 transition-colors duration-150 ${
        hasError
          ? 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400'
          : 'border-gray-300 dark:border-zinc-700 focus:border-transparent dark:focus:border-transparent'
      }`;

  // Main return for the profile content
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
                 if (isEditing) setFormErrors({}); // Clear errors when exiting edit mode
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
        {renderField('Solana Wallet', 'solanaPubKey', 'text', true)}

        {/* Button to Link Wallet (shown if no wallet linked) */}
        {!profileData.solanaPubKey && (
            <div className="mt-4 mb-6">
                <AnimatedButton onClick={handleLinkWallet} disabled={actionLoading || linkWalletLoading}>
                    {linkWalletLoading ? 'Linking Wallet...' : 'Link Solana Wallet'}
                </AnimatedButton>
                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Link your wallet to enable seamless logins and potential future features.</p>
            </div>
        )}

        {/* Section/Form to Set Credentials (shown if no username/password) */}
        {!profileData.username && profileData.solanaPubKey && (
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
                             className={inputClasses(!!setCredsFormErrors.username)} // Use specific error state
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
          {renderField('Date of Birth', 'dateOfBirth', 'date')} {/* Changed type to date */}
          {renderField('Email', 'email', 'email')}
          {renderField('Phone Number', 'phone', 'tel')} {/* Changed type to tel */}

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
                 type="submit" // Use type="submit" to trigger form onSubmit
                 disabled={actionLoading || !isEditing}
                 className="inline-flex justify-center py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60"
               >
                 {actionLoading ? 'Saving...' : 'Save Changes'}
               </AnimatedButton>
            </div>
          )}
        </form> { /* Close the form */}
      </div>
    </motion.div>
  );
};

// Wrap the ProfileContent with ProtectedRoute
const ProfilePage = () => {
    return (
        <ProtectedRoute>
            <ProfileContent />
        </ProtectedRoute>
    );
};

export default ProfilePage; 