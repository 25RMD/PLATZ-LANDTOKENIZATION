"use client";

import React, { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import AnimatedButton from '@/components/common/AnimatedButton';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { RegisterSchema, FieldErrors } from '@/lib/schemas';

const SignUpPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<FieldErrors>({});
  const { register, isLoading, error: contextError, clearError: clearContextError } = useAuth();
  const router = useRouter();

  // Display context error toast when it changes
  useEffect(() => {
    if (contextError) {
      toast.error(contextError);
      clearContextError();
    }
  }, [contextError, clearContextError]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Frontend Validation
    const validationResult = RegisterSchema.extend({
      confirmPassword: z.string().min(1, { message: "Please confirm your password" })
    }).refine(data => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    }).safeParse({ username, email, password, confirmPassword });

    if (!validationResult.success) {
      const zodErrors = validationResult.error.flatten().fieldErrors;
      setFormErrors(zodErrors);
      return;
    }

    // Validation passed, proceed with registration
    const { confirmPassword: _, ...dataToSend } = validationResult.data;

    console.log("Attempting registration with:", dataToSend);

    const loadingToastId = toast.loading("Creating account...");
    const success = await register(dataToSend.username, dataToSend.email || null, dataToSend.password);
    toast.dismiss(loadingToastId);

    if (success) {
      toast.success('Registration successful! Please log in.');
      router.push('/login');
    } else {
      console.error("Registration failed (toast displayed by context)");
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
          {/* Signup Card */}
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
              REGISTER ACCESS
            </motion.h1>

            <motion.form 
              onSubmit={handleSubmit} 
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-text-light/80 dark:text-text-dark/80 mb-2 font-mono uppercase tracking-wide">
                  Username <span className="text-red-500">*</span>
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
                  placeholder="Choose a username"
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
                <label htmlFor="email" className="block text-sm font-medium text-text-light/80 dark:text-text-dark/80 mb-2 font-mono uppercase tracking-wide">
                  Email (Optional)
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={inputClasses(!!formErrors.email)}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
                {formErrors.email && (
                  <motion.p 
                    className="mt-2 text-sm text-red-500 dark:text-red-400 font-mono"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {formErrors.email[0]}
                  </motion.p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-light/80 dark:text-text-dark/80 mb-2 font-mono uppercase tracking-wide">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className={inputClasses(!!formErrors.password)}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
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
                <label htmlFor="confirm-password" className="block text-sm font-medium text-text-light/80 dark:text-text-dark/80 mb-2 font-mono uppercase tracking-wide">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className={inputClasses(!!formErrors.confirmPassword)}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-light/60 dark:text-text-dark/60 hover:text-text-light dark:hover:text-text-dark transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash className="h-4 w-4" />
                    ) : (
                      <FaEye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <motion.p 
                    className="mt-2 text-sm text-red-500 dark:text-red-400 font-mono"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {formErrors.confirmPassword[0]}
                  </motion.p>
                )}
              </div>

              <div>
                <AnimatedButton
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-cyber-lg shadow-sm text-sm font-bold text-white bg-black hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black/20 dark:focus:ring-white/20 disabled:opacity-60 transition-all duration-200 font-mono uppercase tracking-wider"
                >
                  {isLoading ? 'CREATING ACCESS...' : 'INITIALIZE ACCOUNT'}
                </AnimatedButton>
              </div>
            </motion.form>

            {/* Link to Log In */}
            <motion.div 
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-sm text-text-light/60 dark:text-text-dark/60 font-mono">
                Already have access credentials?{' '}
                <Link 
                  href="/login" 
                  className="font-medium text-black dark:text-white hover:text-black/80 dark:hover:text-white/80 underline underline-offset-2 font-mono uppercase tracking-wide transition-colors"
                >
                  Access Terminal
                </Link>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUpPage; 