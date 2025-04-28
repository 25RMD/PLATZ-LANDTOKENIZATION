import { NextRequest, NextResponse } from 'next/server';
// import prisma from '../../../lib/prisma'; // Previous incorrect relative path
import prisma from '../../../../lib/prisma'; // Corrected relative path
import { NFT } from '@prisma/client'; // Import generated NFT type if needed

// Define the expected structure for the response, including NFTs
import { Collection } from '@/lib/interdace'; // Assuming this includes basic fields
interface CollectionWithNFTs extends Collection {
  nfts: NFT[]; // Use Prisma's generated NFT type
}

// Mock NFT Generator Function
const generateMockNFTs = (collection: Collection): NFT[] => {
  const mockNfts: NFT[] = [];
  for (let i = 1; i <= collection.items; i++) {
    mockNfts.push({
      id: `${collection.id}-mock-${i}`, // Simple mock ID
      name: `${collection.name} #${i}`,
      itemNumber: i,
      // Use a generic placeholder or try to derive from collection image
      image: `/images/mock-nft-placeholder.png`, // Generic placeholder
      // Use floor price or a slight variation for mock price
      price: collection.floorPrice + Math.random() * 0.1 - 0.05, // Slight random variation
      collectionId: collection.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  return mockNfts;
};

export async function GET(
  request: NextRequest,
  context: { params: { collectionId: string } }
) {
  const collectionId = context.params.collectionId;

  if (!collectionId) {
    return NextResponse.json({ message: 'Collection ID is required' }, { status: 400 });
  }

  try {
    console.log(`API GET /api/collections/${collectionId}: Fetching collection with NFTs...`);

    const collection = await prisma.collection.findUnique({
      where: {
        id: collectionId,
      },
      include: {
        nfts: { // Include the related NFTs
          orderBy: {
            itemNumber: 'asc', // Order NFTs by their number within the collection
          },
        },
      },
    });

    if (!collection) {
      console.log(`API GET /api/collections/${collectionId}: Collection not found.`);
      return NextResponse.json({ message: 'Collection not found' }, { status: 404 });
    }

    console.log(`API GET /api/collections/${collectionId}: Found collection. NFT count: ${collection.nfts.length}`);

    // Check if NFTs were included but the array is empty (meaning none exist in DB)
    // And if the collection expects items (items > 0)
    if (collection.nfts.length === 0 && collection.items > 0) {
      console.log(`API GET /api/collections/${collectionId}: No NFTs found in DB, generating mocks for ${collection.items} items...`);
      // Generate mock NFTs if none are found in the database
      const mockNfts = generateMockNFTs(collection);
      // We need to cast the collection to include the mocked nfts field
      const collectionWithMocks: CollectionWithNFTs = {
          ...collection,
          nfts: mockNfts
      };
       console.log(`API GET /api/collections/${collectionId}: Returning collection with ${mockNfts.length} mocked NFTs.`);
      return NextResponse.json(collectionWithMocks);
    }

    // If real NFTs exist, return the collection as fetched
    console.log(`API GET /api/collections/${collectionId}: Returning collection with ${collection.nfts.length} real NFTs.`);
    return NextResponse.json(collection);

  } catch (error) {
    console.error(`API GET /api/collections/${collectionId}: Error fetching collection:`, error);
    return NextResponse.json({ message: 'Internal Server Error fetching collection data' }, { status: 500 });
  }
} 