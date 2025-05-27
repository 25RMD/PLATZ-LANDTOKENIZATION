import prisma from '@/lib/db';

/**
 * Service function to get collection by ID
 * 
 * Retrieves a specific NFT collection by ID
 * 
 * Parameters:
 * - id: Collection ID
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: Collection
 * }
 */
export async function getCollectionById(id: string) {
  try {
    const collection = await prisma.landListing.findUnique({
      where: {
        id: id, // Query by CUID string 'id'
      },
      select: {
        id: true,
        nftTitle: true,
        nftDescription: true,
        listingPrice: true, 
        priceCurrency: true,
        nftImageFileRef: true,
        nftCollectionSize: true,
        country: true,
        state: true,
        localGovernmentArea: true,
        propertyAreaSqm: true,
        latitude: true,
        longitude: true,
        contractAddress: true,
        collectionId: true,      // Prisma BigInt type (selected for response, not for query filter here)
        mainTokenId: true,       // Prisma BigInt type (selected for response, not for query filter here)

        mintTransactionHash: true,
        mintTimestamp: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            username: true,
            evmAddress: true,
          },
        },
        evmCollectionTokens: {
          select: {
            tokenId: true,         // Prisma BigInt type
            tokenURI: true,
            ownerAddress: true,
            isListed: true,
            listingPrice: true,    // Prisma Decimal type
          },
          orderBy: {
            tokenId: 'asc'
          }
        },
      },
    });

    if (!collection) {
      return {
        success: false,
        message: 'Collection not found',
        status: 404,
      };
    }

    // Define a type for the token object based on selection
    type EvmCollectionToken = {
      tokenId: bigint | null;
      tokenURI: string | null;
      ownerAddress: string | null;
      isListed: boolean | null;
      listingPrice: import('@prisma/client').Prisma.Decimal | null; 
    };

    // Convert BigInt fields to strings and Decimal to numbers for JSON serialization
    const serializableCollection = {
      ...collection,
      listingPrice: collection.listingPrice ? (collection.listingPrice as any as import('@prisma/client').Prisma.Decimal).toNumber() : null,
      collectionId: collection.collectionId?.toString(),
      mainTokenId: collection.mainTokenId?.toString(),
      evmCollectionTokens: (collection as any).evmCollectionTokens.map((token: EvmCollectionToken) => ({
        ...token,
        tokenId: token.tokenId?.toString(),
        listingPrice: token.listingPrice ? (token.listingPrice as any as import('@prisma/client').Prisma.Decimal).toNumber() : null, 
      })),
    };

    return {
      success: true,
      data: serializableCollection,
    };
  } catch (error: any) {
    console.error('Error fetching NFT collection by ID:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while fetching collection by ID',
      status: 500,
      errorDetail: error
    };
  }
} 