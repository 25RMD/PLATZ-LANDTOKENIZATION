import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { LandListing } from '@prisma/client';

interface ChildTokenMetadata {
  name: string;
  description: string;
  image: string;
  attributes: {
    trait_type: string;
    value: string | number;
  }[];
  external_url: string;
}

export async function GET(
  _request: NextRequest, // Add NextRequest as the first parameter
  { params: paramsPromise }: { params: Promise<{ landListingDbId: string; evmTokenId: string }> }
) {
  const actualParams = await paramsPromise;

  if (!actualParams) {
    console.error('[API Child Token Metadata] Error: actualParams is undefined after awaiting paramsPromise. paramsPromise was:', paramsPromise);
    return NextResponse.json({ error: 'Failed to resolve route parameters' }, { status: 500 });
  }

  const { landListingDbId, evmTokenId: rawEvmTokenId } = actualParams;
  let evmTokenId = rawEvmTokenId;
  if (evmTokenId.endsWith('.json')) {
    evmTokenId = evmTokenId.slice(0, -5); // Remove '.json'
  }

  if (!landListingDbId || !evmTokenId) {
    return NextResponse.json({ error: 'Missing landListingDbId or evmTokenId' }, { status: 400 });
  }

  console.log(`[API Child Token Metadata] Request for LandListing DB ID: ${landListingDbId}, EVM Token ID: ${evmTokenId}`);

  try {
    const landListing = await prisma.landListing.findUnique({
      where: { id: landListingDbId },
    });

    if (!landListing) {
      console.warn(`[API Child Token Metadata] LandListing not found for DB ID: ${landListingDbId}`);
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Validate evmTokenId
    if (!landListing.mainTokenId || landListing.nftCollectionSize === null || landListing.nftCollectionSize === undefined) {
      console.error(`[API Child Token Metadata] LandListing ${landListingDbId} is missing mainTokenId or nftCollectionSize.`);
      return NextResponse.json({ error: 'Collection data incomplete for validation' }, { status: 500 });
    }

    const requestedEvmTokenIdNum = BigInt(evmTokenId); // Now evmTokenId is just the number
    const dbMainTokenIdNum = BigInt(landListing.mainTokenId);
    const dbCollectionSize = BigInt(landListing.nftCollectionSize);

    // Check if the requested ID is the main token ID
    if (requestedEvmTokenIdNum === dbMainTokenIdNum) {
      console.warn(`[API Child Token Metadata] Requested EVM token ID ${evmTokenId} is the mainTokenId for LandListing DB ID: ${landListingDbId}. This endpoint is for child tokens.`);
      return NextResponse.json({ error: 'This endpoint is for child token metadata. Main token has a separate metadata URL.' }, { status: 400 });
    }

    // Validate if the token ID is a valid child token for this collection
    // Child tokens are mainTokenId + 1 to mainTokenId + nftCollectionSize - 1
    // So, evmTokenId must be > mainTokenId AND <= mainTokenId + (nftCollectionSize - 1)
    // Note: nftCollectionSize includes the main token. So, number of child tokens is nftCollectionSize - 1.
    // The last child token ID is mainTokenId + (nftCollectionSize - 1).
    if (
      requestedEvmTokenIdNum <= dbMainTokenIdNum || // Must be greater than mainTokenId
      requestedEvmTokenIdNum > dbMainTokenIdNum + dbCollectionSize - BigInt(1) // Must be within the range of child tokens
    ) {
      console.warn(`[API Child Token Metadata] Requested EVM token ID ${evmTokenId} is not a valid child token for LandListing DB ID: ${landListingDbId}. MainTokenID: ${dbMainTokenIdNum}, CollectionSize: ${dbCollectionSize}`);
      return NextResponse.json({ error: 'Token ID not valid for this collection' }, { status: 404 });
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001');
    const collectionImage = landListing.coverImageUrl ? `${baseUrl}${landListing.coverImageUrl.startsWith('/') ? '' : '/'}${landListing.coverImageUrl}` : `${baseUrl}/placeholder-image.png`;

    const metadata: ChildTokenMetadata = {
      name: `Platz Child Token #${evmTokenId} for ${landListing.collectionNftTitle || 'Land Collection'}`,
      description: landListing.nftDescription || `A child token representing a share of ${landListing.collectionNftTitle || 'a Platz Land Collection'}.`,
      image: collectionImage,
      attributes: [
        { trait_type: 'Token Type', value: 'Child Token' },
        { trait_type: 'Parent Collection ID (Contract)', value: landListing.collectionId || 'N/A' },
        { trait_type: 'Parent LandListing ID (DB)', value: landListingDbId },
        { trait_type: 'On-Chain Token ID', value: evmTokenId },
        { trait_type: 'Parcel Number', value: landListing.parcelNumber || 'N/A' },
        { trait_type: 'Country', value: landListing.country || 'N/A' },
        { trait_type: 'State/Province', value: landListing.state || 'N/A' },
      ],
      external_url: `${baseUrl}/explore/${landListingDbId}`, // Link to the main listing/collection page
    };

    console.log(`[API Child Token Metadata] Successfully generated metadata for LandListing DB ID: ${landListingDbId}, EVM Token ID: ${evmTokenId}`);
    return NextResponse.json(metadata);

  } catch (error) {
    console.error(`[API Child Token Metadata] Error processing request for LandListing DB ID: ${landListingDbId}, EVM Token ID: ${evmTokenId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Failed to generate token metadata', details: errorMessage }, { status: 500 });
  }
}

// Ensure BigInt serialization for JSON (though NextResponse.json might handle it)
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
}; 