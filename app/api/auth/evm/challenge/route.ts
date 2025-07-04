import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { generateNonce } from '@/lib/authUtils';
import { isAddress } from 'ethers';
import { randomUUID } from 'crypto';

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
    const user = await prisma.users.upsert({
      where: { evm_address: normalizedAddress },
      update: { sign_in_nonce: nonce },
      create: {
        id: randomUUID(),
        evm_address: normalizedAddress,
        sign_in_nonce: nonce,
        auth_type: 'evm', // Explicitly set auth_type for new EVM users
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
