# Ownership-Based UI & Collection Price Tracking

This document describes the new ownership-based UI improvements and collection price tracking system implemented for the NFT marketplace.

## Features Overview

### 1. Ownership-Based UI Improvements

#### Visual Ownership Indicators
- **Owned Token Badges**: Tokens owned by the connected wallet display a "OWNED" badge
- **Disabled Bidding**: Users cannot place bids on tokens they already own
- **Smart Token Sorting**: Owned tokens are displayed at the bottom of the collection view
- **Visual Distinction**: Owned tokens have reduced opacity and special styling

#### Implementation Details
- Real-time ownership checking when wallet connects or collection loads
- Case-insensitive address matching for robust ownership detection
- Efficient token sorting algorithm that preserves original order while moving owned items to bottom

### 2. Collection Price Tracking System

#### Comprehensive Price Analytics
- **Floor Price Tracking**: Automatically calculated from lowest listed token prices
- **Average Price Calculation**: Based on recent sales and accepted bids (7-day window)
- **24h Statistics**: Volume, sales count, and price change percentage
- **Top Offer Tracking**: Highest active bid for each collection
- **Price History**: Complete historical record of all price-affecting events

#### Tracked Events
- `BID_PLACED`: When a new bid is submitted
- `BID_ACCEPTED`: When a collection owner accepts a bid
- `BID_REJECTED`: When a collection owner rejects a bid
- `SALE`: When a direct purchase occurs
- `FLOOR_PRICE`: Automated floor price updates
- `AVG_PRICE`: Automated average price calculations

## Database Schema

### CollectionPriceHistory Model
```prisma
model CollectionPriceHistory {
  id                 String      @id @default(cuid())
  landListingId      String      @map("land_listing_id")
  priceType          String      @map("price_type") @db.VarChar(20)
  price              Float
  previousPrice      Float?      @map("previous_price")
  changePercentage   Float?      @map("change_percentage")
  bidId              String?     @map("bid_id")
  transactionId      String?     @map("transaction_id")
  metadata           Json?
  createdAt          DateTime    @default(now()) @map("created_at")
  landListing        LandListing @relation("CollectionPriceHistory", fields: [landListingId], references: [id], onDelete: Cascade)

  @@index([landListingId])
  @@index([priceType])
  @@index([createdAt])
  @@map("collection_price_history")
}
```

## API Endpoints

### Collection Statistics
```
GET /api/collections/[collectionId]/stats
```
Returns comprehensive price statistics including:
- Floor price
- Average price
- 24h volume and sales
- Price change percentage
- Top offer

### Bid Status Management
```
PATCH /api/bids/[bidId]/status
```
Allows collection owners to accept or reject bids with automatic price tracking.

### User Ownership Check
```
GET /api/collections/user-owned?userAddress={address}
```
Returns all collections and tokens owned by a specific wallet address.

## Price Tracking Functions

### Core Functions

#### `trackPriceEvent(data: PriceTrackingData)`
Records any price-related event with automatic change percentage calculation.

#### `updateFloorPrice(landListingId: string)`
Calculates and records the current floor price based on active listings.

#### `updateAveragePrice(landListingId: string)`
Calculates and records the average price based on recent sales and accepted bids.

#### `trackBidEvent(landListingId, bidId, bidAmount, eventType)`
Specialized function for tracking bid-related events with automatic metric updates.

#### `get24hPriceStats(landListingId: string)`
Returns comprehensive 24-hour statistics for a collection.

#### `getPriceHistory(landListingId, timeframe)`
Returns historical price data for charting and analysis.

## Usage Examples

### Testing Price Tracking
```bash
npm run test-price-tracking
```

### Manual Price Updates
```typescript
import { updateFloorPrice, updateAveragePrice } from '@/lib/priceTracking';

// Update floor price for a collection
await updateFloorPrice('collection-id');

// Update average price
await updateAveragePrice('collection-id');
```

### Tracking Custom Events
```typescript
import { trackBidEvent } from '@/lib/priceTracking';

// Track a bid placement
await trackBidEvent('collection-id', 'bid-id', 0.5, 'BID_PLACED');

// Track bid acceptance
await trackBidEvent('collection-id', 'bid-id', 0.5, 'BID_ACCEPTED');
```

## UI Components

### NFTCollectionDetailPage Enhancements
- **Ownership Detection**: Automatically checks user ownership on load and wallet changes
- **Smart Token Display**: Sorts tokens with owned items at bottom
- **Bid Prevention**: Disables bidding UI for owned tokens
- **Visual Indicators**: Shows ownership badges and styling

### Price Statistics Display
- **Real-time Updates**: Statistics refresh when bids are placed/accepted
- **Trend Indicators**: Visual arrows and colors for price changes
- **Comprehensive Metrics**: Floor price, volume, sales, and top offers

## Integration Points

### Bid Creation (`/api/bids/route.ts`)
- Automatically tracks `BID_PLACED` events
- Updates collection metrics when significant bids are placed

### Bid Management (`/api/bids/[bidId]/status/route.ts`)
- Tracks `BID_ACCEPTED` and `BID_REJECTED` events
- Triggers automatic floor price and average price updates
- Creates transaction records for accepted bids

### Collection Statistics (`/api/collections/[collectionId]/stats/route.ts`)
- Uses price tracking system for accurate, real-time statistics
- Automatically updates floor and average prices before returning data

## Performance Considerations

### Efficient Queries
- Indexed database queries for fast price history retrieval
- Optimized ownership checking with case-insensitive matching
- Cached token metadata to reduce redundant API calls

### Background Processing
- Price updates happen asynchronously to avoid blocking user interactions
- Error handling ensures bid operations succeed even if price tracking fails
- Automatic cleanup of old price history records (configurable retention)

## Security Features

### Authorization
- Only collection owners can accept/reject bids
- Case-insensitive address matching prevents bypass attempts
- Comprehensive input validation on all price tracking endpoints

### Data Integrity
- Automatic backup creation before major operations
- Transaction rollback on critical failures
- Comprehensive error logging for debugging

## Monitoring & Analytics

### Logging
- Detailed logs for all price tracking events
- Performance metrics for ownership checking
- Error tracking for failed operations

### Metrics
- Price change trends over time
- Bid acceptance/rejection rates
- Collection activity levels
- User engagement with owned vs. non-owned tokens

## Future Enhancements

### Planned Features
- **Price Alerts**: Notify users of significant price changes
- **Advanced Analytics**: More sophisticated price prediction models
- **Bulk Operations**: Batch processing for multiple collections
- **API Rate Limiting**: Prevent abuse of price tracking endpoints
- **Real-time Updates**: WebSocket integration for live price feeds

### Scalability Improvements
- **Caching Layer**: Redis integration for frequently accessed data
- **Database Optimization**: Partitioning for large price history tables
- **Background Jobs**: Queue system for heavy price calculations
- **CDN Integration**: Cached responses for public statistics

## Troubleshooting

### Common Issues

#### Ownership Not Detected
- Verify wallet connection
- Check for address case sensitivity issues
- Ensure user has an account with the connected wallet

#### Price Statistics Not Updating
- Check database connectivity
- Verify price tracking functions are being called
- Review error logs for failed operations

#### Performance Issues
- Monitor database query performance
- Check for missing indexes on price history table
- Review token metadata caching efficiency

### Debug Commands
```bash
# Test price tracking system
npm run test-price-tracking

# Check database migrations
npx prisma migrate status

# Verify user ownership data
npx prisma studio
```

## Migration Notes

### Database Changes
- New `CollectionPriceHistory` table with proper indexes
- Updated `LandListing` model with price history relation
- Backward compatible with existing data

### API Changes
- Enhanced statistics endpoint with real-time price tracking
- New bid status management endpoint
- Improved user ownership endpoint with case-insensitive matching

### UI Changes
- Non-breaking enhancements to collection detail page
- Progressive enhancement for ownership features
- Graceful degradation when price data is unavailable 