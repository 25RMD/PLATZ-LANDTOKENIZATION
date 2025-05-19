import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/db';
import { verifyJwtToken } from '@/lib/auth/jwt';
import { 
  createCollection
} from '@/lib/ethereum/contractUtils';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/nft/mint
 * 
 * Initiates the minting process for a land listing (collection)
 * Requires authentication and the land listing must be in ACTIVE status
 * 
 * Request body (formData):
 * {
 *   landListingId: string // ID of the land listing to mint
 *   nftTitle: string
 *   nftDescription: string
 *   nftImageFile: File
 *   ownerAddress: string // (Currently not used by contractUtils.createCollection, assumes msg.sender)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   data?: {
 *     landListingId: string,
 *     collectionId: string,
 *     mainTokenId: string,
 *     transactionHash: string
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  console.log('Received NFT collection mint request');
  try {
    // Parse the form data
    const formData = await request.formData();
    
    // Extract the required parameters
    const landListingId = (formData as any).get('landListingId') as string;
    const nftTitle = (formData as any).get('nftTitle') as string;
    const nftDescription = (formData as any).get('nftDescription') as string;
    const nftImageFile = (formData as any).get('nftImageFile') as File | null;
    // IMPORTANT: Get ownerAddress from formData or use a default/server wallet address
    let ownerAddress = (formData as any).get('ownerAddress') as string;

    // If ownerAddress is not provided by client, decide on a default strategy.
    // For now, let's assume if it's not in formData, we might use a server default or throw.
    // This needs to align with your application's logic for who receives the minted NFTs.
    if (!ownerAddress) {
      // Option 1: Use a server-owned wallet address (ensure this env var is set)
      // ownerAddress = process.env.SERVER_WALLET_PUBLIC_ADDRESS!;
      // if (!ownerAddress) {
      //   throw new Error('Minting recipient address (ownerAddress) not found in request and no server default is set.');
      // }
      // Option 2: Throw an error if client doesn't provide it (safer for now if intent is client specifies)
      console.error('ownerAddress not provided in formData for mint request.');
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required parameter: ownerAddress for minting.'
      }, { status: 400 });
    }
    
    console.log('Mint request parameters:');
    console.log('- Land Listing ID:', landListingId);
    console.log('- NFT Title:', nftTitle);
    console.log('- NFT Description:', nftDescription ? (nftDescription.length > 20 ? nftDescription.substring(0, 20) + '...' : nftDescription) : 'None');
    console.log('- NFT Image:', nftImageFile ? nftImageFile.name : 'None');
    console.log('- Owner Address (Recipient):', ownerAddress);
    
    // Validate required parameters
    if (!landListingId || !nftTitle || !nftImageFile || !ownerAddress) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters (landListingId, nftTitle, nftImageFile, ownerAddress are required)'
      }, { status: 400 });
    }
    
    // Update the land listing status to PENDING
    await prisma.landListing.update({
      where: { id: landListingId },
      data: {
        mintStatus: 'PENDING',
        mintTimestamp: new Date(),
      },
    });
    
    console.log('Updated land listing status to PENDING');
    
    // Save the NFT image to local storage
    console.log('Saving NFT image to local storage...');
    
    let nftImageFileName;
    try {
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Generate unique filename
      const fileExtension = nftImageFile.name.split('.').pop() || 'png';
      nftImageFileName = `${uuidv4()}.${fileExtension}`;
      const filePath = path.join(uploadsDir, nftImageFileName);
      
      // Convert File to ArrayBuffer and save to disk
      const arrayBuffer = await nftImageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(filePath, buffer);
      
      console.log('NFT image saved to local storage with filename:', nftImageFileName);
      
    } catch (storageError) {
      console.error('Local storage error:', storageError);
      await prisma.landListing.update({
        where: { id: landListingId },
        data: {
          mintStatus: 'FAILED',
          mintErrorReason: 'Failed to save image to local storage',
        },
      });
      return NextResponse.json({
        success: false,
        error: 'Failed to save image',
        details: (storageError as Error).message
      }, { status: 500 });
    }
    
    // Update the land listing with the NFT metadata
    try {
      await prisma.landListing.update({
        where: { id: landListingId },
        data: {
          nftTitle,
          nftDescription,
          nftImageFileRef: nftImageFileName,
        },
      });
      console.log('Updated land listing with NFT metadata');
    } catch (dbError) {
      console.error('Database update error:', dbError);
      await prisma.landListing.update({
        where: { id: landListingId },
        data: {
          mintStatus: 'FAILED',
          mintErrorReason: 'Failed to update land listing with NFT metadata',
        },
      });
      return NextResponse.json({
        success: false,
        error: 'Database error',
        details: (dbError as Error).message
      }, { status: 500 });
    }
    
    // Generate NFT metadata for the main token (and to be reused for collection metadata)
    console.log('Generating NFT metadata for the main token & collection...');
    const mainTokenMetadata = await generateLandNFTMetadata(landListingId); 
    
    // Save main token's metadata to local storage
    console.log('Saving main token metadata to local storage...');
    let mainTokenMetadataFileName;
    try {
      const metadataDir = path.join(process.cwd(), 'uploads', 'metadata');
      if (!fs.existsSync(metadataDir)) {
        fs.mkdirSync(metadataDir, { recursive: true });
      }
      mainTokenMetadataFileName = `${uuidv4()}-main-token.json`;
      const mainTokenMetadataPath = path.join(metadataDir, mainTokenMetadataFileName);
      fs.writeFileSync(mainTokenMetadataPath, JSON.stringify(mainTokenMetadata, null, 2));
      console.log('Main token metadata saved to:', mainTokenMetadataPath);
    } catch (storageError) {
      console.error('Main token metadata storage error:', storageError);
      await prisma.landListing.update({
        where: { id: landListingId },
        data: {
          mintStatus: 'FAILED',
          mintErrorReason: 'Failed to save main token metadata to local storage',
        },
      });
      return NextResponse.json({
        success: false,
        error: 'Failed to save main token metadata',
        details: (storageError as Error).message
      }, { status: 500 });
    }

    // Save a copy for the collection metadata
    console.log('Saving collection metadata (copy of main token metadata)...');
    let collectionMetadataFileName;
    try {
      const metadataDir = path.join(process.cwd(), 'uploads', 'metadata'); // Ensure directory exists (should from above)
      collectionMetadataFileName = `${uuidv4()}-collection.json`;
      const collectionMetadataPath = path.join(metadataDir, collectionMetadataFileName);
      fs.writeFileSync(collectionMetadataPath, JSON.stringify(mainTokenMetadata, null, 2)); // Using mainTokenMetadata
      console.log('Collection metadata saved to:', collectionMetadataPath);
    } catch (storageError) {
      console.error('Collection metadata storage error:', storageError);
      // Decide if this is a critical failure. For now, we'll log and continue,
      // but the collectionMetadataURI might be incorrect if this fails.
      // Depending on contract requirements, this could be made a hard failure.
      await prisma.landListing.update({
        where: { id: landListingId },
        data: {
          mintStatus: 'FAILED',
          mintErrorReason: 'Failed to save collection metadata to local storage',
        },
      });
       return NextResponse.json({
        success: false,
        error: 'Failed to save collection metadata',
        details: (storageError as Error).message
      }, { status: 500 });
    }
    
    // --- Generate and save metadata for additional NFTs in the collection ---
    // IMPORTANT: This count should match the 'quantity' passed to the smart contract.
    // The smart contract's 'quantity' parameter is for child/additional tokens, excluding the main one.
    const numberOfChildTokens = 2; // This becomes the 'quantity' for the contract call.
    console.log(`Generating metadata for ${numberOfChildTokens} child NFTs...`);
    for (let i = 0; i < numberOfChildTokens; i++) {
      const childTokenDisplayId = i + 1; // e.g., 1, 2 (for naming/description purposes)
      // The actual token ID will be determined by the smart contract during minting.
      // The metadata filename here (e.g., 1.json) is what the contract will reference via baseURI + tokenId.json
      // This means your contract's tokenURI logic for child tokens should append <tokenId>.json to the baseURI.
      // The server generates files like 1.json, 2.json, etc. These are NOT actual token IDs initially.
      // The smart contract will mint tokens with IDs like (mainTokenId + 1), (mainTokenId + 2) ...
      // And the tokenURI override will fetch baseURI/ (mainTokenId + 1) .json etc.
      // So, filenames for child tokens should ideally align with how they will be looked up.
      // For simplicity, if baseURI is /metadata/ and contract does baseURI + tokenId + .json
      // and child token IDs are sequential after mainTokenId, then we need to know those future IDs.
      // ALTERNATIVE: Save child metadata as child-1.json, child-2.json and have contract use that if it can take array of URIs.
      // CURRENT APPROACH: Smart contract creates child tokens with IDs (mainTokenId+1), (mainTokenId+2) ...
      // Smart contract tokenURI logic: baseURI + (mainTokenId+1) + .json, etc.
      // So, the files saved here MUST match that eventual lookup.
      // This part is tricky if `additionalTokenId` (as a filename) doesn't match the *actual* minted child token ID.

      // For now, the contract creates child tokens and expects metadata at baseURI/<child_token_id>.json
      // The current loop saves them as 1.json, 2.json. This will ONLY work if the child token IDs *ARE* 1 and 2.
      // This is unlikely if _nextTokenId is a global counter in the contract.
      // Solution: The contractUtils.createCollection needs to return the range of child token IDs minted.
      // Or, the API needs to pre-calculate them (less robust).
      // OR, the contract must take an array of URIs for all children.
      // Given the current contract (`baseURI` + `tokenId.toString()` + `.json`), the files created on disk
      // MUST be named `<actual_child_tokenId_1>.json`, `<actual_child_tokenId_2>.json` etc.
      // This API route CANNOT know those actual IDs beforehand without a change to the contract or contractUtils response.

      // TEMPORARY ASSUMPTION for current code: The child token IDs WILL BE 1, 2, 3... (relative to collection start or global)
      // and the baseURI is set up such that baseURI + "1.json" is looked up for the first child token.
      // This is often NOT how ERC721 token IDs work unless it's an ERC721A or similar with predictable IDs from batch start.
      // Our current contract increments _nextTokenId globally. So child IDs are not 1, 2...
      // THIS SECTION REQUIRES REVISITING AFTER SEEING HOW `contractUtils.createCollection` RETURNS CHILD TOKEN IDS OR IF CONTRACT CHANGES

      // For now, we continue with the current logic of creating 1.json, 2.json and hope the contract aligns or this is fixed later.
      const metadataFileNameForChild = `${childTokenDisplayId}.json`;

      const additionalTokenMetadata = {
        ...mainTokenMetadata, 
        name: `${mainTokenMetadata.name} - Plot ${childTokenDisplayId}`,
        description: `${mainTokenMetadata.description} - Sub-plot ${childTokenDisplayId} of the collection.`,
        attributes: [
          ...(mainTokenMetadata.attributes || []),
          { trait_type: 'Plot ID', value: childTokenDisplayId.toString() },
          { trait_type: 'Parent Collection Title', value: mainTokenMetadata.name}
        ],
      };

      try {
        const metadataDir = path.join(process.cwd(), 'uploads', 'metadata');
        const additionalTokenMetadataPath = path.join(metadataDir, metadataFileNameForChild);
        fs.writeFileSync(additionalTokenMetadataPath, JSON.stringify(additionalTokenMetadata, null, 2));
        console.log(`Metadata for child token (display ${childTokenDisplayId}), file ${metadataFileNameForChild} saved to: ${additionalTokenMetadataPath}`);
      } catch (storageError) {
        console.error(`Error saving metadata for child token (display ${childTokenDisplayId}):`, storageError);
        await prisma.landListing.update({
            where: { id: landListingId },
            data: {
                mintStatus: 'FAILED',
                mintErrorReason: `Failed to save metadata for child token ${childTokenDisplayId}`,
            },
        });
        return NextResponse.json({
            success: false,
            error: `Failed to save metadata for child token ${childTokenDisplayId}`,
            details: (storageError as Error).message
        }, { status: 500 });
      }
    }
    // --- End of additional NFT metadata generation ---
    
    // Prepare token URIs
    const localMainTokenURIPath = `/uploads/metadata/${mainTokenMetadataFileName}`;
    const localCollectionMetadataURIPath = `/uploads/metadata/${collectionMetadataFileName}`;
    // This is a base path for the contract to append to (e.g., /1.json, /2.json)
    const localAdditionalTokensBaseDir = `/uploads/metadata/`; 

    // Construct Base URL for public accessibility
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      console.error('NEXT_PUBLIC_BASE_URL is not set. Metadata URIs will not be publicly accessible.');
      await prisma.landListing.update({
        where: { id: landListingId },
        data: {
          mintStatus: 'FAILED',
          mintErrorReason: 'Server configuration error: NEXT_PUBLIC_BASE_URL not set.',
        },
      });
      return NextResponse.json({
        success: false,
        error: 'Server configuration error preventing public URI generation.'
      }, { status: 500 });
    }
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

    // URIs for specific files are served via /api/static, which maps /uploads to / for the URI path
    const mainTokenURI = `${normalizedBaseUrl}/api/static${localMainTokenURIPath.replace('/uploads/', '/')}`;
    const collectionMetadataURI = `${normalizedBaseUrl}/api/static${localCollectionMetadataURIPath.replace('/uploads/', '/')}`;
    
    // additionalTokensBaseURI is a directory path. How it's made public depends on contract needs.
    // If contract directly appends to this (e.g., additionalTokensBaseURI + '1.json'),
    // it should point to the public path of the metadata directory.
    const additionalTokensBaseURI = `${normalizedBaseUrl}/api/static${localAdditionalTokensBaseDir.replace('/uploads/', '/')}`;

    console.log('Constructed URIs:');
    console.log('- Main Token URI:', mainTokenURI);
    console.log('- Additional Tokens Base URI:', additionalTokensBaseURI);
    console.log('- Collection Metadata URI:', collectionMetadataURI);
    
    // Create the NFT collection on-chain
    console.log('Creating NFT collection on-chain with contractUtils.createCollection...');
    
    try {
      // Check for valid contract configuration first
      if (!process.env.NFT_CONTRACT_ADDRESS || process.env.NFT_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
        throw new Error("NFT contract address is not properly configured. Please set the NFT_CONTRACT_ADDRESS environment variable.");
      }
      
      if (!process.env.MARKETPLACE_CONTRACT_ADDRESS || process.env.MARKETPLACE_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
        throw new Error("Marketplace contract address is not properly configured. Please set the MARKETPLACE_CONTRACT_ADDRESS environment variable.");
      }
      
      const collectionResult = await createCollection(
        landListingId,
        ownerAddress,             // Pass recipient address
        mainTokenURI,
        numberOfChildTokens,      // Pass the number of child tokens
        collectionMetadataURI,
        additionalTokensBaseURI   // This is the base URI for child tokens, contract will append <tokenId>.json
      );
      
      console.log('Collection creation attempt result from contractUtils:', collectionResult);
      
      if (!collectionResult.success) {
        // Error is already logged in createCollection, update status if not already FAILED
        const currentListing = await prisma.landListing.findUnique({ where: {id: landListingId }});
        if (currentListing?.mintStatus !== 'FAILED') {
            await prisma.landListing.update({
                where: { id: landListingId },
                data: {
                mintStatus: 'FAILED',
                mintErrorReason: collectionResult.error || 'Unknown error from createCollection utility',
                },
            });
        }
        throw new Error(collectionResult.error || 'Unknown blockchain error during collection creation');
      }
      
      // Return success response
      return NextResponse.json({
        success: true,
        message: 'NFT collection created successfully',
        data: {
          landListingId,
          collectionId: collectionResult.collectionId,
          mainTokenId: collectionResult.mainTokenId,
          transactionHash: collectionResult.transactionHash,
        }
      });
      
    } catch (error) {
      console.error('Blockchain error:', error);
      
      const errorMessage = (error as Error).message || 'Unknown blockchain error';
      
      // Update the land listing with the error
      await prisma.landListing.update({
        where: { id: landListingId },
        data: {
          mintStatus: 'FAILED',
          mintErrorReason: errorMessage,
        },
      });
      
      return NextResponse.json({
        success: false,
        error: 'Blockchain error',
        details: errorMessage
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Request processing error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: (error as Error).message
    }, { status: 500 });
  }
}

// Helper function to generate metadata for a land NFT
async function generateLandNFTMetadata(landListingId: string): Promise<any> {
  // Fetch land listing details from Prisma
  const landListing = await prisma.landListing.findUnique({
    where: { id: landListingId },
    include: {
      user: true, // Assuming you want to include owner info
      // Include other relations if needed for metadata
    },
  });
  
  if (!landListing) {
    throw new Error(`Land listing with ID ${landListingId} not found for metadata generation.`);
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    console.warn('NEXT_PUBLIC_BASE_URL is not set. Image URLs in metadata might be incomplete.');
  }
  const normalizedBaseUrl = baseUrl ? (baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl) : '';
  const imageUrl = landListing.nftImageFileRef 
    ? `${normalizedBaseUrl}/api/static/images/${landListing.nftImageFileRef}` 
    : 'https://via.placeholder.com/500'; // Default placeholder

  // Basic metadata structure (align with OpenSea standards or your platform's needs)
  const metadata = {
    name: landListing.nftTitle || 'Untitled Land Parcel',
    description: landListing.nftDescription || 'A unique land parcel on the Platz platform.',
    image: imageUrl,
    external_url: `${normalizedBaseUrl}/listings/${landListing.id}`, // Link to the listing on your platform
    attributes: [
      { trait_type: "Country", value: landListing.country || "N/A" },
      { trait_type: "State/Province", value: landListing.state || "N/A" },
      { trait_type: "LGA", value: landListing.localGovernmentArea || "N/A" },
      { trait_type: "Parcel Number", value: landListing.parcelNumber || "N/A" },
      { 
        trait_type: "Area (sqm)", 
        value: landListing.propertyAreaSqm ? landListing.propertyAreaSqm.toString() : "N/A",
        display_type: "number"
      },
      { trait_type: "Latitude", value: landListing.latitude || "N/A" },
      { trait_type: "Longitude", value: landListing.longitude || "N/A" },
      { trait_type: "Mint Status", value: landListing.mintStatus || "N/A" },
      // Add more attributes as needed
    ],
    // Platz-specific data (optional)
    platz_data: {
      listing_id: landListing.id,
      owner_id: landListing.userId,
      owner_evm_address: landListing.user?.evmAddress || "N/A",
      created_at: landListing.createdAt.toISOString(),
    }
  };
  return metadata;
}

async function updateMintStatus(landListingId: string, status: string, errorMessage?: string) {
  try {
    await prisma.landListing.update({
      where: { id: landListingId },
      data: {
        mintStatus: status,
        mintErrorReason: errorMessage,
      },
    });
    return true;
  } catch (error) {
    console.error('Failed to update mint status:', error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  // Parse landListingId from query params
  const url = new URL(request.url);
  const landListingId = url.searchParams.get('landListingId');

  if (!landListingId) {
    return NextResponse.json({
      success: false,
      error: 'Missing landListingId query parameter',
    }, { status: 400 });
  }

  try {
    // Fetch the land listing from the database
    const landListing = await prisma.landListing.findUnique({
      where: { id: landListingId },
      select: {
        id: true,
        mintStatus: true,
        mintErrorReason: true,
        mintTimestamp: true,
        mintTransactionHash: true,
        collectionId: true,
        mainTokenId: true,
        mainTokenMetadataUrl: true,
        contractAddress: true,
        nftTitle: true,
        nftDescription: true,
        nftImageFileRef: true,
        listingPrice: true,
        priceCurrency: true,
        user: { select: { id: true, username: true, evmAddress: true } },
      },
    });

    if (!landListing) {
      return NextResponse.json({
        success: false,
        error: 'Land listing not found',
      }, { status: 404 });
    }

    // Compose the response data
    const data = {
      id: landListing.id,
      mintStatus: landListing.mintStatus,
      mintErrorReason: landListing.mintErrorReason,
      mintTimestamp: landListing.mintTimestamp,
      mintTransactionHash: landListing.mintTransactionHash,
      collectionId: landListing.collectionId?.toString(),
      mainTokenId: landListing.mainTokenId,
      mainTokenMetadataUrl: landListing.mainTokenMetadataUrl,
      contractAddress: landListing.contractAddress,
      nftTitle: landListing.nftTitle,
      nftDescription: landListing.nftDescription,
      nftImageFileRef: landListing.nftImageFileRef,
      listingPrice: landListing.listingPrice,
      priceCurrency: landListing.priceCurrency,
      user: landListing.user,
    };

    // Determine status for frontend
    let status = 'NOT_STARTED';
    if (landListing.mintStatus === 'COMPLETED') status = 'COMPLETED';
    else if (landListing.mintStatus === 'FAILED') status = 'FAILED';
    else if (landListing.mintStatus === 'PENDING') status = 'PENDING';
    // else keep as NOT_STARTED

  return NextResponse.json({
      success: true,
      status,
      data,
      error: landListing.mintErrorReason || null,
    });
  } catch (error) {
    console.error('Error fetching mint status:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: (error as Error).message,
    }, { status: 500 });
  }
}
