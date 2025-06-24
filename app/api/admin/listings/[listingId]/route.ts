import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from '@/lib/auth/jwt';
import prisma from '@/lib/db';
import { ListingStatus } from '@prisma/client';

export async function PUT(req: NextRequest, { params }: { params: { listingId: string } }) {
  const token = req.cookies.get('auth-token')?.value;
  if (!token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  const payload = await verifyJwtToken(token);
  if (!payload || !payload.userId || !payload.isAdmin) {
    return NextResponse.json({ message: 'Forbidden: Admin access required' }, { status: 403 });
  }

  const { listingId } = params;
  if (!listingId) {
    return NextResponse.json({ message: 'Listing ID is required' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { status, rejectionReason } = body;

    if (!status || !Object.values(ListingStatus).includes(status)) {
      return NextResponse.json({ message: 'Invalid status provided' }, { status: 400 });
    }

    if (status === 'REJECTED' && !rejectionReason) {
      return NextResponse.json({ message: 'Rejection reason is required when rejecting a listing' }, { status: 400 });
    }

    const updatedListing = await prisma.landListing.update({
      where: { id: listingId },
      data: {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason : null,
      },
    });

    return NextResponse.json(updatedListing, { status: 200 });
  } catch (error) {
    console.error(`Error updating listing ${listingId}:`, error);
    if (error instanceof Error) {
        return NextResponse.json({ message: `Internal Server Error: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
