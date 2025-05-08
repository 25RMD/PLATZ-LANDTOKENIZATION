import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db'; // Use the correct Prisma import
import { Prisma } from '@prisma/client';

// Define types for watchlist items
interface WatchlistItemWithMetrics {
  id: string;
  collectionId: string;
  name: string;
  description: string | null;
  image: string | null;
  price: number | null;
  currency: string;
  items: number;
  creator: string;
  createdAt: string;
  updatedAt: string;
  ownerCount: number;
  listedCount: number;
  nftCount: number;
  addedToWatchlistAt: string;
}

export async function GET(req: NextRequest) {
  try {
    // Get user ID from request headers (set by middleware)
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's watchlist with collection details using raw SQL
    const watchlistItems = await prisma.$queryRaw`
      SELECT 
        w.id, 
        w."collectionId", 
        w."createdAt" as "addedToWatchlistAt",
        l.nft_title as "name", 
        l.nft_description as "description",
        l.nft_image_file_ref as "image", 
        l.listing_price as "price",
        l.price_currency as "currency", 
        l.nft_collection_size as "items",
        l."createdAt", 
        l."updatedAt",
        u.username as "creatorName",
        u.solana_pub_key as "creatorWallet",
        (SELECT COUNT(*) FROM nfts WHERE land_listing_id = l.id) as "nftCount"
      FROM watchlist w
      JOIN land_listings l ON w."collectionId" = l.id
      LEFT JOIN users u ON l."userId" = u.id
      WHERE w."userId" = ${userId}
      ORDER BY w."createdAt" DESC
    `;

    // Transform the raw data to match the expected format
    const formattedItems: WatchlistItemWithMetrics[] = (watchlistItems as any[]).map(item => ({
      id: item.id,
      collectionId: item.collectionId,
      name: item.name || 'Untitled Collection',
      description: item.description,
      image: item.image,
      price: item.price ? parseFloat(item.price) : null,
      currency: item.currency || 'SOL',
      items: item.items || 0,
      creator: item.creatorName || (item.creatorWallet ? item.creatorWallet.substring(0, 6) : 'Unknown'),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      ownerCount: 0, // This would need additional calculation
      listedCount: 0, // This would need additional calculation
      nftCount: parseInt(item.nftCount) || 0,
      addedToWatchlistAt: item.addedToWatchlistAt,
    }));

    return NextResponse.json({
      success: true,
      data: formattedItems,
    });
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch watchlist' },
      { status: 500 }
    );
  }
}
