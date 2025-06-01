import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { LandMarketplaceABI } from '@/contracts/LandMarketplaceABI';
import { LAND_MARKETPLACE_ADDRESS, PLATZ_LAND_NFT_ADDRESS } from '@/config/contracts';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface BlockchainBid {
  bidder: string;
  amount: bigint;
  paymentToken: string;
  timestamp: bigint;
}

interface SyncResult {
  success: boolean;
  currentBid: number | null;
  error?: string;
  synced?: boolean;
}

/**
 * Get the current highest bid from the blockchain for a specific token
 */
export async function getBlockchainBid(tokenId: number): Promise<BlockchainBid | null> {
  try {
    const rpcUrl = process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
    
    const client = createPublicClient({
      chain: sepolia,
      transport: http(rpcUrl, {
        timeout: 30000, // 30 second timeout
        retryCount: 3,
        retryDelay: 1000
      })
    });

    const highestBid = await client.readContract({
      address: LAND_MARKETPLACE_ADDRESS,
      abi: LandMarketplaceABI,
      functionName: 'getHighestBid',
      args: [PLATZ_LAND_NFT_ADDRESS, BigInt(tokenId)]
    }) as any;

    if (!highestBid || typeof highestBid !== 'object') {
      return null;
    }

    const amount = Number(highestBid.amount);
    
    if (amount === 0) {
      return null;
    }

    return {
      bidder: highestBid.bidder,
      amount: highestBid.amount,
      paymentToken: highestBid.paymentToken,
      timestamp: highestBid.timestamp
    };
  } catch (error) {
    console.error(`Error fetching blockchain bid for token ${tokenId}:`, error);
    return null;
  }
}

/**
 * Sync a blockchain bid with the database
 */
export async function syncBidWithDatabase(tokenId: number, blockchainBid: BlockchainBid): Promise<boolean> {
  try {
    const amountInEth = Number(blockchainBid.amount) / 1e18;

    // Check if this bid already exists in database
    const existingBid = await prisma.nftBid.findFirst({
      where: {
        tokenId: tokenId,
        bidAmount: amountInEth,
        bidder: {
          evmAddress: {
            equals: blockchainBid.bidder,
            mode: 'insensitive'
          }
        },
        bidStatus: 'ACTIVE'
      }
    });

    if (existingBid) {
      return true; // Already synced
    }

    // Find the bidder user
    const bidderUser = await prisma.user.findFirst({
      where: {
        evmAddress: {
          equals: blockchainBid.bidder,
          mode: 'insensitive'
        }
      }
    });

    if (!bidderUser) {
      console.warn(`Bidder user not found for address: ${blockchainBid.bidder}`);
      return false;
    }

    // Find the land listing for this token
    const landListing = await prisma.landListing.findFirst({
      where: {
        OR: [
          { mainTokenId: tokenId.toString() },
          { evmCollectionTokens: { some: { tokenId: tokenId } } }
        ]
      }
    });

    if (!landListing) {
      console.warn(`Land listing not found for token ${tokenId}`);
      return false;
    }

    // Create the bid record
    await prisma.nftBid.create({
      data: {
        landListingId: landListing.id,
        tokenId: tokenId,
        bidderUserId: bidderUser.id,
        bidAmount: amountInEth,
        bidStatus: 'ACTIVE',
        transactionHash: 'SYNCED_FROM_BLOCKCHAIN',
        createdAt: new Date(Number(blockchainBid.timestamp) * 1000),
        updatedAt: new Date()
      }
    });

    console.log(`✅ Synced bid for token ${tokenId}: ${amountInEth} ETH`);
    return true;
  } catch (error) {
    console.error(`Error syncing bid for token ${tokenId}:`, error);
    return false;
  }
}

/**
 * Get the current highest bid for a token, syncing with blockchain if needed
 */
export async function getCurrentBidWithSync(tokenId: number): Promise<SyncResult> {
  try {
    // First, check database
    const dbBid = await prisma.nftBid.findFirst({
      where: {
        tokenId: tokenId,
        bidStatus: 'ACTIVE'
      },
      orderBy: {
        bidAmount: 'desc'
      }
    });

    // Then, check blockchain
    const blockchainBid = await getBlockchainBid(tokenId);

    if (!blockchainBid) {
      // No blockchain bid, return database bid if any
      return {
        success: true,
        currentBid: dbBid?.bidAmount || null,
        synced: false
      };
    }

    const blockchainAmountEth = Number(blockchainBid.amount) / 1e18;

    // If database bid matches blockchain bid, we're in sync
    if (dbBid && Math.abs(dbBid.bidAmount - blockchainAmountEth) < 0.0001) {
      return {
        success: true,
        currentBid: dbBid.bidAmount,
        synced: true
      };
    }

    // If blockchain bid is higher or database is missing, sync it
    if (!dbBid || blockchainAmountEth > dbBid.bidAmount) {
      const syncSuccess = await syncBidWithDatabase(tokenId, blockchainBid);
      
      return {
        success: true,
        currentBid: blockchainAmountEth,
        synced: syncSuccess
      };
    }

    // Database has higher bid than blockchain (unusual but possible)
    return {
      success: true,
      currentBid: dbBid.bidAmount,
      synced: false
    };

  } catch (error) {
    console.error(`Error getting current bid for token ${tokenId}:`, error);
    return {
      success: false,
      currentBid: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Calculate minimum bid amount for a token
 */
export async function getMinimumBidAmount(tokenId: number): Promise<number> {
  try {
    const result = await getCurrentBidWithSync(tokenId);
    
    if (!result.success || result.currentBid === null) {
      return 0.001; // Default minimum bid
    }

    // Minimum bid is current bid + 0.001 ETH
    return result.currentBid + 0.001;
  } catch (error) {
    console.error(`Error calculating minimum bid for token ${tokenId}:`, error);
    return 0.001; // Default minimum bid
  }
}

/**
 * Validate if a bid amount is sufficient for a token (database-first approach)
 */
export async function validateBidAmountFast(tokenId: number, bidAmount: number): Promise<{
  valid: boolean;
  minimumBid: number;
  currentBid: number | null;
  message?: string;
}> {
  try {
    // First, check database for current highest bid
    const dbBid = await prisma.nftBid.findFirst({
      where: {
        tokenId: tokenId,
        bidStatus: 'ACTIVE'
      },
      orderBy: {
        bidAmount: 'desc'
      }
    });

    let currentBid: number | null = null;
    
    if (dbBid) {
      currentBid = dbBid.bidAmount;
    }
    
    const minimumBid = currentBid ? currentBid + 0.001 : 0.001;

    if (bidAmount < minimumBid) {
      return {
        valid: false,
        minimumBid,
        currentBid,
        message: currentBid 
          ? `Bid must be higher than current bid of ${currentBid} ETH. Minimum: ${minimumBid} ETH`
          : `Minimum bid amount is ${minimumBid} ETH`
      };
    }

    return {
      valid: true,
      minimumBid,
      currentBid
    };
  } catch (error) {
    console.error(`Error validating bid amount for token ${tokenId}:`, error);
    return {
      valid: false,
      minimumBid: 0.001,
      currentBid: null,
      message: 'Failed to validate bid amount'
    };
  }
}

/**
 * Validate if a bid amount is sufficient for a token (blockchain-first approach)
 */
export async function validateBidAmount(tokenId: number, bidAmount: number): Promise<{
  valid: boolean;
  minimumBid: number;
  currentBid: number | null;
  message?: string;
}> {
  try {
    // ALWAYS check blockchain state first to match smart contract validation
    const blockchainBid = await getBlockchainBid(tokenId);
    
    let currentBid: number | null = null;
    
    if (blockchainBid) {
      currentBid = Number(blockchainBid.amount) / 1e18;
    }
    
    const minimumBid = currentBid ? currentBid + 0.001 : 0.001;

    if (bidAmount < minimumBid) {
      return {
        valid: false,
        minimumBid,
        currentBid,
        message: currentBid 
          ? `Bid must be higher than current bid of ${currentBid} ETH. Minimum: ${minimumBid} ETH`
          : `Minimum bid amount is ${minimumBid} ETH`
      };
    }

    return {
      valid: true,
      minimumBid,
      currentBid
    };
  } catch (error) {
    console.error(`Error validating bid amount for token ${tokenId}:`, error);
    // Fallback to database validation if blockchain fails
    console.log(`Falling back to database validation for token ${tokenId}`);
    return await validateBidAmountFast(tokenId, bidAmount);
  }
} 