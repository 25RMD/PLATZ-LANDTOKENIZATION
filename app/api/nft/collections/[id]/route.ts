import { NextRequest, NextResponse } from 'next/server';
import { getCollectionById } from '../route';

/**
 * GET /api/nft/collections/[id]
 * 
 * Retrieves a specific NFT collection by ID
 * 
 * Path parameters:
 * - id: Collection ID
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: Collection
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Extract collection ID from URL path
    const url = new URL(request.url);
    const segments = url.pathname.split('/');
    const id = segments[segments.length - 1];
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Collection ID is required' },
        { status: 400 }
      );
    }

    const result = await getCollectionById(id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: result.status || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error: any) {
    console.error('Error fetching NFT collection:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while fetching NFT collection', 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
