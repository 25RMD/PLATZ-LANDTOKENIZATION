import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/db';

// GET handler for admins to fetch pending KYC requests
export async function GET(request: NextRequest) {
  // Middleware already verified admin status and attached user info
  const requestingUserId = request.headers.get('x-user-id');
  const isAdmin = request.headers.get('x-user-is-admin') === 'true';

  // Double-check admin status (defense in depth)
  if (!isAdmin) {
    return NextResponse.json({ message: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    // Fetch users who are not yet verified BUT have submitted some KYC data
    // Adjust the `where` clause based on which fields indicate a pending request
    const pendingUsers = await prisma.user.findMany({
      where: {
        kycVerified: false,
        // Add conditions to only fetch users who have submitted data, e.g.:
        OR: [
          { fullName: { not: null } },
          { dateOfBirth: { not: null } },
          { phone: { not: null } },
          { addressLine1: { not: null } },
          { govIdRef: { not: null } },
          { sofDocRef: { not: null } },
        ],
        // Optionally exclude the requesting admin if needed
        // id: { not: requestingUserId }
      },
      select: {
        // Select fields needed for the admin review dashboard
        id: true,
        username: true,
        email: true,
        fullName: true,
        dateOfBirth: true,
        phone: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        stateProvince: true,
        postalCode: true,
        country: true,
        govIdType: true,
        govIdRef: true,
        sofDocRef: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc', // Show oldest requests first
      },
    });

    return NextResponse.json(pendingUsers, { status: 200 });

  } catch (error) {
    console.error("Get KYC Requests Error:", error);
    return NextResponse.json({ message: 'An error occurred fetching KYC requests.' }, { status: 500 });
  }
} 