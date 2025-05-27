import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * GET /api/nft/collections
 * 
 * Retrieves a list of minted NFT collections
 * 
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Number of items per page (default: 10)
 * - status: Filter by status (ACTIVE, SOLD, etc.)
 * - minPrice: Minimum price
 * - maxPrice: Maximum price
 * - country: Filter by country
 * - state: Filter by state/province
 * - search: Search term for title or description
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     collections: Array<Collection>,
 *     pagination: {
 *       total: number,
 *       pages: number,
 *       page: number,
 *       limit: number
 *     }
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');
    const minPrice = url.searchParams.get('minPrice') ? parseFloat(url.searchParams.get('minPrice')!) : undefined;
    const maxPrice = url.searchParams.get('maxPrice') ? parseFloat(url.searchParams.get('maxPrice')!) : undefined;
    const country = url.searchParams.get('country');
    const state = url.searchParams.get('state');
    const search = url.searchParams.get('search');

    // Build the where clause for filtering
    const where: any = {
      mintStatus: 'COMPLETED', // Only show minted collections
    };

    if (status) {
      where.status = status;
    }

    if (minPrice !== undefined) {
      where.listingPrice = {
        ...where.listingPrice,
        gte: minPrice,
      };
    }

    if (maxPrice !== undefined) {
      where.listingPrice = {
        ...where.listingPrice,
        lte: maxPrice,
      };
    }

    if (country) {
      where.country = country;
    }

    if (state) {
      where.state = state;
    }

    if (search) {
      where.OR = [
        { nftTitle: { contains: search, mode: 'insensitive' } },
        { nftDescription: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Count total collections matching the criteria
    const total = await prisma.landListing.count({ where });

    // Calculate pagination
    const pages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    // Fetch the collections
    const collections = await prisma.landListing.findMany({
      where,
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
        collectionId: true,
        mainTokenId: true,
        nftMetadataIrysUri: true,


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
          where: {
            isMainToken: true,
          },
          select: {
            tokenId: true,
            tokenURI: true,
            ownerAddress: true,
            isListed: true,
            listingPrice: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: offset,
      take: limit,
    });

    // Convert BigInt fields to strings and Decimal to numbers for JSON serialization
    const serializableCollections = collections.map(collection => ({
      ...collection,
      listingPrice: collection.listingPrice ? (collection.listingPrice as any as import('@prisma/client').Prisma.Decimal).toNumber() : null,
      collectionId: collection.collectionId?.toString(),
      mainTokenId: collection.mainTokenId?.toString(),
      evmCollectionTokens: collection.evmCollectionTokens.map(token => ({
        ...token,
        tokenId: token.tokenId?.toString(),
        listingPrice: token.listingPrice ? (token.listingPrice as any as import('@prisma/client').Prisma.Decimal).toNumber() : null,
      })),
    }));

    return NextResponse.json({
      success: true,
      data: {
        collections: serializableCollections,
        pagination: {
          total,
          pages,
          page,
          limit,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching NFT collections:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while fetching NFT collections', 
        error: error.message 
      },
      { status: 500 }
    );
  }
}


