import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { landListingDbId: string } }
) {
  try {
    const { landListingDbId } = params;
    
    // Define the directory path
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'collections', landListingDbId);
    
    // Check if directory exists
    if (!fs.existsSync(uploadsDir)) {
      return NextResponse.json(
        { error: 'Collection directory not found' },
        { status: 404 }
      );
    }
    
    // Read directory contents
    const files = fs.readdirSync(uploadsDir);
    
    // First, try to find the collection metadata to get the correct UUID
    const collectionMetadataFiles = files.filter(file => 
      file.includes('-collection-metadata-') && file.endsWith(`${landListingDbId}.json`)
    );
    
    let targetUuid: string | null = null;
    
    if (collectionMetadataFiles.length > 0) {
      // Read the most recent collection metadata file (or first one found)
      const collectionMetadataFile = collectionMetadataFiles[0];
      const collectionMetadataPath = path.join(uploadsDir, collectionMetadataFile);
      
      try {
        const collectionContent = fs.readFileSync(collectionMetadataPath, 'utf8');
        const collectionMetadata = JSON.parse(collectionContent);
        
        // Extract UUID from the image URL in collection metadata
        if (collectionMetadata.image) {
          const imageMatch = collectionMetadata.image.match(/([a-f0-9-]{36})-main-token-image-/);
          if (imageMatch) {
            targetUuid = imageMatch[1];
          }
        }
      } catch (error) {
        console.warn('Failed to parse collection metadata:', error);
      }
    }
    
    // Find the main token metadata file
    let mainTokenMetadataFile: string | undefined;
    
    if (targetUuid) {
      // Look for the specific UUID-prefixed file
      mainTokenMetadataFile = files.find(file => 
        file.startsWith(targetUuid) && file.endsWith(`-main-token-metadata-${landListingDbId}.json`)
      );
    }
    
    if (!mainTokenMetadataFile) {
      // Fallback: find any main token metadata file
      mainTokenMetadataFile = files.find(file => 
        file.endsWith(`-main-token-metadata-${landListingDbId}.json`)
      );
    }
    
    if (!mainTokenMetadataFile) {
      return NextResponse.json(
        { error: 'Main token metadata file not found' },
        { status: 404 }
      );
    }
    
    // Read and return the metadata file
    const filePath = path.join(uploadsDir, mainTokenMetadataFile);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const metadata = JSON.parse(fileContent);
    
    return NextResponse.json(metadata, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
    
  } catch (error) {
    console.error('Error serving main token metadata:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 