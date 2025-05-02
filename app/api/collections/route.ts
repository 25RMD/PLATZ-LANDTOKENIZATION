import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db'; // Use the standard alias import
// import prisma from '../../../lib/prisma'; // Remove relative path
import { Collection } from '@/lib/interdace'; // Keep for type hints if needed, Prisma Client is typed

// --- Remove the simulated database array ---
// let serverCollections: Collection[] = [...initialCollections]; 

// GET Handler - Fetch from Actual Database
export async function GET(request: NextRequest) {
  try {
    console.log("API GET /api/collections: Fetching from database..."); // Added log
    console.log("API GET /api/collections: Value of prisma before findMany:", prisma);
    const properties = await prisma.property.findMany({
      orderBy: {
        // Example: Order by volume descending by default, or createdAt
        createdAt: 'desc'
      }
    });
    console.log(`API GET /api/collections: Found ${properties.length} properties.`); // Updated log message
    return NextResponse.json(properties);
  } catch (error) {
    console.error('API GET /api/collections: Error fetching properties:', error); // Updated log message
    return NextResponse.json({ message: 'Internal Server Error fetching properties' }, { status: 500 }); // Updated error message
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

    // --- Actual Image Upload Needed Here ---
    // TODO: Implement actual image upload to cloud storage (S3, Cloudinary, Vercel Blob, etc.)
    // TODO: Get the permanent URL back from the storage service.
    // Using a placeholder for now:
    const imageUrl = `/placeholder/uploads/${Date.now()}_${imageFile.name}`;
    console.log(`API POST /api/collections: TODO: Implement actual image upload for ${imageFile.name}. Using placeholder: ${imageUrl}`);
    // --------------------------------------

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
      creator: creator,
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