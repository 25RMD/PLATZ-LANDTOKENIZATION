import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/authUtils';
import prisma from '@/lib/prisma-client';
import { ListingStatus } from '@prisma/client';

// Define the expected structure of the request body
interface UpdateStatusRequestBody {
  status: ListingStatus;
}

/**
 * Update the status of a land listing
 */
export async function PATCH(request: NextRequest, { params: paramsPromise }: { params: Promise<{ listingId: string }> }) {
  const { listingId } = await paramsPromise;
  const listingid = listingId;
  
  // Get the token from cookies
  const cookieHeader = request.headers.get('cookie');
  const cookieToken = cookieHeader?.split(';')
    .find(c => c.trim().startsWith('auth-token='))?.split('=')[1];
    
  if (!cookieToken) {
    return NextResponse.json({ message: 'Unauthorized: No valid token provided' }, { status: 401 });
  }

  const payload = await verifyJwt(cookieToken);

  // Ensure user is authenticated and is an admin
  if (!payload || !payload.userId || !payload.isAdmin) {
    return NextResponse.json({ message: 'Forbidden: Access denied' }, { status: 403 });
  }
  if (!listingid) {
    return NextResponse.json({ message: 'Bad Request: Listing ID is required' }, { status: 400 });
  }

  let requestBody: UpdateStatusRequestBody;
  try {
    requestBody = await request.json();
  } catch (error) {
    return NextResponse.json({ message: 'Bad Request: Invalid JSON body' }, { status: 400 });
  }

  const { status: newStatus } = requestBody;

  // Basic validation for the new status
  // Define valid statuses based on your Prisma schema
  const validStatuses: ListingStatus[] = Object.values(ListingStatus);
  if (!newStatus || !validStatuses.includes(newStatus)) {
    return NextResponse.json({ message: `Bad Request: Invalid status value. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
  }

  try {
    // Check if the listing exists
    const existingListing = await prisma.landListing.findUnique({
      where: { id: listingid },
    });

    if (!existingListing) {
      return NextResponse.json({ message: 'Not Found: Listing not found' }, { status: 404 });
    }

    // Update the listing status
    const updatedListing = await prisma.landListing.update({
      where: { id: listingid },
      data: { status: newStatus },
    });

    return NextResponse.json(updatedListing, { status: 200 });
  } catch (error) {
    console.error(`Error updating status for listing ${listingid}:`, error);
    // Handle potential Prisma errors, e.g., if the update fails for some reason
    if (error instanceof Error && (error as any).code === 'P2025') { // Prisma's "Record to update not found"
        return NextResponse.json({ message: 'Not Found: Listing not found during update' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}