import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';

// Schema for the request body
const VerifyUserSchema = z.object({
  userId: z.string().uuid({ message: "Invalid User ID format" }),
});

// POST handler for admins to verify a user
export async function POST(request: NextRequest) {
  // 1. Check Admin Status (from middleware)
  const isAdmin = request.headers.get('x-user-is-admin') === 'true';
  if (!isAdmin) {
    return NextResponse.json({ message: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    const body = await request.json();

    // 2. Validate Input
    const validationResult = VerifyUserSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { userId } = validationResult.data;

    // 3. Update User Status in DB
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        kycVerified: true,
        // Optionally clear document references after verification if desired
        // govIdRef: null,
        // sofDocRef: null,
      },
      select: { // Return minimal confirmation
          id: true,
          kycVerified: true
      }
    });

    if (!updatedUser) {
         return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    console.log(`Admin verified user: ${userId}`);
    // TODO: Optionally send a notification email to the user

    return NextResponse.json({ message: 'User verified successfully', user: updatedUser }, { status: 200 });

  } catch (error) {
    // Handle potential Prisma errors (e.g., user not found)
    if ((error as any).code === 'P2025') { // Prisma error code for record not found on update
         return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    console.error("Verify User Error:", error);
    return NextResponse.json({ message: 'An error occurred verifying the user.' }, { status: 500 });
  }
} 