// app/api/profile/route.ts
// Handles GET to fetch profile and PUT/PATCH to update profile data.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { Prisma } from '@prisma/client';
import { ProfileUpdateSchema } from '@/lib/schemas';

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
    'govIdRef'
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
        evmAddress: true,
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
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validationResult = ProfileUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ message: 'Invalid input', errors: validationResult.error.flatten().fieldErrors }, { status: 400 });
    }

    let validatedData = validationResult.data;

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        username: true,
        email: true,
        evmAddress: true, // Important for our logic
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
        kycVerified: true,
      }
    });

    if (!currentUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const updatesForPrisma: Prisma.UserUpdateInput = {};

    // --- START: Special handling for evmAddress ---
    if (validatedData.hasOwnProperty('evmAddress')) {
      const incomingEvmAddress = (validatedData.evmAddress === '' || validatedData.evmAddress === undefined) ? null : validatedData.evmAddress;
      const currentEvmAddress = currentUser.evmAddress;

      if (incomingEvmAddress && incomingEvmAddress.toLowerCase() !== currentEvmAddress?.toLowerCase()) {
        // User is trying to set or change evmAddress to a new non-null value
        return NextResponse.json({
          message: 'EVM address cannot be directly set or changed via this endpoint. Please use the dedicated wallet linking process. To unlink your current EVM address, provide `null` or an empty string for the `evmAddress` field.'
        }, { status: 400 });
      } else if (incomingEvmAddress === null && currentEvmAddress !== null) {
        // User is unlinking the EVM address
        updatesForPrisma.evmAddress = null;
      }
      // If incomingEvmAddress is the same as current (case-insensitive), or both are null, no change to evmAddress needs to be added here.
      // Remove evmAddress from validatedData so it's not processed by the generic loop below
      delete validatedData.evmAddress;
    }
    // --- END: Special handling for evmAddress ---

    const kycChanges: Record<string, any> = {};
    let hasKycChanges = false;

    // Compare remaining incoming data with current data
    for (const key in validatedData) {
      if (!validatedData.hasOwnProperty(key)) continue;

      const typedKey = key as keyof typeof validatedData;
      // @ts-ignore Helper for dynamic access, types are validated by Zod and comparison logic
      let incomingValue = validatedData[typedKey];
      // @ts-ignore
      let currentValue = currentUser[typedKey as keyof typeof currentUser];

      // Normalize empty strings to null for consistency, Zod schema handles this partially
      if (incomingValue === '') incomingValue = null;

      // Date comparison normalization
      if (typedKey === 'dateOfBirth' && currentValue instanceof Date && incomingValue) {
        currentValue = currentValue.toISOString().split('T')[0] as any;
        // incomingValue from Zod is already a Date object or null if preprocessed successfully
        // For string comparison, ensure incomingValue is also formatted if it's a string date
        if (incomingValue instanceof Date) {
            incomingValue = incomingValue.toISOString().split('T')[0] as any;
        }
      }

      if (incomingValue !== currentValue) {
        if (kycFields.includes(typedKey as any)) {
          kycChanges[typedKey] = incomingValue;
          hasKycChanges = true;
        } else {
          // @ts-ignore
          updatesForPrisma[typedKey] = incomingValue;
        }
      }
    }

    if (hasKycChanges) {
      console.log(`[API PUT /profile] User ${userId} submitting KYC changes for review:`, kycChanges);
      await prisma.kycUpdateRequest.create({
        data: {
          userId: userId,
          changes: kycChanges as Prisma.JsonObject,
          status: 'PENDING',
        }
      });
      updatesForPrisma.kycVerified = false;
      console.log(`[API PUT /profile] User ${userId} submitted KYC changes, kycVerified set to false pending review.`);
    }

    if (Object.keys(updatesForPrisma).length > 0) {
      console.log(`[API PUT /profile] User ${userId} updating user record:`, updatesForPrisma);
      await prisma.user.update({
        where: { id: userId },
        data: updatesForPrisma,
      });
    }

    const latestUserProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        username: true,
        email: true,
        evmAddress: true,
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
        kycVerified: true,
      }
    });

    if (hasKycChanges) {
      return NextResponse.json(
        { 
          message: 'Profile updated. Some changes require KYC review; verification status reset.', 
          user: latestUserProfile
        },
        { status: 200 } 
      );
    } else if (Object.keys(updatesForPrisma).length > 0) {
      return NextResponse.json(
        { 
          message: 'Profile updated successfully.', 
          user: latestUserProfile 
        },
        { status: 200 }
      );
    } else {
      console.log(`[API PUT /profile] User ${userId} submitted profile update with no actual changes.`);
      return NextResponse.json(
        { 
          message: 'No changes detected in profile data.',
          user: latestUserProfile
        }, 
        { status: 200 }
      );
    }

  } catch (error) {
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
    evmAddress: true,
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
    kycVerified: true,
}; 

// You might use PATCH instead of PUT if you only allow partial updates
// export async function PATCH(request: Request) { ... } 