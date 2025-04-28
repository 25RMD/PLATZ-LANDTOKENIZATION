// app/api/auth/me/route.ts
// Handles GET requests to retrieve the currently authenticated user's data.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // User ID should be attached by the middleware
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      // This shouldn't happen if middleware is configured correctly
      console.error("Get Me Error: User ID not found in headers after middleware.");
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    // Fetch user from DB
    const user = await prisma.user.findUnique({
      where: { id: userId },
      // Select only the necessary fields to return
      select: {
        id: true,
        username: true,
        email: true,
        solanaPubKey: true,
        fullName: true,
        // Add other non-sensitive profile fields you want to return
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      console.error(`Get Me Error: User not found with ID: ${userId}`);
      // Could indicate DB inconsistency or deleted user
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });

  } catch (error) {
    console.error("Get Me Error:", error);
    return NextResponse.json({ message: 'An error occurred fetching user data.' }, { status: 500 });
  }
} 