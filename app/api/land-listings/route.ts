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
  
  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Save the file
  const filePath = path.join(uploadsDir, uniqueFilename);
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);
  
  return uniqueFilename;
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    console.log("Received FormData keys:", Array.from((formData as any).keys())); // Log incoming FormData keys

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
    const titleDeedFile = getFile(formData, 'titleDeedFile');
    const titleCertFile = getFile(formData, 'titleCertFile');
    const encumbranceFile = getFile(formData, 'encumbranceFile');
    const surveyPlanFile = getFile(formData, 'surveyPlanFile');
    const gisFile = getFile(formData, 'gisFile');
    const idDocumentFile = getFile(formData, 'idDocumentFile');
    const nftImageFile = getFile(formData, 'nftImageFile');

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
    const nftTitle = getString(formData, 'nftTitle');
    const nftDescription = getString(formData, 'nftDescription');
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
          nftDescription || '',
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
      parcelNumber: getString(formData, 'parcelNumber'),
      registryVolume: getString(formData, 'registryVolume'),
      registryPage: getString(formData, 'registryPage'),
      surveyPlanNumber: getString(formData, 'surveyPlanNumber'),
      surveyDate: getString(formData, 'surveyDate') ? new Date(getString(formData, 'surveyDate')!) : null,
      // Store latitude and longitude directly as they exist in the schema
      latitude: getString(formData, 'latitude'),
      longitude: getString(formData, 'longitude'),
      gisFileRef: savedFiles.gisFileRef || null,
      surveyPlanFileRef: savedFiles.surveyPlanFileRef || null,

      // Title Information
      titleDeedFileRef: savedFiles.titleDeedFileRef || null,
      deedNumber: getString(formData, 'deedNumber'),
      deedType: getString(formData, 'deedType'),
      grantorName: getString(formData, 'grantorName'),
      granteeName: getString(formData, 'granteeName'),
      deedDate: getString(formData, 'deedDate') ? new Date(getString(formData, 'deedDate')!) : null,

      // Title Certificate
      titleCertFileRef: savedFiles.titleCertFileRef || null,
      certNumber: getString(formData, 'certNumber'),
      certIssueDate: getString(formData, 'certIssueDate') ? new Date(getString(formData, 'certIssueDate')!) : null,
      certExpiryDate: getString(formData, 'certExpiryDate') ? new Date(getString(formData, 'certExpiryDate')!) : null,

      // Encumbrance Details
      encumbranceFileRef: savedFiles.encumbranceFileRef || null,
      encumbranceId: getString(formData, 'encumbranceId'),
      encumbrancePeriodStart: getString(formData, 'encumbrancePeriodStart') ? new Date(getString(formData, 'encumbrancePeriodStart')!) : null,
      encumbrancePeriodEnd: getString(formData, 'encumbrancePeriodEnd') ? new Date(getString(formData, 'encumbrancePeriodEnd')!) : null,

      // Owner KYC
      ownerName: getString(formData, 'ownerName'),
      govIdNumber: getString(formData, 'govIdNumber'),
      idDocumentFileRef: savedFiles.idDocumentFileRef || null,
      kycStatus: getString(formData, 'kycStatus') || 'PENDING',

      // Chain-of-Title & Encumbrance History
      titleSearchFileRef: getString(formData, 'titleSearchFileRef'), 
      titleOpinionFileRef: getString(formData, 'titleOpinionFileRef'), 
      recordedInstruments: getString(formData, 'recordedInstruments'),

      // NFT Specific Details
      nftTitle: nftTitle,
      nftDescription: nftDescription,
      // Use Arweave URL if available, otherwise fall back to local image reference.
      // Never store null or placeholder values if we have an image
      nftImageFileRef: nftImageUrlArweave || savedFiles.nftImageFileRef || null,
      listingPrice: getString(formData, 'listingPrice') ? parseFloat(getString(formData, 'listingPrice')!) : null,
      priceCurrency: getString(formData, 'priceCurrency') || 'ETH',
      // nftCollectionSize will use the default (100) from Prisma schema
      // Ethereum NFT Integration Fields
      contractAddress: nftMintAddress, // Contract address instead of mintAddress
      metadataUri: nftMetadataUri,
      evmOwnerAddress: nftMintAddress ? ownerEthAddressForDb : null, // Use the fetched Ethereum address
      mintStatus: 'NOT_STARTED', // Default status

      // Additional Info
      status: getString(formData, 'status') || 'DRAFT',
      // Store location data and property area in additionalNotes as JSON until database migration is done
      additionalNotes: JSON.stringify({
        locationData: {
          country: getString(formData, 'country'),
          state: getString(formData, 'state'),
          localGovernmentArea: getString(formData, 'localGovernmentArea')
        },
        propertyAreaSqm: getString(formData, 'propertyAreaSqm') || '',
        notes: getString(formData, 'additionalNotes') || ''
      }),
    };

    // Try to find a valid user to connect to the listing, or create one if needed
    let prismaData: Prisma.LandListingCreateInput;
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
    prismaData = {
      ...baseData,
      user: {
        connect: {
          id: userToConnect.id
        }
      }
    };
    
    console.log("Prisma Data Before Create:", JSON.stringify(prismaData, null, 2));

    // Create the listing with or without a user relation
    const newListing = await prisma.landListing.create({
      data: prismaData,
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
