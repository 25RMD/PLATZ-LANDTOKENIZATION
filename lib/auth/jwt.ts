import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string || 'default-jwt-secret-for-development';

/**
 * Generate a JWT token for a user
 * @param payload The data to encode in the token
 * @param expiresIn Token expiration time (default: 7 days)
 */
export const generateJwtToken = (
  payload: Record<string, any>,
  expiresIn: string | number = '7d'
): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as any);
};

/**
 * Verify a JWT token and return the decoded payload
 * @param token The JWT token to verify
 */
export const verifyJwtToken = async (token: string): Promise<any> => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
};

/**
 * Decode a JWT token without verifying it
 * @param token The JWT token to decode
 */
export const decodeJwtToken = (token: string): any => {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
};
