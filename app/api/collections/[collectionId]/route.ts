import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma'; 
import { Property as PrismaProperty, NFT } from '@prisma/client';

interface PropertyWithNFTs extends PrismaProperty {
  nfts: NFT[];
  ownerCount: number; 
  listedCount: number; 
  topOffer: number | null; 
  volume24h: number; 
  sales24h: number; 
}

const generateMockNFTs = (property: PrismaProperty, propertyImageUrl: string): NFT[] => {
  const mockNfts: NFT[] = [];
  for (let i = 1; i <= property.items; i++) {
    mockNfts.push({
      id: `${property.id}-mock-${i}`, 
      name: `${property.name} #${i}`,
      itemNumber: i,
      image: propertyImageUrl, 
      price: property.floorPrice + Math.random() * 0.1 - 0.05, 
      propertyId: property.id, 
      createdAt: new Date(),
      updatedAt: new Date(),
      ownerId: null, 
      isListed: false 
    });
  }
  return mockNfts;
};

export async function GET(
  request: NextRequest,
  context: { params: { collectionId: string } } 
) {
  const { params } = context; 
  const awaitedParams = await context.params;
  const propertyId = awaitedParams.collectionId; 

  if (!propertyId) {
    return NextResponse.json({ message: 'Property ID is required' }, { status: 400 });
  }

  try {
    console.log(`API GET /api/collections/${propertyId}: Fetching property with NFTs...`); 

    const property = await prisma.property.findUnique({ 
      where: {
        id: propertyId,
      },
      include: {
        nfts: { 
          orderBy: {
            itemNumber: 'asc', 
          },
        },
      },
    });

    if (!property) {
      console.log(`API GET /api/collections/${propertyId}: Property not found.`); 
      return NextResponse.json({ message: 'Property not found' }, { status: 404 }); 
    }

    const distinctOwners = await prisma.nFT.findMany({
      where: {
        propertyId: propertyId,
        ownerId: { not: null },
      },
      distinct: ['ownerId'],
      select: { ownerId: true }, 
    });
    const distinctOwnerCount = distinctOwners.length;

    console.log(`API GET /api/collections/${propertyId}: Distinct owner count: ${distinctOwnerCount}`);

    const listedCount = await prisma.nFT.count({
      where: {
        propertyId: propertyId,
        isListed: true, 
      },
    });
    console.log(`API GET /api/collections/${propertyId}: Listed count: ${listedCount}`);

    const topOfferResult = await prisma.offer.aggregate({
      _max: { price: true },
      where: {
        status: 'ACTIVE',
        nft: { propertyId: propertyId },
      },
    });
    const topOffer = topOfferResult._max.price; 
    console.log(`API GET /api/collections/${propertyId}: Top offer: ${topOffer}`);

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const tradeStats = await prisma.trade.aggregate({
      _sum: { price: true },
      _count: { id: true },
      where: {
        timestamp: { gte: twentyFourHoursAgo },
        nft: { propertyId: propertyId },
      },
    });
    const volume24h = tradeStats._sum.price ?? 0;
    const sales24h = tradeStats._count.id ?? 0;
    console.log(`API GET /api/collections/${propertyId}: 24h Volume: ${volume24h}, 24h Sales: ${sales24h}`);

    console.log(`API GET /api/collections/${propertyId}: Found property. NFT count: ${property.nfts.length}`);

    if (property.nfts.length === 0 && property.items > 0) {
      console.log(`API GET /api/collections/${propertyId}: No NFTs found in DB, generating mocks for ${property.items} items...`);
      const mockNfts = generateMockNFTs(property, property.image); 
      const propertyWithMocksAndCount: PropertyWithNFTs = {
          ...property,
          nfts: mockNfts,
          ownerCount: 0, 
          listedCount: 0, 
          topOffer: null, 
          volume24h: 0,
          sales24h: 0
      };
       console.log(`API GET /api/collections/${propertyId}: Returning property with ${mockNfts.length} mocked NFTs.`); 
      return NextResponse.json(propertyWithMocksAndCount);
    }

    const nftsWithCorrectImage = property.nfts.map(nft => ({
      ...nft,
      image: property.image 
    }));

    const responseData: PropertyWithNFTs = {
        ...property,
        nfts: nftsWithCorrectImage, 
        ownerCount: distinctOwnerCount, 
        listedCount: listedCount, 
        topOffer: topOffer,
        volume24h: volume24h,
        sales24h: sales24h
    }
    console.log(`API GET /api/collections/${propertyId}: Returning property with ${property.nfts.length} real NFTs, ${distinctOwnerCount} owners, ${listedCount} listed.`); 
    return NextResponse.json(responseData); 

  } catch (error) {
    console.error(`API GET /api/collections/${propertyId}: Error fetching property:`, error); 
    return NextResponse.json({ message: 'Internal Server Error fetching property data' }, { status: 500 }); 
  }
}