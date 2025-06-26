// app/api/profile/route.ts
// Handles GET to fetch profile and PUT/PATCH to update profile data.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { Prisma } from '@prisma/client';
import { ProfileUpdateSchema } from '@/lib/schemas';
import { randomUUID } from 'crypto';

// --- Define KYC-related fields --- 
const kycFields: (keyof Prisma.usersUpdateInput)[] = [ 
    'full_name',
    'date_of_birth',
    'phone',
    'address_line1',
    'address_line2',
    'city',
    'state_province',
    'postal_code',
    'country',
    'gov_id_type',
    'gov_id_ref'
];

// GET handler to fetch current user's profile
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const userProfile = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        username: true,
        email: true,
        evm_address: true,
        full_name: true,
        date_of_birth: true,
        phone: true,
        address_line1: true,
        address_line2: true,
        city: true,
        state_province: true,
        postal_code: true,
        country: true,
        gov_id_type: true,
        gov_id_ref: true,
        kyc_verified: true,
      },
    });

    if (!userProfile) {
      return NextResponse.json({ message: 'User profile not found' }, { status: 404 });
    }

    // Transform to camelCase for the frontend
    const transformedProfile = {
      username: userProfile.username,
      email: userProfile.email,
      evmAddress: userProfile.evm_address,
      fullName: userProfile.full_name,
      dateOfBirth: userProfile.date_of_birth,
      phone: userProfile.phone,
      addressLine1: userProfile.address_line1,
      addressLine2: userProfile.address_line2,
      city: userProfile.city,
      stateProvince: userProfile.state_province,
      postalCode: userProfile.postal_code,
      country: userProfile.country,
      govIdType: userProfile.gov_id_type,
      govIdRef: userProfile.gov_id_ref,
      kycVerified: userProfile.kyc_verified,
    };

    return NextResponse.json(transformedProfile, { status: 200 });

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

    const currentUser = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        username: true,
        email: true,
        evm_address: true, // Important for our logic
        full_name: true,
        date_of_birth: true,
        phone: true,
        address_line1: true,
        address_line2: true,
        city: true,
        state_province: true,
        postal_code: true,
        country: true,
        gov_id_type: true,
        gov_id_ref: true,
        kyc_verified: true,
      }
    });

    if (!currentUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const updatesForPrisma: Prisma.usersUpdateInput = {};

    // --- START: Special handling for evm_address ---
    if (Object.prototype.hasOwnProperty.call(validatedData, 'evm_address')) {
      const incomingEvmAddress = (validatedData.evm_address === '' || validatedData.evm_address === undefined) ? null : validatedData.evm_address;
      const currentEvmAddress = currentUser.evm_address;

      if (incomingEvmAddress && incomingEvmAddress.toLowerCase() !== currentEvmAddress?.toLowerCase()) {
        // User is trying to set or change evm_address to a new non-null value
        return NextResponse.json({
          message: 'EVM address cannot be directly set or changed via this endpoint. Please use the dedicated wallet linking process. To unlink your current EVM address, provide `null` or an empty string for the `evm_address` field.'
        }, { status: 400 });
      } else if (incomingEvmAddress === null && currentEvmAddress !== null) {
        // User is unlinking the EVM address
        updatesForPrisma.evm_address = null;
      }
      // If incomingEvmAddress is the same as current (case-insensitive), or both are null, no change to evm_address needs to be added here.
      // Remove evm_address from validatedData so it's not processed by the generic loop below
      delete validatedData.evm_address;
    }
    // --- END: Special handling for evm_address ---

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
      if (typedKey === 'date_of_birth' && currentValue instanceof Date && incomingValue) {
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
      console.log(`[API PUT /profile] KYC changes persisted to user record and marked unverified.`);

      // 1) Create a pending KYC update request record
      await prisma.kyc_update_requests.create({
        data: {
          id: randomUUID(),
          userId: userId,
          changes: kycChanges as Prisma.JsonObject,
          status: 'PENDING',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });

      // 2) Also apply the requested changes to the user record immediately so the UI reflects the edit
      Object.assign(updatesForPrisma, kycChanges);

      // 3) Mark the account as unverified until admin approval
      updatesForPrisma.kyc_verified = false;
    }

    if (Object.keys(updatesForPrisma).length > 0) {
      console.log(`[API PUT /profile] User ${userId} updating user record:`, updatesForPrisma);
      await prisma.users.update({
        where: { id: userId },
        data: updatesForPrisma,
      });
    }

    const latestUserProfile = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        username: true,
        email: true,
        evm_address: true,
        full_name: true,
        date_of_birth: true,
        phone: true,
        address_line1: true,
        address_line2: true,
        city: true,
        state_province: true,
        postal_code: true,
        country: true,
        gov_id_type: true,
        gov_id_ref: true,
        kyc_verified: true,
      },
    });

    if (!latestUserProfile) {
      return NextResponse.json({ message: 'User not found after update' }, { status: 404 });
    }

    // Transform to camelCase for the frontend
    const transformedProfile = {
      username: latestUserProfile.username,
      email: latestUserProfile.email,
      evmAddress: latestUserProfile.evm_address,
      fullName: latestUserProfile.full_name,
      dateOfBirth: latestUserProfile.date_of_birth,
      phone: latestUserProfile.phone,
      addressLine1: latestUserProfile.address_line1,
      addressLine2: latestUserProfile.address_line2,
      city: latestUserProfile.city,
      stateProvince: latestUserProfile.state_province,
      postalCode: latestUserProfile.postal_code,
      country: latestUserProfile.country,
      govIdType: latestUserProfile.gov_id_type,
      govIdRef: latestUserProfile.gov_id_ref,
      kycVerified: latestUserProfile.kyc_verified,
    };

    let message = 'No changes detected in profile update.';
    if (hasKycChanges) {
      message = 'Profile updated. Some changes require KYC review; verification status reset.';
    } else if (Object.keys(updatesForPrisma).length > 0) {
      message = 'Profile updated successfully.';
    }

    return NextResponse.json({ message, user: transformedProfile }, { status: 200 });

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
    evm_address: true,
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