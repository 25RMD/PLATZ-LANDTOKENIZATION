import { NextRequest, NextResponse } from 'next/server';
import { Collection } from '@/lib/interdace';
import { collections as initialCollections } from '@/lib/data'; // Import initial data

// --- Simulate Database ---
// This in-memory array will hold collections for the lifetime of the server instance.
// It will be reset if the server restarts.
// In a real app, you would replace this with database interactions.
let serverCollections: Collection[] = [...initialCollections];
// ------------------------

export async function POST(request: NextRequest) {
  try {
    // Use formData to handle file uploads along with text fields
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const creator = formData.get('creator') as string;
    const items = formData.get('items') as string;
    const floorPrice = formData.get('floorPrice') as string;
    const category = formData.get('category') as string;
    const imageFile = formData.get('imageFile') as File | null;

    // Basic validation
    if (!name || !creator || !items || !floorPrice || !category || !imageFile) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // --- Simulate Image Upload ---
    // In a real app, you would upload the imageFile to cloud storage (S3, Cloudinary, etc.)
    // and get back a permanent URL. For now, we'll just use a placeholder or the filename.
    const imageUrl = `/images/uploads/${Date.now()}_${imageFile.name}`; // Example placeholder path
    console.log(`Simulating upload for image: ${imageFile.name}, Placeholder URL: ${imageUrl}`);
    // ---------------------------

    // Construct the new collection object
    const newCollection: Collection = {
      id: Date.now().toString(), // Simple unique ID generation
      name: name,
      creator: creator,
      items: parseInt(items, 10) || 0,
      volume: 0, // Default volume for new collections
      floorPrice: parseFloat(floorPrice) || 0,
      image: imageUrl, // Use the placeholder URL
      category: category,
      verified: false, // Default verification status for new collections
    };

    // --- Simulate Database Write ---
    serverCollections.push(newCollection);
    console.log('--- New Collection Added (Server-Side In-Memory) ---');
    console.log(newCollection);
    console.log('----------------------------------------------------');
    // -----------------------------

    // Return the newly created collection object
    return NextResponse.json(newCollection, { status: 201 }); // 201 Created status

  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// Implement the GET handler to return current collections
export async function GET(request: NextRequest) {
  try {
    // In a real app, this would fetch from your database.
    // Here, we return the current state of our in-memory array.
    return NextResponse.json(serverCollections);
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
} 