import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * POST /api/reset-mint-status
 * 
 * Resets the mint status of listings from PENDING to FAILED
 * This is a utility endpoint for development purposes
 * 
 * Request body:
 * {
 *   listingIds?: string[] // Optional specific listing IDs to reset, if not provided all PENDING listings will be reset
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   updatedCount: number,
 *   updatedListings?: { id: string, mintStatus: string }[]
 * }
 */
export async function POST(request: NextRequest) {
  console.log("API POST /api/reset-mint-status: Starting request...");
  
  try {
    // Parse request body
    const body = await request.json().catch(() => ({}));
    const { listingIds } = body;
    
    // Build the where clause based on whether specific listing IDs were provided
    const where = listingIds && listingIds.length > 0
      ? { 
          id: { in: listingIds },
          mintStatus: 'PENDING'
        }
      : { mintStatus: 'PENDING' };
    
    console.log("Resetting mint status for listings with criteria:", where);
    
    // Find the listings that will be updated (for logging)
    const pendingListings = await prisma.landListing.findMany({
      where,
      select: { id: true, nftTitle: true }
    });
    
    console.log(`Found ${pendingListings.length} pending listings to reset:`, 
      pendingListings.map(l => `${l.id} (${l.nftTitle})`).join(', '));
    
    // Update the listings
    const updateResult = await prisma.landListing.updateMany({
      where,
      data: {
        mintStatus: 'FAILED',
        updatedAt: new Date()
      }
    });
    
    console.log(`Successfully reset ${updateResult.count} listings from PENDING to FAILED`);
    
    // Get the updated listings to return in the response
    const updatedListings = await prisma.landListing.findMany({
      where: {
        id: { in: pendingListings.map(l => l.id) }
      },
      select: {
        id: true,
        nftTitle: true,
        mintStatus: true
      }
    });
    
    return NextResponse.json({
      success: true,
      message: `Successfully reset ${updateResult.count} listings from PENDING to FAILED`,
      updatedCount: updateResult.count,
      updatedListings
    });
  } catch (error) {
    console.error('Error resetting mint status:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while resetting mint status', 
        error: error instanceof Error ? error.message : String(error),
        updatedCount: 0
      },
      { status: 500 }
    );
  }
}
