import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import mime from 'mime-types';

// In Next.js App Router, dynamic params are supposed to be awaited
export async function GET(
  request: NextRequest, 
  { params: paramsPromise }: { params: Promise<{ path: string[] }> }
) {
  try {
    const actualParams = await paramsPromise;
    let pathSegments: string[];

    if (actualParams && actualParams.path && Array.isArray(actualParams.path)) {
      pathSegments = actualParams.path;
    } else {
      console.error('Error: actualParams.path is not a valid array or actualParams is undefined. actualParams:', actualParams);
      return new NextResponse('Invalid path structure - path parameter missing or invalid', { status: 400 });
    }

    // Final check to ensure pathSegments is an array before spreading
    if (!Array.isArray(pathSegments)) {
      console.error('Error: path parameter did not resolve to an array:', pathSegments);
      return new NextResponse('Invalid path structure - resolution failed', { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'uploads', ...pathSegments);

    // Security check
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!filePath.startsWith(uploadsDir)) {
      return new NextResponse('Invalid path', { status: 400 });
    }
    
    try {
      await fs.access(filePath);
    } catch {
      return new NextResponse('File not found', { status: 404 });
    }
    
    const fileBuffer = await fs.readFile(filePath);
    const contentType = mime.lookup(filePath) || 'application/octet-stream';
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('Error serving static file:', error);
    if (error instanceof TypeError && error.message.includes('is not iterable')) {
        console.error('Specific error: Problem spreading pathSegments. The paramsPromise received by GET was:', paramsPromise, 'Full error:', error);
         return new NextResponse('Invalid path parameter causing spread error', { status: 400 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 