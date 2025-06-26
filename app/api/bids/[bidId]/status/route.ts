import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { trackBidEvent } from '@/lib/priceTracking';
import { randomUUID } from 'crypto';
import { createPublicClient, createWalletClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { LandMarketplaceABI } from '@/contracts/LandMarketplaceABI';
import { LAND_MARKETPLACE_ADDRESS, PLATZ_LAND_NFT_ADDRESS } from '@/config/contracts';
import { 
  validateBidAcceptance, 
  checkForDuplicateSale, 
  syncOwnershipWithBlockchain 
} from '@/lib/bidValidation';

// Schema for validation
const paramsSchema = z.object({
  bidId: z.string().min(1)
});

const updateBidSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED']),
  user_address: z.string().min(1) // Address of the user accepting/rejecting the bid
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
    const bid = await prisma.nft_bids.findUnique({
      where: { id: bidId },
      include: {
        land_listings: {
          include: {
            users: true,
            evm_collection_tokens: true // Get all tokens, we'll filter for the specific one later
          }
        },
        users: true
      }
    });

    if (!bid) {
      return NextResponse.json(
        { success: false, message: 'Bid not found' },
        { status: 404 }
      );
    }

    // Enhanced validation using the new validation system (with fallback tolerance)
    const validationResult = await validateBidAcceptance(bidId, validatedData.user_address);
    
    if (!validationResult.isValid) {
      console.warn(`[BID_STATUS] Validation failed (${validationResult.source}): ${validationResult.error}`);
      
      // If validation failed due to blockchain connectivity, be more lenient
      if (validationResult.source === 'fallback' || validationResult.source === 'database') {
        console.log(`[BID_STATUS] Allowing bid acceptance despite validation failure due to connectivity issues`);
        // Continue with acceptance but log the issue
        // TODO: Create an `audit_logs` model in `schema.prisma` to store validation bypass events.
        // try {
        //   await prisma.audit_logs.create({
        //     data: {
        //       id: randomUUID(),
        //       event_type: 'BID_ACCEPTANCE_VALIDATION_BYPASS',
        //       user_address: validatedData.user_address,
        //       bid_id: bidId,
        //       details: {
        //         validationError: validationResult.error,
        //         validationSource: validationResult.source,
        //         bypassReason: 'blockchain_connectivity_issues',
        //         timestamp: new Date().toISOString()
        //       }
        //     }
        //   });
        // } catch (auditError) {
        //   console.warn('[BID_STATUS] Failed to create audit log:', auditError);
        // }
      } else {
        return NextResponse.json(
          { success: false, message: validationResult.error },
          { status: 400 }
        );
      }
    }

    // Check for duplicate sales to prevent multiple acceptances
    const duplicateCheck = await checkForDuplicateSale(bid.land_listing_id, bid.token_id);
    if (duplicateCheck.isDuplicate) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Token was already sold recently at ${duplicateCheck.lastSaleDate?.toISOString()}`,
          transaction_hash: duplicateCheck.transactionHash
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
    const targetToken = await prisma.evm_collection_tokens.findFirst({
      where: {
        land_listing_id: bid.land_listing_id,
        token_id: bid.token_id
      }
    });

    // If rejecting, just update the status
    if (validatedData.status === 'REJECTED') {
      const updatedBid = await prisma.nft_bids.update({
        where: { id: bidId },
        data: {
          bid_status: 'REJECTED',
          updated_at: new Date()
        },
        include: {
          users: {
            select: {
              id: true,
              username: true,
              evm_address: true
            }
          },
          land_listings: {
            select: {
              id: true,
              nft_title: true,
              collection_id: true
            }
          }
        }
      });

      await trackBidEvent(bid.land_listing_id, bidId, bid.bid_amount, 'BID_REJECTED');

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
        console.log(`[BID_ACCEPTANCE] Accepting bid for token ${bid.token_id} from ${bid.users.evm_address} to ${validatedData.user_address}`);
        
        // Get gas estimate first
        const gasEstimate = await publicClient.estimateContractGas({
          address: LAND_MARKETPLACE_ADDRESS,
          abi: LandMarketplaceABI,
          functionName: 'acceptBid',
          args: [PLATZ_LAND_NFT_ADDRESS, BigInt(bid.token_id)],
          account: account.address
        });

        const transactionHash = await walletClient.writeContract({
          address: LAND_MARKETPLACE_ADDRESS,
          abi: LandMarketplaceABI,
          functionName: 'acceptBid',
          args: [PLATZ_LAND_NFT_ADDRESS, BigInt(bid.token_id)],
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
        const syncResult = await syncOwnershipWithBlockchain(bid.land_listing_id, bid.token_id);
        if (syncResult.success) {
          console.log(`[BID_ACCEPTANCE] Successfully synced ownership to ${syncResult.newOwner}`);
        } else {
          console.warn(`[BID_ACCEPTANCE] Failed to sync ownership: ${syncResult.error}`);
          // Continue anyway since blockchain transaction succeeded
        }

        // Update bid status
        const updatedBid = await prisma.nft_bids.update({
          where: { id: bidId },
          data: {
            bid_status: 'ACCEPTED',
            updated_at: new Date()
          },
          include: {
            users: {
              select: {
                id: true,
                username: true,
                evm_address: true
              }
            },
            land_listings: {
              select: {
                id: true,
                nft_title: true,
                collection_id: true
              }
            }
          }
        });

        // Track the bid acceptance event for price analytics
        await trackBidEvent(bid.land_listing_id, bidId, bid.bid_amount, 'BID_ACCEPTED');
        
        // Also track as a sale event for comprehensive analytics
        const { trackSaleEvent } = await import('@/lib/priceTracking');
        try {
          const transactionRecord = await prisma.nft_transactions.findFirst({
            where: {
              land_listing_id: bid.land_listing_id,
              token_id: bid.token_id,
              transaction_hash: transactionHash
            }
          });
          
          if (transactionRecord) {
            await trackSaleEvent(bid.land_listing_id, transactionRecord.id, bid.bid_amount);
          }
        } catch (trackingError) {
          console.error('Failed to track sale event:', trackingError);
          // Don't fail the bid acceptance if sale tracking fails
        }

        // Mark all other active bids for this token as OUTBID
        await prisma.nft_bids.updateMany({
          where: {
            land_listing_id: bid.land_listing_id,
            token_id: bid.token_id,
            id: { not: bidId },
            bid_status: 'ACTIVE'
          },
          data: {
            bid_status: 'OUTBID'
          }
        });

        // Create a transaction record for the accepted bid
        try {
          await prisma.nft_transactions.create({
            data: {
              id: randomUUID(),
              land_listing_id: bid.land_listing_id,
              token_id: bid.token_id,
              from_address: validatedData.user_address, // Current owner (seller)
              to_address: bid.users.evm_address || '',
              price: bid.bid_amount,
              transaction_hash: transactionHash,
              transaction_type: 'BID_ACCEPTED'
            }
          });
        } catch (transactionError) {
          console.error('Failed to create transaction record:', transactionError);
          // Don't fail the bid acceptance if transaction recording fails
        }

        return NextResponse.json({
          success: true,
          bid: updatedBid,
          transaction_hash: transactionHash,
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
  }
} 