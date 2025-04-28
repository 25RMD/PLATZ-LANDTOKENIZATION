import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { createSignInMessage, verifySolanaSignature } from '@/lib/solanaAuthUtils';
import { SolanaVerifySchema } from '@/lib/schemas'; // Re-use schema for pubkey/signature validation
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58'; // Import bs58 for decoding

export async function POST(request: NextRequest) {
  // 1. Get Authenticated User ID from Middleware Header
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }
  console.log(`[API /link-wallet] Attempting link for user: ${userId}`);

  try {
    const body = await request.json();
    console.log("[API /link-wallet] Received body:", body);

    // 2. Validate Incoming Data (PubKey and Signature)
    const validationResult = SolanaVerifySchema.safeParse(body);
    if (!validationResult.success) {
      console.error("[API /link-wallet] Validation failed:", validationResult.error.flatten().fieldErrors);
      return NextResponse.json(
        { message: "Invalid input", errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { solanaPubKey, signature: signatureBase58 } = validationResult.data;

    // Validate pubkey format
    try {
      new PublicKey(solanaPubKey);
    } catch (err) {
      return NextResponse.json({ message: 'Invalid Solana public key format' }, { status: 400 });
    }

    // 3. Check if the wallet is already linked to ANOTHER user
    const existingLink = await prisma.user.findUnique({
      where: {
        solanaPubKey: solanaPubKey,
        NOT: { id: userId } // Exclude the current user
      },
      select: { id: true } // Only need to know if it exists
    });

    if (existingLink) {
      console.warn(`[API /link-wallet] Wallet ${solanaPubKey} already linked to user ${existingLink.id}`);
      return NextResponse.json({ message: 'This wallet is already linked to another account.' }, { status: 409 }); // Conflict
    }

    // 4. Get the current user's nonce (should have been set by a challenge request before linking)
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { signInNonce: true }
    });

    if (!currentUser || !currentUser.signInNonce) {
      console.warn(`[API /link-wallet] No valid challenge nonce found for user ${userId}.`);
      return NextResponse.json({ message: 'Verification challenge required or expired. Please try again.' }, { status: 401 });
    }
    const nonce = currentUser.signInNonce; // Store nonce for logging

    // 5. Verify the signature against the nonce
    const message = `Please sign this message to link your wallet.\nNonce: ${nonce}`;
    let signatureBytes: Buffer;
    try {
        signatureBytes = bs58.decode(signatureBase58);
    } catch (decodeError) {
        console.error(`[API /link-wallet] Failed to decode Base58 signature for user ${userId}:`, decodeError);
        return NextResponse.json({ message: 'Invalid signature format.' }, { status: 400 });
    }

    // --- ADD LOGGING --- 
    console.log(`[API /link-wallet] Verification attempt for user ${userId}:`);
    console.log(`  - PubKey: ${solanaPubKey}`);
    console.log(`  - Nonce: ${nonce}`);
    console.log(`  - Message: "${message}"`);
    console.log(`  - Signature (Base58 Received): ${signatureBase58}`);
    console.log(`  - Signature (Bytes Decoded):`, signatureBytes); // Log the buffer
    // --- END LOGGING --- 

    // Pass the DECODED signature bytes to the verification function
    const isVerified = verifySolanaSignature(solanaPubKey, message, signatureBytes);

    if (!isVerified) {
      console.warn(`[API /link-wallet] Signature verification failed for user ${userId}, pubkey ${solanaPubKey}`);
      return NextResponse.json({ message: 'Signature verification failed.' }, { status: 401 });
    }

    // 6. Signature is valid! Link the wallet and clear the nonce.
    console.log(`[API /link-wallet] Signature verified for user ${userId}, linking wallet ${solanaPubKey}`);
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        solanaPubKey: solanaPubKey,
        signInNonce: null // Clear nonce after successful link
      },
    });

    // 7. Return success (don't need to return full user object typically)
    return NextResponse.json({ message: 'Wallet linked successfully' }, { status: 200 });

  } catch (error) {
    console.error("[API /link-wallet] Caught Error:", error);
    return NextResponse.json({ message: 'An error occurred while linking the wallet.' }, { status: 500 });
  }
} 