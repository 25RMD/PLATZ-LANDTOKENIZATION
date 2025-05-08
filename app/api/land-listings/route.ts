import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Helper function to get string value from FormData
const getString = (formData: FormData, key: string): string | null => {
  const value = formData.get(key);
  return typeof value === 'string' ? value : null;
};

// Helper function to get File value from FormData
const getFile = (formData: FormData, key: string): File | null => {
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
    console.log("Received FormData keys:", Array.from(formData.keys())); // Log incoming FormData keys

    // --- User Authentication (Placeholder - Replace with actual JWT verification) ---
    const userId = "566a0c3d-c4b4-4e9c-8eb3-89f2cc0a74c0"; // UPDATED HARDCODED USER ID FOR TESTING - REMOVE LATER

    // --- File Handling ---
    const titleDeedFile = getFile(formData, 'titleDeedFile');
    const titleCertFile = getFile(formData, 'titleCertFile');
    const encumbranceFile = getFile(formData, 'encumbranceFile');
    const surveyPlanFile = getFile(formData, 'surveyPlanFile');
    const gisFile = getFile(formData, 'gisFile');
    const idDocumentFile = getFile(formData, 'idDocumentFile');
    const nftImageFile = getFile(formData, 'nftImageFile');
    
    // --- Save files to uploads directory ---
    // We'll use async/await to save the files and get the unique filenames
    const savedFiles: Record<string, string | null> = {};
    
    // Process each file and save it if it exists
    if (titleDeedFile) savedFiles.titleDeedFileRef = await saveFile(titleDeedFile);
    if (titleCertFile) savedFiles.titleCertFileRef = await saveFile(titleCertFile);
    if (encumbranceFile) savedFiles.encumbranceFileRef = await saveFile(encumbranceFile);
    if (surveyPlanFile) savedFiles.surveyPlanFileRef = await saveFile(surveyPlanFile);
    if (gisFile) savedFiles.gisFileRef = await saveFile(gisFile);
    if (idDocumentFile) savedFiles.idDocumentFileRef = await saveFile(idDocumentFile);
    if (nftImageFile) savedFiles.nftImageFileRef = await saveFile(nftImageFile);

    // --- Prepare data for Prisma ---
    const prismaData: Prisma.LandListingCreateInput = {
      user: { connect: { id: userId } }, // Corrected: Use connect for relations
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
      nftTitle: getString(formData, 'nftTitle'),
      nftDescription: getString(formData, 'nftDescription'),
      nftImageFileRef: savedFiles.nftImageFileRef || null,
      listingPrice: getString(formData, 'listingPrice') ? parseFloat(getString(formData, 'listingPrice')!) : null,
      priceCurrency: getString(formData, 'priceCurrency') || 'SOL',
      // nftCollectionSize will use the default (100) from Prisma schema

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

    console.log("Prisma Data Before Create:", JSON.stringify(prismaData, null, 2)); // Uncommented for detailed logging

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
