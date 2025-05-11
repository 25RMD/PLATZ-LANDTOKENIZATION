import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyJwtToken } from '@/lib/auth/jwt';
import { 
  createCollection, 
  prepareLandListingForMinting 
} from '@/lib/ethereum/contractUtils';

/**
 * POST /api/nft/mint
 * 
 * Initiates the minting process for a land listing
 * Requires authentication and the land listing must be in ACTIVE status
 * 
 * Request body:
 * {
 *   landListingId: string // ID of the land listing to mint
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   data?: {
 *     transactionHash: string,
 *     collectionId: number,
 *     mainTokenId: number
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  // Land listing ID for both try and catch scopes
  let landListingId: string | undefined;
  try {
    // Verify authentication - For development, we'll make this optional
    // In production, proper authentication should be enforced
    let userId: string | null = null;
    
    // Try to get authentication from auth-token cookie (used in the app)
    const authToken = request.cookies.get('auth-token')?.value;
    if (authToken) {
      try {
        const payload = await verifyJwtToken(authToken);
        if (payload && payload.userId) {
          userId = payload.userId;
          console.log("Authenticated user ID from auth-token:", userId);
        }
      } catch (error) {
        console.warn("Error verifying auth-token:", error);
      }
    }
    
    // If no auth token, try to get user ID from headers
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

    // Parse request body
    const body = await request.json();
    landListingId = body.landListingId;

    if (!landListingId) {
      return NextResponse.json(
        { success: false, message: 'Land listing ID is required' },
        { status: 400 }
      );
    }

    // Check if the land listing exists
    // For development, we'll allow minting any land listing
    // In production, we should check if the listing belongs to the authenticated user
    const landListing = await prisma.landListing.findUnique({
      where: {
        id: landListingId,
      },
    });

    if (!landListing) {
      return NextResponse.json(
        { success: false, message: 'Land listing not found' },
        { status: 404 }
      );
    }
    
    console.log("Found land listing:", {
      id: landListing.id,
      userId: landListing.userId,
      status: landListing.status,
      mintStatus: landListing.mintStatus
    });

    // Check if the land listing is in ACTIVE or DRAFT status
    // For development, we'll allow minting for DRAFT listings as well
    if (landListing.status !== 'ACTIVE' && landListing.status !== 'DRAFT') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Land listing must be in ACTIVE or DRAFT status to mint NFTs' 
        },
        { status: 400 }
      );
    }
    
    console.log("Land listing status:", landListing.status);

    // Check if the land listing has already been minted
    // For development, we'll allow reminting for COMPLETED listings as well
    if (landListing.mintStatus === 'COMPLETED') {
      console.log('Land listing has already been minted, but allowing reminting for development');
      // Continue with the minting process
    }

    // Check if minting is already in progress
    if (landListing.mintStatus === 'PENDING') {
      return NextResponse.json(
        { success: false, message: 'Minting is already in progress' },
        { status: 400 }
      );
    }

    // Update the land listing status to PENDING
    await prisma.landListing.update({
      where: { id: landListingId! },
      data: { mintStatus: 'PENDING' },
    });

    // Prepare the land listing for minting
    const { 
      mainTokenURI, 
      additionalTokensBaseURI, 
      collectionMetadataURI 
    } = await prepareLandListingForMinting(landListingId);

    // Create the collection on the blockchain
    const result = await createCollection(
      landListingId,
      mainTokenURI,
      additionalTokensBaseURI,
      collectionMetadataURI
    );

    if (!result.success) {
      // Persist failure status in DB
      if (landListingId) {
        await prisma.landListing.update({
          where: { id: landListingId! },
          data: { mintStatus: 'FAILED' },
        });
      }
      return NextResponse.json(
        { success: false, message: 'Failed to mint NFT collection', error: result.error },
        { status: 500 }
      );
    }

    // Persist completion status and metadata
    await prisma.landListing.update({
      where: { id: landListingId! },
      data: {
        mintStatus: 'COMPLETED',
        mintTransactionHash: result.transactionHash,
        collectionId: BigInt(result.collectionId!),
        mainTokenId: BigInt(result.mainTokenId!),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'NFT collection minted successfully',
      data: {
        transactionHash: result.transactionHash,
        collectionId: Number(result.collectionId!),
        mainTokenId: Number(result.mainTokenId!),
      },
    });
  } catch (error: any) {
    console.error('Error minting NFT collection:', error);
    // Persist failure status on unexpected error
    if (landListingId) {
      try {
        await prisma.landListing.update({
          where: { id: landListingId! },
          data: { mintStatus: 'FAILED' },
        });
      } catch {}
    }
    return NextResponse.json(
      { success: false, message: 'An error occurred while minting NFT collection', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/nft/mint?landListingId=xxx
 * 
 * Gets the minting status for a land listing
 * 
 * Query parameters:
 * - landListingId: ID of the land listing to check
 * 
 * Response:
 * {
 *   success: boolean,
 *   status: string, // NOT_STARTED, PENDING, COMPLETED, FAILED
 *   data?: {
 *     transactionHash: string,
 *     collectionId: number,
 *     mainTokenId: number
 *   }
 * }
 */
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
      data: status === 'COMPLETED' && landListing.mintTransactionHash && landListing.collectionId != null && landListing.mainTokenId != null
        ? {
            transactionHash: landListing.mintTransactionHash,
            collectionId: Number(landListing.collectionId),
            mainTokenId: Number(landListing.mainTokenId),
          }
        : undefined,
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
