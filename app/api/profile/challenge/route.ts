import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateNonce, verifyJwt } from '@/lib/authUtils';
import { isAddress } from 'ethers';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // 1. Authenticate user via JWT from cookies
    const cookieStore = await cookies(); // Get the cookie store
    const tokenCookie = cookieStore.get('token'); // Access the 'get' method on the store

    if (!tokenCookie) {
      return NextResponse.json({ message: 'Authentication token not found.' }, { status: 401 });
    }
    const decodedToken = await verifyJwt(tokenCookie.value);
    if (!decodedToken || !decodedToken.userId) {
      return NextResponse.json({ message: 'Invalid or expired authentication token.' }, { status: 401 });
    }
    const authenticatedUserId = decodedToken.userId;

    // 2. Get address from request body
    const body = await request.json();
    const { address } = body;

    // 3. Validate address
    if (!address || typeof address !== 'string' || !isAddress(address)) {
      return NextResponse.json({ message: 'Invalid or missing EVM address for linking' }, { status: 400 });
    }
    const normalizedAddressToLink = address.toLowerCase();

    // 4. Check if the address is already linked to another user
    const existingUserWithAddress = await prisma.user.findUnique({
      where: { evmAddress: normalizedAddressToLink },
    });

    if (existingUserWithAddress && existingUserWithAddress.id !== authenticatedUserId) {
      return NextResponse.json({ message: 'This EVM address is already linked to another account.' }, { status: 409 }); // 409 Conflict
    }
    
    // If the address is already linked to the *current* user, they might be re-initiating, which is fine.
    // Or, if they are trying to link an address they previously unlinked.

    // 5. Generate nonce
    const nonce = generateNonce();

    // 6. Store nonce in the authenticated user's signInNonce field
    await prisma.user.update({
      where: { id: authenticatedUserId },
      data: { signInNonce: nonce },
    });

    // 7. Return nonce
    return NextResponse.json({ nonce });

  } catch (error) {
    console.error('Profile EVM Challenge Error:', error);
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