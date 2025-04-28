// app/api/profile/challenge/route.ts
// Handles GET requests to generate a sign-in nonce FOR AN AUTHENTICATED USER
// This is used for actions like linking a new wallet to an existing account.

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { generateNonce } from '@/lib/authUtils';

export async function GET(request: NextRequest) {
  // 1. Get Authenticated User ID from Middleware Header
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }
  console.log(`[API /profile/challenge] Request for user: ${userId}`);

  try {
    // 2. Generate a new nonce
    const nonce = generateNonce();

    // 3. Update the user's record with the new nonce
    // We assume the user MUST exist because they are authenticated
    await prisma.user.update({
      where: { id: userId },
      data: { signInNonce: nonce },
    });

    console.log(`[API /profile/challenge] Generated nonce for user ${userId}: ${nonce}`);

    // 4. Return the nonce to the frontend
    return NextResponse.json({ nonce }, { status: 200 });

  } catch (error) {
    console.error(`[API /profile/challenge] Error for user ${userId}:`, error);
    // Check if error is because user wasn't found (shouldn't happen with middleware)
    if ((error as any)?.code === 'P2025') { // Prisma code for RecordNotFound
         return NextResponse.json({ message: 'Authenticated user not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'An error occurred generating the challenge.' }, { status: 500 });
  }
} 