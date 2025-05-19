# PlatzLand NFT Deployment Guide

This guide outlines the steps to deploy, verify, and configure your PlatzLand NFT smart contract and frontend.

## Contract Deployment Status

Two versions of the contract have been deployed:

1. **Original PlatzLandNFT**:
   - Deployed to Sepolia at: `0x3634a1Da3bb8f2F81D7c7db37aF99A2E4F788190`
   - This is the original contract without the optimized collections functionality

2. **PlatzLandNFTWithCollections** (New Version):
   - Deployed to Sepolia at: `0xc2Fba30e5d703c237C7fE94E861E34ffA1536b36`
   - This version has optimized collection management with direct state access
   - Added methods: `getCollectionCount()`, `getCollectionsPaginated()`, etc.

## Step 1: Verify Contract on Etherscan

The new contract needs to be verified on Etherscan so that users can view and interact with it:

```bash
# For the new collections contract
npx hardhat verify --network sepolia 0xc2Fba30e5d703c237C7fE94E861E34ffA1536b36 0x3ec4bfe3167ba77A5906C034AABE5537BA7c4B07

# For the original contract (if needed)
npx hardhat verify --network sepolia 0x3634a1Da3bb8f2F81D7c7db37aF99A2E4F788190 0x3ed58788ab7ca932c3b3b52a9c58f81b7a4f77ad
```

If you encounter bytecode mismatch errors, try these steps:

1. Ensure your hardhat.config.ts contains the correct network configuration:
   ```typescript
   sepolia: {
     url: "https://eth-sepolia.public.blastapi.io",
     accounts: ["YOUR_PRIVATE_KEY"],
     timeout: 60000,
     gasMultiplier: 1.2
   }
   ```

2. Recompile your contracts with the force flag:
   ```bash
   npx hardhat compile --force
   ```

3. If the contract was deployed with a different version or configuration than what's currently in your codebase, you may need to:
   - Check the deployed bytecode against your compiled contract
   - Adjust your Solidity compiler settings in hardhat.config.ts
   - Verify manually through Etherscan's UI with the correct Solidity version and optimizer settings

## Step 2: Update Frontend Environment

Ensure your frontend is properly configured to use the deployed contract:

1. Update or confirm that your `.env.local` file contains:
   ```
   # Use the new collections contract
   NFT_CONTRACT_ADDRESS=0xc2Fba30e5d703c237C7fE94E861E34ffA1536b36
   
   # Or use the original contract if needed
   # NFT_CONTRACT_ADDRESS=0x3634a1Da3bb8f2F81D7c7db37aF99A2E4F788190
   ```

2. Check that your config/contracts.ts file references this environment variable:
   ```typescript
   export const PLATZ_LAND_NFT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS || "0xc2Fba30e5d703c237C7fE94E861E34ffA1536b36";
   ```

3. If using both development and production environments, also ensure the localhost reference is updated:
   ```typescript
   export const LOCALHOST_PLATZ_LAND_NFT_ADDRESS = "0xc2Fba30e5d703c237C7fE94E861E34ffA1536b36";
   ```

## Implemented Frontend Optimizations

The following frontend optimizations have been successfully implemented:

1. **Efficient Collection Fetching**: The codebase now uses `lib/fetchCollections.ts` which:
   - Attempts to use direct contract state queries with `getCollectionCount()` and `getCollectionsPaginated()`
   - Falls back to event scanning for older contracts
   - Implements pagination to avoid loading too many collections at once

2. **React Hook for Collections**: The `useCollections` hook in `hooks/useCollections.ts`:
   - Handles loading, error states, and pagination
   - Caches results to prevent redundant blockchain requests
   - Supports infinite scrolling with the `loadNextPage()` function

3. **Skeleton Loading UI**: The `CollectionLoadingWrapper` component:
   - Provides immediate visual feedback during loading
   - Supports different skeleton variants (card, list)
   - Shows appropriate error messages

4. **Optimized Collection Display**: The `CollectionsGrid` component: 
   - Implements the optimized loading pattern
   - Handles empty states and errors
   - Supports "Load More" pagination

5. **Fallback RPC Mechanism**: The system now has robust RPC endpoint handling:
   - Tries multiple endpoints if the primary one fails
   - Added timeout configuration to prevent hanging requests
   - Provides helpful error messages when network issues occur

6. **Caching Optimizations**:
   - Collections are cached in React state to minimize re-fetching
   - Metadata is loaded in parallel using Promise.all
   - Images have fallback placeholders to handle loading errors

## Troubleshooting

If you encounter issues:

1. Check browser console for errors
2. Verify your RPC connections are working
3. Ensure your wallet is connected to the Sepolia network
4. Verify contract ABIs match the deployed contract
5. Check that you have sufficient ETH for gas fees

## Next Steps

After deployment:
1. Run comprehensive tests on the Sepolia testnet
2. Monitor performance and gas usage
3. Consider implementing a more robust caching strategy
4. Plan for mainnet deployment 