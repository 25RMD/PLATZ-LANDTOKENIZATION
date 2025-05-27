import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { LandListing as PrismaLandListing, User as PrismaUser, NFT as PrismaNftEntity, Offer as PrismaOffer, Trade as PrismaTrade, Prisma } from '@prisma/client'; // Aliased to avoid naming conflicts 
import { Decimal } from '@prisma/client/runtime/library'; 

// This interface describes the final shape of the LandListing object sent in the response,
// including processed data and calculated stats.
interface LandListingWithStats extends PrismaLandListing { // Start with the base Prisma type
  // Relations will be typed based on what's included in the Prisma query
  user: PrismaUser | null; // Explicitly type the user relation
  nfts: ProcessedNft[]; // nfts will be an array of our ProcessedNft type
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

// This interface describes an individual NFT *after* its image URL is processed by getFileUrl
// and it's part of the LandListingWithStats response.
interface ProcessedNft {
  // Fields from PrismaNftEntity
  id: string;
  name: string;
  itemNumber: number;
  image: string | null; // <<< This is the key change: processed URL from getFileUrl
  price: number | null; // Changed from Decimal | null to number | null to match Prisma Float
  isListed: boolean;
  ownerId: string | null;
  landListingId: string | null;
  createdAt: Date;
  updatedAt: Date;
  propertyId: string | null;

  // Relations, explicitly typed
  owner: PrismaUser | null;
  offers: PrismaOffer[];
  trades: PrismaTrade[];
  // Note: Add any other fields from PrismaNftEntity that are used by NFTCard or elsewhere
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
  { params }: { params: Promise<{ collectionId: string }> }
) {
  const resolvedParams = await params;
  const landListingId = resolvedParams.collectionId;

  if (!landListingId) {
    return NextResponse.json({ message: 'LandListing ID is required' }, { status: 400 });
  }

  try {
    console.log(`API GET /api/collections/${landListingId}: Fetching LandListing and associated NFT data...`);

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const landListingArgs = {
      where: {
        id: landListingId,
      },
      include: {
        user: true,
        nfts: {
          include: {
            owner: true,
            offers: {
              where: { status: 'ACTIVE' as const }, // Add 'as const' for literal type
              orderBy: { price: 'desc' as const },
            },
            trades: {
              where: { timestamp: { gte: twentyFourHoursAgo } },
            },
          },
        },
      },
    } satisfies Prisma.LandListingFindUniqueArgs;

    const landListingWithNfts: Prisma.LandListingGetPayload<typeof landListingArgs> | null = await prisma.landListing.findUnique(landListingArgs);

    // Type for an NFT as included from the database, before image processing
    // This helps type the 'nft' parameter in the map function below.
    // Ensure landListingWithNfts is not null before trying to access its properties for type derivation.
    // Using the dynamic approach based on landListingArgs for robustness.
    type IncludedNft = NonNullable<Prisma.LandListingGetPayload<typeof landListingArgs>['nfts']>[number];

      // Additional check to ensure landListingWithNfts is not null before proceeding
      if (!landListingWithNfts) {
        console.error(`API GET /api/collections/${landListingId}: LandListing not found after Prisma query.`);
        return NextResponse.json({ message: 'LandListing not found' }, { status: 404 });
      }

      // Check if user exists on landListingWithNfts before accessing its properties
      const creator = landListingWithNfts.user;

    const processedAndTypedNfts: ProcessedNft[] = (landListingWithNfts.nfts || []).map((nft: IncludedNft) => {
      const processedNft: ProcessedNft = {
        // Spread all properties from the original nft (IncludedNft)
        ...nft,
        // Override the image with the processed URL
        image: getFileUrl(nft.image),
        // Ensure price is Decimal or null. Prisma's Decimal type should be fine.
        price: nft.price,
        // Ensure relations are correctly passed if they are part of IncludedNft
        owner: nft.owner,
        offers: nft.offers,
        trades: nft.trades,
      };
      return processedNft;
    });

    const nftsInCollection = processedAndTypedNfts;
    
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

    const derivedCreatorName = landListingWithNfts.user?.username || landListingWithNfts.user?.email || 'Unknown Creator'; // Removed solanaPubKey
    const processedNftImageUrl = getFileUrl(landListingWithNfts.nftImageFileRef);

    const responseData: LandListingWithStats = {
      // Spread all properties from landListingWithNfts (which is PrismaLandListing with relations)
      // Ensure that the types are compatible or cast appropriately.
      ...(landListingWithNfts as Omit<PrismaLandListing, 'nfts' | 'user'> & { user: PrismaUser | null }), // Corrected Omit key
      nfts: nftsInCollection, // Use the processed NFTs
      user: landListingWithNfts.user, // Explicitly include the user from the fetched data
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