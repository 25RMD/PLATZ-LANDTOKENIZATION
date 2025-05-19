import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyJwtToken } from '@/lib/auth/jwt';
import { 
  createCollection,
  createListing,
  listCollectionOnMarketplace
} from '@/lib/ethereum/contractUtils';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * NFT Collection minting endpoint using JSON with base64 encoded image for the main token.
 * 
 * POST /api/nft/mint-json
 * 
 * Request body:
 * {
 *   landListingId: string,
 *   nftTitle: string,       // Used for the main token's name & collection name
 *   nftDescription: string, // Used for the main token's description & collection description
 *   imageBase64: string,    // Base64 encoded image data for the main token
 *   ownerAddress: string,
 *   collectionSize: number // e.g., 100 (for 1 main token + 99 child tokens)
 * }
 */

// Helper function to save a buffer to a file and return its URL
const saveBufferToFile = async (buffer: Buffer, fileName: string, contentType: string, subfolder?: string): Promise<string> => {
  // Create a unique filename to prevent collisions
  const fileExtension = contentType.split('/')[1] || 'png';
  const uniqueFilename = `${uuidv4()}-${fileName}.${fileExtension}`;
  
  // Ensure uploads directory and subfolder (if any) exists
  const baseUploadsDir = path.join(process.cwd(), 'uploads');
  const targetDir = subfolder ? path.join(baseUploadsDir, subfolder) : baseUploadsDir;

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Save the file
  const filePath = path.join(targetDir, uniqueFilename);
  fs.writeFileSync(filePath, buffer);
  
  // Return the URL path for the file
  return subfolder ? `/uploads/${subfolder}/${uniqueFilename}` : `/uploads/${uniqueFilename}`;
};

// Helper to create and save metadata JSON
const createAndSaveMetadata = async (
  data: any, 
  fileNamePrefix: string, 
  landListingId: string, 
  baseUrl: string,
  subfolder?: string
): Promise<string> => {
  let metadataFilePath;
  try {
    console.log(`Saving ${fileNamePrefix} metadata to local storage...`);
    metadataFilePath = await saveBufferToFile(
      Buffer.from(JSON.stringify(data, null, 2)), 
      `${fileNamePrefix}-metadata-${landListingId}`, 
      'application/json',
      subfolder
    );
    console.log(`${fileNamePrefix} metadata saved to local storage: ${metadataFilePath}`);
  } catch (e) {
    console.error(`Error saving ${fileNamePrefix} metadata:`, e);
    throw new Error(`Failed to save ${fileNamePrefix} metadata to local storage: ${(e as Error).message}`);
  }
  return `${baseUrl}${metadataFilePath}`; // Return full URL
};

export async function POST(request: NextRequest) {
  try {
    console.log('Received JSON NFT Collection mint request');
    
    let requestData;
    try {
      requestData = await request.json();
      console.log('JSON data parsed successfully');
      console.log('[mint-json API] Received requestData:', JSON.stringify(requestData, null, 2));
    } catch (jsonError) {
      console.error('Error parsing JSON:', jsonError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to parse JSON data',
        details: (jsonError as Error).message
      }, { status: 400 });
    }

    const { landListingId, nftTitle, nftDescription, imageBase64, ownerAddress, collectionSize = 100 } = requestData;

    if (!landListingId || !nftTitle || !imageBase64 || !ownerAddress) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: landListingId, nftTitle, imageBase64, or ownerAddress' 
      }, { status: 400 });
    }

    if (!imageBase64.startsWith('data:image/')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid image data format for main token. Must be a base64 encoded data URL' 
      }, { status: 400 });
    }
    
    const quantityOfChildTokens = collectionSize > 0 ? collectionSize -1 : 0;
    console.log(`[mint-json API] Processing landListingId: ${landListingId}, collectionSize from request: ${collectionSize}, derived quantityOfChildTokens: ${quantityOfChildTokens}`);
    if (quantityOfChildTokens < 0) {
       return NextResponse.json({ success: false, error: 'collectionSize must be at least 1' }, { status: 400 });
    }


    // --- 1. Fetch Land Listing Data ---
    const listing = await prisma.landListing.findUnique({
      where: { id: landListingId },
      include: {
        user: true
      }
    });
    if (!listing) {
      return NextResponse.json({ 
        success: false, 
        error: 'Land listing not found' 
      }, { status: 404 });
    }

    await prisma.landListing.update({
      where: { id: landListingId },
      data: {
        mintStatus: 'PENDING_COLLECTION', // New status
      },
    });

    console.log("Fetched listing for collection minting:", listing.id);

    // --- 2. Save Main Token Image to local storage ---
    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      await updateMintStatus(landListingId, 'FAILED_COLLECTION', 'Invalid image data format for main token');
      return NextResponse.json({ success: false, error: 'Invalid image data format for main token'}, { status: 400 });
    }
    
    const contentType = matches[1];
    const base64Data = matches[2];
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    const collectionFilesSubfolder = `collections/${landListingId}`; // Store collection specific files in a subfolder

    let mainTokenImageUrlPath;
    try {
      console.log(`Saving main token image to local storage (${imageBuffer.length} bytes)...`);
      mainTokenImageUrlPath = await saveBufferToFile(imageBuffer, `main-token-image-${landListingId}`, contentType, collectionFilesSubfolder);
      console.log(`Main token image saved to: ${mainTokenImageUrlPath}`);
    } catch (e) {
      await updateMintStatus(landListingId, 'FAILED_COLLECTION', 'Failed to save main token image');
      console.error("Error saving main token image:", e);
      return NextResponse.json({ success: false, error: 'Failed to save main token image', details: (e as Error).message }, { status: 500 });
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const mainTokenImageFullUrl = `${normalizedBaseUrl}${mainTokenImageUrlPath}`;

    if (normalizedBaseUrl.includes('localhost') || !normalizedBaseUrl.includes('ngrok')) { // Adjusted ngrok check
      console.warn('WARNING: Using URL that may not be publicly accessible for NFT metadata: ' + normalizedBaseUrl);
    } else {
      console.log('Using public ngrok URL for NFT resources: ' + normalizedBaseUrl);
    }

    // --- 3. Prepare and Save Main Token Metadata JSON ---
    const mainTokenMetadata = {
      name: nftTitle || `Platz Land Parcel - Main Token for ${listing.parcelNumber || landListingId}`,
      description: nftDescription || listing.propertyDescription || `Main representative token for land listing ${landListingId} on Platz.`,
      image: mainTokenImageFullUrl,
      attributes: [
        { trait_type: "Land Listing ID", value: landListingId },
        { trait_type: "Token Type", value: "Main Collection Token" },
        listing.parcelNumber ? { trait_type: "Parcel Number", value: listing.parcelNumber } : undefined,
        listing.country ? { trait_type: "Country", value: listing.country } : undefined,
      ].filter(attr => attr !== undefined) as { trait_type: string; value: string | number }[],
      external_url: `${normalizedBaseUrl}/explore/${landListingId}`, // Link to the listing page
    };
    const mainTokenMetadataFullUrl = await createAndSaveMetadata(mainTokenMetadata, 'main-token', landListingId, normalizedBaseUrl, collectionFilesSubfolder);

    // --- 4. Prepare and Save Collection Metadata JSON ---
    // This metadata describes the collection itself
    const collectionMetadata = {
      name: `Collection: ${nftTitle || listing.parcelNumber || landListingId}`,
      description: `A collection of ${collectionSize} NFTs representing fractional ownership or aspects of land listing ${landListingId}. Includes one main token and ${quantityOfChildTokens} child tokens.`,
      image: mainTokenImageFullUrl, // Collection can also use the main token image
      external_link: `${normalizedBaseUrl}/collections/${landListingId}`, // A potential page for the collection itself
      seller_fee_basis_points: 250, // Example: 2.5%
      fee_recipient: ownerAddress // Example: collection creator gets secondary sales fees
    };
    const collectionMetadataFullUrl = await createAndSaveMetadata(collectionMetadata, 'collection', landListingId, normalizedBaseUrl, collectionFilesSubfolder);

    // --- 5. Define Base URI for Child Tokens ---
    // The contract will append `tokenId.json` to this base URI.
    // Metadata for child tokens will need to be generated and served from this path.
    // For now, this is a placeholder; a separate mechanism/endpoint would be needed to serve these individual child token JSON files.
    const childTokensBaseURI = `${normalizedBaseUrl}/api/static/collections/${landListingId}/child-tokens/`;
    // Ensure the 'uploads/collections/{landListingId}/child-tokens' directory exists if you plan to pre-generate them.
    // Or, have an API route that dynamically generates metadata for /api/static/collections/{landListingId}/child-tokens/{tokenId}.json

    // --- 6. Mint Collection ---
    try {
      console.log(`Minting collection for listing ${landListingId} to owner ${ownerAddress}...`);
      
      if (!process.env.NFT_CONTRACT_ADDRESS || process.env.NFT_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
        throw new Error("NFT contract address is not properly configured.");
      }
      
      // Call createCollection from contractUtils
      const collectionResult = await createCollection(
        landListingId,            // landListingId (DB ID)
        ownerAddress,             // toAddress
        mainTokenMetadataFullUrl, // mainTokenURI
        quantityOfChildTokens,    // quantity (of child tokens)
        collectionMetadataFullUrl,// collectionURI
        childTokensBaseURI        // baseURI (for child tokens)
      );
      
      const { collectionId, mainTokenId, transactionHash } = collectionResult; // Assuming this structure from createCollection

      if (typeof collectionId === 'undefined' || typeof mainTokenId === 'undefined') {
        console.error('Failed to retrieve collectionId or mainTokenId from minting transaction receipt.', collectionResult);
        throw new Error('Failed to retrieve collectionId or mainTokenId from minting transaction. Events might be missing or malformed.');
      }
      
      console.log(`Collection minted: Collection ID ${collectionId}, Main Token ID ${mainTokenId}, Tx: ${transactionHash}`);
      
      // --- 7. Marketplace Listing for Collection ---
      let marketplaceListingTxHash: string | undefined = undefined;
      let marketplaceListingError: string | undefined = undefined;
      
      if (listing.listingPrice && listing.priceCurrency) {
        try {
          console.log(`Listing collection ${collectionId} on marketplace for ${listing.listingPrice} ${listing.priceCurrency}...`);
          const listResult = await listCollectionOnMarketplace(
            collectionId.toString(), // Ensure collectionId is string
            listing.listingPrice.toString(),
            listing.priceCurrency
          );

          if (listResult.success) {
            marketplaceListingTxHash = listResult.transactionHash;
            console.log(`Collection ${collectionId} listed on marketplace. Tx: ${marketplaceListingTxHash}`);
          } else {
            marketplaceListingError = listResult.error || "Failed to list collection on marketplace.";
            console.error(`Failed to list collection ${collectionId} on marketplace:`, marketplaceListingError);
          }
        } catch (listErr) {
          marketplaceListingError = listErr instanceof Error ? listErr.message : String(listErr);
          console.error("Error calling listCollectionOnMarketplace utility:", marketplaceListingError);
        }
      } else {
        console.log(`Skipping marketplace listing for collection ${collectionId} as price/currency not set on LandListing.`);
      }

      // --- 8. Update database with Collection data ---
      await prisma.landListing.update({
        where: { id: landListingId },
        data: {
          mintStatus: 'COMPLETED_COLLECTION', // New status
          mintTransactionHash: transactionHash, // Original collection mint tx
          collectionId: collectionId.toString(), 
          mainTokenId: mainTokenId.toString(),
          collectionNftTitle: nftTitle, 
          marketplaceTransactionHash: marketplaceListingTxHash, // New field for prisma schema
          marketplaceListingError: marketplaceListingError,
          coverImageUrl: mainTokenImageUrlPath, 
          collectionMetadataUrl: collectionMetadataFullUrl,
          childTokensBaseUrl: childTokensBaseURI,
          mainTokenMetadataUrl: mainTokenMetadataFullUrl
        },
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Collection minted successfully!' + (marketplaceListingTxHash ? ' And listed on marketplace.' : marketplaceListingError ? ' But failed to list on marketplace.' : ' Marketplace listing skipped.'),
        data: { 
            collectionId: collectionId.toString(), 
            mainTokenId: mainTokenId.toString(), 
            collectionMintTxHash: transactionHash, 
            marketplaceListingTxHash 
        } 
      }, { status: 200 });

    } catch (mintError) {
      await updateMintStatus(landListingId, 'FAILED_COLLECTION', 'Failed to mint collection');
      console.error("Error minting collection:", mintError);
      
      // Provide more detailed error information
      const errorMsg = mintError instanceof Error ? mintError.message : String(mintError);
      const errorDetails = typeof mintError === 'object' && mintError !== null ? JSON.stringify(mintError) : errorMsg;
          
      // Add debugging information about environment
      console.log('Environment debug info:');
      console.log('- NFT_CONTRACT_ADDRESS:', process.env.NFT_CONTRACT_ADDRESS ? 'present' : 'missing');
      console.log('- MARKETPLACE_CONTRACT_ADDRESS:', process.env.MARKETPLACE_CONTRACT_ADDRESS ? 'present' : 'missing');
      console.log('- SERVER_WALLET_PRIVATE_KEY:', process.env.SERVER_WALLET_PRIVATE_KEY ? 'present (length: ' + 
                 process.env.SERVER_WALLET_PRIVATE_KEY.length + ')' : 'missing');
      console.log('- RPC URL configuration:');
      console.log('  - SEPOLIA_RPC_URL:', process.env.SEPOLIA_RPC_URL ? 'present' : 'missing');
      console.log('  - RPC_URL:', process.env.RPC_URL ? 'present' : 'missing');
      console.log('  - FALLBACK_RPC_URL_1:', process.env.FALLBACK_RPC_URL_1 ? 'present' : 'missing');
      console.log('  - FALLBACK_RPC_URL_2:', process.env.FALLBACK_RPC_URL_2 ? 'present' : 'missing');
      
      // Parse the error to provide user-friendly messages
      let userMessage = 'Failed to mint collection';
      let status = 500;
      
      // Check for specific error types and provide better messages
      if (errorMsg.includes('quota') || errorMsg.includes('rate limit') || errorMsg.includes('exceeded')) {
        userMessage = 'The blockchain network is currently experiencing high demand. Please try again in a few minutes.';
        status = 503; // Service Unavailable
      } else if (errorMsg.includes('network') || errorMsg.includes('connect')) {
        userMessage = 'Unable to connect to the blockchain network. Please check your connection and try again.';
        status = 503; // Service Unavailable
      } else if (errorMsg.includes('rejected') || errorMsg.includes('denied') || errorMsg.includes('reverted')) {
        userMessage = 'The transaction was rejected by the blockchain. This could be due to contract configuration issues or insufficient permissions.';
        status = 400; // Bad Request
      } else if (errorMsg.includes('timeout')) {
        userMessage = 'The operation timed out. The blockchain network might be congested, please try again later.';
        status = 504; // Gateway Timeout
      } else if (errorMsg.includes('not a function') || errorMsg.includes('no method')) {
        userMessage = 'Contract integration error. The smart contract does not match the expected interface.';
        status = 500; // Internal Server Error
      }
      
      // Suggest verifying contract configuration if it seems to be a contract issue
      let suggestion = null;
      if (
        errorMsg.includes('not a function') || 
        errorMsg.includes('no method') || 
        errorMsg.includes('reverted') ||
        errorMsg.includes('invalid contract')
      ) {
        suggestion = 'Please visit /api/admin/verify-contracts to check your contract configuration.';
      }
      
      return NextResponse.json({ 
        success: false, 
        error: userMessage, 
        details: errorDetails,
        retry: status === 503 || status === 504, // Suggest retry for service issues
        suggestion
      }, { status });
    }
  } catch (error) {
    console.error('Error in /api/nft/mint-json:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal Server Error', 
      details: (error as Error).message 
    }, { status: 500 });
  }
}

// Helper function to update mint status (same as in the original route)
async function updateMintStatus(landListingId: string, status: string, errorMessage?: string) {
  try {
    await prisma.landListing.update({
      where: { id: landListingId },
      data: {
        mintStatus: status,
        mintErrorReason: errorMessage, // Corrected field name as per Prisma error
      },
    });
  } catch (dbError) {
    console.error(`Failed to update mint status to ${status} for ${landListingId} in DB:`, dbError);
  }
} 