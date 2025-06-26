// lib/schemas.ts
import { z } from 'zod';

// Schema for User Registration
export const RegisterSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }).max(50),
  email: z.string().email({ message: "Invalid email address" }).optional().or(z.literal('')).nullable(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

// Schema for User Login
export const LoginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

// Schema for Solana Challenge Request
export const SolanaChallengeSchema = z.object({
    solanaPubKey: z.string().min(44, {message: "Invalid Solana public key"}).max(44, {message: "Invalid Solana public key"}),
});

// Schema for Solana Signature Verification
export const SolanaVerifySchema = z.object({
    solanaPubKey: z.string().min(44).max(44),
    signature: z.string().min(1, {message: "Signature is required"}), // Base58 encoded signature
});

// Schema for Profile Update (only include fields that can be updated)
export const ProfileUpdateSchema = z.object({
  full_name: z.string().min(1, { message: "Full name cannot be empty" }).max(100).optional().or(z.literal('').nullable()),
  email: z.string().email({ message: "Invalid email address" }).optional().or(z.literal('').nullable()), // Allow empty or null
  phone: z.string().max(20, {message: "Phone number too long"}).optional().or(z.literal('').nullable()),
  evm_address: z.string().length(42).regex(/^0x[a-fA-F0-9]{40}$/, { message: "Invalid EVM address format" }).optional().nullable(),
  date_of_birth: z.preprocess((arg) => {
     if (arg === "" || arg === null || arg === undefined) return null;
     if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
     return arg;
   }, z.date({ invalid_type_error: "Invalid date format" }).nullable().optional()),
  address_line1: z.string().max(255).optional().or(z.literal('').nullable()),
  address_line2: z.string().max(255).optional().or(z.literal('').nullable()),
  city: z.string().max(100).optional().or(z.literal('').nullable()),
  state_province: z.string().max(100).optional().or(z.literal('').nullable()),
  postal_code: z.string().max(20).optional().or(z.literal('').nullable()),
  country: z.string().max(100).optional().or(z.literal('').nullable()),
  gov_id_type: z.string().max(50).optional().or(z.literal('').nullable()),
  gov_id_ref: z.string().optional().or(z.literal('').nullable()),
}).partial();

// Helper type for frontend form errors
export type FieldErrors = Record<string, string[] | undefined>; 