import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { Prisma } from '@prisma/client';

/**
 * Reject a KYC update request
 */
export async function DELETE(request: Request) {
    // Extract updateRequestId from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const updateRequestId = pathParts[pathParts.length - 2]; // Get the ID from the URL path
    
    // 1. Check Admin Status
    const isAdmin = request.headers.get('x-user-is-admin') === 'true';
    const requestingAdminId = request.headers.get('x-user-id');

    if (!isAdmin) {
        return NextResponse.json({ message: 'Forbidden: Admin access required' }, { status: 403 });
    }

    if (!updateRequestId) {
        return NextResponse.json({ message: 'KYC Update Request ID is required' }, { status: 400 });
    }

    console.log(`Admin [${requestingAdminId}] attempting to REJECT KYC Update Request [${updateRequestId}]`);

    try {
        // 2. Find the KycUpdateRequest record
        const updateRequest = await prisma.kycUpdateRequest.findUnique({
            where: { id: updateRequestId },
            select: { id: true, status: true, userId: true } // Select needed fields
        });

        if (!updateRequest) {
            return NextResponse.json({ message: 'KYC Update Request not found' }, { status: 404 });
        }

        // Optional: Check if already processed
        if (updateRequest.status !== 'PENDING') {
            return NextResponse.json(
                { message: `Request has already been processed (Status: ${updateRequest.status})` },
                { status: 409 } // Conflict
            );
        }

        // 3. Update the status of the KycUpdateRequest to REJECTED
        const rejectedRequest = await prisma.kycUpdateRequest.update({
            where: { id: updateRequestId },
            data: {
                status: 'REJECTED',
                // Optionally add admin notes here if a field exists/is added
                // adminNotes: `Rejected by ${requestingAdminId} on ${new Date().toISOString()}`
            },
            select: { id: true, status: true } // Return minimal confirmation
        });

        console.log(`Admin [${requestingAdminId}] successfully REJECTED KYC Update Request [${updateRequestId}] for user [${updateRequest.userId}].`);
        // TODO: Optionally send a notification email to the user explaining the rejection

        // NOTE: We do NOT modify the User record here.
        // The user's kycVerified status and data remain as they were before this request was submitted.

        return NextResponse.json(
            { message: 'KYC Update Request rejected successfully.', request: rejectedRequest },
            { status: 200 }
        );

    } catch (error) {
        console.error(`Error rejecting KYC Update Request ${updateRequestId}:`, error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return NextResponse.json({ message: 'KYC Update Request not found during update.' }, { status: 404 });
             }
        }
        return NextResponse.json({ message: 'An error occurred during KYC rejection.' }, { status: 500 });
    }
} 