#!/usr/bin/env tsx

/**
 * Script to delete the 2 earliest listings that are visible on the explore page
 * These are listings with collection_id and completed mint status
 * Usage: npx tsx scripts/delete-earliest-visible-listings.ts
 */

import { PrismaClient } from '@prisma/client';
import readline from 'readline';

const prisma = new PrismaClient();

interface VisibleListing {
  id: string;
  collection_id: string | null;
  nft_title: string | null;
  listing_title: string | null;
  mint_status: string | null;
  created_at: Date;
  users: {
    username: string | null;
    email: string | null;
  };
}

async function getEarliestVisibleListings(): Promise<VisibleListing[]> {
  return await prisma.land_listings.findMany({
    where: {
      AND: [
        { collection_id: { not: null } },
        { 
          OR: [
            { mint_status: 'COMPLETED' },
            { mint_status: 'COMPLETED_COLLECTION' },
            { mint_status: 'SUCCESS' } // Legacy status
          ]
        }
      ]
    },
    orderBy: {
      created_at: 'asc'
    },
    take: 2,
    select: {
      id: true,
      collection_id: true,
      nft_title: true,
      listing_title: true,
      mint_status: true,
      created_at: true,
      users: {
        select: {
          username: true,
          email: true
        }
      }
    }
  });
}

function askQuestion(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function deleteEarliestVisibleListings(): Promise<void> {
  try {
    console.log('🔍 Finding the 2 earliest listings visible on explore page...\n');

    const earliestListings = await getEarliestVisibleListings();

    if (earliestListings.length === 0) {
      console.log('❌ No visible listings found on explore page.');
      return;
    }

    console.log(`✅ Found ${earliestListings.length} earliest visible listing(s):\n`);

    earliestListings.forEach((listing, index) => {
      console.log(`📋 Listing #${index + 1}:`);
      console.log(`   ID: ${listing.id}`);
      console.log(`   Collection ID: ${listing.collection_id}`);
      console.log(`   Title: ${listing.nft_title || listing.listing_title || 'No title'}`);
      console.log(`   Mint Status: ${listing.mint_status}`);
      console.log(`   Owner: ${listing.users.username || listing.users.email || 'Unknown'}`);
      console.log(`   Created: ${listing.created_at.toISOString()}`);
      console.log('');
    });

    // Get total count before deletion
    const totalVisibleListings = await prisma.land_listings.count({
      where: {
        AND: [
          { collection_id: { not: null } },
          { 
            OR: [
              { mint_status: 'COMPLETED' },
              { mint_status: 'COMPLETED_COLLECTION' },
              { mint_status: 'SUCCESS' }
            ]
          }
        ]
      }
    });

    console.log(`📊 Current visible listings on explore page: ${totalVisibleListings}`);
    console.log(`🗑️  About to delete ${earliestListings.length} listing(s)\n`);

    // Confirmation prompt
    const confirmation = await askQuestion('⚠️  Are you sure you want to DELETE these listings? This action cannot be undone. Type "DELETE" to confirm: ');

    if (confirmation !== 'DELETE') {
      console.log('❌ Deletion cancelled. No changes made.');
      return;
    }

    console.log('\n🗑️  Deleting listings...\n');

    // Delete each listing
    for (const listing of earliestListings) {
      try {
        console.log(`Deleting listing: ${listing.nft_title || listing.listing_title || listing.id}`);
        
        await prisma.land_listings.delete({
          where: {
            id: listing.id
          }
        });

        console.log(`✅ Successfully deleted listing ${listing.id}`);
      } catch (error) {
        console.error(`❌ Failed to delete listing ${listing.id}:`, error);
      }
    }

    // Verify deletion
    const remainingVisibleListings = await prisma.land_listings.count({
      where: {
        AND: [
          { collection_id: { not: null } },
          { 
            OR: [
              { mint_status: 'COMPLETED' },
              { mint_status: 'COMPLETED_COLLECTION' },
              { mint_status: 'SUCCESS' }
            ]
          }
        ]
      }
    });

    console.log(`\n📊 Final Statistics:`);
    console.log(`   Visible listings before deletion: ${totalVisibleListings}`);
    console.log(`   Visible listings after deletion: ${remainingVisibleListings}`);
    console.log(`   Listings deleted: ${totalVisibleListings - remainingVisibleListings}`);

  } catch (error) {
    console.error('❌ Error during deletion process:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  deleteEarliestVisibleListings()
    .then(() => {
      console.log('\n✅ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { deleteEarliestVisibleListings };
