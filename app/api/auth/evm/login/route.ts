import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createJwt, generateNonce } from '@/lib/authUtils'; // Assuming generateNonce isn't needed here but createJwt is
import { isAddress, verifyMessage } from 'ethers';

// Helper function to construct the challenge message, ensure it matches the frontend
const getChallengeMessage = (nonce: string): string => {
  return `Please sign this message to log in.\nNonce: ${nonce}`;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { address, signature } = body;

    if (!address || typeof address !== 'string' || !isAddress(address)) {
      return NextResponse.json({ message: 'Invalid or missing EVM address' }, { status: 400 });
    }
    if (!signature || typeof signature !== 'string') {
      return NextResponse.json({ message: 'Invalid or missing signature' }, { status: 400 });
    }

    const normalizedAddress = address.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { evmAddress: normalizedAddress },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found. Please request a challenge first.' }, { status: 401 });
    }

    if (!user.signInNonce) {
      return NextResponse.json({ message: 'No active challenge found for this user. Please request a new challenge.' }, { status: 401 });
    }

    const expectedMessage = getChallengeMessage(user.signInNonce);
    let recoveredAddress;
    try {
      recoveredAddress = verifyMessage(expectedMessage, signature);
    } catch (verifyError) {
      console.error('Signature verification error:', verifyError);
      return NextResponse.json({ message: 'Invalid signature format or verification failed.' }, { status: 401 });
    }
    

    if (recoveredAddress.toLowerCase() !== normalizedAddress) {
      return NextResponse.json({ message: 'Signature validation failed. Address mismatch.' }, { status: 401 });
    }

    // Signature is valid, clear the nonce and issue JWT
    await prisma.user.update({
      where: { id: user.id },
      data: { signInNonce: null }, // Clear the nonce after successful use
    });

    const token = await createJwt({ userId: user.id, isAdmin: user.isAdmin });

    // Return user info (excluding sensitive data) and token
    // Consider what user information is appropriate to return here
    const { passwordHash, signInNonce, ...userProfile } = user;
    
    const response = NextResponse.json({ 
      message: 'Login successful',
      user: userProfile,
      // token: token // Optionally return token in body
    });

    // Set JWT as an HttpOnly cookie for security
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax',
      path: '/',
      // maxAge: // consider setting maxAge if your JWT has a fixed short life
    });

    return response;

  } catch (error) {
    console.error('EVM Login Error:', error);
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
