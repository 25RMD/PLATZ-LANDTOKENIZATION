import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/authUtils';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  // Get the token from cookies
  const cookieToken = req.cookies.get('auth-token')?.value;
  if (!cookieToken) {
    return NextResponse.json({ message: 'Unauthorized: No valid token provided' }, { status: 401 });
  }

  const payload = await verifyJwt(cookieToken);

  // Ensure user is authenticated and is an admin
  if (!payload || !payload.userId || !payload.isAdmin) {
    return NextResponse.json({ message: 'Forbidden: Access denied. User is not an admin or not authenticated.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  // Get status values as strings - these should match the values in your Prisma schema
  const statuses = searchParams.getAll('status'); // e.g., ?status=DRAFT&status=PENDING

  try {
    const listings = await prisma.land_listings.findMany({
      where: {
        ...(statuses && statuses.length > 0 && { status: { in: statuses } }),
      },
      include: {
        users: { // Include user details (creator of the listing)
          select: {
            id: true,
            username: true,
            email: true, 
          },
        },
        // Add other relations if needed for "full details"
        // For example, if you have legal documents linked:
        // legalDocuments: { select: { documentType: true, documentUrl: true } },
      },
      orderBy: {
        created_at: 'desc', // Show newest first
      },
    });

    if (!listings || listings.length === 0) {
      return NextResponse.json({ listings: [], message: 'No listings found matching criteria' }, { status: 200 }); // Return 200 with empty array
    }

    return NextResponse.json(listings, { status: 200 });
  } catch (error) {
    console.error('Error fetching listings for admin:', error);
    // It's good to be more specific about error types if possible
    if (error instanceof Error) {
        return NextResponse.json({ message: `Internal Server Error: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}