# Bid Acceptance and NFT Transfer System

## Overview

This document describes the enhanced bid acceptance system that automatically transfers NFT ownership when bids are accepted. The system integrates smart contract calls with database updates to ensure seamless ownership transfers.

## Architecture

### Flow Diagram

```
[User Places Bid] → [Smart Contract] → [Database Record]
         ↓
[Owner Accepts Bid] → [API Call] → [Smart Contract Transfer] → [Database Update] → [Ownership Changed]
```

### Components

1. **Frontend (BidModal)**: Collects bid information including specific tokenId
2. **Bid Creation API**: Stores bid with tokenId in database
3. **Bid Acceptance API**: Calls smart contract and updates database
4. **Smart Contract**: Handles NFT transfer and payment
5. **Database**: Tracks ownership and transaction history

## Database Schema

### NftBid Model (Enhanced)

```prisma
model NftBid {
  id              String      @id @default(cuid())
  landListingId   String      @map("land_listing_id")
  tokenId         Int         @default(0) @map("token_id") // NEW: Specific token being bid on
  bidderUserId    String      @map("bidder_user_id")
  bidAmount       Float       @map("bid_amount")
  bidStatus       String      @map("bid_status") @db.VarChar(20)
  transactionHash String?     @map("transaction_hash") @db.VarChar(66)
  createdAt       DateTime    @default(now()) @map("created_at")
  updatedAt       DateTime    @updatedAt @map("updated_at")
  bidder          User        @relation(fields: [bidderUserId], references: [id])
  landListing     LandListing @relation(fields: [landListingId], references: [id])

  @@index([tokenId])
  @@map("nft_bids")
}
```

**Key Changes:**
- Added `tokenId` field to track specific token being bid on
- `tokenId = 0` represents collection-level bids (legacy support)
- `tokenId > 0` represents individual token bids

## API Endpoints

### 1. Create Bid (`POST /api/bids`)

**Request Body:**
```json
{
  "collectionId": "16",
  "tokenId": "104",
  "bidAmount": 0.1,
  "transactionHash": "0x...",
  "bidderAddress": "0x..."
}
```

**Process:**
1. Validates user exists
2. Finds collection
3. Marks previous bids as OUTBID
4. Creates new bid record with tokenId
5. Tracks price event

### 2. Accept/Reject Bid (`PATCH /api/bids/{bidId}/status`)

**Request Body:**
```json
{
  "status": "ACCEPTED",
  "userAddress": "0x..." // Collection owner address
}
```

**Process for ACCEPTED:**
1. Validates authorization (only collection owner)
2. Validates bid is still active
3. **Calls smart contract `acceptBid(nftContract, tokenId)`**
4. **Updates database ownership: `ownerAddress` → bidder**
5. Marks token as unlisted
6. Creates transaction record
7. Marks other bids as OUTBID
8. Tracks price events

**Process for REJECTED:**
1. Simply updates bid status to REJECTED
2. Tracks price event

## Smart Contract Integration

### Contract Functions Used

1. **`acceptBid(address nftContract, uint256 tokenId)`**
   - Transfers NFT from current owner to bidder
   - Transfers payment from bidder to seller (minus marketplace fee)
   - Clears the bid from contract storage
   - Emits `BidAccepted` event

### Transaction Flow

```solidity
// Smart contract handles:
1. NFT transfer: ownerOf(tokenId) → bidder
2. Payment transfer: bidder's escrowed ETH → seller
3. Marketplace fee: bidder's escrowed ETH → marketplace
4. Clear bid storage
5. Clear listing if exists
```

## Environment Configuration

### Required Environment Variables

```bash
# deploy.env or .env.local
SERVER_WALLET_PRIVATE_KEY="your_private_key_here"
# OR
PRIVATE_KEY="your_private_key_here"  # Fallback

# Contract addresses
LAND_MARKETPLACE_ADDRESS="0xc2Fba30e5d703c237C7fE94E861E34ffA1536b36"
PLATZ_LAND_NFT_ADDRESS="0x3634a1Da3bb8f2F81D7c7db37aF99A2E4F788190"
```

**Security Notes:**
- Server wallet should have minimal ETH (only for gas fees)
- Server wallet should NOT hold valuable assets
- Consider using a dedicated wallet for automated transactions

## Frontend Integration

### BidModal Updates

```typescript
// When placing bid, ensure tokenId is passed
await fetch('/api/bids', {
  method: 'POST',
  body: JSON.stringify({
    collectionId,
    tokenId,           // ← CRITICAL: Specific token being bid on
    bidAmount: bidEthValue,
    transactionHash,
    bidderAddress: address,
  }),
});
```

### Ownership Verification

The frontend now uses blockchain data directly:

```typescript
const checkUserOwnership = async () => {
  // Uses blockchain data loaded from smart contract
  collection.evmCollectionTokens.forEach(token => {
    if (token.ownerAddress?.toLowerCase() === connectedEvmAddress.toLowerCase()) {
      ownedTokenIds.add(token.tokenId);
    }
  });
};
```

## Testing

### Manual Testing Steps

1. **Place a Bid:**
   ```bash
   # Frontend: Use BidModal to place bid on specific token
   # Verify: Check database for bid record with correct tokenId
   ```

2. **Accept Bid:**
   ```bash
   curl -X PATCH http://localhost:3000/api/bids/{bidId}/status \
     -H "Content-Type: application/json" \
     -d '{
       "status": "ACCEPTED",
       "userAddress": "0x_collection_owner_address"
     }'
   ```

3. **Verify Transfer:**
   - Check blockchain: `ownerOf(tokenId)` should return bidder address
   - Check database: `evmCollectionToken.ownerAddress` should be updated
   - Check frontend: Token should show as owned by bidder

### Test Scenarios

1. **Successful Bid Acceptance:**
   - ✅ NFT transfers to bidder
   - ✅ Payment transfers to seller
   - ✅ Database ownership updated
   - ✅ Other bids marked as OUTBID
   - ✅ Price tracking events recorded

2. **Failed Bid Acceptance:**
   - ❌ Insufficient gas → Transaction fails, database unchanged
   - ❌ Invalid authorization → 403 error
   - ❌ Bid already processed → 400 error

3. **Edge Cases:**
   - Token already transferred → Smart contract reverts
   - Invalid tokenId → Database/contract error
   - Network issues → Transaction timeout

## Security Considerations

### Authorization
- Only collection owners can accept/reject bids
- Server wallet executes transactions but doesn't own assets
- All transactions are blockchain-verified

### Error Handling
- Smart contract failures don't update database
- Database failures don't affect blockchain state
- Comprehensive logging for debugging

### Gas Management
- Server wallet needs sufficient ETH for gas
- Gas price estimation and limits
- Fallback mechanisms for failed transactions

## Troubleshooting

### Common Issues

1. **"Server wallet not configured"**
   ```bash
   # Solution: Add to deploy.env
   SERVER_WALLET_PRIVATE_KEY="your_key_here"
   ```

2. **"Token not found in collection"**
   ```bash
   # Solution: Verify tokenId exists in database
   # Check: evmCollectionTokens table
   ```

3. **"Smart contract transaction failed"**
   ```bash
   # Possible causes:
   # - NFT not approved for marketplace
   # - Insufficient gas
   # - Bid already accepted/withdrawn
   # - Network congestion
   ```

4. **"Ownership not updating in UI"**
   ```bash
   # Solution: Refresh collection data
   # The frontend will fetch updated blockchain state
   ```

### Monitoring

- Monitor server wallet ETH balance
- Track transaction success/failure rates
- Monitor gas costs and optimize
- Alert on consecutive failures

## Migration Notes

### Database Migration Applied
```sql
-- Added tokenId field with default 0 for legacy support
ALTER TABLE "nft_bids" ADD COLUMN "token_id" INTEGER NOT NULL DEFAULT 0;
```

### Backward Compatibility
- Legacy bids (tokenId = 0) still work
- New bids require specific tokenId
- Collection-level bids can be migrated if needed

## Future Enhancements

1. **Batch Bid Acceptance:** Accept multiple bids at once
2. **Escrow Integration:** Hold payments in smart contract escrow
3. **Royalty Distribution:** Automatic royalty payments
4. **Gas Optimization:** Batch transactions for efficiency
5. **Multi-signature:** Require multiple approvals for high-value transfers

---

## Collection Stats Real-Time Updates

### Automatic Stats Refresh
When purchases are completed (bids accepted), collection statistics are automatically updated:

1. **Backend Updates**: 
   - `BID_ACCEPTED` and `SALE` events are tracked
   - Floor price recalculated
   - Average price updated
   - 24h volume and sales count incremented

2. **Frontend Updates**:
   - Collection detail page refreshes stats every 30 seconds
   - Bid management page refreshes collection data after acceptance
   - User ownership status updated in real-time

### Stats Tracked
- **Floor Price**: Lowest listing price across collection
- **24h Volume**: Total ETH traded in last 24 hours (includes bid acceptances)
- **24h Sales**: Number of completed purchases in last 24 hours
- **Top Offer**: Highest active bid amount
- **Price Change**: 24-hour percentage change in floor price

### Testing
Run the collection stats test to verify updates:
```bash
npm run test-collection-stats
```

## Summary

The enhanced bid acceptance system provides:

✅ **Secure NFT Transfers**: Smart contract-verified ownership changes  
✅ **Automatic Payments**: Bidder pays seller automatically  
✅ **Database Synchronization**: Ownership tracking stays accurate  
✅ **Real-Time Stats**: Collection statistics update immediately after purchases  
✅ **Price Tracking**: Comprehensive market analytics with bid/sale events  
✅ **Error Recovery**: Robust error handling and logging  
✅ **Authorization**: Only owners can accept bids  
✅ **Scalability**: Individual token-level bidding support  
✅ **Live Updates**: Frontend automatically refreshes stats and ownership

This system ensures that when bids are accepted, NFT ownership transfers seamlessly from seller to bidder, while maintaining data integrity across blockchain and database states and providing real-time market statistics updates. 