import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { LandListing as PrismaLandListing, NFT, User } from '@prisma/client';

interface LandListingWithDetails extends PrismaLandListing {
  individualNfts: NFT[];
  user: User | null;
  ownerCount: number;
  listedCount: number;
  topOffer: number | null;
  volume24h: number;
  sales24h: number;
  name: string;
  description: string | null;
  image: string | null;
  creator: string;
  floorPrice: number | null;
  items: number;
  verified: boolean;
}

const generateMockNFTs = (landListing: PrismaLandListing, listingImageUrl: string | null): NFT[] => {
  const mockNfts: NFT[] = [];
  const collectionSize = landListing.nftCollectionSize || 0;
  for (let i = 1; i <= collectionSize; i++) {
    mockNfts.push({
      id: `${landListing.id}-mock-${i}`,
      name: `${landListing.nftTitle || 'NFT'} #${i}`,
      itemNumber: i,
      image: listingImageUrl || '/placeholder-nft-image.png',
      price: (Number(landListing.listingPrice) || 0) + Math.random() * 0.1 - 0.05,
      landListingId: landListing.id,
      propertyId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ownerId: null,
      isListed: false,
    });
  }
  return mockNfts;
};

export async function GET(
  request: NextRequest,
  context: { params: { collectionId: string } }
) {
  const { params } = context;
  const landListingId = params.collectionId;

  if (!landListingId) {
    return NextResponse.json({ message: 'LandListing ID is required' }, { status: 400 });
  }

  try {
    console.log(`API GET /api/collections/${landListingId}: Fetching LandListing with NFTs...`);

    const landListing = await prisma.landListing.findUnique({
      where: {
        id: landListingId,
      },
      include: {
        individualNfts: {
          orderBy: {
            itemNumber: 'asc',
          },
        },
        user: true,
      },
    });

    if (!landListing) {
      console.log(`API GET /api/collections/${landListingId}: LandListing not found.`);
      return NextResponse.json({ message: 'LandListing not found' }, { status: 404 });
    }

    const distinctOwners = await prisma.nFT.findMany({
      where: {
        landListingId: landListingId,
        ownerId: { not: null },
      },
      distinct: ['ownerId'],
      select: { ownerId: true },
    });
    const distinctOwnerCount = distinctOwners.length;
    console.log(`API GET /api/collections/${landListingId}: Distinct owner count: ${distinctOwnerCount}`);

    const listedCount = await prisma.nFT.count({
      where: {
        landListingId: landListingId,
        isListed: true,
      },
    });
    console.log(`API GET /api/collections/${landListingId}: Listed count: ${listedCount}`);

    const topOfferResult = await prisma.offer.aggregate({
      _max: { price: true },
      where: {
        status: 'ACTIVE',
        nft: { landListingId: landListingId },
      },
    });
    const topOffer = topOfferResult._max.price;
    console.log(`API GET /api/collections/${landListingId}: Top offer: ${topOffer}`);

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const tradeStats = await prisma.trade.aggregate({
      _sum: { price: true },
      _count: { id: true },
      where: {
        timestamp: { gte: twentyFourHoursAgo },
        nft: { landListingId: landListingId },
      },
    });
    const volume24h = tradeStats._sum.price ?? 0;
    const sales24h = tradeStats._count.id ?? 0;
    console.log(`API GET /api/collections/${landListingId}: 24h Volume: ${volume24h}, 24h Sales: ${sales24h}`);

    console.log(`API GET /api/collections/${landListingId}: Found LandListing. NFT count from DB: ${landListing.individualNfts.length}`);

    let finalNfts = landListing.individualNfts;

    if (finalNfts.length === 0 && (landListing.nftCollectionSize || 0) > 0) {
      console.log(`API GET /api/collections/${landListingId}: No NFTs found in DB, generating mocks for ${landListing.nftCollectionSize} items...`);
      finalNfts = generateMockNFTs(landListing, landListing.nftImageFileRef);
      console.log(`API GET /api/collections/${landListingId}: Returning LandListing with ${finalNfts.length} mocked NFTs.`);
    } else {
      finalNfts = landListing.individualNfts.map(nft => ({
        ...nft,
        image: landListing.nftImageFileRef || nft.image || '/placeholder-nft-image.png',
      }));
      console.log(`API GET /api/collections/${landListingId}: Returning LandListing with ${finalNfts.length} real NFTs.`);
    }

    const creatorName = landListing.user?.username || landListing.user?.solanaPubKey || landListing.user?.email || 'Unknown Creator';

    const responseData: LandListingWithDetails = {
      ...landListing,
      individualNfts: finalNfts,
      ownerCount: distinctOwnerCount,
      listedCount: listedCount,
      topOffer: topOffer ? Number(topOffer) : null,
      volume24h: Number(volume24h),
      sales24h: Number(sales24h),
      name: landListing.nftTitle || 'Untitled Collection',
      description: landListing.nftDescription,
      image: landListing.nftImageFileRef,
      creator: creatorName,
      floorPrice: landListing.listingPrice ? Number(landListing.listingPrice) : null,
      items: landListing.nftCollectionSize || 0,
      verified: (landListing.user as any)?.kycStatus === 'VERIFIED' || false,
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error(`API GET /api/collections/${landListingId}: Error fetching LandListing:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error fetching LandListing data';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}