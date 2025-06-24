import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { mintNft, isValidPublicKey } from '@/lib/solana-utils'; // Now contains Ethereum compatible functions

// Helper function to get string value from FormData
const getString = (formData: any, key: string): string | null => {
  const value = formData.get(key);
  return typeof value === 'string' ? value : null;
};

// Helper function to get File value from FormData
const getFile = (formData: any, key: string): File | null => {
  const value = formData.get(key);
  return value instanceof File ? value : null;
};

// Helper function to save a file to the uploads directory and return a unique filename
const saveFile = async (file: File): Promise<string> => {
  // Create a unique filename to prevent collisions
  const uniqueFilename = `${uuidv4()}-${file.name}`;
  
  // Ensure public/uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Save the file
  const filePath = path.join(uploadsDir, uniqueFilename);
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);
  
  return uniqueFilename;
};

// Helper function to filter out undefined fields or fields that don't exist in the schema
const filterValidFields = (data: any): any => {
  // Define all valid fields from the LandListing schema based on the Prisma schema
  const validFields = [
    'id', 'userId', 'titleDeedFileRef', 'deedNumber', 'deedType', 'grantorName', 'granteeName', 
    'deedDate', 'titleCertFileRef', 'certNumber', 'certIssueDate', 'legalDescription', 
    'parcelNumber', 'propertyAddress', 'city', 'state', 'zipCode', 'country', 'latitude', 
    'longitude', 'propertyType', 'propertyAreaSqm', 'propertyDescription', 'listingTitle', 
    'listingPrice', 'priceCurrency', 'status', 'createdAt', 'updatedAt', 
    'coverImageUrl', 'title', 'tokenId', 'mintStatus', 
    'mintTransactionHash', 'mintErrorReason', 'nftImageIrysUri', 'nftMetadataIrysUri', 
    'marketplaceListingId', 'user', 'localGovernmentArea', 'propertyValuation', 
    'zoningClassification', 'nftTitle', 'nftDescription', 'nftImageFileRef', 'nftCollectionSize',
    'marketplaceListingError', 'contractAddress', 'collectionId', 'mainTokenId', 'metadataUri', 'slug',
    'creatorAddress'
  ];
  
  // Create a new object with only valid fields
  const filteredData: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (validFields.includes(key) && value !== undefined) {
      filteredData[key] = value;
    }
  }
  
  // Preserve special fields like 'user' relation that need to maintain their structure
  if (data.user) {
    filteredData.user = data.user;
  }
  
  return filteredData;
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    // console.log("Received FormData keys:", Array.from(((formData as any) as any).keys())); // Log incoming FormData keys

    // --- For development: Explicitly check for NFT Title and Image --- 
    const nftTitleForCheck = (formData as any).get('nftTitle') as string | null;
    const nftImageFileForCheck = (formData as any).get('nftImageFile') as File | null;

    if (!nftTitleForCheck || !nftImageFileForCheck) {
      return NextResponse.json({
        error: 'For development, NFT Title and NFT Image are required to create a basic listing.',
        // success: false, // Kept consistent with other error responses
      }, { status: 400 });
    }
    // --- End of development check ---

    // --- User Authentication ---
    // For development purposes, we'll use a hardcoded user ID if no authentication is present
    // In production, this should be replaced with proper JWT verification
    let userId = "566a0c3d-c4b4-4e9c-8eb3-89f2cc0a74c0"; // Default user ID for testing
    
    // Log all headers for debugging
    console.log("Request headers:", Object.fromEntries(req.headers.entries()));
    
    // Try to get user ID from headers (set by middleware or client)
    const headerUserId = req.headers.get('x-user-id');
    if (headerUserId) {
      console.log("Using user ID from headers:", headerUserId);
      userId = headerUserId;
    }

    // --- File Handling ---
    const titleDeedFile = (formData as any).get('titleDeedFile') as File | null;
    const titleCertFile = (formData as any).get('titleCertFile') as File | null;
    const encumbranceFile = (formData as any).get('encumbranceFile') as File | null;
    const surveyPlanFile = (formData as any).get('surveyPlanFile') as File | null;
    const gisFile = (formData as any).get('gisFile') as File | null;
    const idDocumentFile = (formData as any).get('idDocumentFile') as File | null;
    const nftImageFile = (formData as any).get('nftImageFile') as File | null;

    let nftMintAddress: string | null = null;
    let nftMetadataUri: string | null = null;
    let nftImageUrlArweave: string | null = null;
    
    // --- Save files to uploads directory --- (excluding nftImageFile if it's being minted)
    const savedFiles: Record<string, string | null> = {};
    
    // Process each file and save it if it exists
    if (titleDeedFile) savedFiles.titleDeedFileRef = await saveFile(titleDeedFile);
    if (titleCertFile) savedFiles.titleCertFileRef = await saveFile(titleCertFile);
    if (encumbranceFile) savedFiles.encumbranceFileRef = await saveFile(encumbranceFile);
    if (surveyPlanFile) savedFiles.surveyPlanFileRef = await saveFile(surveyPlanFile);
    if (gisFile) savedFiles.gisFileRef = await saveFile(gisFile);
    if (idDocumentFile) savedFiles.idDocumentFileRef = await saveFile(idDocumentFile);
    // Always save NFT image locally first to ensure we have a valid filename regardless of minting outcome
    if (nftImageFile) savedFiles.nftImageFileRef = await saveFile(nftImageFile);

    // --- NFT Minting Process ---
    const nftTitle = nftTitleForCheck;
    const nftDescriptionFromForm = (formData as any).get('nftDescription') as string | null;
    console.log('[API /api/land-listings] Received nftDescription from form:', nftDescriptionFromForm);
    const nftDescription = (formData as any).get('nftDescription') as string | null;
    let ownerEthAddressForDb: string | null = null; // Variable to store the Ethereum address used for minting

    if (nftImageFile && nftTitle) {
      try {
        const imageBuffer = Buffer.from(await nftImageFile.arrayBuffer());

        // Fetch the user's Ethereum address
        const user = await prisma.user.findUnique({ where: { id: userId } });
        console.log("Found user:", user ? { id: user.id, evmAddress: user.evmAddress } : "User not found");
        
        // For development, we'll allow minting without a valid Ethereum address
        // In production, this should be enforced
        if (!user) {
          console.warn('User not found, proceeding without user data');
        } else if (!user.evmAddress) {
          console.warn('User has no Ethereum address, proceeding without it');
        } else if (!isValidPublicKey(user.evmAddress)) {
          console.warn('Invalid Ethereum address format, proceeding anyway');
        }
        
        // Store the Ethereum address if it exists and is valid
        if (user?.evmAddress && isValidPublicKey(user.evmAddress)) {
          ownerEthAddressForDb = user.evmAddress;
        }

        const mintResult = await mintNft(
          nftTitle,
          nftDescriptionFromForm || '',
          imageBuffer,
          ownerEthAddressForDb || 'placeholder-ethereum-address', // Use placeholder if no address is available
          500 // Default 5% seller fee basis points
        );
        
        nftMintAddress = mintResult.mintAddress.toString();
        nftMetadataUri = mintResult.metadataUri;
        nftImageUrlArweave = mintResult.imageUrl; // This will be saved as nftImageFileRef
        console.log('NFT Minted:', { nftMintAddress, nftMetadataUri, nftImageUrlArweave });
      } catch (mintError) {
        console.error('NFT Minting Error:', mintError);
        // We'll continue with the local image reference that was already saved
        console.log('Falling back to local image reference:', savedFiles.nftImageFileRef);
      }
    }

    // --- For development purposes, we'll make the user relation optional ---
    // In production, we should ensure that a valid user is always connected
    
    // --- Prepare data for Prisma ---
    // Create a base data object without the user relation
    const baseData: Omit<Prisma.LandListingCreateInput, 'user'> = {
      // Land Details
      parcelNumber: (formData as any).get('parcelNumber') as string | null,
      latitude: (formData as any).get('latitude') ? parseFloat((formData as any).get('latitude')!) : null,
      longitude: (formData as any).get('longitude') ? parseFloat((formData as any).get('longitude')!) : null,

      // Title Information
      titleDeedFileRef: savedFiles.titleDeedFileRef || null,
      deedNumber: (formData as any).get('deedNumber') as string | null,
      deedType: (formData as any).get('deedType') as string | null,
      grantorName: (formData as any).get('grantorName') as string | null,
      granteeName: (formData as any).get('granteeName') as string | null,
      deedDate: (formData as any).get('deedDate') ? new Date(((formData as any).get('deedDate') as string)!) : null,

      // Title Certificate
      titleCertFileRef: savedFiles.titleCertFileRef || null,
      certNumber: (formData as any).get('certNumber') as string | null,
      certIssueDate: (formData as any).get('certIssueDate') ? new Date(((formData as any).get('certIssueDate') as string)!) : null,

      // Property Details
      propertyAddress: (formData as any).get('propertyAddress') as string | null,
      city: (formData as any).get('city') as string | null,
      state: (formData as any).get('state') as string | null,
      country: (formData as any).get('country') as string | null,
      zipCode: (formData as any).get('zipCode') as string | null,
      propertyType: (formData as any).get('propertyType') as string | null,
      propertyAreaSqm: (formData as any).get('propertyAreaSqm') ? parseFloat(((formData as any).get('propertyAreaSqm') as string)!) : null,
      legalDescription: (formData as any).get('legalDescription') as string | null,
      
      // Store nftDescription directly in its own field or a suitable existing field
      // Assuming you have a field like 'nftDescription' in your Prisma model
      nftDescription: nftDescriptionFromForm, 
      // If you were using propertyDescription for other structured data, adjust accordingly
      // For now, let's assume propertyDescription might hold other notes or can be simplified
      propertyDescription: JSON.stringify({
        notes: ((formData as any).get('additionalNotes') as string | null) || ''
      }),
      
      listingTitle: nftTitle,
      nftTitle: nftTitle,
      nftImageIrysUri: nftImageUrlArweave,
      nftImageFileRef: savedFiles.nftImageFileRef,
      listingPrice: (formData as any).get('listingPrice') ? parseFloat(((formData as any).get('listingPrice') as string)!) : null,
      priceCurrency: ((formData as any).get('priceCurrency') as string | null) || 'ETH',
      
      mintStatus: 'NOT_STARTED',
      mintTransactionHash: nftMintAddress, 
      nftMetadataIrysUri: nftMetadataUri,

      status: ((formData as any).get('status') as string | null) || 'DRAFT',
    };

    // Try to find a valid user to connect to the listing, or create one if needed
    let userToConnect = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!userToConnect) {
      console.log("User not found with ID:", userId);
      
      // Try to find a user by username 'admin' (from seed.js)
      userToConnect = await prisma.user.findUnique({ where: { username: "admin" } });
      
      if (!userToConnect) {
        console.log("No admin user found, creating a test user...");
        
        // Create a test user with a random ID
        try {
          userToConnect = await prisma.user.create({
            data: {
              username: "testuser_" + Date.now(),
              email: `test_${Date.now()}@example.com`,
              passwordHash: "placeholder",
              isAdmin: false,
            }
          });
          console.log("Created test user with ID:", userToConnect.id);
        } catch (error) {
          console.error("Error creating test user:", error);
          throw new Error("Could not create a test user for this listing");
        }
      } else {
        console.log("Found admin user with ID:", userToConnect.id);
      }
    } else {
      console.log("Found user with ID:", userToConnect.id);
    }
    
    // Now we should have a valid user to connect to
    const prismaData = {
      ...baseData,
      // Record the creator's Ethereum address on creation
      creatorAddress: ownerEthAddressForDb,
      user: {
        connect: {
          id: userToConnect.id
        }
      }
    };
    
    // Filter the data to only include fields that exist in the schema
    const filteredPrismaData = filterValidFields(prismaData);
    
    console.log("Prisma Data After Filtering:", JSON.stringify(filteredPrismaData, null, 2));

    // Create the listing with filtered data
    const newListing = await prisma.landListing.create({
      data: filteredPrismaData,
    });

    return NextResponse.json(newListing, { status: 201 });
  } catch (error) {
    console.error('Error creating land listing. Details:', { // Enhanced error logging
        name: (error as any).name,
        message: (error as any).message,
        code: (error as any).code, // For Prisma errors
        meta: (error as any).meta, // For Prisma errors
        stack: (error as any).stack,
        errorObject: error // Log the full error object for inspection
    });
    let errorMessage = 'Failed to create land listing';
    let statusCode = 500;
    const errorDetails: Record<string, any> = {}; 

    if (error instanceof Error) {
        errorMessage = error.message;
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      errorMessage = 'Invalid data provided. Please check your inputs.';
      statusCode = 400;
      // For client validation errors, the error.message is usually informative enough
      // errorDetails.prismaValidationDetails = error.message; 
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle known request errors (e.g., unique constraints)
        if (error.code === 'P2002') { 
            errorMessage = 'A record with some of the provided details (e.g., a unique identifier) already exists.';
            statusCode = 409; // Conflict
            // Add more specific information about which fields caused the conflict if available from error.meta.target
            if (error.meta && (typeof error.meta.target === 'string' || Array.isArray(error.meta.target))) {
                errorDetails.conflictingFields = Array.isArray(error.meta.target) ? error.meta.target.join(', ') : error.meta.target;
            }
        }
        // Add other specific Prisma error codes as needed (e.g., P2003 for foreign key constraint failure)
    }
    
    // Return a structured error response
    return NextResponse.json({ 
        error: errorMessage, 
        // Only include details if the object is not empty
        details: Object.keys(errorDetails).length > 0 ? errorDetails : undefined 
    }, { status: statusCode });
  }
}
