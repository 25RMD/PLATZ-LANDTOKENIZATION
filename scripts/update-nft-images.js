// Script to update NFT collection images
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function updateNFTImages() {
  try {
    // Get all image files from the uploads directory - using proper project root
    const projectRoot = path.resolve(__dirname, '..');
    const uploadsDir = path.join(projectRoot, 'uploads');
    const imageFiles = fs.readdirSync(uploadsDir)
      .filter(file => {
        // Exclude the placeholder file and ensure it's an image
        return file !== 'placeholder-image-url' && 
        (file.endsWith('.jpeg') || file.endsWith('.jpg') || file.endsWith('.png'));
      });

    if (imageFiles.length === 0) {
      console.log('No image files found in uploads directory');
      return;
    }

    // Get all Land Listings (this is the actual model name in the schema)
    const collections = await prisma.landListing.findMany();
    console.log(`Found ${collections.length} NFT collections to update`);

    // Update each collection with a random image
    for (const collection of collections) {
      // Select a random image file
      const randomImage = imageFiles[Math.floor(Math.random() * imageFiles.length)];
      
      // Update the land listing
      await prisma.landListing.update({
        where: { id: collection.id },
        data: {
          nftImageFileRef: randomImage
        }
      });
      
      console.log(`Updated collection ${collection.id} with image ${randomImage}`);
    }

    console.log('Successfully updated all Land Listings with real images');
  } catch (error) {
    console.error('Error updating NFT images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
updateNFTImages()
  .then(() => console.log('Update complete'))
  .catch(e => console.error(e));
