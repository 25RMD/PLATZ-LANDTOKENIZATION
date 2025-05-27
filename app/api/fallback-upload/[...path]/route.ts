import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Properly await the params
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    console.log(`[404] Upload not found: ${path}`);
    return new NextResponse(null, { status: 404 });
  } catch (error) {
    console.error('Error in fallback upload handler:', error);
    return new NextResponse(null, { status: 500 });
  }
}
