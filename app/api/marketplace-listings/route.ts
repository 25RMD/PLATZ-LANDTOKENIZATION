import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/marketplace-listings
 *
 * Body (JSON):
 * {
 *   collectionId: string | number;   // The on-chain collectionId that was just listed
 *   transactionHash?: string;        // Optional: tx hash of the listCollection transaction
 *   listingError?: string;           // Optional: error message when listing failed
 * }
 *
 * The endpoint updates the corresponding LandListing row, setting
 *  - marketplaceListingId (numeric – parsed from collectionId)
 *  - marketplaceTransactionHash (if provided)
 *  - marketplaceListingError (null on success or error message)
 *
 * Authentication: expects an `x-user-id` header injected by auth middleware.
 *                Falls back to a hard-coded test user when absent (dev parity with other routes).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { collectionId, transactionHash, listingError } = body ?? {};

    if (!collectionId) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: collectionId' },
        { status: 400 }
      );
    }

    // Dev-only fallback userId (mirrors other routes) – replace with proper auth in production.
    let userId: string | null = req.headers.get('x-user-id');
    if (!userId) {
      userId = '566a0c3d-c4b4-4e9c-8eb3-89f2cc0a74c0';
    }

    // Prepare update payload – only include primitives accepted by Prisma schema.
    const updateData: Record<string, any> = {
      // Prisma `Int`; casting to Number as collectionId originates from Solidity uint256 but is small for MVP.
      marketplaceListingId:
        typeof collectionId === 'string' ? Number(collectionId) : collectionId,
      marketplaceListingError: listingError ?? null,
    };

    if (transactionHash) {
      updateData.marketplaceTransactionHash = transactionHash;
    }

    // Update the LandListing row identified by collectionId & userId (owner).
    const updated = await prisma.landListing.updateMany({
      where: {
        collectionId: String(collectionId),
        userId: userId,
      },
      data: updateData,
    });

    if (updated.count === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No LandListing found for provided collectionId and user',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[API /api/marketplace-listings] Error:', err);
    return NextResponse.json(
      { success: false, error: err?.message ?? 'Unexpected error' },
      { status: 500 }
    );
  }
}
