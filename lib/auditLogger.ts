import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type AuditEventType = 
  | 'BID_PLACED'
  | 'BID_ACCEPTED' 
  | 'BID_REJECTED'
  | 'BID_WITHDRAWN'
  | 'BID_CANCELLED'
  | 'OWNERSHIP_TRANSFER'
  | 'OWNERSHIP_SYNC'
  | 'VALIDATION_FAILURE'
  | 'DATA_INCONSISTENCY';

export interface AuditLogData {
  eventType: AuditEventType;
  userId?: string;
  userAddress?: string;
  landListingId?: string;
  tokenId?: number;
  bidId?: string;
  transactionHash?: string;
  fromAddress?: string;
  toAddress?: string;
  amount?: number;
  details: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * Logs an audit event to the database
 */
export async function logAuditEvent(data: AuditLogData): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        eventType: data.eventType,
        userId: data.userId,
        userAddress: data.userAddress,
        landListingId: data.landListingId,
        tokenId: data.tokenId,
        bidId: data.bidId,
        transactionHash: data.transactionHash,
        fromAddress: data.fromAddress,
        toAddress: data.toAddress,
        amount: data.amount,
        details: data.details,
        metadata: data.metadata || {},
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('[AUDIT_LOG] Failed to log audit event:', error);
    // Don't throw - audit logging should not break the main flow
  }
}

/**
 * Logs a bid placement event
 */
export async function logBidPlacement(
  bidId: string,
  bidderAddress: string,
  landListingId: string,
  tokenId: number,
  amount: number,
  transactionHash: string,
  currentOwner: string
): Promise<void> {
  await logAuditEvent({
    eventType: 'BID_PLACED',
    userAddress: bidderAddress,
    landListingId,
    tokenId,
    bidId,
    transactionHash,
    amount,
    details: {
      bidAmount: amount,
      currentTokenOwner: currentOwner,
      action: 'bid_placed'
    },
    metadata: {
      timestamp: new Date().toISOString(),
      source: 'bid_placement_api'
    }
  });
}

/**
 * Logs a bid acceptance event
 */
export async function logBidAcceptance(
  bidId: string,
  sellerAddress: string,
  buyerAddress: string,
  landListingId: string,
  tokenId: number,
  amount: number,
  transactionHash: string
): Promise<void> {
  await logAuditEvent({
    eventType: 'BID_ACCEPTED',
    userAddress: sellerAddress,
    landListingId,
    tokenId,
    bidId,
    transactionHash,
    fromAddress: sellerAddress,
    toAddress: buyerAddress,
    amount,
    details: {
      bidAmount: amount,
      seller: sellerAddress,
      buyer: buyerAddress,
      action: 'bid_accepted'
    },
    metadata: {
      timestamp: new Date().toISOString(),
      source: 'bid_acceptance_api'
    }
  });
}

/**
 * Logs an ownership transfer event
 */
export async function logOwnershipTransfer(
  landListingId: string,
  tokenId: number,
  fromAddress: string,
  toAddress: string,
  transactionHash?: string,
  reason?: string
): Promise<void> {
  await logAuditEvent({
    eventType: 'OWNERSHIP_TRANSFER',
    landListingId,
    tokenId,
    transactionHash,
    fromAddress,
    toAddress,
    details: {
      previousOwner: fromAddress,
      newOwner: toAddress,
      reason: reason || 'ownership_transfer',
      action: 'ownership_changed'
    },
    metadata: {
      timestamp: new Date().toISOString(),
      source: 'ownership_sync'
    }
  });
}

/**
 * Logs a validation failure event
 */
export async function logValidationFailure(
  eventType: 'bid_placement' | 'bid_acceptance',
  userAddress: string,
  landListingId: string,
  tokenId: number,
  error: string,
  details: Record<string, any>
): Promise<void> {
  await logAuditEvent({
    eventType: 'VALIDATION_FAILURE',
    userAddress,
    landListingId,
    tokenId,
    details: {
      validationType: eventType,
      error,
      ...details,
      action: 'validation_failed'
    },
    metadata: {
      timestamp: new Date().toISOString(),
      source: 'validation_system'
    }
  });
}

/**
 * Logs a data inconsistency event
 */
export async function logDataInconsistency(
  landListingId: string,
  tokenId: number,
  inconsistencyType: string,
  databaseState: Record<string, any>,
  blockchainState: Record<string, any>,
  resolution?: string
): Promise<void> {
  await logAuditEvent({
    eventType: 'DATA_INCONSISTENCY',
    landListingId,
    tokenId,
    details: {
      inconsistencyType,
      databaseState,
      blockchainState,
      resolution: resolution || 'detected',
      action: 'data_inconsistency_detected'
    },
    metadata: {
      timestamp: new Date().toISOString(),
      source: 'data_consistency_check'
    }
  });
}

/**
 * Gets audit logs for a specific token
 */
export async function getTokenAuditLogs(
  landListingId: string,
  tokenId: number,
  limit: number = 50
): Promise<any[]> {
  try {
    return await prisma.auditLog.findMany({
      where: {
        landListingId,
        tokenId
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: limit
    });
  } catch (error) {
    console.error('[AUDIT_LOG] Failed to get audit logs:', error);
    return [];
  }
}

/**
 * Gets audit logs for a specific user
 */
export async function getUserAuditLogs(
  userAddress: string,
  limit: number = 50
): Promise<any[]> {
  try {
    return await prisma.auditLog.findMany({
      where: {
        OR: [
          { userAddress: { equals: userAddress, mode: 'insensitive' } },
          { fromAddress: { equals: userAddress, mode: 'insensitive' } },
          { toAddress: { equals: userAddress, mode: 'insensitive' } }
        ]
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: limit
    });
  } catch (error) {
    console.error('[AUDIT_LOG] Failed to get user audit logs:', error);
    return [];
  }
} 