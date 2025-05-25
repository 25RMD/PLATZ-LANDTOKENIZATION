import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { LandListing } from '@prisma/client';

interface ChildTokenMetadata {
  name: string;
  description: string;
  image: string;
  attributes: {
    trait_type: string;
    value: string | number;
  }[];
  external_url: string;
}

export async function GET(
  _request: NextRequest, // Add NextRequest as the first parameter
  { params: paramsPromise }: { params: Promise<{ landListingDbId: string; evmTokenId: string }> }
) {
  const actualParams = await paramsPromise;

  if (!actualParams) {
    console.error('[API Child Token Metadata] Error: actualParams is undefined after awaiting paramsPromise. paramsPromise was:', paramsPromise);
    const response = NextResponse.json({ error: 'Failed to resolve route parameters' }, { status: 500 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  }

  const { landListingDbId, evmTokenId: rawEvmTokenId } = actualParams;
  let evmTokenId = rawEvmTokenId;
  if (evmTokenId.endsWith('.json')) {
    evmTokenId = evmTokenId.slice(0, -5); // Remove '.json'
  }

  if (!landListingDbId || !evmTokenId) {
    const response = NextResponse.json({ error: 'Missing landListingDbId or evmTokenId' }, { status: 400 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  }

  console.log(`[API Child Token Metadata] Request for LandListing DB ID: ${landListingDbId}, EVM Token ID: ${evmTokenId}`);

  try {
    const landListing = await prisma.landListing.findUnique({
      where: { id: landListingDbId },
    });

    if (!landListing) {
      console.warn(`[API Child Token Metadata] LandListing not found for DB ID: ${landListingDbId}`);
      const response = NextResponse.json({ error: 'Collection not found' }, { status: 404 });
      response.headers.set('Access-Control-Allow-Origin', '*');
      return response;
    }

    // Handle cases where mainTokenId or nftCollectionSize is missing
    if (!landListing.mainTokenId || landListing.nftCollectionSize === null || landListing.nftCollectionSize === undefined) {
      console.warn(`[API Child Token Metadata] LandListing ${landListingDbId} is missing mainTokenId or nftCollectionSize.`, {
        id: landListing.id,
        mainTokenId: landListing.mainTokenId,
        nftCollectionSize: landListing.nftCollectionSize,
        collectionId: landListing.collectionId,
        status: landListing.status,
        mintStatus: landListing.mintStatus,
        updatedAt: landListing.updatedAt
      });
      
      // Check if this is a valid token ID based on the collection size (if available)
      const maxTokenId = landListing.nftCollectionSize ? 
        landListing.nftCollectionSize - 1 : // 0-based indexing
        99; // Default max if collection size is not set
      
      // Parse the token ID safely
      let tokenIdNum;
      try {
        tokenIdNum = parseInt(evmTokenId, 10);
        if (isNaN(tokenIdNum)) {
          throw new Error(`Invalid token ID: ${evmTokenId}`);
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[API Child Token Metadata] Invalid token ID format: ${evmTokenId}`, error);
        const response = NextResponse.json({ 
          error: 'Invalid token ID format',
          details: errorMessage 
        }, { status: 400 });
        response.headers.set('Access-Control-Allow-Origin', '*');
        return response;
      }
      
      // Validate token ID is within reasonable bounds
      if (tokenIdNum < 0 || tokenIdNum > maxTokenId) {
        const response = NextResponse.json({ 
          error: 'Token ID out of range',
          maxTokenId: maxTokenId
        }, { status: 400 });
        response.headers.set('Access-Control-Allow-Origin', '*');
        return response;
      }
      
              // Return a placeholder metadata response
        const response = NextResponse.json({
        name: landListing.collectionNftTitle ? 
          `${landListing.collectionNftTitle} #${tokenIdNum}` : 
          `Land Token #${tokenIdNum}`,
        description: landListing.nftDescription || 
          'This token is part of a land collection on Platz Protocol.',
        image: (() => {
          // Try to find the main token image file in the collection directory first
          try {
            const fs = require('fs');
            const path = require('path');
            const collectionsDir = path.join(process.cwd(), 'public', 'uploads', 'collections', landListingDbId);
            
            if (fs.existsSync(collectionsDir)) {
              const files = fs.readdirSync(collectionsDir);
              // Look for main token image file (contains 'main-token-image' in the filename)
              const mainImageFile = files.find((file: string) => 
                file.includes('main-token-image') && 
                (file.endsWith('.jpeg') || file.endsWith('.jpg') || file.endsWith('.png'))
              );
              
              if (mainImageFile) {
                                 const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
                 return `${baseUrl}/api/static/collections/${landListingDbId}/${mainImageFile}`;
              }
            }
          } catch (error) {
            console.error(`[API Child Token Metadata] Error reading collection directory for placeholder:`, error);
          }
          
          // Fallback to database coverImageUrl with URL rewriting
          if (landListing.coverImageUrl) {
            let imageUrl = landListing.coverImageUrl;
            // Convert /uploads/ to /api/static/ for consistency
            if (imageUrl.startsWith('/uploads/')) {
              imageUrl = imageUrl.replace('/uploads/', '/api/static/');
            }
            // If the image URL contains ngrok, rewrite it to use local API route
            if (imageUrl.includes('ngrok-free.app')) {
              try {
                const oldUrl = new URL(imageUrl);
                // Extract the path after /uploads/ or /api/static/
                const pathMatch = oldUrl.pathname.match(/\/(?:uploads|api\/static)\/(.+)/);
                if (pathMatch) {
                  imageUrl = `/api/static/${pathMatch[1]}`;
                }
              } catch (e: any) {
                console.error(`[API Child Token Metadata] Error rewriting ngrok image URL ${imageUrl}:`, e.message);
                // Keep original URL if rewrite fails
              }
            }
            const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
            return imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
          }
          
          // Final fallback
          const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : (process.env.NEXT_PUBLIC_BASE_URL || 'https://platzprotocol.xyz');
          return `${baseUrl}/placeholder-land.jpg`;
        })(),
        external_url: `${process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : (process.env.NEXT_PUBLIC_BASE_URL || 'https://platzprotocol.xyz')}/explore/${landListingDbId}`,
        attributes: [
          { trait_type: 'Status', value: landListing.status || 'Processing' },
          { trait_type: 'Token ID', value: tokenIdNum.toString() },
          { trait_type: 'Collection', value: landListing.collectionNftTitle || 'Land Collection' },
          { trait_type: 'Location', value: [
            landListing.city,
            landListing.state,
            landListing.country
          ].filter(Boolean).join(', ') || 'Unknown' }
                  ].filter(attr => attr.value !== undefined)
        });
        response.headers.set('Access-Control-Allow-Origin', '*');
        return response;
    }

    const requestedEvmTokenIdNum = BigInt(evmTokenId); // Now evmTokenId is just the number
    const dbMainTokenIdNum = BigInt(landListing.mainTokenId);
    const dbCollectionSize = BigInt(landListing.nftCollectionSize);

    // Check if the requested ID is the main token ID
    if (requestedEvmTokenIdNum === dbMainTokenIdNum) {
      console.warn(`[API Child Token Metadata] Requested EVM token ID ${evmTokenId} is the mainTokenId for LandListing DB ID: ${landListingDbId}. This endpoint is for child tokens.`);
      const response = NextResponse.json({ error: 'This endpoint is for child token metadata. Main token has a separate metadata URL.' }, { status: 400 });
      response.headers.set('Access-Control-Allow-Origin', '*');
      return response;
    }

    // Validate if the token ID is a valid child token for this collection
    // Child tokens are mainTokenId + 1 to mainTokenId + nftCollectionSize - 1
    // So, evmTokenId must be > mainTokenId AND <= mainTokenId + (nftCollectionSize - 1)
    // Note: nftCollectionSize includes the main token. So, number of child tokens is nftCollectionSize - 1.
    // The last child token ID is mainTokenId + (nftCollectionSize - 1).
    if (
      requestedEvmTokenIdNum <= dbMainTokenIdNum || // Must be greater than mainTokenId
      requestedEvmTokenIdNum > dbMainTokenIdNum + dbCollectionSize - BigInt(1) // Must be within the range of child tokens
    ) {
      console.warn(`[API Child Token Metadata] Requested EVM token ID ${evmTokenId} is not a valid child token for LandListing DB ID: ${landListingDbId}. MainTokenID: ${dbMainTokenIdNum}, CollectionSize: ${dbCollectionSize}`);
      const response = NextResponse.json({ error: 'Token ID not valid for this collection' }, { status: 404 });
      response.headers.set('Access-Control-Allow-Origin', '*');
      return response;
    }
    
    // Use localhost for development to avoid ngrok URL issues
    const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
    
    // Handle image URL construction with proper API route
    let collectionImage = `${baseUrl}/placeholder-image.png`;
    
    // For collections, try to find the main token image file in the collection directory
    // This is more reliable than using the database coverImageUrl which may contain ngrok URLs
    try {
      const fs = require('fs');
      const path = require('path');
      const collectionsDir = path.join(process.cwd(), 'public', 'uploads', 'collections', landListingDbId);
      
      if (fs.existsSync(collectionsDir)) {
        const files = fs.readdirSync(collectionsDir);
        // Look for main token image file (contains 'main-token-image' in the filename)
        const mainImageFile = files.find((file: string) => 
          file.includes('main-token-image') && 
          (file.endsWith('.jpeg') || file.endsWith('.jpg') || file.endsWith('.png'))
        );
        
        if (mainImageFile) {
          collectionImage = `${baseUrl}/api/static/collections/${landListingDbId}/${mainImageFile}`;
          console.log(`[API Child Token Metadata] Found main token image: ${mainImageFile}`);
        } else {
          console.warn(`[API Child Token Metadata] No main token image found in ${collectionsDir}`);
          // Fallback to database coverImageUrl with URL rewriting
          if (landListing.coverImageUrl) {
            let imageUrl = landListing.coverImageUrl;
            
            // If the image URL starts with /uploads/, convert it to /api/static/
            if (imageUrl.startsWith('/uploads/')) {
              imageUrl = imageUrl.replace('/uploads/', '/api/static/');
            }
            
            // If the image URL contains ngrok, rewrite it to use local API route
            if (imageUrl.includes('ngrok-free.app')) {
              try {
                const oldUrl = new URL(imageUrl);
                // Extract the path after /uploads/ or /api/static/
                const pathMatch = oldUrl.pathname.match(/\/(?:uploads|api\/static)\/(.+)/);
                if (pathMatch) {
                  imageUrl = `/api/static/${pathMatch[1]}`;
                }
              } catch (e: any) {
                console.error(`[API Child Token Metadata] Error rewriting ngrok image URL ${imageUrl}:`, e.message);
                // Keep original URL if rewrite fails
              }
            }
            
            // Construct the full URL
            if (imageUrl.startsWith('http')) {
              collectionImage = imageUrl;
            } else {
              collectionImage = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
            }
          }
        }
      } else {
        console.warn(`[API Child Token Metadata] Collection directory not found: ${collectionsDir}`);
      }
    } catch (error) {
      console.error(`[API Child Token Metadata] Error reading collection directory:`, error);
      // Fallback to database coverImageUrl with URL rewriting
      if (landListing.coverImageUrl) {
        let imageUrl = landListing.coverImageUrl;
        
        // If the image URL starts with /uploads/, convert it to /api/static/
        if (imageUrl.startsWith('/uploads/')) {
          imageUrl = imageUrl.replace('/uploads/', '/api/static/');
        }
        
        // If the image URL contains ngrok, rewrite it to use local API route
        if (imageUrl.includes('ngrok-free.app')) {
          try {
            const oldUrl = new URL(imageUrl);
            // Extract the path after /uploads/ or /api/static/
            const pathMatch = oldUrl.pathname.match(/\/(?:uploads|api\/static)\/(.+)/);
            if (pathMatch) {
              imageUrl = `/api/static/${pathMatch[1]}`;
            }
          } catch (e: any) {
            console.error(`[API Child Token Metadata] Error rewriting ngrok image URL ${imageUrl}:`, e.message);
            // Keep original URL if rewrite fails
          }
        }
        
        // Construct the full URL
        if (imageUrl.startsWith('http')) {
          collectionImage = imageUrl;
        } else {
          collectionImage = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
        }
      }
    }

    const metadata: ChildTokenMetadata = {
      name: `Platz Child Token #${evmTokenId} for ${landListing.collectionNftTitle || 'Land Collection'}`,
      description: landListing.nftDescription || `A child token representing a share of ${landListing.collectionNftTitle || 'a Platz Land Collection'}.`,
      image: collectionImage,
      attributes: [
        { trait_type: 'Token Type', value: 'Child Token' },
        { trait_type: 'Parent Collection ID (Contract)', value: landListing.collectionId || 'N/A' },
        { trait_type: 'Parent LandListing ID (DB)', value: landListingDbId },
        { trait_type: 'On-Chain Token ID', value: evmTokenId },
        { trait_type: 'Parcel Number', value: landListing.parcelNumber || 'N/A' },
        { trait_type: 'Country', value: landListing.country || 'N/A' },
        { trait_type: 'State/Province', value: landListing.state || 'N/A' },
      ],
      external_url: `${process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : (process.env.NEXT_PUBLIC_BASE_URL || 'https://platzprotocol.xyz')}/explore/${landListingDbId}`, // Link to the main listing/collection page
    };

    console.log(`[API Child Token Metadata] Successfully generated metadata for LandListing DB ID: ${landListingDbId}, EVM Token ID: ${evmTokenId}`);
    
    const response = NextResponse.json(metadata);
    
    // Add CORS headers for cross-origin requests
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    return response;

  } catch (error) {
    console.error(`[API Child Token Metadata] Error processing request for LandListing DB ID: ${landListingDbId}, EVM Token ID: ${evmTokenId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const response = NextResponse.json({ error: 'Failed to generate token metadata', details: errorMessage }, { status: 500 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  }
}

// Handle CORS preflight requests
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

// Ensure BigInt serialization for JSON (though NextResponse.json might handle it)
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
}; 