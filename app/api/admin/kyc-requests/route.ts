import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/db';

// GET handler for admins to fetch PENDING KYC Update Requests
export async function GET(request: NextRequest) {
  const isAdmin = request.headers.get('x-user-is-admin') === 'true';

  if (!isAdmin) {
    return NextResponse.json({ message: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    // Fetch PENDING KycUpdateRequests and include associated User data
    const pendingRequests = await prisma.kycUpdateRequest.findMany({
      where: {
        status: 'PENDING', // Only fetch pending requests
      },
      select: {
        // Select fields from the KycUpdateRequest itself
        id: true, // The ID of the update request (crucial for approve/reject actions)
        userId: true,
        status: true,
        changes: true, // The proposed changes submitted by the user
        createdAt: true, // When the request was submitted
        adminNotes: true,
        // Include selected fields from the related User record
        user: {
          select: {
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
            kycVerified: true,
          }
        }
      },
      orderBy: {
        createdAt: 'asc', // Show oldest requests first
      },
    });

    // Optional: Transform the data structure if needed for the frontend
    // e.g., flatten user data into the main object
    const transformedRequests = pendingRequests.map(req => ({
        updateRequestId: req.id, // Rename id for clarity
        userId: req.userId,
        status: req.status,
        changes: req.changes,
        adminNotes: req.adminNotes,
        submittedAt: req.createdAt,
        // Flatten user details
        ...(req.user),
        // Keep original references separate if needed
        // currentUserData: { ...req.user }
    }));

    return NextResponse.json(transformedRequests, { status: 200 });

  } catch (error) {
    console.error("Get Pending KYC Update Requests Error:", error);
    return NextResponse.json({ message: 'An error occurred fetching pending KYC requests.' }, { status: 500 });
  }
} 