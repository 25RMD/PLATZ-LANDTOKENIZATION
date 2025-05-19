import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * Metadata serving API endpoint
 * GET /api/metadata/[metadataRef]
 * 
 * This endpoint serves metadata JSON files from the local uploads/metadata directory.
 * It looks for the filename specified in the URL parameter [metadataRef]
 * and serves it with the appropriate content type.
 * 
 * If the metadata file is not found, it returns a 404 error.
 */
export async function GET(request: NextRequest) {
  // Extract metadataRef from URL path
  const url = new URL(request.url);
  const segments = url.pathname.split('/');
  // Decode the metadataRef to handle URL-encoded spaces and special characters
  const metadataRef = decodeURIComponent(segments[segments.length - 1]);

  if (!metadataRef) {
    return NextResponse.json({ error: 'Metadata reference is required' }, { status: 400 });
  }

  try {
    // Handle local file
    const metadataDir = path.join(process.cwd(), 'uploads', 'metadata');
    const filePath = path.join(metadataDir, metadataRef);
    
    // Basic security check to prevent path traversal
    if (!filePath.startsWith(metadataDir)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    if (!fs.existsSync(filePath)) {
      console.error(`Metadata file not found at path: ${filePath}`);
      return NextResponse.json({ error: 'Metadata file not found' }, { status: 404 });
    }

    // Read the metadata file
    const metadataContent = fs.readFileSync(filePath, 'utf-8');
    
    try {
      // Parse and return the JSON data
      const jsonData = JSON.parse(metadataContent);
      
      return NextResponse.json(jsonData, {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        },
      });
    } catch (parseError) {
      console.error('Error parsing metadata JSON:', parseError);
      return NextResponse.json({ error: 'Invalid metadata format' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error serving metadata:', error);
    return NextResponse.json({ 
      error: 'Internal server error serving metadata',
      details: process.env.NODE_ENV === 'development' ? `${error}` : undefined 
    }, { status: 500 });
  }
} 