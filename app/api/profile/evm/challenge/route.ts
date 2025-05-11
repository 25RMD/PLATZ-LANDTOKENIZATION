// app/api/profile/evm/challenge/route.ts
// Handles POST requests to generate a nonce for linking an EVM wallet to an authenticated user's profile.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/db'; // Using @/lib/db based on profile/route.ts
import { generateNonce } from '@/lib/authUtils';
import { isAddress } from 'ethers';

export async function POST(request: NextRequest) {
  try {
    const authenticatedUserId = request.headers.get('x-user-id');
    if (!authenticatedUserId) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { address } = body;

    if (!address || typeof address !== 'string' || !isAddress(address)) {
      return NextResponse.json({ message: 'Invalid or missing EVM address' }, { status: 400 });
    }

    const normalizedAddress = address.toLowerCase();

    // Critical Check: Ensure the input address is not already linked to another user account.
    const existingUserWithAddress = await prisma.user.findUnique({
      where: { evmAddress: normalizedAddress },
    });

    if (existingUserWithAddress && existingUserWithAddress.id !== authenticatedUserId) {
      return NextResponse.json(
        { message: 'This EVM address is already linked to another account.' },
        { status: 409 } // 409 Conflict
      );
    }

    // Retrieve the authenticated user
    const authenticatedUser = await prisma.user.findUnique({
      where: { id: authenticatedUserId },
    });

    if (!authenticatedUser) {
      // This case should ideally not happen if x-user-id is validated by middleware
      return NextResponse.json({ message: 'Authenticated user not found' }, { status: 404 });
    }

    const nonce = generateNonce();

    // Update this authenticated user's signInNonce in the database.
    await prisma.user.update({
      where: { id: authenticatedUserId },
      data: { signInNonce: nonce },
    });

    console.log(`Generated signInNonce for user ${authenticatedUserId} to link EVM address ${normalizedAddress}: ${nonce}`);

    return NextResponse.json({ nonce }, { status: 200 });

  } catch (error) {
    console.error('Profile EVM Challenge Error:', error);
    if (error instanceof SyntaxError) { // Handle JSON parsing errors
        return NextResponse.json({ message: 'Invalid JSON payload' }, { status: 400 });
    }
    let errorMessage = 'An unexpected error occurred';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}
