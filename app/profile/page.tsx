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
import { useCurrency } from '@/context/CurrencyContext';
import { CURRENCY_OPTIONS, SupportedCurrency } from '@/lib/utils/currencyConversion';

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
  const { preferredCurrency, setPreferredCurrency, exchangeRates, isLoading: currencyLoading } = useCurrency(); 

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
    setLinkWalletLoading(true);
    clearContextError();

      try {
    if (!isEvmWalletConnected || !connectedEvmAddress) {
              toast.error("Please connect your wallet first.");
      return;
    }

      const challengeResponse = await fetch('/api/profile/evm/challenge', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ evmAddress: connectedEvmAddress }),
      }); 

      if (!challengeResponse.ok) {
              const challengeData = await challengeResponse.json();
              throw new Error(challengeData.message || 'Failed to get challenge.');
          }

          const { challenge } = await challengeResponse.json();

          const signature = await signMessageAsync({ message: challenge });

      const linkResponse = await fetch('/api/profile/evm/link-wallet', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  evmAddress: connectedEvmAddress,
                  signature,
                  challenge,
              }),
          });

      if (!linkResponse.ok) {
              const linkData = await linkResponse.json();
              throw new Error(linkData.message || 'Failed to link wallet.');
          }

          toast.success('EVM wallet linked successfully!');
          await fetchUserProfile(); 
      } catch (error: any) {
          console.error('Error linking wallet:', error);
          if (error.message?.includes('rejected') || error.message?.includes('denied')) {
              toast.error('Wallet connection cancelled by user.');
      } else {
              toast.error(`Failed to link wallet: ${error.message}`);
      }
    } finally {
      setLinkWalletLoading(false);
    }
  };

  const handleUnlinkWallet = async () => {
    setUnlinkWalletLoading(true);
    clearContextError();

      try {
          const response = await fetch('/api/profile/evm/link-wallet', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
          });

          if (!response.ok) {
              const data = await response.json();
              throw new Error(data.message || 'Failed to unlink wallet.');
          }

          toast.success('EVM wallet unlinked successfully!');
          await fetchUserProfile(); 
    } catch (error: any) {
          console.error('Error unlinking wallet:', error);
          toast.error(`Failed to unlink wallet: ${error.message}`);
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
    const commonClasses = `w-full px-3 py-2 border rounded-cyber shadow-sm focus:outline-none focus:ring-2 focus:ring-cyber-glow/50 dark:focus:ring-cyber-glow/30 bg-secondary-light dark:bg-secondary-dark text-text-light dark:text-text-dark placeholder-text-light/40 dark:placeholder-text-dark/40 transition-all duration-150 focus-cyber`;
    const errorClasses = hasError ? 'border-error-minimal dark:border-error-minimal focus:ring-error-minimal/50 dark:focus:ring-error-minimal/30' : 'border-black/20 dark:border-white/20 focus:border-transparent dark:focus:border-transparent';
    const disabledClasses = isDisabled ? 'opacity-70 bg-black/5 dark:bg-white/5 cursor-not-allowed' : '';

    return (
      <div className="mb-4">
        <label htmlFor={name} className="block text-sm font-medium text-text-light/80 dark:text-text-dark/80 mb-1.5 font-mono">
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
        {hasError && <p className="mt-1.5 text-xs text-error-minimal dark:text-error-minimal">{formErrors[name]?.[0]}</p>}
      </div>
    );
  };

  const inputClasses = (hasError: boolean) =>
      `w-full px-3 py-2 border rounded-cyber shadow-sm focus:outline-none focus:ring-2 focus:ring-cyber-glow/50 dark:focus:ring-cyber-glow/30 bg-secondary-light dark:bg-secondary-dark text-text-light dark:text-text-dark placeholder-text-light/40 dark:placeholder-text-dark/40 transition-all duration-150 focus-cyber ${
        hasError
          ? 'border-error-minimal dark:border-error-minimal focus:ring-error-minimal/50 dark:focus:ring-error-minimal/30'
          : 'border-black/20 dark:border-white/20 focus:border-transparent dark:focus:border-transparent'
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
      className="max-w-3xl mx-auto mt-12 mb-12 p-8 border border-black/10 dark:border-white/10 rounded-cyber-lg shadow-2xl bg-primary-light dark:bg-primary-dark cyber-grid"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
              <h1 className="text-3xl font-bold text-text-light dark:text-text-dark mb-4 sm:mb-0 font-mono">
                User Profile
              </h1>
               {/* Verification Status Badge */}
               <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-cyber text-xs font-medium font-mono border ${isVerified
                    ? 'bg-success-minimal/10 text-success-minimal border-success-minimal/20'
                    : 'bg-warning-minimal/10 text-warning-minimal border-warning-minimal/20'
                }`}>
                  {isVerified ? <FiCheckCircle className="w-3 h-3"/> : <FiAlertCircle className="w-3 h-3"/>}
                  {isVerified ? 'VERIFIED' : 'NOT VERIFIED'}
               </div>
          </div>
           <AnimatedButton
             onClick={() => {
                 setIsEditing(!isEditing);
                 if (isEditing) setFormErrors({}); 
             }}
             className={`px-5 py-2 text-sm rounded-cyber border transition-all duration-300 font-mono ${isEditing
                ? 'bg-black/5 dark:bg-white/5 border-black/20 dark:border-white/20 text-text-light dark:text-text-dark hover:bg-black/10 dark:hover:bg-white/10'
                : 'bg-text-light dark:bg-text-dark border-text-light dark:border-text-dark text-primary-light dark:text-primary-dark hover:bg-text-light/90 dark:hover:bg-text-dark/90'
              }`}
            >
             {isEditing ? 'CANCEL EDIT' : 'EDIT PROFILE'}
           </AnimatedButton>
      </div>

      {/* Guidance for unverified users */} 
      {!isVerified && !isEditing && (
         <div className="mb-6 p-4 border border-warning-minimal/30 bg-warning-minimal/5 rounded-cyber text-sm font-mono">
             <p className="font-bold mb-1 text-text-light dark:text-text-dark">VERIFICATION REQUIRED FOR LISTINGS</p>
             <p className="text-text-light/80 dark:text-text-dark/80">To create property listings, please complete your profile and submit KYC documents (references). Verification is typically processed within 1-2 business days.</p>
         </div>
      )}

      <div className="space-y-1">
        {/* Section 1: Basic Info (Non-Editable) */}
        <h2 className="text-xl font-bold text-text-light dark:text-text-dark pt-2 pb-3 border-b border-black/20 dark:border-white/20 mb-4 font-mono">
             ACCOUNT INFORMATION
         </h2>
        {renderField('Username', 'username', 'text', true)}
        {renderField('EVM Wallet', 'evmAddress', 'text', true)}

        {/* EVM Wallet Section */}
        <div className="mb-6 p-4 border border-black/10 dark:border-white/10 rounded-cyber bg-black/2 dark:bg-white/2">
          <h3 className="text-lg font-bold mb-2 text-text-light dark:text-text-dark font-mono">EVM WALLET</h3>
          {profileData.evmAddress ? (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <p className="text-text-light/80 dark:text-text-dark/80 break-all font-mono text-sm">
                Linked Address: <span className="font-mono text-text-light dark:text-text-dark">{profileData.evmAddress}</span>
              </p>
              <AnimatedButton 
                onClick={handleUnlinkWallet}
                disabled={unlinkWalletLoading || actionLoading}
                className="mt-2 sm:mt-0 sm:ml-4 bg-error-minimal/10 hover:bg-error-minimal/20 text-error-minimal border border-error-minimal/30 rounded-cyber font-mono text-sm px-4 py-2"
              >
                UNLINK WALLET
              </AnimatedButton>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <p className="text-text-light/60 dark:text-text-dark/60 font-mono">No EVM wallet linked.</p>
              <AnimatedButton 
                onClick={handleLinkWallet}
                disabled={!isEvmWalletConnected || linkWalletLoading || actionLoading}
                className="mt-2 sm:mt-0 sm:ml-4 bg-text-light dark:bg-text-dark text-primary-light dark:text-primary-dark border border-text-light dark:border-text-dark rounded-cyber font-mono text-sm px-4 py-2 hover:opacity-90"
              >
                LINK WALLET
              </AnimatedButton>
            </div>
          )}
          {!isEvmWalletConnected && !profileData.evmAddress && (
              <p className="text-sm text-warning-minimal mt-2 font-mono">Please connect your wallet (in the header) to link it.</p>
          )}
        </div>

        {/* Currency Preference Section */}
        <div className="mb-6 p-4 border border-black/10 dark:border-white/10 rounded-cyber bg-black/2 dark:bg-white/2">
          <h3 className="text-lg font-bold mb-3 text-text-light dark:text-text-dark font-mono">CURRENCY PREFERENCE</h3>
          <p className="text-sm text-text-light/80 dark:text-text-dark/80 mb-4 font-mono">
            Choose your preferred currency for price display. ETH prices will be shown with conversions to your selected currency.
          </p>
          
          <div className="space-y-3">
            {Object.values(CURRENCY_OPTIONS).map((option) => (
              <label key={option.currency} className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="currencyPreference"
                  value={option.currency}
                  checked={preferredCurrency === option.currency}
                  onChange={(e) => setPreferredCurrency(e.target.value as SupportedCurrency)}
                  className="w-4 h-4 text-text-light dark:text-text-dark bg-transparent border-text-light/40 dark:border-text-dark/40 focus:ring-cyber-glow/50 dark:focus:ring-cyber-glow/30 focus:ring-2"
                />
                <div className="flex items-center space-x-2 font-mono">
                  <span className="text-lg font-bold">{option.symbol}</span>
                  <span className="text-text-light dark:text-text-dark">{option.name} ({option.currency})</span>
                </div>
              </label>
            ))}
          </div>

          {exchangeRates && !currencyLoading && (
            <div className="mt-4 p-3 bg-black/5 dark:bg-white/5 rounded-cyber border border-black/10 dark:border-white/10">
              <p className="text-sm text-text-light/80 dark:text-text-dark/80 mb-2 font-mono">Current Exchange Rates:</p>
              <div className="space-y-1 text-sm font-mono">
                <div>1 ETH = ${exchangeRates.USD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</div>
                <div>1 ETH = ₦{exchangeRates.NGN.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} NGN</div>
              </div>
              <p className="text-xs text-text-light/60 dark:text-text-dark/60 mt-2 font-mono">
                Rates updated every 5 minutes via CoinGecko
              </p>
            </div>
          )}

          {currencyLoading && (
            <div className="mt-4 p-3 bg-black/5 dark:bg-white/5 rounded-cyber border border-black/10 dark:border-white/10">
              <p className="text-sm text-text-light/80 dark:text-text-dark/80 font-mono">Loading exchange rates...</p>
            </div>
          )}
        </div>

        {/* Section/Form to Set Credentials (shown if no username/password) */}
        {!profileData.username && profileData.evmAddress && (
             <div className="mt-6 pt-6 border-t border-black/20 dark:border-white/20">
                <h2 className="text-xl font-bold text-text-light dark:text-text-dark mb-4 font-mono">
                    SET USERNAME & PASSWORD
                </h2>
                 <p className="text-sm text-text-light/80 dark:text-text-dark/80 mb-4 font-mono">You logged in with your wallet. Set a username and password for an alternative login method.</p>
                 
                 {/* --- Add Set Credentials Form --- */}
                 <form onSubmit={handleSetCredentials} className="space-y-4 max-w-sm">
                     {/* New Username Field */}
                     <div>
                         <label htmlFor="newUsername" className="block text-sm font-medium text-text-light/80 dark:text-text-dark/80 mb-1.5 font-mono">
                             Choose Username <span className="text-error-minimal">*</span>
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
                         {setCredsFormErrors.username && <p className="mt-1.5 text-xs text-error-minimal">{setCredsFormErrors.username[0]}</p>}
                     </div>
                     {/* New Password Field */}
                     <div>
                         <label htmlFor="newPassword" className="block text-sm font-medium text-text-light/80 dark:text-text-dark/80 mb-1.5 font-mono">
                             Create Password <span className="text-error-minimal">*</span>
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
                         {setCredsFormErrors.password && <p className="mt-1.5 text-xs text-error-minimal">{setCredsFormErrors.password[0]}</p>}
                     </div>
                     {/* Confirm New Password Field */}
                     <div>
                         <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-text-light/80 dark:text-text-dark/80 mb-1.5 font-mono">
                             Confirm Password <span className="text-error-minimal">*</span>
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
                         {setCredsFormErrors.confirmPassword && <p className="mt-1.5 text-xs text-error-minimal">{setCredsFormErrors.confirmPassword[0]}</p>}
                     </div>
                     {/* Submit Button */}
                     <div>
                         <AnimatedButton 
                           type="submit" 
                           disabled={setCredsLoading || actionLoading}
                           className="bg-text-light dark:bg-text-dark text-primary-light dark:text-primary-dark border border-text-light dark:border-text-dark rounded-cyber font-mono text-sm px-4 py-2 hover:opacity-90"
                         >
                             {setCredsLoading ? 'SETTING CREDENTIALS...' : 'SET CREDENTIALS'}
                         </AnimatedButton>
                     </div>
                 </form>
                 {/* --- END Set Credentials Form --- */}
             </div>
        )}

        {/* Wrap editable sections in a form */}
        <form onSubmit={handleSubmit}>
          {/* Section 2: Personal Details (Editable) */}
           <h2 className="text-xl font-bold text-text-light dark:text-text-dark pt-5 pb-3 border-b border-black/20 dark:border-white/20 mb-4 font-mono">
               PERSONAL DETAILS
           </h2>
          {renderField('Full Legal Name', 'fullName', 'text')}
          {renderField('Date of Birth', 'dateOfBirth', 'date')} 
          {renderField('Email', 'email', 'email')}
          {renderField('Phone Number', 'phone', 'tel')} 

           {/* Section 3: Address (Editable) */}
           <h2 className="text-xl font-bold text-text-light dark:text-text-dark pt-5 pb-3 border-b border-black/20 dark:border-white/20 mb-4 font-mono">
               RESIDENTIAL / BUSINESS ADDRESS
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
           <h2 className="text-xl font-bold text-text-light dark:text-text-dark pt-5 pb-3 border-b border-black/20 dark:border-white/20 mb-4 font-mono">
               KYC DOCUMENTS (REFERENCES)
           </h2>
           <p className="text-xs text-text-light/60 dark:text-text-dark/60 mb-4 font-mono">Provide references (e.g., file IDs, secure links) to your uploaded documents. Actual document upload requires a separate process.</p>
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
            <div className="pt-6 text-right border-t border-black/20 dark:border-white/20 mt-8">
               <AnimatedButton
                 type="submit" 
                 disabled={actionLoading || !isEditing}
                 className="inline-flex justify-center py-2.5 px-6 border border-success-minimal rounded-cyber shadow-sm text-sm font-bold text-success-minimal bg-success-minimal/10 hover:bg-success-minimal/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success-minimal/50 disabled:opacity-60 font-mono transition-all duration-300"
               >
                 {actionLoading ? 'SAVING...' : 'SAVE CHANGES'}
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