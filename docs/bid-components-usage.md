# Bid Components Usage Guide

## Quick Start

### 1. Simple Integration (Recommended)
Use the complete `BidInterface` component for full functionality:

```tsx
import { BidInterface } from '@/components';

const TokenPage = ({ tokenId, collectionId, userAddress }) => {
  return (
    <div className="token-page">
      <h1>Token #{tokenId}</h1>
      
      {/* Complete bid interface with display + form */}
      <BidInterface
        tokenId={tokenId}
        collectionId={collectionId}
        userAddress={userAddress}
        className="mt-6"
      />
    </div>
  );
};
```

### 2. Separate Components
Use individual components for custom layouts:

```tsx
import { BidDisplay, BidForm } from '@/components';

const CustomTokenPage = ({ tokenId, collectionId, userAddress }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left column - Token info */}
      <div>
        <h1>Token #{tokenId}</h1>
        <img src={`/api/tokens/${tokenId}/image`} alt="Token" />
      </div>
      
      {/* Right column - Bidding */}
      <div className="space-y-4">
        <BidDisplay tokenId={tokenId} />
        <BidForm
          tokenId={tokenId}
          collectionId={collectionId}
          userAddress={userAddress}
        />
      </div>
    </div>
  );
};
```

### 3. Display Only
Show bid information without the form:

```tsx
import { BidDisplay } from '@/components';

const TokenCard = ({ tokenId }) => {
  return (
    <div className="token-card">
      <img src={`/api/tokens/${tokenId}/image`} alt="Token" />
      <BidDisplay tokenId={tokenId} autoRefresh={false} />
    </div>
  );
};
```

## Advanced Usage

### Custom Bid Success Handling
```tsx
import { BidForm } from '@/components';

const TokenPageWithAnalytics = ({ tokenId, collectionId, userAddress }) => {
  const handleBidSuccess = (bidAmount: number) => {
    // Custom analytics tracking
    analytics.track('bid_placed', {
      tokenId,
      bidAmount,
      timestamp: new Date().toISOString()
    });
    
    // Show custom notification
    toast.success(`Bid of ${bidAmount} ETH placed successfully!`);
    
    // Redirect or update UI
    router.push(`/tokens/${tokenId}/success`);
  };

  return (
    <BidForm
      tokenId={tokenId}
      collectionId={collectionId}
      userAddress={userAddress}
      onBidSuccess={handleBidSuccess}
    />
  );
};
```

### Using the Hook Directly
```tsx
import { useBidInfo, formatBidAmount } from '@/components';

const CustomBidComponent = ({ tokenId }) => {
  const { bidInfo, loading, error, refresh } = useBidInfo({ 
    tokenId,
    autoRefresh: true,
    refreshInterval: 15000 // 15 seconds
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!bidInfo) return <div>No data</div>;

  return (
    <div className="custom-bid-display">
      <h3>Current Status</h3>
      {bidInfo.hasActiveBid ? (
        <p>Highest bid: {formatBidAmount(bidInfo.currentBid)}</p>
      ) : (
        <p>No bids yet</p>
      )}
      <button onClick={refresh}>Refresh</button>
    </div>
  );
};
```

### Service Layer Usage
```tsx
import { fetchBidInfo, submitBid, validateBidAmount } from '@/components';

const CustomBidLogic = async (tokenId: number, bidAmount: number) => {
  // Get current bid info
  const bidInfo = await fetchBidInfo(tokenId);
  
  // Validate the bid
  const validation = validateBidAmount(bidAmount, bidInfo);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  // Submit the bid (after blockchain transaction)
  const result = await submitBid({
    collectionId: '16',
    tokenId: tokenId.toString(),
    bidAmount,
    transactionHash: '0x...',
    bidderAddress: '0x...'
  });
  
  return result;
};
```

## Integration with Existing Pages

### NFT Collection Detail Page
```tsx
// In your existing NFTCollectionDetailPage.tsx
import { BidInterface } from '@/components';

const NFTCollectionDetailPage = ({ collection, token, user }) => {
  return (
    <div className="nft-detail-page">
      {/* Existing content */}
      <div className="token-info">
        <h1>{token.name}</h1>
        <img src={token.image} alt={token.name} />
      </div>
      
      {/* Add bid interface */}
      <div className="bid-section">
        <h2>Place Your Bid</h2>
        <BidInterface
          tokenId={token.id}
          collectionId={collection.id}
          userAddress={user?.evmAddress}
        />
      </div>
    </div>
  );
};
```

### Token List/Grid View
```tsx
import { BidDisplay } from '@/components';

const TokenGrid = ({ tokens }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {tokens.map(token => (
        <div key={token.id} className="token-card">
          <img src={token.image} alt={token.name} />
          <h3>{token.name}</h3>
          <BidDisplay 
            tokenId={token.id} 
            autoRefresh={false}
            className="mt-2"
          />
        </div>
      ))}
    </div>
  );
};
```

## Styling and Customization

### Custom CSS Classes
The components use Tailwind CSS classes by default, but you can override them:

```tsx
<BidInterface
  tokenId={tokenId}
  collectionId={collectionId}
  userAddress={userAddress}
  className="my-custom-bid-interface"
/>
```

```css
/* In your CSS file */
.my-custom-bid-interface .bid-display {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.my-custom-bid-interface .bid-form button {
  background: #ff6b6b;
  border: none;
}
```

### Theme Integration
```tsx
import { BidInterface } from '@/components';
import { useTheme } from '@/hooks/useTheme';

const ThemedBidInterface = (props) => {
  const { theme } = useTheme();
  
  return (
    <BidInterface
      {...props}
      className={`
        ${theme === 'dark' ? 'dark-theme' : 'light-theme'}
        ${props.className || ''}
      `}
    />
  );
};
```

## Error Handling

### Global Error Boundary
```tsx
import { ErrorBoundary } from 'react-error-boundary';
import { BidInterface } from '@/components';

const SafeBidInterface = (props) => {
  return (
    <ErrorBoundary
      fallback={
        <div className="error-fallback">
          <p>Something went wrong with the bid interface.</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      }
    >
      <BidInterface {...props} />
    </ErrorBoundary>
  );
};
```

## Performance Optimization

### Lazy Loading
```tsx
import { lazy, Suspense } from 'react';

const BidInterface = lazy(() => import('@/components').then(m => ({ default: m.BidInterface })));

const TokenPage = (props) => {
  return (
    <div>
      <h1>Token Details</h1>
      <Suspense fallback={<div>Loading bid interface...</div>}>
        <BidInterface {...props} />
      </Suspense>
    </div>
  );
};
```

### Memoization
```tsx
import { memo } from 'react';
import { BidDisplay } from '@/components';

const MemoizedBidDisplay = memo(BidDisplay, (prevProps, nextProps) => {
  return prevProps.tokenId === nextProps.tokenId;
});
```

## Testing

### Component Testing
```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BidForm } from '@/components';

test('validates bid amount correctly', async () => {
  render(
    <BidForm
      tokenId={106}
      collectionId="16"
      userAddress="0x123..."
    />
  );
  
  const input = screen.getByLabelText(/bid amount/i);
  fireEvent.change(input, { target: { value: '0.0005' } });
  
  await waitFor(() => {
    expect(screen.getByText(/bid must be at least/i)).toBeInTheDocument();
  });
});
```

## Migration from Old Components

### Replace Old Bid Components
```tsx
// OLD
import { OldBidComponent } from './old-components';

// NEW
import { BidInterface } from '@/components';

// Replace this:
<OldBidComponent tokenId={tokenId} />

// With this:
<BidInterface
  tokenId={tokenId}
  collectionId={collectionId}
  userAddress={userAddress}
/>
```

### API Migration
```tsx
// OLD API calls
const response = await fetch(`/api/tokens/${tokenId}/minimum-bid`);

// NEW API calls (handled automatically by components)
import { fetchBidInfo } from '@/components';
const bidInfo = await fetchBidInfo(tokenId);
``` 