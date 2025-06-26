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
      include: {
        users: {
          select: {
            id: true,
            username: true,
            evm_address: true,
          },
        },
        evm_collection_tokens: {
          select: {
            token_id: true,         // Prisma Int
            token_uri: true,
            owner_address: true,
            is_listed: true,
            listing_price: true,    // Prisma Float / Decimal depending on schema
          },
          orderBy: {
            token_id: 'asc',
          },
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

    // Helper types for raw data returned from Prisma
    type RawToken = {
      token_id: number;
      token_uri: string | null;
      owner_address: string | null;
      is_listed: boolean | null;
      listing_price: number | import('@prisma/client').Prisma.Decimal | null;
    };

    // Transform Prisma (snake_case) response into camelCase structure expected by the frontend
    const serializableCollection = {
      id: collection.id,
      nftTitle: collection.nft_title,
      nftDescription: collection.nft_description,
      listingPrice: collection.listing_price != null && typeof (collection.listing_price as any).toNumber === 'function'
        ? (collection.listing_price as any as import('@prisma/client').Prisma.Decimal).toNumber()
        : collection.listing_price,
      priceCurrency: collection.price_currency,
      nftImageFileRef: collection.nft_image_file_ref,
      nftCollectionSize: collection.nft_collection_size,
      country: collection.country,
      state: collection.state,
      localGovernmentArea: collection.local_government_area,
      propertyAreaSqm: collection.property_area_sqm,
      latitude: collection.latitude,
      longitude: collection.longitude,
      contractAddress: collection.contract_address,
      collectionId: collection.collection_id ? String(collection.collection_id) : null,
      mainTokenId: collection.main_token_id ? String(collection.main_token_id) : null,
      metadataUri: collection.collection_metadata_url,
      mintTransactionHash: collection.mint_transaction_hash,
      mintTimestamp: collection.mint_timestamp,
      createdAt: collection.created_at,

      // Map nested user (note: evm_address is snake_case in DB)
      user: (collection as any).users ? {
        id: (collection as any).users.id,
        username: (collection as any).users.username,
        evmAddress: (collection as any).users.evm_address,
      } : null,

      // Convert tokens array
      evmCollectionTokens: (collection.evm_collection_tokens as RawToken[]).map(token => ({
        tokenId: String(token.token_id),
        tokenURI: token.token_uri,
        ownerAddress: token.owner_address,
        isListed: token.is_listed,
        listingPrice: token.listing_price != null && typeof (token.listing_price as any).toNumber === 'function'
          ? (token.listing_price as any as import('@prisma/client').Prisma.Decimal).toNumber()
          : token.listing_price,
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