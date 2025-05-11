import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateNonce } from '@/lib/authUtils';
import { isAddress } from 'ethers'; // Corrected import, was 'ethers/utils' which is for ethers v5

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { address } = body;

    if (!address || typeof address !== 'string' || !isAddress(address)) {
      return NextResponse.json({ message: 'Invalid or missing EVM address' }, { status: 400 });
    }

    // Normalize address to lowercase to prevent case sensitivity issues
    const normalizedAddress = address.toLowerCase();

    const nonce = generateNonce();

    // Upsert user: find by evmAddress or create if not exists, then update/set nonce
    const user = await prisma.user.upsert({
      where: { evmAddress: normalizedAddress },
      update: { signInNonce: nonce },
      create: {
        evmAddress: normalizedAddress,
        signInNonce: nonce,
        // Add any other mandatory fields for user creation if applicable
        // e.g., if your schema requires a username or email, handle that here or adjust schema
      },
    });

    // Ensure user object is not null before proceeding, though upsert should guarantee a user
    if (!user) {
      console.error('User upsert failed unexpectedly for address:', normalizedAddress);
      return NextResponse.json({ message: 'User operation failed' }, { status: 500 });
    }

    return NextResponse.json({ nonce });

  } catch (error) {
    console.error('EVM Challenge Error:', error);
    if (error instanceof SyntaxError) { // Specifically catch JSON parsing errors
      return NextResponse.json({ message: 'Invalid JSON payload' }, { status: 400 });
    }
    // Log the specific error for server-side debugging
    // In a production environment, you might want more structured logging
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    // Avoid sending detailed internal error messages to the client unless desired
    return NextResponse.json({ message: 'An unexpected error occurred' , error: errorMessage }, { status: 500 });
  }
}
