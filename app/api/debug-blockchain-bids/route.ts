import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { PlatzLandNFTABI } from '@/contracts/PlatzLandNFTABI';
import { PLATZ_LAND_NFT_ADDRESS } from '@/config/contracts';

const prisma = new PrismaClient();

// Initialize blockchain client
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http()
});

async function getCurrentTokenOwner(tokenId: bigint): Promise<string | null> {
  try {
    const owner = await publicClient.readContract({
      address: PLATZ_LAND_NFT_ADDRESS,
      abi: PlatzLandNFTABI,
      functionName: 'ownerOf',
      args: [tokenId]
    });
    return owner as string;
  } catch (error) {
    console.error(`Error getting owner for token ${tokenId}:`, error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('userAddress') || '0x3ec4bfe3167ba77A5906C034AABE5537BA7c4B07';

    console.log(`[DEBUG_BLOCKCHAIN] Testing with user: ${userAddress}`);

    // Step 1: Get all bids
    const allBids = await prisma.nftBid.findMany({
      where: {
        bidStatus: { in: ['ACTIVE', 'ACCEPTED', 'WITHDRAWN', 'OUTBID'] }
      },
      include: {
        bidder: {
          select: {
            id: true,
            username: true,
            evmAddress: true
          }
        },
        landListing: {
          select: {
            id: true,
            nftTitle: true,
            collectionId: true,
            nftImageFileRef: true
          }
        }
      }
    });

    console.log(`[DEBUG_BLOCKCHAIN] Found ${allBids.length} total bids`);

    // Step 2: Filter valid bids
    console.log(`[DEBUG_BLOCKCHAIN] Filtering bids for valid tokenIds...`);
    allBids.forEach(bid => {
      console.log(`[DEBUG_BLOCKCHAIN] Bid ${bid.id}: tokenId=${bid.tokenId} (type: ${typeof bid.tokenId}), tokenId > 0 = ${bid.tokenId > 0}, valid = ${bid.tokenId && bid.tokenId > 0}`);
    });
    
    const validBids = allBids.filter(bid => bid.tokenId && bid.tokenId > 0);
    console.log(`[DEBUG_BLOCKCHAIN] Found ${validBids.length} bids with valid tokenIds`);

    if (validBids.length > 0) {
      console.log(`[DEBUG_BLOCKCHAIN] Valid bids:`, validBids.map(bid => ({
        id: bid.id,
        tokenId: bid.tokenId,
        collectionId: bid.landListing.collectionId,
        bidAmount: bid.bidAmount,
        bidStatus: bid.bidStatus,
        bidder: bid.bidder.evmAddress
      })));
    }

    // Step 3: Check ownership for each valid bid
    const ownershipResults = [];
    
    for (const bid of validBids) {
      try {
        const currentOwner = await getCurrentTokenOwner(BigInt(bid.tokenId));
        const isUserOwner = currentOwner?.toLowerCase() === userAddress.toLowerCase();
        
        const result = {
          bidId: bid.id,
          tokenId: bid.tokenId,
          collectionId: bid.landListing.collectionId,
          currentOwner,
          isUserOwner,
          bidAmount: bid.bidAmount,
          bidStatus: bid.bidStatus,
          bidder: bid.bidder.evmAddress
        };
        
        ownershipResults.push(result);
        console.log(`[DEBUG_BLOCKCHAIN] Token ${bid.tokenId} in collection ${bid.landListing.collectionId}:`, result);
      } catch (error) {
        console.error(`[DEBUG_BLOCKCHAIN] Error checking ownership for token ${bid.tokenId}:`, error);
      }
    }

    // Step 4: Find bids where user is the token owner
    const userOwnedBids = ownershipResults.filter(result => result.isUserOwner && result.bidStatus === 'ACTIVE');
    
    console.log(`[DEBUG_BLOCKCHAIN] User owns tokens with ${userOwnedBids.length} active bids`);

    return NextResponse.json({
      success: true,
      debug: {
        userAddress,
        totalBids: allBids.length,
        validBids: validBids.length,
        ownershipResults,
        userOwnedActiveBids: userOwnedBids.length,
        userOwnedBids
      }
    });

  } catch (error) {
    console.error('[DEBUG_BLOCKCHAIN] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 