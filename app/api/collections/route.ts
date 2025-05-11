import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import path from 'path';
import { mkdir, writeFile } from 'fs/promises';

// GET Handler - Fetch active land listings
export async function GET(request: NextRequest) {
  console.log("API GET /api/collections: Starting request...");
  
  try {
    console.log("API GET /api/collections: Testing database connection...");
    try {
      // Simple query to test database connection
      await prisma.$queryRaw`SELECT 1 as test`;
      console.log("API GET /api/collections: Database connection successful");
    } catch (dbConnError: any) {
      console.error("API GET /api/collections: Database connection error:", {
        name: dbConnError.name,
        message: dbConnError.message,
        code: dbConnError.code,
      });
      return NextResponse.json({ 
        message: "Database connection error", 
        error: dbConnError.message 
      }, { status: 500 });
    }
    
    // Now fetch the actual land listings
    console.log("API GET /api/collections: Fetching land listings intended for collection display...");
    const collections = await prisma.landListing.findMany({
      where: {
        // We should only show listings that have been successfully minted
        // and have the necessary contract/collection details.
        mintStatus: 'SUCCESS', // Verify this value for successful mints
        contractAddress: {
          not: null, // Ensure contractAddress is set
        },
        collectionId: {
          not: null, // Ensure collectionId is set
        },
        // Optionally, add other statuses like 'ACTIVE' if you have a general status field
        // status: 'ACTIVE',
      },
      select: {
        id: true,
        nftTitle: true,
        nftDescription: true,
        listingPrice: true, 
        priceCurrency: true,
        nftImageFileRef: true,
        nftCollectionSize: true,
        createdAt: true, 
        user: {
          select: {
            id: true,
            username: true,
            evmAddress: true, // Changed from solanaPubKey for Ethereum context
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Default sort by newest
      },
    });

    console.log(`API GET /api/collections: Found ${collections.length} collections.`);
    return NextResponse.json(collections);

  } catch (error: any) {
    console.error('API GET /api/collections: Unexpected error:', { 
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    
    return NextResponse.json({ 
      message: "Internal Server Error",
      error: error.message
    }, { status: 500 });
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
    const name = (formData as any).get('name') as string;
    const creator = (formData as any).get('creator') as string;
    const itemsStr = (formData as any).get('items') as string;
    const floorPriceStr = (formData as any).get('floorPrice') as string;
    const category = (formData as any).get('category') as string;
    const imageFile = (formData as any).get('imageFile') as File | null;

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
    const newProperty = await prisma.property.create({ 
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