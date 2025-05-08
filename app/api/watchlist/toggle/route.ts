import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db'; // Use the correct Prisma import
import { Prisma } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    // Get user ID from request headers (set by middleware)
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    const { collectionId } = await req.json();

    if (!collectionId) {
      return NextResponse.json(
        { error: 'Collection ID is required' },
        { status: 400 }
      );
    }

    // Check if the collection exists
    const collection = await prisma.landListing.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    // Check if the collection is already in the user's watchlist using raw SQL
    const existingWatchlistItems = await prisma.$queryRaw<{id: string}[]>`
      SELECT id FROM watchlist 
      WHERE "userId" = ${userId} AND "collectionId" = ${collectionId}
      LIMIT 1
    `;
    
    let action;
    
    if (existingWatchlistItems && existingWatchlistItems.length > 0) {
      // Remove from watchlist
      await prisma.$executeRaw`
        DELETE FROM watchlist 
        WHERE id = ${existingWatchlistItems[0].id}
      `;
      action = 'removed';
    } else {
      // Add to watchlist
      await prisma.$executeRaw`
        INSERT INTO watchlist (id, "userId", "collectionId", "createdAt") 
        VALUES (${Prisma.raw(`'${crypto.randomUUID()}'`)}, ${userId}, ${collectionId}, ${Prisma.raw('NOW()')})
      `;
      action = 'added';
    }

    return NextResponse.json({
      success: true,
      action
    });
  } catch (error) {
    console.error('Error toggling watchlist:', error);
    return NextResponse.json(
      { error: 'Failed to update watchlist' },
      { status: 500 }
    );
  }
}
