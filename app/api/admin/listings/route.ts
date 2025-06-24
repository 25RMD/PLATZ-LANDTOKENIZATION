import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from '@/lib/auth/jwt';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  // Get the token from cookies
  const token = req.cookies.get('auth-token')?.value;
  if (!token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  const payload = await verifyJwtToken(token);

  // Ensure user is authenticated and is an admin
  if (!payload || !payload.userId || !payload.isAdmin) {
    return NextResponse.json({ message: 'Forbidden: Access denied. User is not an admin or not authenticated.' }, { status: 403 });
  }

  try {
    const listings = await prisma.landListing.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            evmAddress: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Show newest first
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