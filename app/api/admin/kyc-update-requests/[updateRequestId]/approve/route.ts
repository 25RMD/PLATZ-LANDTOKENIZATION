import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { Prisma } from '@prisma/client';

/**
 * Approve a KYC update request
 */
export async function POST(request: Request) {
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

    console.log(`Admin [${requestingAdminId}] attempting to APPROVE KYC Update Request [${updateRequestId}]`);

    try {
        // Use a transaction to ensure both User and KycUpdateRequest are updated reliably
        const result = await prisma.$transaction(async (tx) => {
            // 2. Find the KycUpdateRequest record and lock it for the transaction
            const updateRequest = await tx.kycUpdateRequest.findUnique({
                where: { id: updateRequestId },
                select: { id: true, status: true, userId: true, changes: true } // Select needed fields, including changes
            });

            if (!updateRequest) {
                // Throw error to rollback transaction
                throw new Error('KYC Update Request not found');
            }

            if (updateRequest.status !== 'PENDING') {
                // Throw error to rollback transaction
                throw new Error(`Request has already been processed (Status: ${updateRequest.status})`);
            }

            // 3. Apply the changes to the corresponding User record
            // Ensure 'changes' is treated as Prisma.JsonObject
            const changesToApply = updateRequest.changes as Prisma.JsonObject;
            if (!changesToApply || typeof changesToApply !== 'object') {
                throw new Error('Invalid changes data in the update request.');
            }

            const updatedUser = await tx.user.update({
                where: { id: updateRequest.userId },
                data: {
                    ...changesToApply, // Spread the changes from the request
                    kycVerified: true, // Explicitly set verification status to true
                },
                select: { id: true, kycVerified: true } // Select confirmation data
            });

            // 4. Update the status of the KycUpdateRequest to APPROVED
            const approvedRequest = await tx.kycUpdateRequest.update({
                where: { id: updateRequestId },
                data: {
                    status: 'APPROVED',
                    // adminNotes: `Approved by ${requestingAdminId} on ${new Date().toISOString()}`
                },
                select: { id: true, status: true }
            });

            console.log(`Admin [${requestingAdminId}] successfully APPROVED KYC Update Request [${updateRequestId}] for user [${updateRequest.userId}]. User record updated.`);
            // TODO: Optionally send a notification email to the user about approval

            return { approvedRequest, updatedUser };
        });

        return NextResponse.json(
            { 
                message: 'KYC Update Request approved successfully. User data updated.',
                request: result.approvedRequest,
                user: result.updatedUser
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error(`Error approving KYC Update Request ${updateRequestId}:`, error);

        // Handle specific errors thrown from the transaction
        if (error.message === 'KYC Update Request not found') {
            return NextResponse.json({ message: error.message }, { status: 404 });
        }
        if (error.message.startsWith('Request has already been processed')) {
            return NextResponse.json({ message: error.message }, { status: 409 }); // Conflict
        }
         if (error.message === 'Invalid changes data in the update request.') {
            return NextResponse.json({ message: error.message }, { status: 400 });
        }

        // Handle potential Prisma errors (e.g., user record not found during update)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') { // Record to update not found
                 return NextResponse.json({ message: 'User not found during update process.' }, { status: 404 });
            }
        }

        return NextResponse.json({ message: 'An error occurred during KYC approval.' }, { status: 500 });
    }
} 