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
    // 1. Get user ID from the 'x-user-id' header
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      console.log("API GET /api/my-listings: 'x-user-id' header missing.");
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }
    console.log(`API GET /api/my-listings: Authenticated user ID: ${userId}`);

    // 2. Fetch the user's profile to get their wallet address
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { evm_address: true },
    });

    if (!user || !user.evm_address) {
      console.log(`API GET /api/my-listings: No user found or no EVM address linked for user ID: ${userId}`);
      return NextResponse.json({ success: true, listings: [] }); // Return empty array if no wallet linked
    }
    console.log(`API GET /api/my-listings: User's EVM address: ${user.evm_address}`);

    // 3. Fetch listings where the creatorAddress matches the user's EVM address
    const listings = await prisma.land_listings.findMany({
      where: {
        creator_address: {
          equals: user.evm_address,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        nft_title: true,
        parcel_number: true,
        status: true,
        mint_status: true,
        listing_price: true,
        price_currency: true,
        created_at: true,
        updated_at: true,
        user_id: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    console.log(`API GET /api/my-listings: Found ${listings.length} listings for wallet ${user.evm_address}`);

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
