// app/api/auth/solana/verify/route.ts
// Handles POST requests to verify a signed Solana message and log the user in.

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { createJwt } from '@/lib/authUtils';
import { createSignInMessage, verifySolanaSignature } from '@/lib/solanaAuthUtils';
import { serialize } from 'cookie';
import { PublicKey } from '@solana/web3.js';
import { SolanaVerifySchema } from '@/lib/schemas';
import bs58 from 'bs58'; // Import bs58 for decoding

const AUTH_COOKIE_NAME = 'auth-token';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[API /solana/verify] Received body:", body);

    // Validate request body
    const validationResult = SolanaVerifySchema.safeParse(body);
    if (!validationResult.success) {
      console.error("[API /solana/verify] Validation failed:", validationResult.error.flatten().fieldErrors);
      return NextResponse.json(
        { message: "Invalid input", errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Use validated data
    const { solanaPubKey, signature: signatureBase58 } = validationResult.data; // Rename incoming signature

    // Validate pubkey format again
    try {
      new PublicKey(solanaPubKey);
    } catch (err) {
      return NextResponse.json({ message: 'Invalid Solana public key format' }, { status: 400 });
    }

    // Find the user and their expected nonce (User MUST exist at this point)
    // Note: solanaPubKey field is deprecated, using evm_address as fallback
    const user = await prisma.user.findUnique({
      where: { evm_address: solanaPubKey },
    });

    if (!user || !user.signInNonce) {
      console.warn(`[API /solana/verify] Verification attempt failed: No user or nonce found for ${solanaPubKey}. Challenge likely expired.`);
      return NextResponse.json({ message: 'Verification challenge expired or invalid. Please try requesting a challenge again.' }, { status: 401 });
    }
    const nonce = user.signInNonce; // Store nonce for logging

    console.log(`[API /solana/verify] Found user ${user.id} with nonce ${nonce} for pubkey ${solanaPubKey}`);

    // Construct the exact message that should have been signed
    const message = `Please sign this message to verify your identity.\nNonce: ${nonce}`;
    let signatureBytes: Buffer;
    try {
        signatureBytes = Buffer.from(bs58.decode(signatureBase58));
    } catch (decodeError) {
        console.error(`[API /solana/verify] Failed to decode Base58 signature for pubkey ${solanaPubKey}:`, decodeError);
        return NextResponse.json({ message: 'Invalid signature format.' }, { status: 400 });
    }

    // --- ADD LOGGING --- 
    console.log(`[API /solana/verify] Verification attempt for pubkey ${solanaPubKey}:`);
    console.log(`  - PubKey: ${solanaPubKey}`);
    console.log(`  - Nonce: ${nonce}`);
    console.log(`  - Message: "${message}"`);
    console.log(`  - Signature (Base58 Received): ${signatureBase58}`);
    console.log(`  - Signature (Bytes Decoded):`, signatureBytes); // Log the buffer
    // --- END LOGGING --- 

    // Verify the signature using DECODED bytes
    const isVerified = verifySolanaSignature(solanaPubKey, message, signatureBytes);

    if (!isVerified) {
      console.warn(`[API /solana/verify] Signature verification failed for ${solanaPubKey}`);
      return NextResponse.json({ message: 'Signature verification failed.' }, { status: 401 });
    }

    // Signature is valid!
    console.log(`[API /solana/verify] Solana signature verified for ${solanaPubKey}`);

    // Clear the nonce for security
    await prisma.user.update({
      where: { id: user.id },
      data: { signInNonce: null }, // Set nonce to null
    });
    console.log(`[API /solana/verify] Nonce cleared for user ${user.id}`);

    // Create JWT
    const token = await createJwt({ userId: user.id, isAdmin: !!user.isAdmin }); // Include isAdmin

    // Serialize the cookie
    const cookie = serialize(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      sameSite: 'lax',
    });

    // Don't return sensitive info
    const { passwordHash, signInNonce, ...userResponse } = user;

    // Return success response with the Set-Cookie header
    return NextResponse.json(
      { message: 'Login successful', user: userResponse },
      {
        status: 200,
        headers: { 'Set-Cookie': cookie },
      }
    );

  } catch (error) {
    console.error("[API /solana/verify] Caught Error:", error);
    return NextResponse.json({ message: 'An error occurred during verification.' }, { status: 500 });
  }
}

// Note: The previous logic assumed the user *must* exist. 
// The /api/auth/solana/challenge route should handle user creation or finding.
// Let's adjust the challenge route instead. 