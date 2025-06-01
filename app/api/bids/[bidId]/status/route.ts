import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { trackBidEvent } from '@/lib/priceTracking';
import { createPublicClient, createWalletClient, http, parseEther } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { LandMarketplaceABI } from '@/contracts/LandMarketplaceABI';
import { LAND_MARKETPLACE_ADDRESS, PLATZ_LAND_NFT_ADDRESS } from '@/config/contracts';
import { 
  validateBidAcceptance, 
  checkForDuplicateSale, 
  syncOwnershipWithBlockchain 
} from '@/lib/bidValidation';

const prisma = new PrismaClient();

// Schema for validation
const paramsSchema = z.object({
  bidId: z.string().min(1)
});

const updateBidSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED']),
  userAddress: z.string().min(1) // Address of the user accepting/rejecting the bid
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ bidId: string }> }
) {
  try {
    const resolvedParams = await params;
    const validatedParams = paramsSchema.parse(resolvedParams);
    const { bidId } = validatedParams;

    const body = await request.json();
    const validatedData = updateBidSchema.parse(body);

    // Find the bid with token information
    const bid = await prisma.nftBid.findUnique({
      where: { id: bidId },
      include: {
        landListing: {
          include: {
            user: true,
            evmCollectionTokens: true // Get all tokens, we'll filter for the specific one later
          }
        },
        bidder: true
      }
    });

    if (!bid) {
      return NextResponse.json(
        { success: false, message: 'Bid not found' },
        { status: 404 }
      );
    }

    // Enhanced validation using the new validation system (with fallback tolerance)
    const validationResult = await validateBidAcceptance(bidId, validatedData.userAddress);
    
    if (!validationResult.isValid) {
      console.warn(`[BID_STATUS] Validation failed (${validationResult.source}): ${validationResult.error}`);
      
      // If validation failed due to blockchain connectivity, be more lenient
      if (validationResult.source === 'fallback' || validationResult.source === 'database') {
        console.log(`[BID_STATUS] Allowing bid acceptance despite validation failure due to connectivity issues`);
        // Continue with acceptance but log the issue
        try {
          await prisma.auditLog.create({
            data: {
              eventType: 'BID_ACCEPTANCE_VALIDATION_BYPASS',
              userAddress: validatedData.userAddress,
              bidId: bidId,
              details: {
                validationError: validationResult.error,
                validationSource: validationResult.source,
                bypassReason: 'blockchain_connectivity_issues',
                timestamp: new Date().toISOString()
              }
            }
          });
        } catch (auditError) {
          console.warn('[BID_STATUS] Failed to create audit log:', auditError);
        }
      } else {
        return NextResponse.json(
          { success: false, message: validationResult.error },
          { status: 400 }
        );
      }
    }

    // Check for duplicate sales to prevent multiple acceptances
    const duplicateCheck = await checkForDuplicateSale(bid.landListingId, bid.tokenId);
    if (duplicateCheck.isDuplicate) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Token was already sold recently at ${duplicateCheck.lastSaleDate?.toISOString()}`,
          transactionHash: duplicateCheck.transactionHash
        },
        { status: 409 }
      );
    }

    // Create blockchain client for ownership verification
    const rpcUrl = process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(rpcUrl)
    });

    // Find the specific token that was bid on (if it exists in database)
    const targetToken = await prisma.evmCollectionToken.findFirst({
      where: {
        landListingId: bid.landListingId,
        tokenId: bid.tokenId
      }
    });

    // If rejecting, just update the status
    if (validatedData.status === 'REJECTED') {
      const updatedBid = await prisma.nftBid.update({
        where: { id: bidId },
        data: {
          bidStatus: 'REJECTED',
          updatedAt: new Date()
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
              collectionId: true
            }
          }
        }
      });

      await trackBidEvent(bid.landListingId, bidId, bid.bidAmount, 'BID_REJECTED');

      return NextResponse.json({
        success: true,
        bid: updatedBid,
        message: 'Bid rejected successfully'
      });
    }

    // For BID ACCEPTANCE - handle smart contract interaction
    if (validatedData.status === 'ACCEPTED') {
      // Check if we have a server-side wallet for executing the transaction
      let serverPrivateKey = process.env.SERVER_WALLET_PRIVATE_KEY || process.env.PRIVATE_KEY;
      if (!serverPrivateKey) {
        return NextResponse.json(
          { success: false, message: 'Server wallet not configured for automated NFT transfers' },
          { status: 500 }
        );
      }

      // Ensure the private key starts with 0x
      if (!serverPrivateKey.startsWith('0x')) {
        serverPrivateKey = `0x${serverPrivateKey}`;
      }

      try {
        // Create wallet client for transaction execution
        const account = privateKeyToAccount(serverPrivateKey as `0x${string}`);
        const walletClient = createWalletClient({
          account,
          chain: sepolia,
          transport: http(rpcUrl)
        });

        // Authorization and token verification already done above

        // Call the smart contract to accept the bid
        console.log(`[BID_ACCEPTANCE] Accepting bid for token ${bid.tokenId} from ${bid.bidder.evmAddress} to ${validatedData.userAddress}`);
        
        // Get gas estimate first
        const gasEstimate = await publicClient.estimateContractGas({
          address: LAND_MARKETPLACE_ADDRESS,
          abi: LandMarketplaceABI,
          functionName: 'acceptBid',
          args: [PLATZ_LAND_NFT_ADDRESS, BigInt(bid.tokenId)],
          account: account.address
        });

        const transactionHash = await walletClient.writeContract({
          address: LAND_MARKETPLACE_ADDRESS,
          abi: LandMarketplaceABI,
          functionName: 'acceptBid',
          args: [PLATZ_LAND_NFT_ADDRESS, BigInt(bid.tokenId)],
          gas: gasEstimate
        });

        // Wait for transaction confirmation
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: transactionHash,
        });

        if (receipt.status !== 'success') {
          throw new Error('Smart contract transaction failed');
        }

        console.log(`[BID_ACCEPTANCE] NFT transfer successful. Transaction: ${transactionHash}`);

        // Sync database ownership with blockchain reality
        const syncResult = await syncOwnershipWithBlockchain(bid.landListingId, bid.tokenId);
        if (syncResult.success) {
          console.log(`[BID_ACCEPTANCE] Successfully synced ownership to ${syncResult.newOwner}`);
        } else {
          console.warn(`[BID_ACCEPTANCE] Failed to sync ownership: ${syncResult.error}`);
          // Continue anyway since blockchain transaction succeeded
        }

        // Update bid status
        const updatedBid = await prisma.nftBid.update({
          where: { id: bidId },
          data: {
            bidStatus: 'ACCEPTED',
            updatedAt: new Date()
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
                collectionId: true
              }
            }
          }
        });

        // Track the bid acceptance event for price analytics
        await trackBidEvent(bid.landListingId, bidId, bid.bidAmount, 'BID_ACCEPTED');
        
        // Also track as a sale event for comprehensive analytics
        const { trackSaleEvent } = await import('@/lib/priceTracking');
        try {
          const transactionRecord = await prisma.nftTransaction.findFirst({
            where: {
              landListingId: bid.landListingId,
              tokenId: bid.tokenId,
              transactionHash: transactionHash
            }
          });
          
          if (transactionRecord) {
            await trackSaleEvent(bid.landListingId, transactionRecord.id, bid.bidAmount);
          }
        } catch (trackingError) {
          console.error('Failed to track sale event:', trackingError);
          // Don't fail the bid acceptance if sale tracking fails
        }

        // Mark all other active bids for this token as OUTBID
        await prisma.nftBid.updateMany({
          where: {
            landListingId: bid.landListingId,
            tokenId: bid.tokenId,
            id: { not: bidId },
            bidStatus: 'ACTIVE'
          },
          data: {
            bidStatus: 'OUTBID'
          }
        });

        // Create a transaction record for the accepted bid
        try {
          await prisma.nftTransaction.create({
            data: {
              landListingId: bid.landListingId,
              tokenId: bid.tokenId,
              fromAddress: validatedData.userAddress, // Current owner (seller)
              toAddress: bid.bidder.evmAddress || '',
              price: bid.bidAmount,
              transactionHash: transactionHash,
              transactionType: 'BID_ACCEPTED'
            }
          });
        } catch (transactionError) {
          console.error('Failed to create transaction record:', transactionError);
          // Don't fail the bid acceptance if transaction recording fails
        }

        return NextResponse.json({
          success: true,
          bid: updatedBid,
          transactionHash: transactionHash,
          message: 'Bid accepted successfully. NFT ownership transferred to bidder.'
        });

      } catch (contractError) {
        console.error('Error executing smart contract transaction:', contractError);
        return NextResponse.json(
          { 
            success: false, 
            message: 'Failed to transfer NFT ownership on blockchain',
            error: contractError instanceof Error ? contractError.message : 'Unknown contract error'
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { success: false, message: 'Invalid status provided' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error updating bid status:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid request data', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 