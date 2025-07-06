import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
// Helper to get secure random bytes in any runtime
const getRandomBytes = (length: number): Uint8Array => {
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(length);
    globalThis.crypto.getRandomValues(bytes);
    return bytes;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { randomBytes } = require('crypto') as typeof import('crypto');
    return randomBytes(length);
  }
};

const JWT_SECRET_KEY = process.env.JWT_SECRET;
const JWT_EXPIRATION = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET_KEY) {
  throw new Error('JWT_SECRET environment variable is not set.');
}
const secretKey = new TextEncoder().encode(JWT_SECRET_KEY);

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10; // Adjust cost factor as needed
  return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

// Using jose for async JWT operations
export const createJwt = async (payload: { userId: string; isAdmin: boolean }): Promise<string> => {
   return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .sign(secretKey);
};

export const verifyJwt = async (token: string): Promise<{ userId: string; isAdmin: boolean } | null> => {
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ['HS256'],
    });
    // Ensure payload contains userId and isAdmin before casting
    if (payload && typeof payload.userId === 'string' && typeof payload.isAdmin === 'boolean') {
         return payload as { userId: string; isAdmin: boolean };
    }
    console.warn("JWT verification failed: payload missing userId or isAdmin");
    return null;
  } catch (error) {
    console.error("JWT Verification failed:", error instanceof Error ? error.message : error);
    return null;
  }
};

// Generate cryptographically-secure nonce usable in both Node & Edge
export const generateNonce = (): string => {
  return Array.from(getRandomBytes(16))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};