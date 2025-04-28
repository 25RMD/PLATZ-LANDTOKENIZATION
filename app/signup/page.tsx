"use client";

import React, { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import AnimatedButton from '@/components/common/AnimatedButton'; // Reusable button
import toast from 'react-hot-toast'; // Import toast
import { z } from 'zod'; // Import zod
import { RegisterSchema, FieldErrors } from '@/lib/schemas'; // Import schema and error type

const SignUpPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(''); // Optional email field
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState<FieldErrors>({}); // State for validation errors
  const { register, isLoading, error: contextError, clearError: clearContextError } = useAuth();
  const router = useRouter();

  // Display context error toast when it changes
  useEffect(() => {
      if (contextError) {
          toast.error(contextError);
          clearContextError(); // Clear error after displaying
      }
  }, [contextError, clearContextError]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormErrors({}); // Clear previous form errors
    // clearContextError(); // Context error cleared by useEffect

    // Frontend Validation
    const validationResult = RegisterSchema.extend({
        confirmPassword: z.string().min(1, { message: "Please confirm your password" })
    }).refine(data => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"], // Path of error
    }).safeParse({ username, email, password, confirmPassword });

    if (!validationResult.success) {
      const zodErrors = validationResult.error.flatten().fieldErrors;
      setFormErrors(zodErrors);
      // Optionally show a generic toast
      // toast.error("Please fix the errors in the form.");
      return;
    }

    // Validation passed, proceed with registration
    const { confirmPassword: _, ...dataToSend } = validationResult.data; // Exclude confirmPassword

    console.log("Attempting registration with:", dataToSend);

    const loadingToastId = toast.loading("Creating account...");
    const success = await register(dataToSend.username, dataToSend.email || null, dataToSend.password);
    toast.dismiss(loadingToastId);

    if (success) {
      toast.success('Registration successful! Please log in.');
      router.push('/login');
    } else {
      // Context error will be shown by useEffect
      console.error("Registration failed (toast displayed by context)");
    }
  };

  // Helper to reduce repetition
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
        Create Account
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
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
          {formErrors.username && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{formErrors.username[0]}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
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
          {formErrors.email && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{formErrors.email[0]}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className={inputClasses(!!formErrors.password)}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
          />
          {formErrors.password && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{formErrors.password[0]}</p>}
        </div>

        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <input
            id="confirm-password"
            name="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            className={inputClasses(!!formErrors.confirmPassword)}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
          />
          {formErrors.confirmPassword && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{formErrors.confirmPassword[0]}</p>}
        </div>

        <div>
          <AnimatedButton
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60"
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </AnimatedButton>
        </div>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2">
            Log In
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default SignUpPage; 