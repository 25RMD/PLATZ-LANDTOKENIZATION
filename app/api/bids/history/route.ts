import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('userAddress');

    if (!userAddress) {
      return NextResponse.json(
        { success: false, error: 'User address is required' },
        { status: 400 }
      );
    }

    console.log(`Fetching bid history for user: ${userAddress}`);

    // Find the user by EVM address
    const user = await prisma.user.findFirst({
      where: {
        evmAddress: {
          equals: userAddress,
          mode: 'insensitive'
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get all bids made by the user (both active and historical)
    const userBids = await prisma.nftBid.findMany({
      where: {
        bidderUserId: user.id
      },
      include: {
        landListing: {
          select: {
            id: true,
            nftTitle: true,
            collectionId: true,
            nftImageFileRef: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get all transactions where user was involved in bid-related activities
    const bidTransactions = await prisma.nftTransaction.findMany({
      where: {
        OR: [
          {
            fromAddress: {
              equals: userAddress,
              mode: 'insensitive'
            },
            transactionType: {
              in: ['BID_ACCEPTED', 'BID_PLACED']
            }
          },
          {
            toAddress: {
              equals: userAddress,
              mode: 'insensitive'
            },
            transactionType: {
              in: ['BID_ACCEPTED', 'BID_PLACED']
            }
          }
        ]
      },
      include: {
        landListing: {
          select: {
            id: true,
            nftTitle: true,
            collectionId: true,
            nftImageFileRef: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get bids received on user's listings
    const receivedBids = await prisma.nftBid.findMany({
      where: {
        landListing: {
          user: {
            evmAddress: {
              equals: userAddress,
              mode: 'insensitive'
            }
          }
        }
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Combine and format all history items with deduplication
    const historyItems: any[] = [];
    const processedBids = new Set<string>();
    const processedTransactions = new Set<string>();

    // Add user's bids (only if not already processed via transactions)
    userBids.forEach(bid => {
      const bidKey = `bid-${bid.id}`;
      if (!processedBids.has(bidKey)) {
        processedBids.add(bidKey);
        
        let description = `You placed a bid of ${bid.bidAmount} ETH`;
        let type = 'BID_PLACED';
        
        // If bid is accepted, show it as accepted rather than just placed
        if (bid.bidStatus === 'ACCEPTED') {
          description = `Your bid of ${bid.bidAmount} ETH was accepted`;
          type = 'BID_ACCEPTED';
        }
        
        historyItems.push({
          id: bidKey,
          type,
          status: bid.bidStatus,
          amount: bid.bidAmount,
          transactionHash: bid.transactionHash,
          createdAt: bid.createdAt.toISOString(),
          updatedAt: bid.updatedAt.toISOString(),
          description,
          landListing: bid.landListing,
          isUserAction: true,
          bidId: bid.id
        });
      }
    });

    // Add received bids (only if not already processed)
    receivedBids.forEach(bid => {
      const bidKey = `received-bid-${bid.id}`;
      if (!processedBids.has(bidKey)) {
        processedBids.add(bidKey);
        
        let description = `${bid.bidder.username || 'Anonymous'} placed a bid of ${bid.bidAmount} ETH on your listing`;
        let type = 'BID_RECEIVED';
        
        // If bid is accepted, show it as accepted
        if (bid.bidStatus === 'ACCEPTED') {
          description = `You accepted a bid of ${bid.bidAmount} ETH from ${bid.bidder.username || 'Anonymous'}`;
          type = 'BID_ACCEPTED';
        }
        
        historyItems.push({
          id: bidKey,
          type,
          status: bid.bidStatus,
          amount: bid.bidAmount,
          transactionHash: bid.transactionHash,
          createdAt: bid.createdAt.toISOString(),
          updatedAt: bid.updatedAt.toISOString(),
          description,
          landListing: bid.landListing,
          isUserAction: false,
          bidder: bid.bidder,
          bidId: bid.id
        });
      }
    });

    // Add bid-related transactions (only unique ones not covered by bids)
    bidTransactions.forEach(transaction => {
      const transactionKey = `transaction-${transaction.id}`;
      if (!processedTransactions.has(transactionKey)) {
        processedTransactions.add(transactionKey);
        
        const isUserSender = transaction.fromAddress.toLowerCase() === userAddress.toLowerCase();
        const isUserReceiver = transaction.toAddress.toLowerCase() === userAddress.toLowerCase();
        
        let description = '';
        let shouldInclude = true;
        
        if (transaction.transactionType === 'BID_ACCEPTED') {
          // Only include BID_ACCEPTED transactions if they're not already covered by bid status
          const correspondingBid = [...userBids, ...receivedBids].find(bid => 
            bid.landListingId === transaction.landListingId && 
            bid.bidAmount === transaction.price &&
            bid.bidStatus === 'ACCEPTED'
          );
          
          if (!correspondingBid) {
            if (isUserSender) {
              description = `You accepted a bid of ${transaction.price} ETH`;
            } else {
              description = `Your bid of ${transaction.price} ETH was accepted`;
            }
          } else {
            shouldInclude = false; // Skip as it's already covered by the bid entry
          }
        } else if (transaction.transactionType === 'BID_PLACED') {
          // Only include BID_PLACED transactions if they're not already covered by bids
          const correspondingBid = userBids.find(bid => 
            bid.landListingId === transaction.landListingId && 
            bid.bidAmount === transaction.price &&
            bid.transactionHash === transaction.transactionHash
          );
          
          if (!correspondingBid) {
            description = `Bid placed for ${transaction.price} ETH`;
          } else {
            shouldInclude = false; // Skip as it's already covered by the bid entry
          }
        }

        if (shouldInclude && description) {
          historyItems.push({
            id: transactionKey,
            type: transaction.transactionType,
            status: 'COMPLETED',
            amount: transaction.price,
            transactionHash: transaction.transactionHash,
            createdAt: transaction.createdAt.toISOString(),
            updatedAt: transaction.createdAt.toISOString(),
            description,
            landListing: transaction.landListing,
            isUserAction: isUserSender,
            fromAddress: transaction.fromAddress,
            toAddress: transaction.toAddress
          });
        }
      }
    });

    // Sort all items by creation date (newest first)
    historyItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    console.log(`Found ${historyItems.length} history items for user ${userAddress}`);

    return NextResponse.json({
      success: true,
      history: historyItems,
      summary: {
        totalBidsPlaced: userBids.length,
        totalBidsReceived: receivedBids.length,
        totalTransactions: bidTransactions.length,
        activeBids: userBids.filter(bid => bid.bidStatus === 'ACTIVE').length,
        acceptedBids: userBids.filter(bid => bid.bidStatus === 'ACCEPTED').length,
        withdrawnBids: userBids.filter(bid => bid.bidStatus === 'WITHDRAWN').length
      }
    });

  } catch (error) {
    console.error('Error fetching bid history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bid history' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 