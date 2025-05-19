# PLATZ Land Tokenization Smart Contracts

This repository contains the Ethereum smart contracts for the PLATZ land tokenization platform. These contracts allow for the creation and trading of NFTs that represent land parcels.

## Contracts

### PlatzLandNFT.sol

An ERC-721 token contract that represents land as non-fungible tokens (NFTs). Each token includes:

- A reference to property details
- Information about who created the token and when
- Standard ERC-721 functionality like transfers and approvals

### PlatzLandNFTWithCollections.sol

An enhanced version of the ERC-721 token contract with optimized collection management features:

- Efficient on-chain tracking of collections
- Direct state access for collection data
- Pagination support for large collections
- Batch minting capabilities
- Helper methods for frontend integration

### LandMarketplace.sol

A marketplace contract for trading land NFTs with the following features:

- Fixed-price listings: List your land NFT for a specific price
- Bid-based trading: Make bids on NFTs even if they're not listed
- Owner control: Only the owner of an NFT can list it or accept bids
- Fee structure: Small platform fee on each transaction (configurable)

## Development

### Prerequisites

- Node.js and npm
- Hardhat

### Installation

```bash
# Install dependencies
npm install
```

### Testing

```bash
# Run tests
npx hardhat test
```

### Deployment

To deploy to Sepolia testnet:

1. Set up your `.env` file with:
   - `PRIVATE_KEY`: Your Ethereum private key
   - `SEPOLIA_RPC_URL`: URL to Sepolia node provider
   - `ETHERSCAN_API_KEY`: API key for verification

2. Run deployment:

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

## Usage Flow

1. Create a land NFT:
   - Call `mintLand()` on the PlatzLandNFT contract

2. Sell at a fixed price:
   - Approve the marketplace contract to transfer your NFT
   - Call `createListing()` on LandMarketplace
   - Buyers can purchase with `purchaseListing()`

3. Accept bids:
   - Bidders call `placeBid()` with ETH attached
   - The owner can call `acceptBid()` to accept a bid
   - Bidders can withdraw bids with `withdrawBid()`

## License

MIT

# PLATZ-LANDTOKENIZATION

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Frontend Optimizations

This project includes significant performance optimizations for the frontend:

1. **Optimized Collection Loading**: Collections are loaded using smart contract state queries rather than scanning events when possible, with fallback mechanisms for older contracts.

2. **Skeleton Loading UI**: Improved user experience with skeleton loaders that provide immediate visual feedback during data loading.

3. **Efficient Data Fetching**: Implemented pagination, parallel requests, and smart caching to reduce blockchain RPC usage and improve loading times.

4. **RPC Reliability**: Added fallback mechanisms to automatically retry with alternative RPC endpoints when the primary one fails.

5. **Responsive Components**: The UI is fully responsive and provides appropriate loading, error, and empty states.

To build the optimized production version:

```bash
npm run build:optimized
```

## Smart Contracts

The project utilizes two primary smart contracts:

1. **PlatzLandNFT**: The original NFT contract for land tokenization.
2. **PlatzLandNFTWithCollections**: An enhanced version that adds direct collection tracking and efficient querying capabilities.

The deployed contract addresses for Sepolia testnet are:
```
# Original contract
0x3634a1Da3bb8f2F81D7c7db37aF99A2E4F788190

# New collections contract (recommended)
0xc2Fba30e5d703c237C7fE94E861E34ffA1536b36
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
