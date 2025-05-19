import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from '@/lib/auth/jwt';
import prisma from '@/lib/db';
import {
  getListingDetails,
  createListing,
  buyListing,
  cancelListing,
  placeBid,
  acceptBid,
  getListingBids
} from '@/lib/ethereum/contractUtils';

/**
 * POST /api/marketplace/create-listing
 * 
 * Creates a new listing in the marketplace
 * 
 * Request body:
 * {
 *  tokenId: number,
 *  price: string,
 *  currency: string,
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Get the action from the URL
    const url = new URL(request.url);
    const action = url.pathname.split('/').pop();

    if (!action) {
      return NextResponse.json({
        success: false,
        message: 'No action specified'
      }, { status: 400 });
    }

    // Verify authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }

    const verifiedToken = await verifyJwtToken(token);
    if (!verifiedToken) {
      return NextResponse.json({
        success: false,
        message: 'Invalid authentication token'
      }, { status: 401 });
    }

    const userId = verifiedToken.id;
    const body = await request.json();

    // Router for different marketplace actions
    switch (action) {
      case 'create-listing':
        return handleCreateListing(body, userId);
      case 'buy-listing':
        return handleBuyListing(body, userId);
      case 'cancel-listing':
        return handleCancelListing(body, userId);
      case 'place-bid':
        return handlePlaceBid(body, userId);
      case 'accept-bid':
        return handleAcceptBid(body, userId);
      case 'get-bids':
        return handleGetBids(body);
      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid action'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in marketplace API:', error);
    return NextResponse.json({
      success: false,
      message: 'An error occurred',
      error: (error as Error).message
    }, { status: 500 });
  }
}

// Handle create listing request
async function handleCreateListing(body: any, userId: string) {
  const { tokenId, price, currency } = body;

  if (!tokenId || !price || !currency) {
    return NextResponse.json({
      success: false,
      message: 'Missing required fields: tokenId, price, or currency'
    }, { status: 400 });
  }

  try {
    // Verify user owns the token (check in your NFT contract or database)
    const landListing = await prisma.landListing.findFirst({
      where: {
        tokenId: tokenId,
        userId: userId
      }
    });

    if (!landListing) {
      return NextResponse.json({
        success: false,
        message: 'You do not own this token or it does not exist'
      }, { status: 403 });
    }

    // Create listing in the marketplace
    const result = await createListing(tokenId, price, currency);

    // Update the land listing with the marketplace listing ID
    await prisma.landListing.update({
      where: { id: landListing.id },
      data: {
        marketplaceListingId: result.listingId,
        listingPrice: parseFloat(price),
        priceCurrency: currency,
        status: 'LISTED'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Listing created successfully',
      data: {
        listingId: result.listingId,
        transactionHash: result.transactionHash
      }
    });
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create listing',
      error: (error as Error).message
    }, { status: 500 });
  }
}

// Handle buy listing request
async function handleBuyListing(body: any, userId: string) {
  const { listingId, value } = body;

  if (!listingId || !value) {
    return NextResponse.json({
      success: false,
      message: 'Missing required fields: listingId or value'
    }, { status: 400 });
  }

  try {
    // Get user wallet address
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { walletAddress: true }
    });

    if (!user?.walletAddress) {
      return NextResponse.json({
        success: false,
        message: 'User wallet address not found'
      }, { status: 400 });
    }

    // Buy the listing
    const result = await buyListing(listingId, user.walletAddress, value);

    // Find the land listing that has this marketplace listing ID
    const landListing = await prisma.landListing.findFirst({
      where: { marketplaceListingId: listingId }
    });

    if (landListing) {
      // Update the land listing with the new owner
      await prisma.landListing.update({
        where: { id: landListing.id },
        data: {
          userId: userId,
          marketplaceListingId: null, // Remove listing ID as it's now sold
          status: 'OWNED'
        }
      });

      // Create a transaction record
      await prisma.nftTransaction.create({
        data: {
          landListingId: landListing.id,
          tokenId: landListing.tokenId!,
          fromAddress: landListing.user?.walletAddress || '', // Previous owner
          toAddress: user.walletAddress,
          price: parseFloat(value),
          transactionHash: result.transactionHash,
          transactionType: 'PURCHASE'
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Listing purchased successfully',
      data: {
        transactionHash: result.transactionHash
      }
    });
  } catch (error) {
    console.error('Error buying listing:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to buy listing',
      error: (error as Error).message
    }, { status: 500 });
  }
}

// Handle cancel listing request
async function handleCancelListing(body: any, userId: string) {
  const { listingId } = body;

  if (!listingId) {
    return NextResponse.json({
      success: false,
      message: 'Missing required field: listingId'
    }, { status: 400 });
  }

  try {
    // Verify user owns the listing
    const landListing = await prisma.landListing.findFirst({
      where: {
        marketplaceListingId: listingId,
        userId: userId
      }
    });

    if (!landListing) {
      return NextResponse.json({
        success: false,
        message: 'You do not own this listing or it does not exist'
      }, { status: 403 });
    }

    // Cancel the listing
    const result = await cancelListing(listingId);

    // Update the land listing
    await prisma.landListing.update({
      where: { id: landListing.id },
      data: {
        marketplaceListingId: null,
        status: 'OWNED'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Listing canceled successfully',
      data: {
        transactionHash: result.transactionHash
      }
    });
  } catch (error) {
    console.error('Error canceling listing:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to cancel listing',
      error: (error as Error).message
    }, { status: 500 });
  }
}

// Handle place bid request
async function handlePlaceBid(body: any, userId: string) {
  const { listingId, bidAmount } = body;

  if (!listingId || !bidAmount) {
    return NextResponse.json({
      success: false,
      message: 'Missing required fields: listingId or bidAmount'
    }, { status: 400 });
  }

  try {
    // Get user wallet address
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { walletAddress: true }
    });

    if (!user?.walletAddress) {
      return NextResponse.json({
        success: false,
        message: 'User wallet address not found'
      }, { status: 400 });
    }

    // Place the bid
    const result = await placeBid(listingId, bidAmount);

    // Create a bid record
    const landListing = await prisma.landListing.findFirst({
      where: { marketplaceListingId: listingId }
    });

    if (landListing) {
      await prisma.nftBid.create({
        data: {
          landListingId: landListing.id,
          bidderUserId: userId,
          bidAmount: parseFloat(bidAmount),
          bidStatus: 'ACTIVE',
          transactionHash: result.transactionHash
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Bid placed successfully',
      data: {
        transactionHash: result.transactionHash
      }
    });
  } catch (error) {
    console.error('Error placing bid:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to place bid',
      error: (error as Error).message
    }, { status: 500 });
  }
}

// Handle accept bid request
async function handleAcceptBid(body: any, userId: string) {
  const { listingId, bidderAddress } = body;

  if (!listingId || !bidderAddress) {
    return NextResponse.json({
      success: false,
      message: 'Missing required fields: listingId or bidderAddress'
    }, { status: 400 });
  }

  try {
    // Verify user owns the listing
    const landListing = await prisma.landListing.findFirst({
      where: {
        marketplaceListingId: listingId,
        userId: userId
      }
    });

    if (!landListing) {
      return NextResponse.json({
        success: false,
        message: 'You do not own this listing or it does not exist'
      }, { status: 403 });
    }

    // Accept the bid
    const result = await acceptBid(listingId, bidderAddress);

    // Find the bidder user
    const bidder = await prisma.user.findFirst({
      where: { walletAddress: bidderAddress }
    });

    if (!bidder) {
      return NextResponse.json({
        success: false,
        message: 'Bidder user not found'
      }, { status: 400 });
    }

    // Update the land listing with the new owner
    await prisma.landListing.update({
      where: { id: landListing.id },
      data: {
        userId: bidder.id,
        marketplaceListingId: null, // Remove listing ID as it's now sold
        status: 'OWNED'
      }
    });

    // Update the bid status
    await prisma.nftBid.updateMany({
      where: {
        landListingId: landListing.id,
        bidderUserId: bidder.id,
        bidStatus: 'ACTIVE'
      },
      data: {
        bidStatus: 'ACCEPTED'
      }
    });

    // Cancel other bids
    await prisma.nftBid.updateMany({
      where: {
        landListingId: landListing.id,
        bidderUserId: { not: bidder.id },
        bidStatus: 'ACTIVE'
      },
      data: {
        bidStatus: 'CANCELLED'
      }
    });

    // Find the bid amount 
    const bid = await prisma.nftBid.findFirst({
      where: {
        landListingId: landListing.id,
        bidderUserId: bidder.id,
        bidStatus: 'ACCEPTED'
      }
    });

    // Create a transaction record
    await prisma.nftTransaction.create({
      data: {
        landListingId: landListing.id,
        tokenId: landListing.tokenId!,
        fromAddress: landListing.user?.walletAddress || '', // Previous owner
        toAddress: bidderAddress,
        price: bid?.bidAmount || 0,
        transactionHash: result.transactionHash,
        transactionType: 'BID_ACCEPT'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Bid accepted successfully',
      data: {
        transactionHash: result.transactionHash
      }
    });
  } catch (error) {
    console.error('Error accepting bid:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to accept bid',
      error: (error as Error).message
    }, { status: 500 });
  }
}

// Handle get bids request
async function handleGetBids(body: any) {
  const { listingId } = body;

  if (!listingId) {
    return NextResponse.json({
      success: false,
      message: 'Missing required field: listingId'
    }, { status: 400 });
  }

  try {
    // Get all bids for the listing
    const bids = await getListingBids(listingId);

    // Retrieve user information for each bidder
    const bidsWithUserInfo = await Promise.all(
      bids.map(async (bid: any) => {
        const user = await prisma.user.findFirst({
          where: { walletAddress: bid.bidder },
          select: { id: true, email: true, name: true, profileImageUrl: true }
        });

        return {
          ...bid,
          user: user || null
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        bids: bidsWithUserInfo
      }
    });
  } catch (error) {
    console.error('Error getting bids:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to get bids',
      error: (error as Error).message
    }, { status: 500 });
  }
}

/**
 * GET /api/marketplace/listings
 * 
 * Gets all active marketplace listings
 * 
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Number of listings per page (default: 10)
 * - sort: Sort field (default: 'createdAt')
 * - order: Sort order (default: 'desc')
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const sort = url.searchParams.get('sort') || 'createdAt';
    const order = url.searchParams.get('order') || 'desc';
    const action = url.pathname.split('/').pop();

    // Router for different marketplace GET actions
    switch (action) {
      case 'listings':
        return handleGetListings(page, limit, sort, order);
      case 'listing':
        const listingId = url.searchParams.get('listingId');
        if (!listingId) {
          return NextResponse.json({
            success: false,
            message: 'Missing required parameter: listingId'
          }, { status: 400 });
        }
        return handleGetListing(parseInt(listingId));
      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid action'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in marketplace GET API:', error);
    return NextResponse.json({
      success: false,
      message: 'An error occurred',
      error: (error as Error).message
    }, { status: 500 });
  }
}

// Handle get listings request
async function handleGetListings(page: number, limit: number, sort: string, order: string) {
  try {
    // Get all land listings with active marketplace listings
    const landListings = await prisma.landListing.findMany({
      where: {
        marketplaceListingId: { not: null },
        status: 'LISTED'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImageUrl: true
          }
        }
      },
      orderBy: {
        [sort]: order === 'asc' ? 'asc' : 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // Count total listings
    const totalListings = await prisma.landListing.count({
      where: {
        marketplaceListingId: { not: null },
        status: 'LISTED'
      }
    });

    // Format the response
    const listings = await Promise.all(
      landListings.map(async (listing) => {
        let marketplaceDetails = null;
        
        if (listing.marketplaceListingId) {
          try {
            marketplaceDetails = await getListingDetails(listing.marketplaceListingId);
          } catch (error) {
            console.error(`Error fetching marketplace details for listing ${listing.marketplaceListingId}:`, error);
          }
        }

        return {
          id: listing.id,
          tokenId: listing.tokenId,
          listingId: listing.marketplaceListingId,
          title: listing.title,
          description: listing.propertyDescription,
          price: listing.listingPrice,
          currency: listing.priceCurrency,
          imageUrl: listing.coverImageUrl || listing.nftImageIrysUri,
          seller: listing.user,
          marketplaceDetails,
          createdAt: listing.createdAt,
          updatedAt: listing.updatedAt
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        listings,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(totalListings / limit),
          totalItems: totalListings
        }
      }
    });
  } catch (error) {
    console.error('Error getting listings:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to get listings',
      error: (error as Error).message
    }, { status: 500 });
  }
}

// Handle get listing request
async function handleGetListing(listingId: number) {
  try {
    // Get listing details from the marketplace contract
    const marketplaceDetails = await getListingDetails(listingId);

    // Get the land listing associated with this marketplace listing
    const landListing = await prisma.landListing.findFirst({
      where: { marketplaceListingId: listingId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImageUrl: true,
            walletAddress: true
          }
        }
      }
    });

    if (!landListing) {
      return NextResponse.json({
        success: false,
        message: 'Land listing not found'
      }, { status: 404 });
    }

    // Get bids for this listing
    const bids = await getListingBids(listingId);

    // Format the response
    const listing = {
      id: landListing.id,
      tokenId: landListing.tokenId,
      listingId: landListing.marketplaceListingId,
      title: landListing.title,
      description: landListing.propertyDescription,
      price: landListing.listingPrice,
      currency: landListing.priceCurrency,
      imageUrl: landListing.coverImageUrl || landListing.nftImageIrysUri,
      metadataUrl: landListing.nftMetadataIrysUri,
      seller: landListing.user,
      marketplaceDetails,
      bids,
      createdAt: landListing.createdAt,
      updatedAt: landListing.updatedAt
    };

    return NextResponse.json({
      success: true,
      data: { listing }
    });
  } catch (error) {
    console.error('Error getting listing:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to get listing',
      error: (error as Error).message
    }, { status: 500 });
  }
} 