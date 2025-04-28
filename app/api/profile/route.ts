// app/api/profile/route.ts
// Handles GET to fetch profile and PUT/PATCH to update profile data.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { ProfileUpdateSchema } from '@/lib/schemas'; // Import schema

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

    // Get data from request body
    const body = await request.json();

    // Validate request body against schema
    const validationResult = ProfileUpdateSchema.safeParse(body);
    if (!validationResult.success) {
       return NextResponse.json(
            { message: "Invalid input", errors: validationResult.error.flatten().fieldErrors },
            { status: 400 }
        );
    }

    // Use validated data (safeParse ensures only defined fields are present)
    const dataToUpdate = validationResult.data;

    // Clean data: Convert empty strings back to null for optional fields if desired by DB
    Object.keys(dataToUpdate).forEach(key => {
      if (dataToUpdate[key as keyof typeof dataToUpdate] === '') {
        dataToUpdate[key as keyof typeof dataToUpdate] = null;
      }
    });

    // Remove fields that shouldn't be updated via this route
    delete (dataToUpdate as any).username;
    delete (dataToUpdate as any).solanaPubKey;
    delete (dataToUpdate as any).kycVerified; // User cannot verify themselves
    // Add any other fields to prevent update if necessary

    // Check if there's anything left to update after validation & filtering
    if (Object.keys(dataToUpdate).length === 0) {
        return NextResponse.json({ message: 'No valid updatable fields provided' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      // Pass the validated and filtered data object
      data: dataToUpdate,
      select: { // Return the updated profile data, including new fields
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

    console.log(`Profile updated for user: ${userId}`);
    return NextResponse.json(updatedUser, { status: 200 });

  } catch (error) {
    // Handle potential errors like unique constraint violations (e.g., email already exists)
    if ((error as any).code === 'P2002' && (error as any).meta?.target?.includes('email')) {
        return NextResponse.json({ message: 'Email address is already in use.' }, { status: 409 });
    }

    console.error("Update Profile Error:", error);
    return NextResponse.json({ message: 'An error occurred updating profile data.' }, { status: 500 });
  }
}

// You might use PATCH instead of PUT if you only allow partial updates
// export async function PATCH(request: Request) { ... } 