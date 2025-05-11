// Script to update the nftImageFileRef in the database
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Initialize Prisma client
const prisma = new PrismaClient();

async function updateImageRef() {
  try {
    console.log('Updating nftImageFileRef for collection with placeholder value...');

    // Get the collection with placeholder-image-url
    const collection = await prisma.landListing.findFirst({
      where: {
        nftImageFileRef: 'placeholder-image-url'
      },
      select: {
        id: true,
        nftTitle: true,
        nftImageFileRef: true
      }
    });

    if (!collection) {
      console.log('No collections found with placeholder-image-url value.');
      return;
    }

    console.log(`Found collection: ${collection.id} (${collection.nftTitle})`);

    // Get a list of image files from the uploads directory
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const files = fs.readdirSync(uploadsDir).filter(file => 
      file.endsWith('.png') || 
      file.endsWith('.jpg') || 
      file.endsWith('.jpeg') || 
      file.endsWith('.gif')
    );

    if (files.length === 0) {
      console.log('No image files found in uploads directory.');
      return;
    }

    // Choose the first image file
    const newImageRef = files[0];
    console.log(`Updating nftImageFileRef to: ${newImageRef}`);

    // Update the collection
    const updatedCollection = await prisma.landListing.update({
      where: {
        id: collection.id
      },
      data: {
        nftImageFileRef: newImageRef
      }
    });

    console.log('Database updated successfully!');
    console.log(`Collection ${updatedCollection.id} now has nftImageFileRef: ${updatedCollection.nftImageFileRef}`);

  } catch (error) {
    console.error('Error updating nftImageFileRef:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
updateImageRef()
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
