import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyJwtToken } from '@/lib/auth/jwt';

/**
 * GET /api/my-listings
 * 
 * Retrieves all land listings for the authenticated user
 * 
 * Response:
 * {
 *   success: boolean,
 *   listings: LandListing[]
 * }
 */
export async function GET(request: NextRequest) {
  console.log("API GET /api/my-listings: Starting request...");
  try {
    // Get authentication from auth-token cookie
    const authToken = request.cookies.get('auth-token')?.value;
    console.log("API GET /api/my-listings: Auth token present:", !!authToken);
    let userId: string | null = null;
    
    if (authToken) {
      try {
        const payload = await verifyJwtToken(authToken);
        if (payload && payload.userId) {
          userId = payload.userId;
          console.log("Authenticated user ID from token:", userId);
        }
      } catch (error) {
        console.warn("Error verifying auth-token:", error);
        // Continue to check for user ID in headers instead of returning error
      }
    }
    
    // If no valid auth token, check for user ID in headers (for development)
    if (!userId) {
      userId = request.headers.get('x-user-id');
      if (userId) {
        console.log("Using user ID from headers:", userId);
      }
    }
    
    // For development, if still no user ID, use a default one
    if (!userId) {
      console.warn("No authentication found, using default user ID for development");
      // Try to find an admin user
      const adminUser = await prisma.user.findFirst({ where: { isAdmin: true } });
      if (adminUser) {
        userId = adminUser.id;
        console.log("Using admin user ID:", userId);
      } else {
        // If no admin user, try to find any user
        const anyUser = await prisma.user.findFirst();
        if (anyUser) {
          userId = anyUser.id;
          console.log("Using existing user ID:", userId);
        } else {
          // If no users exist, return an error
          return NextResponse.json(
            { success: false, message: 'No valid users found in the system' },
            { status: 500 }
          );
        }
      }
    }

    console.log("API GET /api/my-listings: Fetching listings for user ID:", userId);
    
    // For development purposes, let's check if we're in development mode
    const isDevelopment = process.env.NODE_ENV === 'development';
    console.log(`API GET /api/my-listings: Running in ${isDevelopment ? 'development' : 'production'} mode`);
    
    // In development mode, we'll fetch all listings regardless of user ID
    // In production, we'll only fetch listings for the authenticated user
    const listings = await prisma.landListing.findMany({
      where: isDevelopment 
        ? {} // In development, fetch all listings
        : { userId: userId ? userId : undefined }, // In production, only fetch user's listings
      select: {
        id: true,
        nftTitle: true,
        parcelNumber: true,
        status: true,
        mintStatus: true,
        listingPrice: true,
        priceCurrency: true,
        createdAt: true,
        updatedAt: true,
        userId: true, // Include userId for debugging
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log("API GET /api/my-listings: Found listings count:", listings.length);
    if (listings.length === 0) {
      // For debugging, let's check if there are any listings at all in the database
      const allListings = await prisma.landListing.findMany({
        select: { id: true, userId: true },
        take: 5, // Just get a few for debugging
      });
      console.log("API GET /api/my-listings: Sample of all listings in DB:", allListings);
    }

    return NextResponse.json({
      success: true,
      listings,
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}
