import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import path from 'path';
import { mkdir, writeFile } from 'fs/promises';

/**
 * GET /api/collections
 * 
 * Returns all collections from the database as a fallback when smart contract calls fail
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[API /api/collections] Fetching collections from database...');
    
    // Get all land listings that have been minted as collections
    const collections = await prisma.land_listings.findMany({
      where: {
        AND: [
          { collection_id: { not: null } },
          { 
            OR: [
              { mint_status: 'COMPLETED' },
              { mint_status: 'COMPLETED_COLLECTION' },
              { mint_status: 'SUCCESS' } // Legacy status
            ]
          }
        ]
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            evm_address: true
          }
        },
        evm_collection_tokens: {
          select: {
            token_id: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    console.log(`[API /api/collections] Found ${collections.length} collections in database`);

    // Transform the data to match the expected format with hybrid token counting
    const transformedCollections = collections.map(collection => {
      // Calculate actual collection size from minted tokens
      const actualTokenCount = collection.evm_collection_tokens.length;
      const dbCollectionSize = collection.nft_collection_size || 0;
      
      // Hybrid approach: use actual count if tokens exist, otherwise use database field
      const hybridCollectionSize = actualTokenCount > 0 ? actualTokenCount : dbCollectionSize;
      
      console.log(`[API /api/collections] Collection ${collection.collection_id}: DB size=${dbCollectionSize}, Actual tokens=${actualTokenCount}, Using=${hybridCollectionSize}`);
      
      return {
        id: collection.id,
        collectionId: collection.collection_id,
        mainTokenId: collection.main_token_id,
        nftTitle: collection.nft_title,
        nftDescription: collection.nft_description,
        nftImageFileRef: collection.nft_image_file_ref,
        nftCollectionSize: hybridCollectionSize,
        listingPrice: collection.listing_price,
        priceCurrency: collection.price_currency,
        country: collection.country,
        state: collection.state,
        localGovernmentArea: collection.local_government_area,
        propertyAreaSqm: collection.property_area_sqm,
        latitude: collection.latitude,
        longitude: collection.longitude,
        contractAddress: collection.contract_address,
        mintTransactionHash: collection.mint_transaction_hash,
        mintTimestamp: collection.mint_timestamp,
        createdAt: collection.created_at,
        user: collection.users // Match the Prisma relation name
      };
    });

    return NextResponse.json({
      success: true,
      collections: transformedCollections,
      count: transformedCollections.length
    });

  } catch (error: any) {
    console.error('[API /api/collections] Error fetching collections:', error);
    
    // More detailed error logging
    if (error.code) {
      console.error('[API /api/collections] Database error code:', error.code);
    }
    if (error.meta) {
      console.error('[API /api/collections] Database error meta:', error.meta);
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch collections',
      details: error.message
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
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { kyc_verified: true },
    });

    if (!user?.kyc_verified) {
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

    const data = {
      name: name,
      items: items,
      floorPrice: floorPrice,
      image: imageUrl,
      category: category,
    };

    // Create property in database with all required fields
    const propertyData = {
      id: crypto.randomUUID(), // Generate a UUID for the property
      name: data.name,
      items: 0, // Default value for required field
      floor_price: data.floorPrice,
      image: data.image,
      category: data.category,
      user_id: userId,
      created_at: new Date(),
      updated_at: new Date(),
      volume: 0, // Default value for required field
      verified: false, // Default value for required field
      // Connect to user using the correct relation name from schema
      user: {
        connect: { id: userId }
      }
    };

    console.log("API POST /api/collections: Attempting to create property in DB:", propertyData);

    const newProperty = await prisma.properties.create({ 
      data: propertyData,
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