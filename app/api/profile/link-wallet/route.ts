import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJwt } from '@/lib/authUtils';
import { isAddress, verifyMessage } from 'ethers';
import { cookies } from 'next/headers';

// Helper function to construct the challenge message for linking
const getLinkChallengeMessage = (nonce: string): string => {
  return `Please sign this message to link your EVM wallet to your profile.\nNonce: ${nonce}`;
};

export async function POST(request: Request) {
  try {
    // 1. Authenticate user via JWT from cookies
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('auth-token');

    if (!tokenCookie) {
      return NextResponse.json({ message: 'Authentication token not found.' }, { status: 401 });
    }
    const decodedToken = await verifyJwt(tokenCookie.value);
    if (!decodedToken || !decodedToken.userId) {
      return NextResponse.json({ message: 'Invalid or expired authentication token.' }, { status: 401 });
    }
    const authenticatedUserId = decodedToken.userId;

    // 2. Get address and signature from request body
    const body = await request.json();
    const { address, signature } = body;

    // 3. Validate address and signature
    if (!address || typeof address !== 'string' || !isAddress(address)) {
      return NextResponse.json({ message: 'Invalid or missing EVM address for linking' }, { status: 400 });
    }
    if (!signature || typeof signature !== 'string') {
      return NextResponse.json({ message: 'Invalid or missing signature' }, { status: 400 });
    }
    const normalizedAddressToLink = address.toLowerCase();

    // 4. Retrieve the authenticated user and their current signInNonce
    const authenticatedUser = await prisma.user.findUnique({
      where: { id: authenticatedUserId },
    });

    if (!authenticatedUser) {
      return NextResponse.json({ message: 'Authenticated user not found.' }, { status: 404 });
    }

    if (!authenticatedUser.signInNonce) {
      return NextResponse.json({ message: 'No active linking challenge found. Please request a new challenge.' }, { status: 401 });
    }

    // 5. Verify the signature
    const expectedMessage = getLinkChallengeMessage(authenticatedUser.signInNonce);
    let recoveredAddress;
    try {
      recoveredAddress = verifyMessage(expectedMessage, signature);
    } catch (verifyError) {
      console.error('Link wallet signature verification error:', verifyError);
      return NextResponse.json({ message: 'Invalid signature format or verification failed.' }, { status: 401 });
    }

    if (recoveredAddress.toLowerCase() !== normalizedAddressToLink) {
      return NextResponse.json({ message: 'Signature validation failed. Address mismatch.' }, { status: 401 });
    }

    // 6. Critical Check (Race Condition): Ensure the address hasn't been linked by another user since challenge was issued.
    const existingUserWithAddress = await prisma.user.findUnique({
      where: { evmAddress: normalizedAddressToLink },
    });

    if (existingUserWithAddress && existingUserWithAddress.id !== authenticatedUserId) {
      return NextResponse.json({ message: 'This EVM address has been linked to another account since the challenge was issued.' }, { status: 409 });
    }

    // 7. Signature is valid, link the address and clear the nonce
    const updatedUser = await prisma.user.update({
      where: { id: authenticatedUserId },
      data: {
        evmAddress: normalizedAddressToLink,
        signInNonce: null, // Clear the nonce
      },
    });

    // 8. Return success response (e.g., updated user profile)
    // Re-fetch to get the latest state, excluding sensitive fields
    const { passwordHash, signInNonce, ...userProfile } = updatedUser;
    
    return NextResponse.json({
      message: 'EVM wallet linked successfully.',
      user: userProfile,
    });

  } catch (error) {
    console.error('Profile Link Wallet Error:', error);
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