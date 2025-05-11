import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Prisma client
const prisma = new PrismaClient();

async function checkNftImageRefs() {
  try {
    console.log('Checking nftImageFileRef values in LandListing records...');

    // Query all land listings that have collectionId (NFT collections)
    const collections = await prisma.landListing.findMany({
      where: {
        collectionId: {
          not: null
        }
      },
      select: {
        id: true,
        nftTitle: true,
        nftImageFileRef: true,
        collectionId: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${collections.length} collection records.`);

    if (collections.length === 0) {
      console.log('No collections found with collectionId. Checking all listings with nftImageFileRef:');
      
      // Try a broader query for any records with nftImageFileRef
      const listings = await prisma.landListing.findMany({
        where: {
          nftImageFileRef: {
            not: null
          }
        },
        select: {
          id: true, 
          nftTitle: true,
          nftImageFileRef: true,
          collectionId: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      console.log(`Found ${listings.length} listings with nftImageFileRef.`);
      
      if (listings.length > 0) {
        console.log('\nListing details:');
        listings.forEach((listing, index) => {
          console.log(`\n[${index + 1}] Listing ID: ${listing.id}`);
          console.log(`  Title: ${listing.nftTitle || '(no title)'}`);
          console.log(`  nftImageFileRef: ${listing.nftImageFileRef || '(null)'}`);
          console.log(`  collectionId: ${listing.collectionId ? listing.collectionId.toString() : '(null)'}`);
          console.log(`  Created: ${listing.createdAt.toISOString()}`);
        });
      }
    } else {
      console.log('\nCollection details:');
      collections.forEach((collection, index) => {
        console.log(`\n[${index + 1}] Collection ID: ${collection.id}`);
        console.log(`  Title: ${collection.nftTitle || '(no title)'}`);
        console.log(`  nftImageFileRef: ${collection.nftImageFileRef || '(null)'}`);
        console.log(`  collectionId: ${collection.collectionId ? collection.collectionId.toString() : '(null)'}`);
        console.log(`  Created: ${collection.createdAt.toISOString()}`);
      });
    }

    // Check for placeholder values
    const placeholderCount = collections.filter(
      c => c.nftImageFileRef === 'placeholder-image-url'
    ).length;
    
    if (placeholderCount > 0) {
      console.log(`\nFound ${placeholderCount} records with 'placeholder-image-url' as nftImageFileRef.`);
    }

    // Check for records with null nftImageFileRef
    const nullCount = collections.filter(c => c.nftImageFileRef === null).length;
    console.log(`Found ${nullCount} records with null nftImageFileRef.`);

    // Check the uploads directory
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      console.log('\nUploads directory does not exist!');
      return;
    }
    
    const files = fs.readdirSync(uploadsDir);
    console.log(`\nFound ${files.length} files in uploads directory:`);
    
    if (files.length > 0) {
      // Check if any collection references match actual files
      const matchingFiles = collections.filter(
        c => c.nftImageFileRef && files.includes(c.nftImageFileRef as string)
      ).length;
      
      console.log(`${matchingFiles} collections reference files that exist in the uploads directory.`);
      
      // List the first 10 files (or all if less than 10)
      console.log('\nSample files in uploads directory:');
      files.slice(0, 10).forEach((file: string) => {
        console.log(`  ${file}`);
      });
      
      if (files.length > 10) {
        console.log(`  ... and ${files.length - 10} more files.`);
      }
    }

  } catch (error) {
    console.error('Error checking nftImageFileRef values:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
checkNftImageRefs().catch(e => {
  console.error(e);
  process.exit(1);
});
