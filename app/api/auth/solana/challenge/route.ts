// app/api/auth/solana/challenge/route.ts
// Handles POST requests to generate a sign-in nonce for a Solana public key.

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { generateNonce } from '@/lib/authUtils';
import { SolanaChallengeSchema } from '@/lib/schemas'; // Import schema

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = SolanaChallengeSchema.safeParse(body);
    if (!validationResult.success) {
        return NextResponse.json(
            { message: "Invalid input", errors: validationResult.error.flatten().fieldErrors },
            { status: 400 }
        );
    }

    // Use validated data
    const { solanaPubKey } = validationResult.data;

    // if (!solanaPubKey) { ... } // Handled by zod

    // Basic validation of the public key format (already done by zod schema, but keep for defense)
    // try { new PublicKey(solanaPubKey); } catch (err) { ... }

    const nonce = generateNonce();

    // Find user by Solana public key or create/update them
    // Using upsert: creates if not exists, updates if exists
    const user = await prisma.user.upsert({
      where: { solanaPubKey: solanaPubKey },
      update: { signInNonce: nonce }, // Update nonce for existing user
      create: { solanaPubKey: solanaPubKey, signInNonce: nonce }, // Create new user with nonce
    });

    console.log(`Generated nonce for ${solanaPubKey}: ${nonce}`);

    // Return the nonce to the frontend to be signed
    return NextResponse.json({ nonce }, { status: 200 });

  } catch (error) {
    console.error("Solana Challenge Error:", error);
    return NextResponse.json({ message: 'An error occurred generating the challenge.' }, { status: 500 });
  }
} 