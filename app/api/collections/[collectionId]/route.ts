import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { LandListing as PrismaLandListing, User, NFT, Offer, Trade, Prisma } from '@prisma/client'; 
import { Decimal } from '@prisma/client/runtime/library'; 

interface LandListingWithStats extends PrismaLandListing {
  user: User | null;
  processedNftImageUrl: string | null;
  derivedCreatorName: string;
  derivedOwnerCount: number;   
  derivedListedCount: number;  
  derivedItemsCount: number;   
  stats: {
    topOffer: Decimal | number | null; 
    volume24h: Decimal | number | null;
    sales24h: number | null;
  };
}

const getFileUrl = (fileRef: string | null): string => {
  const placeholder = '/placeholder-nft-image.png';
  if (!fileRef) return placeholder;
  if (fileRef.startsWith('http://') || fileRef.startsWith('https://')) return fileRef;
  if (fileRef.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i)) {
    return `/api/files/${fileRef}`;
  }
  if (fileRef.startsWith('/')) return fileRef;
  if (fileRef.startsWith('public/')) return `/${fileRef.substring(7)}`;
  return placeholder;
};

export async function GET(
  request: NextRequest,
  { params }: { params: { collectionId: string } }
) {
  const landListingId = params.collectionId;

  if (!landListingId) {
    return NextResponse.json({ message: 'LandListing ID is required' }, { status: 400 });
  }

  try {
    console.log(`API GET /api/collections/${landListingId}: Fetching LandListing and associated NFT data...`);

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const landListingWithNfts = await prisma.landListing.findUnique({
      where: {
        id: landListingId,
      },
      include: {
        user: true, 
        individualNfts: {     // Changed from 'nfts' to 'individualNfts'
          include: {
            owner: true, // To count unique owners
            offers: {
              where: {
                status: 'ACTIVE', 
              },
              orderBy: {
                price: 'desc',
              },
            },
            trades: {
              where: {
                timestamp: {
                  gte: twentyFourHoursAgo,
                },
              },
            },
          },
        },
      },
    });

    if (!landListingWithNfts) { 
      console.log(`API GET /api/collections/${landListingId}: LandListing not found.`);
      return NextResponse.json({ message: 'LandListing not found' }, { status: 404 });
    }

    const nftsInCollection = landListingWithNfts.individualNfts || []; // Changed from .nfts
    
    const derivedItemsCount = nftsInCollection.length;
    
    const derivedListedCount = nftsInCollection.filter(nft => nft.isListed).length;
    
    const uniqueOwnerIds = new Set(nftsInCollection.map(nft => nft.ownerId).filter(id => id !== null));
    const derivedOwnerCount = uniqueOwnerIds.size;

    let topOffer: Prisma.Decimal | null = null;
    nftsInCollection.forEach(nft => {
      if (nft.offers && nft.offers.length > 0) {
        const nftTopOfferPrice = typeof nft.offers[0].price === 'number' ? new Prisma.Decimal(nft.offers[0].price) : nft.offers[0].price; 
        if (nftTopOfferPrice !== null) { 
            if (topOffer === null || nftTopOfferPrice.greaterThan(topOffer)) {
                topOffer = nftTopOfferPrice;
            }
        }
      }
    });
    
    let volume24h = new Prisma.Decimal(0);
    let sales24h = 0;
    nftsInCollection.forEach(nft => {
      nft.trades.forEach(trade => {
        const tradePrice = typeof trade.price === 'number' ? new Prisma.Decimal(trade.price) : trade.price; 
        if (tradePrice !== null) { 
            volume24h = volume24h.plus(tradePrice);
            sales24h++;
        }
      });
    });

    const derivedCreatorName = landListingWithNfts.user?.username || landListingWithNfts.user?.solanaPubKey || landListingWithNfts.user?.email || 'Unknown Creator';
    const processedNftImageUrl = getFileUrl(landListingWithNfts.nftImageFileRef);

    const responseData: LandListingWithStats = {
      ...landListingWithNfts,
      user: landListingWithNfts.user,
      processedNftImageUrl: processedNftImageUrl,
      derivedCreatorName: derivedCreatorName,
      derivedOwnerCount: derivedOwnerCount,
      derivedListedCount: derivedListedCount,
      derivedItemsCount: derivedItemsCount,
      stats: {
        topOffer: topOffer, 
        volume24h: volume24h, 
        sales24h: sales24h,
      },
    };

    console.log(`API GET /api/collections/${landListingId}: Returning LandListing details with calculated stats.`);
    return NextResponse.json(responseData);

  } catch (error) {
    console.error(`API GET /api/collections/${landListingId}: Error:`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error("Prisma Error Code:", error.code);
        console.error("Prisma Error Meta:", error.meta);
    }
    return NextResponse.json({ message: 'Internal Server Error', details: (error as Error).message }, { status: 500 });
  }
}