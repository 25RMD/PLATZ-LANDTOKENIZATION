import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import { promises as fsPromises } from 'fs';

/**
 * Image serving API endpoint
 * GET /api/images/[imageRef]
 * 
 * This endpoint serves image files from the uploads directory.
 * It looks for the filename specified in the URL parameter [imageRef]
 * and serves it with the appropriate content type.
 * 
 * If the image is not found, it returns a 404 error.
 */
export async function GET(request: NextRequest) {
  // Extract imageRef from URL path
  const url = new URL(request.url);
  const segments = url.pathname.split('/');
  // Decode the imageRef to handle URL-encoded spaces and special characters
  const imageRef = decodeURIComponent(segments[segments.length - 1]);

  if (!imageRef) {
    return NextResponse.json({ error: 'Image reference is required' }, { status: 400 });
  }

  try {
    // Check if this is an Arweave URL (or any other external URL)
    if (imageRef.startsWith('http://') || imageRef.startsWith('https://') || imageRef.startsWith('ar://')) {
      // For Arweave URLs that might start with ar://, convert to https
      const url = imageRef.startsWith('ar://') 
        ? `https://arweave.net/${imageRef.substring(5)}` 
        : imageRef;
      
      console.log(`Proxying image request to: ${url}`);
      
      try {
        // Fetch the external image
        const response = await fetch(url);
        
        if (!response.ok) {
          console.error(`Failed to fetch image from ${url}: ${response.status} ${response.statusText}`);
          return NextResponse.json({ error: `Failed to fetch image: ${response.statusText}` }, { status: response.status });
        }
        
        const contentType = response.headers.get('Content-Type') || 'application/octet-stream';
        const imageArrayBuffer = await response.arrayBuffer();
        const imageBuffer = Buffer.from(imageArrayBuffer);
        
        return new NextResponse(imageBuffer, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
          },
        });
      } catch (fetchError) {
        console.error(`Error fetching external image: ${fetchError}`);
        return NextResponse.json({ error: 'Error fetching external image' }, { status: 500 });
      }
    }
    
    // Handle local file
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const filePath = path.join(uploadsDir, imageRef);
    
    // Basic security check to prevent path traversal
    if (!filePath.startsWith(uploadsDir)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    if (!fs.existsSync(filePath)) {
      console.error(`Image not found at path: ${filePath}`);
      
      // For development, create a fallback for "placeholder-image-url" requests
      if (imageRef === 'placeholder-image-url') {
        // Try to serve a default placeholder if available
        const defaultPlaceholder = path.join(uploadsDir, 'default-placeholder.png');
        if (fs.existsSync(defaultPlaceholder)) {
          const placeholderBuffer = fs.readFileSync(defaultPlaceholder);
          return new NextResponse(placeholderBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'image/png',
              'Cache-Control': 'public, max-age=86400',
            },
          });
        }
      }
      
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    const imageBuffer = fs.readFileSync(filePath);
    const contentType = mime.lookup(filePath) || 'application/octet-stream';

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json({ 
      error: 'Internal server error serving image',
      details: process.env.NODE_ENV === 'development' ? `${error}` : undefined 
    }, { status: 500 });
  }
}
