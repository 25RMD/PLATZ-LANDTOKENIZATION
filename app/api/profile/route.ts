// app/api/profile/route.ts
// Handles GET to fetch profile and PUT/PATCH to update profile data.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { ProfileUpdateSchema } from '@/lib/schemas'; // Import schema
import { Prisma } from '@prisma/client'; // Import Prisma for Json type

// --- Define KYC-related fields --- 
const kycFields: (keyof Prisma.UserUpdateInput)[] = [
    'fullName',
    'dateOfBirth',
    'phone',
    'addressLine1',
    'addressLine2',
    'city',
    'stateProvince',
    'postalCode',
    'country',
    'govIdType',
    'govIdRef',
    'sofDocRef'
];

// GET handler to fetch current user's profile
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        // Select only the fields relevant to the profile page
        username: true,
        email: true,
        solanaPubKey: true,
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
      },
    });

    if (!userProfile) {
      return NextResponse.json({ message: 'User profile not found' }, { status: 404 });
    }

    return NextResponse.json(userProfile, { status: 200 });

  } catch (error) {
    console.error("Get Profile Error:", error);
    return NextResponse.json({ message: 'An error occurred fetching profile data.' }, { status: 500 });
  }
}

// PUT handler to update user's profile
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = ProfileUpdateSchema.safeParse(body);

    if (!validationResult.success) {
       return NextResponse.json(
            { message: "Invalid input", errors: validationResult.error.flatten().fieldErrors },
            { status: 400 }
        );
    }

    const validatedData = validationResult.data;

    // Fetch current user data to compare
    const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        // Select fields needed for comparison + potentially updated non-KYC fields
        select: {
            email: true, // Example non-KYC field
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
    });

    if (!currentUser) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const kycChanges: Record<string, any> = {};
    const nonKycUpdates: Record<string, any> = {};
    let hasKycChanges = false;

    // Compare incoming data with current data
    for (const key in validatedData) {
        const typedKey = key as keyof typeof validatedData;
        let incomingValue = validatedData[typedKey];
        let currentValue = currentUser[typedKey as keyof typeof currentUser];

        // Normalize empty strings to null for comparison/update
        if (incomingValue === '') incomingValue = null;

        // Format date for comparison (YYYY-MM-DD)
        if (currentValue instanceof Date) {
            currentValue = currentValue.toISOString().split('T')[0] as any;
        }
        // Validated data dateOfBirth is already string | null

        // Only consider fields that have actually changed
        if (incomingValue !== currentValue) {
            if (kycFields.includes(typedKey)) {
                kycChanges[typedKey] = incomingValue;
                hasKycChanges = true;
            } else {
                // Add non-KYC changes to a separate object for direct update
                // Exclude fields that should never be updated here (like kycVerified)
                if (typedKey !== 'kycVerified') { 
                     nonKycUpdates[typedKey] = incomingValue;
                }
            }
        }
    }

    // --- Logic based on whether KYC fields were changed --- 
    if (hasKycChanges) {
        // Create a KYC Update Request record
        console.log(`[API PUT /profile] User ${userId} submitting KYC changes for review:`, kycChanges);
        await prisma.kycUpdateRequest.create({
            data: {
                userId: userId,
                changes: kycChanges as Prisma.JsonObject, // Store changes as JSON
                status: 'PENDING',
            }
        });

        // --- Revoke verification if user was previously verified --- 
        // if (currentUser.kycVerified) {\n        //     console.log(`[API PUT /profile] User ${userId} was verified, revoking status due to KYC field change.`);\n        //     nonKycUpdates.kycVerified = false; // Add status reset to the direct update
        // }
        // New logic: User remains verified while update is PENDING. Status changes only upon admin approval/rejection via KycUpdateRequest.
        // ----------------------------------------------------------

        // If non-KYC fields (or kycVerified status) also changed, update them directly
        if (Object.keys(nonKycUpdates).length > 0) {
            console.log(`[API PUT /profile] User ${userId} updating non-KYC fields (or revoking KYC) alongside KYC submission:`, nonKycUpdates);
            await prisma.user.update({
                where: { id: userId },
                data: nonKycUpdates,
            });
        }

        // Fetch the LATEST profile state (note: kycVerified status hasn't changed yet) to return
        const latestUserProfile = await prisma.user.findUnique({ 
            where: { id: userId }, 
            select: profileSelectFields // Use the helper select object
        });

        return NextResponse.json(
            { 
                message: 'Profile updated. KYC changes submitted for review.',
                user: latestUserProfile // Return potentially updated profile state
            },
            { status: 200 } 
        );

    } else if (Object.keys(nonKycUpdates).length > 0) {
        // Only non-KYC changes detected, update directly
        console.log(`[API PUT /profile] User ${userId} updating non-KYC fields:`, nonKycUpdates);
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: nonKycUpdates,
            select: profileSelectFields, // Use the helper select object
        });
        return NextResponse.json(updatedUser, { status: 200 });
    } else {
        // No changes detected
        console.log(`[API PUT /profile] User ${userId} submitted profile update with no actual changes.`);
         // Return current profile data
         const latestUserProfile = await prisma.user.findUnique({ 
            where: { id: userId }, 
            select: profileSelectFields // Use the helper select object
        }); 
        return NextResponse.json(latestUserProfile, { status: 200 });
    }

  } catch (error) {
    // Handle potential errors like unique constraint violations (e.g., email already exists)
    if ((error as any).code === 'P2002' && (error as any).meta?.target?.includes('email')) {
        return NextResponse.json({ message: 'Email address is already in use.' }, { status: 409 });
    }

    console.error("Update Profile Error:", error);
    return NextResponse.json({ message: 'An error occurred updating profile data.' }, { status: 500 });
  }
}

// Helper to select profile fields consistently
const profileSelectFields = {
    username: true,
    email: true,
    solanaPubKey: true,
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
}; 

// You might use PATCH instead of PUT if you only allow partial updates
// export async function PATCH(request: Request) { ... } 