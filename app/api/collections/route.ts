import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db'; // Use the standard alias import
import { writeFile } from 'fs/promises'; // For writing the file
import path from 'path';               // For path manipulation
import { mkdir } from 'fs/promises';   // For creating directory

// import prisma from '../../../lib/prisma'; // Remove relative path
import { Collection } from '@/lib/interdace'; // Keep for type hints if needed, Prisma Client is typed

// --- Remove the simulated database array ---
// let serverCollections: Collection[] = [...initialCollections]; 

// GET Handler - Fetch LandListings for Collection Display
export async function GET(request: NextRequest) {
  console.log("Attempting to GET /api/collections..."); // Added log
  try {
    console.log("API GET /api/collections: Fetching LandListings from database...");
    const landListings = await prisma.landListing.findMany({
      where: {
        // Add any filtering conditions if needed, e.g., status: 'ACTIVE'
        status: 'ACTIVE', // Example: Only fetch active/published listings
      },
      select: {
        id: true,
        nftTitle: true,
        nftDescription: true,
        listingPrice: true,
        priceCurrency: true,
        nftImageFileRef: true,
        nftCollectionSize: true,
        // slug: true, // REMOVED: Assuming you have a slug for direct navigation - Field does not exist
        user: { // Include creator details
          select: {
            id: true,
            username: true,
            solanaPubKey: true, // Or other relevant user identifier
          }
        },
        createdAt: true, // For sorting or display
        // Add any other fields needed for the collections overview/cards
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    console.log(`API GET /api/collections: Found ${landListings.length} LandListings.`);
    return NextResponse.json(landListings);
  } catch (error) {
    console.error('API GET /api/collections: Error fetching LandListings. Details:', { 
        name: (error as any).name,
        message: (error as any).message,
        code: (error as any).code, // For Prisma errors
        meta: (error as any).meta, // For Prisma errors
        stack: (error as any).stack,
        errorObject: error // Log the full error object for inspection
    });
    return NextResponse.json({ message: 'Internal Server Error fetching collections' }, { status: 500 });
  }
}

// POST Handler - Create in Actual Database
export async function POST(request: NextRequest) {
  try {
    // 1. Check Authentication & Verification using Middleware Header
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      // Should be caught by middleware, but double-check
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    // Fetch user to check verification status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { kycVerified: true },
    });

    if (!user?.kycVerified) {
      console.warn(`User ${userId} attempted to create collection but is not verified.`);
      return NextResponse.json({ message: 'User verification required to create listings.' }, { status: 403 }); // Forbidden
    }

    // 2. Proceed with Collection/Property Creation
    console.log("API POST /api/collections: Received request..."); // Added log
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const creator = formData.get('creator') as string;
    const itemsStr = formData.get('items') as string;
    const floorPriceStr = formData.get('floorPrice') as string;
    const category = formData.get('category') as string;
    const imageFile = formData.get('imageFile') as File | null;

    if (!name || !creator || !itemsStr || !floorPriceStr || !category || !imageFile) {
      console.log("API POST /api/collections: Missing required fields."); // Added log
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // --- Implement actual image upload locally --- 
    let imageUrl = '';
    try {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate a unique filename (e.g., timestamp + original name)
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      const extension = path.extname(imageFile.name);
      const filename = `${imageFile.name.replace(extension, '').slice(0, 20).replace(/[^a-z0-9]/gi, '_')}_${uniqueSuffix}${extension}`;
      
      // Define the upload directory relative to the project root
      const uploadDir = path.join(process.cwd(), 'public/uploads/properties');
      const filePath = path.join(uploadDir, filename);

      // Ensure the upload directory exists
      await mkdir(uploadDir, { recursive: true });

      // Write the file
      await writeFile(filePath, buffer);
      console.log(`API POST /api/collections: Uploaded file saved to ${filePath}`);

      // Construct the public URL
      imageUrl = `/uploads/properties/${filename}`;
      console.log(`API POST /api/collections: Public image URL: ${imageUrl}`);

    } catch (uploadError) {
      console.error('API POST /api/collections: Error uploading image:', uploadError);
      return NextResponse.json({ message: 'Error uploading image file.' }, { status: 500 });
    }
    // ---------------------------------------------

    // Prepare data for Prisma (ensure correct types)
    const items = parseInt(itemsStr, 10);
    const floorPrice = parseFloat(floorPriceStr);

    // Validate parsed numbers
    if (isNaN(items) || isNaN(floorPrice)) {
       console.log(`API POST /api/collections: Invalid number format. Items: ${itemsStr}, FloorPrice: ${floorPriceStr}`); // Added log
       return NextResponse.json({ message: 'Invalid number format for items or floor price' }, { status: 400 });
    }

    const propertyData = {
      name: name,
      items: items,
      floorPrice: floorPrice,
      image: imageUrl,
      category: category,
      userId: userId, // <<< ADD THIS LINE
      // Add any other required fields for your Property model
      // volume and verified will use default values from schema
      // id, createdAt, updatedAt are handled by Prisma/database
    };

    console.log("API POST /api/collections: Attempting to create property in DB:", propertyData); // <<< Use propertyData in log

    // --- Use the correct model name 'Property' --- 
    const newProperty = await prisma.Property.create({ 
      data: propertyData, // <<< Use propertyData here
    });
    
    console.log('--- API POST /api/collections: New Collection Added (Database) ---');
    console.log(newProperty);
    console.log('------------------------------------------------------------------');

    return NextResponse.json(newProperty, { status: 201 });

  } catch (error) {
    console.error('API POST /api/collections: Error creating collection:', error);
     // Prisma can throw specific errors, you might want to handle those
     // e.g., PrismaClientKnownRequestError
    return NextResponse.json({ message: 'Internal Server Error creating collection' }, { status: 500 });
  }
} 