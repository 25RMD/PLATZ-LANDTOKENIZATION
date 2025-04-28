import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

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

// Simple function to generate a nonce (replace with more secure if needed, e.g., crypto module)
export const generateNonce = (): string => {
   // Generate a more robust nonce using crypto if available in your environment
   // For example, in Node.js:
   // return require('crypto').randomBytes(16).toString('hex');
   return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
} 