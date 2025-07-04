// app/api/profile/evm/link-wallet/route.ts
// Handles POST requests to verify a signed challenge and link an EVM wallet to an authenticated user's profile.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { isAddress, verifyMessage } from 'ethers';

export async function POST(request: NextRequest) {
  try {
    const authenticatedUserId = request.headers.get('x-user-id');
    if (!authenticatedUserId) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { evm_address, signature, challenge } = body;

    if (!evm_address || typeof evm_address !== 'string' || !isAddress(evm_address)) {
      return NextResponse.json({ message: 'Invalid or missing EVM address' }, { status: 400 });
    }
    if (!signature || typeof signature !== 'string') {
      return NextResponse.json({ message: 'Invalid or missing signature' }, { status: 400 });
    }
    if (!challenge || typeof challenge !== 'string') {
        return NextResponse.json({ message: 'Invalid or missing challenge' }, { status: 400 });
    }

    const normalizedAddress = evm_address.toLowerCase();

    const authenticatedUser = await prisma.users.findUnique({
      where: { id: authenticatedUserId },
    });

    if (!authenticatedUser) {
      return NextResponse.json({ message: 'Authenticated user not found' }, { status: 404 });
    }

    if (!authenticatedUser.sign_in_nonce) {
      return NextResponse.json({ message: 'No active challenge found. Please request a challenge first.' }, { status: 401 });
    }

    const expectedMessage = `Please sign this message to link your EVM wallet to your profile.\nNonce: ${authenticatedUser.sign_in_nonce}`;

    if (challenge !== expectedMessage) {
        return NextResponse.json({ message: 'Challenge mismatch.' }, { status: 401 });
    }

    let recoveredAddress = '';

    try {
      recoveredAddress = verifyMessage(expectedMessage, signature).toLowerCase();
    } catch (verifyError) {
      console.error('Signature verification error:', verifyError);
      return NextResponse.json({ message: 'Signature verification failed. Invalid signature.' }, { status: 401 });
    }

    if (recoveredAddress !== normalizedAddress) {
      return NextResponse.json({ message: 'Signature does not match the provided address.' }, { status: 401 });
    }

    // Critical Check (Race Condition): Re-query to ensure the input address has not been linked to another user 
    // since the challenge was issued.
    const userWithThisAddress = await prisma.users.findUnique({
        where: { evm_address: normalizedAddress }
    });

    if (userWithThisAddress && userWithThisAddress.id !== authenticatedUserId) {
        // Address got linked to someone else in the meantime
        return NextResponse.json(
            { message: 'This EVM address was linked to another account after the challenge was issued.' }, 
            { status: 409 } // Conflict
        );
    }

    // Link the wallet
    const updatedUser = await prisma.users.update({
      where: { id: authenticatedUserId },
      data: {
        evm_address: normalizedAddress,
        sign_in_nonce: null, // Clear the nonce
      },
      // Select the fields you want to return (excluding sensitive ones like passwordHash)
      select: {
        id: true,
        username: true,
        email: true,
        evm_address: true,
        kyc_verified: true,
        // Add other fields as needed for the profile context
      }
    });

    console.log(`EVM address ${normalizedAddress} successfully linked to user ${authenticatedUserId}.`);

    return NextResponse.json({ message: 'EVM wallet linked successfully.', user: updatedUser }, { status: 200 });

  } catch (error) {
    console.error('Profile EVM Link Wallet Error:', error);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ message: 'Invalid JSON payload' }, { status: 400 });
    }
    let errorMessage = 'An unexpected error occurred';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}
