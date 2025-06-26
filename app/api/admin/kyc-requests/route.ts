import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { verifyJwt } from '@/lib/authUtils';
import { cookies } from 'next/headers';

// GET handler for admins to fetch PENDING KYC Update Requests
export async function GET(request: NextRequest) {
  try {
    // More robust admin authorization
    const authHeader = request.headers.get('x-user-is-admin');
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('auth-token');
    
    let isAdmin = authHeader === 'true';
    let userId = null;
    
    // Check auth token if header check fails
    if (!isAdmin && authCookie?.value) {
      try {
        const payload = await verifyJwt(authCookie.value);
        isAdmin = payload?.isAdmin === true;
        userId = (payload as any)?.sub;
        console.log(`User authenticated via JWT: userId=${userId}, isAdmin=${isAdmin}`);
      } catch (jwtError) {
        console.error('JWT verification failed:', jwtError);
      }
    }

    if (!isAdmin) {
      console.error('Admin authorization failed for /api/admin/kyc-requests');
      return NextResponse.json({ message: 'Forbidden: Admin access required' }, { status: 403 });
    }

    console.log('Fetching PENDING KYC update requests...');
    
    // Corrected query using camelCase fields as defined in the Prisma schema
    const pendingRequests = await prisma.kyc_update_requests.findMany({
      where: {
        status: 'PENDING',
      },
      select: {
        id: true,
        userId: true, // Corrected from user_id
        status: true,
        changes: true,
        createdAt: true, // Corrected from created_at
        adminNotes: true, // Corrected from admin_notes
        users: {
          select: {
            username: true,
            email: true,
            full_name: true, // Assuming full_name is correct, will adjust if needed
            kyc_verified: true, // Assuming kyc_verified is correct
          },
        },
      },
      orderBy: {
        createdAt: 'asc', // Corrected from created_at
      },
    });

    console.log(`Found ${pendingRequests.length} pending KYC requests`);

    // Transform data to use camelCase keys expected by the frontend
    const transformedRequests = pendingRequests.map(req => {
      const user = req.users || {};
      return {
        updateRequestId: req.id,
        userId: req.userId,
        status: req.status,
        changes: req.changes,
        adminNotes: req.adminNotes,
        submittedAt: req.createdAt,
        // Flatten user details into the response with camelCase keys
        username: user.username || null,
        email: user.email || null,
        fullName: (user as any).full_name || null,
        kycVerified: (user as any).kyc_verified || false,
      };
    });

    return NextResponse.json(transformedRequests);

  } catch (error) {
    console.error("Get Pending KYC Update Requests Error:", error);
    
    // Check for specific Prisma errors
    let errorMessage = 'An error occurred fetching pending KYC requests.';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('relation "kyc_update_requests" does not exist')) {
        errorMessage = 'Database error: The KYC requests table does not exist.';
      } else if (error.message.includes('connection')) {
        errorMessage = 'Database error: Could not connect to the database.';
      }
    }
    
    return NextResponse.json({ 
      message: errorMessage,
      error: error instanceof Error ? error.message : String(error) 
    }, { status: statusCode });
  }
} 