import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

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

    // --- Prepare data for Prisma ---
    const prismaData: Prisma.LandListingCreateInput = {
      user: { connect: { id: userId } }, // Corrected: Use connect for relations
      // Land Details
      parcelNumber: getString(formData, 'parcelNumber'),
      registryVolume: getString(formData, 'registryVolume'),
      registryPage: getString(formData, 'registryPage'),
      surveyPlanNumber: getString(formData, 'surveyPlanNumber'),
      surveyDate: getString(formData, 'surveyDate') ? new Date(getString(formData, 'surveyDate')!) : null,
      latitude: getString(formData, 'latitude'),
      longitude: getString(formData, 'longitude'),
      gisFileRef: gisFile ? gisFile.name : null,
      surveyPlanFileRef: surveyPlanFile ? surveyPlanFile.name : null,

      // Title Information
      titleDeedFileRef: titleDeedFile ? titleDeedFile.name : null,
      deedNumber: getString(formData, 'deedNumber'),
      deedType: getString(formData, 'deedType'),
      grantorName: getString(formData, 'grantorName'),
      granteeName: getString(formData, 'granteeName'),
      deedDate: getString(formData, 'deedDate') ? new Date(getString(formData, 'deedDate')!) : null,

      // Title Certificate
      titleCertFileRef: titleCertFile ? titleCertFile.name : null,
      certNumber: getString(formData, 'certNumber'),
      certIssueDate: getString(formData, 'certIssueDate') ? new Date(getString(formData, 'certIssueDate')!) : null,
      certExpiryDate: getString(formData, 'certExpiryDate') ? new Date(getString(formData, 'certExpiryDate')!) : null,

      // Encumbrance Details
      encumbranceFileRef: encumbranceFile ? encumbranceFile.name : null,
      encumbranceId: getString(formData, 'encumbranceId'),
      encumbrancePeriodStart: getString(formData, 'encumbrancePeriodStart') ? new Date(getString(formData, 'encumbrancePeriodStart')!) : null,
      encumbrancePeriodEnd: getString(formData, 'encumbrancePeriodEnd') ? new Date(getString(formData, 'encumbrancePeriodEnd')!) : null,

      // Owner KYC
      ownerName: getString(formData, 'ownerName'),
      govIdNumber: getString(formData, 'govIdNumber'),
      idDocumentFileRef: idDocumentFile ? idDocumentFile.name : null,
      kycStatus: getString(formData, 'kycStatus') || 'PENDING',

      // Chain-of-Title & Encumbrance History
      titleSearchFileRef: getString(formData, 'titleSearchFileRef'), 
      titleOpinionFileRef: getString(formData, 'titleOpinionFileRef'), 
      recordedInstruments: getString(formData, 'recordedInstruments'),

      // NFT Specific Details
      nftTitle: getString(formData, 'nftTitle'),
      nftDescription: getString(formData, 'nftDescription'),
      nftImageFileRef: nftImageFile ? nftImageFile.name : null,
      listingPrice: getString(formData, 'listingPrice') ? parseFloat(getString(formData, 'listingPrice')!) : null,
      priceCurrency: getString(formData, 'priceCurrency') || 'SOL',
      // nftCollectionSize will use the default (100) from Prisma schema

      // Additional Info
      status: getString(formData, 'status') || 'DRAFT',
      additionalNotes: getString(formData, 'additionalNotes'),
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
