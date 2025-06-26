#!/usr/bin/env tsx

/**
 * TypeScript script to fetch the 2 earliest listings from the database
 * Usage: npx tsx scripts/get-earliest-listings.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ListingWithUser {
  id: string;
  listing_title: string | null;
  nft_title: string | null;
  property_address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  listing_price: number | null;
  price_currency: string | null;
  status: string;
  created_at: Date;
  updated_at: Date;
  collection_id: string | null;
  token_id: number | null;
  mint_status: string | null;
  users: {
    id: string;
    username: string | null;
    email: string | null;
  };
}

async function getEarliestListings(): Promise<void> {
  try {
    console.log('🔍 Fetching the 2 earliest listings from the database...\n');

    const earliestListings: ListingWithUser[] = await prisma.land_listings.findMany({
      orderBy: {
        created_at: 'asc'
      },
      take: 2,
      select: {
        id: true,
        listing_title: true,
        nft_title: true,
        property_address: true,
        city: true,
        state: true,
        country: true,
        listing_price: true,
        price_currency: true,
        status: true,
        created_at: true,
        updated_at: true,
        collection_id: true,
        token_id: true,
        mint_status: true,
        users: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    if (earliestListings.length === 0) {
      console.log('❌ No listings found in the database.');
      return;
    }

    console.log(`✅ Found ${earliestListings.length} earliest listing(s):\n`);

    earliestListings.forEach((listing, index) => {
      console.log(`📋 Listing #${index + 1}:`);
      console.log(`   ID: ${listing.id}`);
      console.log(`   Title: ${listing.listing_title || listing.nft_title || 'No title'}`);
      console.log(`   Address: ${listing.property_address || 'No address'}`);
      console.log(`   Location: ${[listing.city, listing.state, listing.country].filter(Boolean).join(', ') || 'No location'}`);
      console.log(`   Price: ${listing.listing_price ? `${listing.listing_price} ${listing.price_currency || 'USD'}` : 'No price set'}`);
      console.log(`   Status: ${listing.status}`);
      console.log(`   Mint Status: ${listing.mint_status || 'Not started'}`);
      console.log(`   Collection ID: ${listing.collection_id || 'Not assigned'}`);
      console.log(`   Token ID: ${listing.token_id || 'Not minted'}`);
      console.log(`   Owner: ${listing.users.username || listing.users.email || listing.users.id}`);
      console.log(`   Created: ${listing.created_at.toISOString()}`);
      console.log(`   Updated: ${listing.updated_at.toISOString()}`);
      console.log('');
    });

    // Additional statistics
    const totalListings = await prisma.land_listings.count();
    console.log(`📊 Database Statistics:`);
    console.log(`   Total listings in database: ${totalListings}`);
    
    if (earliestListings.length > 0) {
      const oldestDate = earliestListings[0].created_at;
      const daysSinceOldest = Math.floor((new Date().getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24));
      console.log(`   Oldest listing created: ${daysSinceOldest} days ago`);
    }

  } catch (error) {
    console.error('❌ Error fetching earliest listings:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  getEarliestListings()
    .then(() => {
      console.log('\n✅ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { getEarliestListings };
