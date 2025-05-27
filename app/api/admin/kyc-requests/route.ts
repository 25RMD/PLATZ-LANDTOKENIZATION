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
    
    // Simplified query with minimal fields to avoid any issues
    const pendingRequests = await prisma.kycUpdateRequest.findMany({
      where: {
        status: 'PENDING',
      },
      select: {
        id: true,
        userId: true,
        status: true,
        changes: true,
        createdAt: true,
        adminNotes: true,
        user: {
          select: {
            username: true,
            email: true,
            fullName: true,
            kycVerified: true,
          }
        }
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    console.log(`Found ${pendingRequests.length} pending KYC requests`);

    // Transform the data with minimal processing
    const transformedRequests = pendingRequests.map(req => {
        // Create safe copies of nested objects to avoid reference issues
        const user = req.user || {};
        
        return {
            updateRequestId: req.id,
            userId: req.userId,
            status: req.status,
            changes: req.changes,
            adminNotes: req.adminNotes,
            submittedAt: req.createdAt,
            username: (user as any).username || null,
            email: (user as any).email || null,
            fullName: (user as any).fullName || null,
            kycVerified: (user as any).kycVerified || false,
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