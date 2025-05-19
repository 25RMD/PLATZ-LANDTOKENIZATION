import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { createCollection } from '@/lib/ethereum/contractUtils';
import fs from 'fs';
import path from 'path';
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

// Helper function to save a buffer to a file and return its URL
const saveBufferToFile = async (buffer: Buffer, fileName: string, contentType: string): Promise<string> => {
  // Create a unique filename to prevent collisions
  const fileExtension = contentType.split('/')[1] || 'png';
  const uniqueFilename = `${uuidv4()}-${fileName}.${fileExtension}`;
  
  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Save the file
  const filePath = path.join(uploadsDir, uniqueFilename);
  fs.writeFileSync(filePath, buffer);
  
  // Return the URL path for the file
  return `/uploads/${uniqueFilename}`;
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
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
    
    // Ensure the baseUrl doesn't have a trailing slash
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    
    // Create the full URLs using the baseUrl
    const imageFullUrl = `${normalizedBaseUrl}${imageUrl}`;
    
    // Show warning only if not using ngrok
    if (baseUrl.includes('localhost') || !baseUrl.includes('ngrok')) {
      console.warn('WARNING: Using URL that may not be publicly accessible for NFT metadata: ' + baseUrl);
      console.warn('For development with smart contracts, please use ngrok and set NEXT_PUBLIC_BASE_URL to your ngrok URL');
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
    const collectionMetadata = {
      ...mainTokenMetadata,
      name: `${mainTokenMetadata.name} Collection`,
      description: `Collection of ${quantity} land tokens for ${mainTokenMetadata.name}`,
      attributes: [
        ...mainTokenMetadata.attributes.filter(attr => attr.trait_type !== "Token Type"),
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
    
    // --- 6. Create metadata directory for child tokens ---
    const metadataDir = path.join(process.cwd(), 'uploads', 'metadata');
    if (!fs.existsSync(metadataDir)) {
      fs.mkdirSync(metadataDir, { recursive: true });
    }
    
    // --- 7. Generate and save child token metadata ---
    for (let i = 1; i <= quantity; i++) {
      const childTokenMetadata = {
        ...mainTokenMetadata,
        name: `${mainTokenMetadata.name} - Plot ${i}`,
        description: `${mainTokenMetadata.description} - Sub-plot ${i} of the collection.`,
        attributes: [
          ...mainTokenMetadata.attributes.filter(attr => attr.trait_type !== "Token Type"),
          { trait_type: "Token Type", value: "Child Token" },
          { trait_type: "Plot Number", value: i },
          { trait_type: "Parent Collection", value: `${mainTokenMetadata.name} Collection` }
        ]
      };
      
      try {
        // Save the child token metadata with format "1.json", "2.json", etc.
        // This matches the expected format for tokenURI in the contract
        const childTokenFilePath = path.join(metadataDir, `${i}.json`);
        fs.writeFileSync(childTokenFilePath, JSON.stringify(childTokenMetadata, null, 2));
        console.log(`Child token ${i} metadata saved to: ${childTokenFilePath}`);
      } catch (e) {
        await updateMintStatus(landListingId, 'FAILED', `Failed to save child token ${i} metadata`);
        console.error(`Error saving child token ${i} metadata:`, e);
        return NextResponse.json({ 
          success: false, 
          error: `Failed to save child token ${i} metadata`, 
          details: (e as Error).message 
        }, { status: 500 });
      }
    }
    
    // --- 8. Create fully qualified URLs ---
    const mainTokenMetadataFullUrl = `${normalizedBaseUrl}${mainTokenMetadataUrl}`;
    const collectionMetadataFullUrl = `${normalizedBaseUrl}${collectionMetadataUrl}`;
    // For child tokens, the baseURI will be used with the filename "1.json", "2.json", etc.
    const childTokensBaseURI = `${normalizedBaseUrl}/api/static/metadata/`;
    
    console.log(`Using URLs:`);
    console.log(`- Main Token Metadata: ${mainTokenMetadataFullUrl}`);
    console.log(`- Collection Metadata: ${collectionMetadataFullUrl}`);
    console.log(`- Child Tokens Base URI: ${childTokensBaseURI}`);
    
    // Validate URLs are accessible to the blockchain
    if (!normalizedBaseUrl.startsWith('https://') && !normalizedBaseUrl.startsWith('http://')) {
      throw new Error('NEXT_PUBLIC_BASE_URL must be a valid HTTP/HTTPS URL for metadata to be accessible by smart contracts');
    }

    // --- 9. Create NFT Collection on-chain ---
    try {
      console.log(`Creating NFT collection for listing ${landListingId} with owner ${ownerAddress}...`);
      
      // Check for valid contract configuration first
      if (!process.env.NFT_CONTRACT_ADDRESS || process.env.NFT_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
        throw new Error("NFT contract address is not properly configured. Please set the NFT_CONTRACT_ADDRESS environment variable.");
      }
      
      // Call createCollection from contractUtils.ts
      const result = await createCollection(
        landListingId,
        ownerAddress,
        mainTokenMetadataFullUrl,
        quantity, // Number of child tokens
        collectionMetadataFullUrl,
        childTokensBaseURI
      );
      
      if (!result.success) {
        // If createCollection itself failed, it should have already updated mintStatus to FAILED.
        // We just re-throw the error to be caught by the outer try-catch which will also attempt to set FAILED status.
        throw new Error(result.error || 'Unknown error creating collection in contractUtils');
      }

      // After a successful transaction and event parsing within createCollection,
      // collectionId and mainTokenId should be non-null strings.
      if (!result.collectionId || !result.mainTokenId) {
        console.error('Critical Error: Collection ID or Main Token ID is missing from a successful createCollection result.');
        // Attempt to update status to FAILED, then throw.
        try {
          await prisma.landListing.update({
            where: { id: landListingId },
            data: { mintStatus: 'FAILED', mintErrorReason: 'Post-mint ID parsing inconsistency' },
          });
        } catch (dbUpdateError) {
          console.error('Failed to update LandListing to FAILED after ID inconsistency:', dbUpdateError);
        }
        throw new Error('Critical Error: Post-mint ID parsing inconsistency. Contact support.');
      }
      
      console.log(`NFT collection created successfully: Collection ID ${result.collectionId}, Main Token ID: ${result.mainTokenId}, Transaction: ${result.transactionHash}`);
      
      // --- 10. Update database with NFT data ---
      // result.collectionId and result.mainTokenId are already strings here.
      await prisma.landListing.update({
        where: { id: landListingId },
        data: {
          mintStatus: 'COMPLETED',
          mintTransactionHash: { set: result.transactionHash },
          tokenId: { set: result.mainTokenId }, // Explicitly set String
          collectionId: { set: result.collectionId }, // Explicitly set String
          nftTitle: { set: nftTitle },
          nftDescription: { set: nftDescription || '' },
          nftImageFileRef: { set: imageUrl },
          metadataUri: { set: mainTokenMetadataFullUrl },
        },
      });
      
      // Return success response
      return NextResponse.json({
        success: true,
        message: 'NFT collection minted successfully',
        data: {
          landListingId,
          collectionId: result.collectionId,
          mainTokenId: result.mainTokenId,
          transactionHash: result.transactionHash,
        }
      });
      
    } catch (error) {
      console.error('Error minting NFT collection:', error);
      
      // Update mint status to FAILED
      await updateMintStatus(landListingId, 'FAILED', (error as Error).message);
      
      return NextResponse.json({
        success: false,
        error: 'Error minting NFT collection',
        details: (error as Error).message
      }, { status: 500 });
    }
    
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