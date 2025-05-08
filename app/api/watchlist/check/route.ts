import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db'; // Use the correct Prisma import
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    // Get user ID from request headers (set by middleware)
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    const collectionId = req.nextUrl.searchParams.get('collectionId');

    if (!collectionId) {
      return NextResponse.json(
        { error: 'Collection ID is required' },
        { status: 400 }
      );
    }

    // Check if the collection is in the user's watchlist using raw SQL
    const watchlistItems = await prisma.$queryRaw<{id: string}[]>`
      SELECT id FROM watchlist 
      WHERE "userId" = ${userId} AND "collectionId" = ${collectionId}
      LIMIT 1
    `;

    return NextResponse.json({
      success: true,
      isWatchlisted: watchlistItems.length > 0,
      watchlistItemId: watchlistItems.length > 0 ? watchlistItems[0].id : null
    });
  } catch (error) {
    console.error('Error checking watchlist status:', error);
    return NextResponse.json(
      { error: 'Failed to check watchlist status' },
      { status: 500 }
    );
  }
}
