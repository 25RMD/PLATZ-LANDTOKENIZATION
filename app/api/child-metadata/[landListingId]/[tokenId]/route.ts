import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

interface Params {
  landListingId: string;
  tokenId: string;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  try {
    const params = await context.params;
    const { landListingId, tokenId } = params;

    // Fetch the land listing to get base metadata
    const listing = await prisma.landListing.findUnique({
      where: { id: landListingId },
      select: {
        nftTitle: true,
        nftDescription: true,
        nftImageFileRef: true,
        country: true,
        state: true,
        localGovernmentArea: true,
        propertyAreaSqm: true,
        latitude: true,
        longitude: true,
      }
    });

    if (!listing) {
      return NextResponse.json({ error: 'Land listing not found' }, { status: 404 });
    }

    // Create child token metadata based on the main token
    const childTokenMetadata = {
      name: `${listing.nftTitle} - Plot ${tokenId}`,
      description: `${listing.nftDescription} - Sub-plot ${tokenId} of the collection.`,
      image: listing.nftImageFileRef,
      attributes: [
        { trait_type: "Token Type", value: "Child Token" },
        { trait_type: "Plot Number", value: parseInt(tokenId) },
        { trait_type: "Parent Collection", value: `${listing.nftTitle} Collection` },
        { trait_type: "Country", value: listing.country },
        { trait_type: "State", value: listing.state },
        { trait_type: "Local Government Area", value: listing.localGovernmentArea },
        { trait_type: "Area (sq.m)", value: listing.propertyAreaSqm },
        { trait_type: "Latitude", value: listing.latitude },
        { trait_type: "Longitude", value: listing.longitude },
      ].filter(attr => attr.value !== null && attr.value !== undefined)
    };

    return NextResponse.json(childTokenMetadata, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });

  } catch (error) {
    console.error('Error generating child token metadata:', error);
    return NextResponse.json(
      { error: 'Failed to generate metadata' },
      { status: 500 }
    );
  }
} 