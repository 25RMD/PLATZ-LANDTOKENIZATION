import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get the land listing ID from the query parameters
    const url = new URL(request.url);
    const landListingId = url.searchParams.get('landListingId');

    if (!landListingId) {
      return NextResponse.json(
        { success: false, message: 'Land listing ID is required' },
        { status: 400 }
      );
    }

    // Get the land listing
    const landListing = await prisma.landListing.findUnique({
      where: { id: landListingId },
    });

    if (!landListing) {
      return NextResponse.json(
        { success: false, message: 'Land listing not found' },
        { status: 404 }
      );
    }

    // Return the minting status with serializable values
    const status = landListing.mintStatus || 'NOT_STARTED';
    
    return NextResponse.json({
      success: true,
      status,
      data: {
        landListingId: landListing.id,
        mintStatus: status,
        mintErrorReason: landListing.mintErrorReason || null,
        mintTimestamp: landListing.mintTimestamp || null,
        mintTransactionHash: landListing.mintTransactionHash || null,
        collectionId: landListing.collectionId || null,
        mainTokenId: landListing.mainTokenId || null,
        metadataUri: landListing.metadataUri || null,
        marketplaceListingId: landListing.marketplaceListingId || null,
        marketplaceListingError: landListing.marketplaceListingError || null,
      }
    });
  } catch (error: any) {
    console.error('Error getting minting status:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while getting minting status', 
        error: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { landListingId } = body;

    if (!landListingId) {
      return NextResponse.json(
        { success: false, message: 'Land listing ID is required' },
        { status: 400 }
      );
    }

    // Get the land listing
    const landListing = await prisma.landListing.findUnique({
      where: { id: landListingId },
    });

    if (!landListing) {
      return NextResponse.json(
        { success: false, message: 'Land listing not found' },
        { status: 404 }
      );
    }

    // Reset minting status
    // Only allow reset if status is FAILED or NOT_STARTED
    if (landListing.mintStatus !== 'FAILED' && landListing.mintStatus !== 'NOT_STARTED') {
      return NextResponse.json(
        { 
          success: false, 
          message: `Cannot reset minting status when status is ${landListing.mintStatus}. Only FAILED or NOT_STARTED statuses can be reset.` 
        },
        { status: 400 }
      );
    }

    // Update the land listing
    await prisma.landListing.update({
      where: { id: landListingId },
      data: {
        mintStatus: 'NOT_STARTED',
        mintErrorReason: null,
        mintTimestamp: null,
        mintTransactionHash: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Minting status reset successfully',
      data: {
        landListingId,
        mintStatus: 'NOT_STARTED',
      }
    });
  } catch (error: any) {
    console.error('Error resetting minting status:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while resetting minting status', 
        error: error.message 
      },
      { status: 500 }
    );
  }
} 