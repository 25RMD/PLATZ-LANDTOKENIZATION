"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateNonce = exports.verifyJwt = exports.createJwt = exports.comparePassword = exports.hashPassword = void 0;
const jose_1 = require("jose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const JWT_SECRET_KEY = process.env.JWT_SECRET;
const JWT_EXPIRATION = process.env.JWT_EXPIRES_IN || '7d';
if (!JWT_SECRET_KEY) {
    throw new Error('JWT_SECRET environment variable is not set.');
}
const secretKey = new TextEncoder().encode(JWT_SECRET_KEY);
const hashPassword = async (password) => {
    const saltRounds = 10; // Adjust cost factor as needed
    return await bcryptjs_1.default.hash(password, saltRounds);
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hash) => {
    return await bcryptjs_1.default.compare(password, hash);
};
exports.comparePassword = comparePassword;
// Using jose for async JWT operations
const createJwt = async (payload) => {
    return await new jose_1.SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(JWT_EXPIRATION)
        .sign(secretKey);
};
exports.createJwt = createJwt;
const verifyJwt = async (token) => {
    try {
        const { payload } = await (0, jose_1.jwtVerify)(token, secretKey, {
            algorithms: ['HS256'],
        });
        // Ensure payload contains userId and isAdmin before casting
        if (payload && typeof payload.userId === 'string' && typeof payload.isAdmin === 'boolean') {
            return payload;
        }
        console.warn("JWT verification failed: payload missing userId or isAdmin");
        return null;
    }
    catch (error) {
        console.error("JWT Verification failed:", error instanceof Error ? error.message : error);
        return null;
    }
};
exports.verifyJwt = verifyJwt;
// Simple function to generate a nonce (replace with more secure if needed, e.g., crypto module)
const generateNonce = () => {
    // Generate a more robust nonce using crypto if available in your environment
    // For example, in Node.js:
    return crypto_1.default.randomBytes(16).toString('hex');
    // return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
exports.generateNonce = generateNonce;
