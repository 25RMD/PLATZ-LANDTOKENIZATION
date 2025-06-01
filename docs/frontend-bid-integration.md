# Frontend Bid Integration Guide

## Overview
This guide shows how to integrate with the reliable bid data API that works even when blockchain calls are unreliable.

## API Endpoint
```
GET /api/tokens/{tokenId}/bid-info
```

## Response Format
```typescript
interface BidInfo {
  tokenId: number;
  currentBid: number | null;
  minimumBid: number;
  bidder: {
    address: string;
    username: string;
  } | null;
  hasActiveBid: boolean;
  status: 'has_bids' | 'no_bids';
  message: string;
  lastUpdated: string | null;
  source: 'database';
}
```

## Frontend Implementation

### 1. Fetch Bid Data
```typescript
const fetchBidInfo = async (tokenId: number): Promise<BidInfo> => {
  try {
    const response = await fetch(`/api/tokens/${tokenId}/bid-info`);
    if (!response.ok) throw new Error('Failed to fetch bid info');
    return await response.json();
  } catch (error) {
    console.error('Error fetching bid info:', error);
    // Return safe defaults
    return {
      tokenId,
      currentBid: null,
      minimumBid: 0.001,
      bidder: null,
      hasActiveBid: false,
      status: 'no_bids',
      message: 'Unable to load bid data. Minimum bid: 0.001 ETH',
      lastUpdated: null,
      source: 'database'
    };
  }
};
```

### 2. Display Current Bid Status
```tsx
const BidDisplay = ({ tokenId }: { tokenId: number }) => {
  const [bidInfo, setBidInfo] = useState<BidInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBidInfo(tokenId).then(data => {
      setBidInfo(data);
      setLoading(false);
    });
  }, [tokenId]);

  if (loading) return <div>Loading bid information...</div>;
  if (!bidInfo) return <div>Unable to load bid data</div>;

  return (
    <div className="bid-info">
      {bidInfo.hasActiveBid ? (
        <div className="current-bid">
          <h3>Current Highest Bid</h3>
          <p className="bid-amount">{bidInfo.currentBid} ETH</p>
          <p className="bidder">by {bidInfo.bidder?.username || 'Anonymous'}</p>
          <p className="minimum">Minimum next bid: {bidInfo.minimumBid} ETH</p>
        </div>
      ) : (
        <div className="no-bids">
          <h3>No Bids Yet</h3>
          <p>Be the first to bid! Minimum: {bidInfo.minimumBid} ETH</p>
        </div>
      )}
    </div>
  );
};
```

### 3. Bid Input with Validation
```tsx
const BidInput = ({ tokenId, onBidSubmit }: { 
  tokenId: number; 
  onBidSubmit: (amount: number) => void; 
}) => {
  const [bidInfo, setBidInfo] = useState<BidInfo | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBidInfo(tokenId).then(setBidInfo);
  }, [tokenId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bidInfo) {
      setError('Bid information not loaded');
      return;
    }

    const amount = parseFloat(bidAmount);
    
    if (isNaN(amount) || amount < bidInfo.minimumBid) {
      setError(`Bid must be at least ${bidInfo.minimumBid} ETH`);
      return;
    }

    // Refresh bid info right before submission
    const latestBidInfo = await fetchBidInfo(tokenId);
    if (amount < latestBidInfo.minimumBid) {
      setError(`Bid too low! Minimum is now ${latestBidInfo.minimumBid} ETH`);
      setBidInfo(latestBidInfo);
      return;
    }

    setError('');
    onBidSubmit(amount);
  };

  if (!bidInfo) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="bid-form">
      <div className="bid-context">
        <p>{bidInfo.message}</p>
      </div>
      
      <div className="input-group">
        <input
          type="number"
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
          min={bidInfo.minimumBid}
          step="0.001"
          placeholder={`Minimum: ${bidInfo.minimumBid} ETH`}
          className="bid-input"
        />
        <span className="currency">ETH</span>
      </div>
      
      {error && <p className="error">{error}</p>}
      
      <button 
        type="submit" 
        disabled={!bidAmount || parseFloat(bidAmount) < bidInfo.minimumBid}
        className="bid-button"
      >
        Place Bid
      </button>
    </form>
  );
};
```

### 4. Real-time Updates
```typescript
// Refresh bid info after successful bid placement
const handleBidSuccess = async (tokenId: number) => {
  // Wait a moment for database to update
  setTimeout(async () => {
    const updatedBidInfo = await fetchBidInfo(tokenId);
    setBidInfo(updatedBidInfo);
  }, 1000);
};

// Periodic refresh for active auctions
useEffect(() => {
  if (!tokenId) return;
  
  const interval = setInterval(async () => {
    const updatedBidInfo = await fetchBidInfo(tokenId);
    setBidInfo(updatedBidInfo);
  }, 30000); // Refresh every 30 seconds
  
  return () => clearInterval(interval);
}, [tokenId]);
```

## Key Benefits

1. **✅ Reliable Data**: Always returns data, even when blockchain is unavailable
2. **✅ Fast Response**: Database queries are much faster than blockchain calls
3. **✅ Rich Information**: Includes bidder info, timestamps, and clear messages
4. **✅ Error Handling**: Graceful fallbacks and clear error states
5. **✅ User-Friendly**: Clear validation and helpful messages

## Important Notes

- The API uses database as the source of truth for bid data
- Data is kept in sync through the bid placement API
- Frontend should refresh data after successful bid placement
- Input validation prevents most bid failures before blockchain submission
- The `minimumBid` field should be used to set input constraints

## Migration from Old API

Replace calls to blockchain-dependent endpoints with:
```typescript
// OLD (unreliable)
const response = await fetch(`/api/tokens/${tokenId}/minimum-bid`);

// NEW (reliable)  
const response = await fetch(`/api/tokens/${tokenId}/bid-info`);
``` 