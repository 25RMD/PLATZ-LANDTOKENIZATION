import { NextRequest, NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/getBaseUrl';
import prisma from '@/lib/prisma';
import { createCollection } from '@/lib/ethereum/contractUtils';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { v4 as uuidv4 } from 'uuid';

/**
 * API route for minting an NFT collection using PlatzLandNFTWithCollections contract
 * 
 * POST /api/nft/mint-collection
 * 
 * Request body:
 * {
 *   landListingId: string,
 *   nftTitle: string,
 *   nftDescription: string,
 *   imageBase64: string, // Base64 encoded image data with mime type prefix
 *   ownerAddress: string,
 *   quantity: number // Number of child tokens to mint (default: 2)
 * }
 */

// Helper function to save a buffer to Cloudinary and return its URL
const saveBufferToFile = async (buffer: Buffer, fileName: string, contentType: string): Promise<string> => {
  try {
    const result = await uploadToCloudinary(buffer, fileName, 'nft-collections');
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error(`Failed to upload ${fileName} to cloud storage`);
  }
};

// Helper function to update mint status
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

export async function POST(request: NextRequest) {
  try {
    console.log('Received NFT collection mint request');
    
    // Parse JSON request
    let requestData;
    try {
      requestData = await request.json();
      console.log('JSON data parsed successfully');
    } catch (jsonError) {
      console.error('Error parsing JSON:', jsonError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to parse JSON data',
        details: (jsonError as Error).message
      }, { status: 400 });
    }

    const { 
      landListingId, 
      nftTitle, 
      nftDescription, 
      imageBase64, 
      ownerAddress,
      quantity = 2 // Default to 2 child tokens if not specified
    } = requestData;

    console.log('Received nftDescription from request:', nftDescription);

    // Validate required fields
    if (!landListingId || !nftTitle || !imageBase64 || !ownerAddress) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: landListingId, nftTitle, imageBase64, or ownerAddress' 
      }, { status: 400 });
    }

    // Validate and extract image data
    if (!imageBase64.startsWith('data:image/')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid image data format. Must be a base64 encoded data URL' 
      }, { status: 400 });
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

    // Update mint status to PENDING
    await prisma.landListing.update({
      where: { id: landListingId },
      data: {
        mintStatus: 'PENDING',
      },
    });

    console.log("Fetched listing for collection minting:", listing.id);

    // --- 2. Save Image to local storage ---
    // Extract image data and metadata from base64 string
    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      await updateMintStatus(landListingId, 'FAILED', 'Invalid image data format');
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid image data format'
      }, { status: 400 });
    }
    
    const contentType = matches[1];
    const base64Data = matches[2];
    
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Save image to local storage
    let imageUrl;
    try {
      console.log(`Saving image to local storage (${imageBuffer.length} bytes)...`);
      imageUrl = await saveBufferToFile(imageBuffer, `nft-image-${landListingId}`, contentType);
      console.log(`Image saved to local storage: ${imageUrl}`);
    } catch (e) {
      await updateMintStatus(landListingId, 'FAILED', 'Failed to save image to local storage');
      console.error("Error saving image:", e);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to save image to local storage', 
        details: (e as Error).message 
      }, { status: 500 });
    }
    
    // Create a fully qualified URL for the image (for dev environment)
    const baseUrl = getBaseUrl();
    
    // Ensure the baseUrl doesn't have a trailing slash
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    
    // Create the full URLs using the baseUrl
    const imageFullUrl = `${normalizedBaseUrl}${imageUrl}`;
    
    // Show warning only if not using ngrok
    if (baseUrl.includes('localhost') || !baseUrl.includes('ngrok')) {
      console.warn('WARNING: Using URL that may not be publicly accessible for NFT metadata: ' + baseUrl);
      console.warn('For development with smart contracts, please use ngrok and set BASE_URL to your ngrok URL');
    } else {
      console.log('Using public URL for NFT resources: ' + normalizedBaseUrl);
    }

    // --- 3. Prepare Main Token NFT Metadata JSON ---
    const mainTokenMetadata = {
      name: nftTitle || `Platz Land Plot - ${listing.parcelNumber || landListingId}`,
      description: nftDescription || listing.propertyDescription || 'A unique plot of land on Platz.',
      image: imageFullUrl,
      attributes: [
        { trait_type: "Land Listing ID", value: landListingId },
        { trait_type: "Token Type", value: "Main Collection Token" },
        listing.parcelNumber ? { trait_type: "Parcel Number", value: listing.parcelNumber } : undefined,
        listing.country ? { trait_type: "Country", value: listing.country } : undefined,
        listing.propertyAreaSqm ? { trait_type: "Area (sqm)", value: listing.propertyAreaSqm.toString() } : undefined,
      ].filter(attr => attr !== undefined) as { trait_type: string; value: string | number }[],
      external_url: `${normalizedBaseUrl}/listings/${landListingId}`,
    };
    
    console.log('Using description for mainTokenMetadata:', mainTokenMetadata.description);
    // --- 4. Save Main Token Metadata JSON to local storage ---
    let mainTokenMetadataUrl;
    try {
      console.log(`Saving main token metadata to local storage...`);
      mainTokenMetadataUrl = await saveBufferToFile(
        Buffer.from(JSON.stringify(mainTokenMetadata, null, 2)), 
        `main-nft-metadata-${landListingId}`, 
        'application/json'
      );
      console.log(`Main token metadata saved to local storage: ${mainTokenMetadataUrl}`);
    } catch (e) {
      await updateMintStatus(landListingId, 'FAILED', 'Failed to save main token metadata to local storage');
      console.error("Error saving main token metadata:", e);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to save main token metadata to local storage', 
        details: (e as Error).message 
      }, { status: 500 });
    }
    
    // --- 5. Save Collection Metadata JSON ---
    // Use nftTitle (from requestData) directly for collection name.
    // Strip "Collection: " prefix from nftTitle if present, as it's often redundant for the collection name.
    let processedCollectionName = nftTitle || `Unnamed Land Collection ${landListingId}`; // Fallback if nftTitle is empty
    if (processedCollectionName.toLowerCase().startsWith('collection: ')) {
        processedCollectionName = processedCollectionName.substring('collection: '.length).trim();
    }
    // If stripping the prefix made the name empty, revert to a fallback.
    if (!processedCollectionName) {
        processedCollectionName = `Unnamed Land Collection ${landListingId}`;
    }

    // Use nftDescription (from requestData) directly for collection description.
    const processedCollectionDescription = nftDescription || `This is a collection of ${quantity + 1} unique land plots.`; // Fallback if nftDescription is empty

    // DEBUG LOG FOR COLLECTION METADATA INPUTS
    console.log(`[API MINT DEBUG] Preparing collectionMetadata. Inputs: nftTitle='${nftTitle}', nftDescription='${nftDescription}', quantity=${quantity}`);

    const collectionMetadata = {
      // Inherit image and external_url from main token's metadata as a base.
      // These could be made distinct for collections if needed in the future.
      image: mainTokenMetadata.image, 
      external_url: mainTokenMetadata.external_url, 

      name: processedCollectionName,
      description: processedCollectionDescription,
      
      attributes: [
        // Filter out "Token Type" from mainTokenMetadata's attributes, then add collection-specific attributes.
        // Ensure mainTokenMetadata.attributes exists before trying to filter.
        ...((mainTokenMetadata.attributes || []).filter((attr: {trait_type: string; value: any;}) => attr.trait_type !== "Token Type")),
        { trait_type: "Token Type", value: "Collection" },
        { trait_type: "Total Tokens", value: quantity + 1 } // +1 for main token
      ]
    };
    
    let collectionMetadataUrl;
    try {
      console.log(`Saving collection metadata to local storage...`);
      collectionMetadataUrl = await saveBufferToFile(
        Buffer.from(JSON.stringify(collectionMetadata, null, 2)), 
        `collection-metadata-${landListingId}`, 
        'application/json'
      );
      console.log(`Collection metadata saved to local storage: ${collectionMetadataUrl}`);
    } catch (e) {
      await updateMintStatus(landListingId, 'FAILED', 'Failed to save collection metadata to local storage');
      console.error("Error saving collection metadata:", e);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to save collection metadata to local storage', 
        details: (e as Error).message 
      }, { status: 500 });
    }
    
    // --- 6. Create metadata for child tokens using Cloudinary ---
    console.log('Creating child token metadata using cloud storage...');
    const childTokensBaseURI = `${normalizedBaseUrl}/api/child-metadata/${landListingId}/`;
    
    // We'll create child token metadata on-demand rather than pre-creating files
    console.log(`Child tokens will use base URI: ${childTokensBaseURI}`);

    // --- 6.5. Create fully qualified URLs for blockchain ---
    const mainTokenMetadataFullUrl = mainTokenMetadataUrl; // Already a full Cloudinary URL
    const collectionMetadataFullUrl = collectionMetadataUrl; // Already a full Cloudinary URL
    
    console.log(`Using URLs:`);
    console.log(`- Main Token Metadata: ${mainTokenMetadataFullUrl}`);
    console.log(`- Collection Metadata: ${collectionMetadataFullUrl}`);
    console.log(`- Child Tokens Base URI: ${childTokensBaseURI}`);

    // --- 7. Mint Collection on blockchain ---
    let createCollectionResult;
    try {
      console.log('Calling createCollection contract utility...');
      createCollectionResult = await createCollection(
        landListingId,
        ownerAddress,
        mainTokenMetadataFullUrl,
        quantity,
        collectionMetadataFullUrl,
        childTokensBaseURI
      );
      
      if (!createCollectionResult.success) {
        throw new Error(createCollectionResult.error || 'Failed to create collection in contractUtils');
      }

      console.log('createCollection successful:', createCollectionResult);
    } catch (error) {
      const errorMessage = `Failed to mint collection on blockchain: ${(error as Error).message}`;
      console.error(errorMessage, error);
      await updateMintStatus(landListingId, 'FAILED', errorMessage);
      return NextResponse.json({ 
        success: false, 
        error: errorMessage
      }, { status: 500 });
    }
    
    const { 
      collectionId, 
      mainTokenId, 
      creator, 
      startTokenId,
      quantity: mintedQuantity,
      transactionHash 
    } = createCollectionResult;

    // --- 7. Update Database with Minting Results ---
    try {
      console.log('Updating database with minting results...');

      // Update the LandListing with all the new data
          await prisma.landListing.update({
            where: { id: landListingId },
        data: {
          mintStatus: 'COMPLETED',
          mintTransactionHash: transactionHash,
          tokenId: mainTokenId ? parseInt(mainTokenId) : undefined,
          collectionId: collectionId,
          mainTokenId: mainTokenId,
          creatorAddress: creator,
          nftTitle: nftTitle,
          nftDescription: nftDescription || '',
          nftImageFileRef: imageUrl,
          mainTokenMetadataUrl: mainTokenMetadataFullUrl,
          collectionMetadataUrl: collectionMetadataFullUrl,
          childTokensBaseUrl: childTokensBaseURI,
          nftCollectionSize: quantity + 1,
        }
      });
      
      // --- 8. Create EvmCollectionToken records ---
      const tokensToCreate = [];
      const numericStartTokenId = BigInt(startTokenId || '0');
      const numericQuantity = BigInt(mintedQuantity || '0');

      // Add the main token
      if (mainTokenId) {
        tokensToCreate.push({
          landListingId: landListingId,
          tokenId: Number(mainTokenId),
          isMainToken: true,
          tokenURI: mainTokenMetadataFullUrl,
          ownerAddress: ownerAddress, // User's wallet is the owner
          mintTransactionHash: transactionHash,
          mintTimestamp: new Date(),
        });
      }

      // Add the child tokens
      if (startTokenId && mintedQuantity) {
        for (let i = 0n; i < numericQuantity; i++) {
          const tokenId = numericStartTokenId + i;
          const tokenURI = childTokensBaseURI.includes('{id}')
            ? `${childTokensBaseURI.replace('{id}', tokenId.toString())}.json`
            : `${childTokensBaseURI.endsWith('/') ? childTokensBaseURI : `${childTokensBaseURI}/`}${tokenId.toString()}.json`;
          
          tokensToCreate.push({
            landListingId: landListingId,
            tokenId: Number(tokenId),
            isMainToken: false,
            tokenURI: tokenURI,
            ownerAddress: ownerAddress, // User's wallet is the owner
            mintTransactionHash: transactionHash,
            mintTimestamp: new Date(),
          });
        }
      }

      if (tokensToCreate.length > 0) {
        // Use createMany for efficiency
        await prisma.evmCollectionToken.createMany({
          data: tokensToCreate,
          skipDuplicates: true, // Prevents errors on re-runs
        });
        console.log(`Successfully created or found ${tokensToCreate.length} EvmCollectionToken records.`);
      }

    } catch (error) {
      const errorMessage = `Minting successful, but failed to update database: ${(error as Error).message}`;
      console.error(errorMessage, error);
      // Don't mark mint as FAILED, as it succeeded on-chain. But log the error for debugging.
      await prisma.landListing.update({
        where: { id: landListingId },
        data: {
          mintErrorReason: errorMessage,
        },
      });
    }
      
    // --- 9. Final Success Response ---
      return NextResponse.json({
        success: true,
      message: 'NFT collection minted successfully and database updated',
        data: {
          landListingId,
        collectionId,
        mainTokenId,
        creator,
        transactionHash,
        }
      });
    
  } catch (error) {
    console.error('Unhandled error in mint-collection API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: (error as Error).message
    }, { status: 500 });
  }
}

// GET handler to check minting status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const landListingId = searchParams.get('landListingId');
  
  if (!landListingId) {
    return NextResponse.json({
      success: false,
      error: 'Missing landListingId parameter'
    }, { status: 400 });
  }
  
  try {
    const listing = await prisma.landListing.findUnique({
      where: { id: landListingId },
      select: {
        id: true,
        mintStatus: true,
        mintErrorReason: true,
        mintTransactionHash: true,
        tokenId: true,
        collectionId: true,
      }
    });
    
    if (!listing) {
      return NextResponse.json({
        success: false,
        error: 'Land listing not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      status: listing.mintStatus,
      error: listing.mintErrorReason,
      data: listing.mintStatus === 'COMPLETED' ? {
        tokenId: listing.tokenId,
        collectionId: listing.collectionId,
        transactionHash: listing.mintTransactionHash,
      } : undefined
    });
    
  } catch (error) {
    console.error('Error fetching minting status:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch minting status',
      details: (error as Error).message
    }, { status: 500 });
  }
} 