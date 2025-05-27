# How to Add Your Minted NFTs to MetaMask

If your NFTs were minted successfully but don't appear in MetaMask, follow these steps to manually add them.

## Prerequisites

1. **Correct Network**: Ensure you're connected to **Sepolia Testnet** in MetaMask
2. **Contract Address**: You'll need the NFT contract address (check your `.env` file for `NFT_CONTRACT_ADDRESS`)
3. **Token IDs**: You'll need the specific token IDs that were minted to your wallet

## Step 1: Verify Your NFTs Were Minted Correctly

First, let's verify your NFTs exist and are owned by your wallet:

```bash
# Run the verification script
node scripts/verify-nft-ownership.js YOUR_WALLET_ADDRESS COLLECTION_ID

# Example:
node scripts/verify-nft-ownership.js 0x1234567890123456789012345678901234567890 1
```

This will show you:
- ✅ Which tokens you actually own
- ❌ Which tokens are owned by other addresses (like the server wallet)
- 📋 Collection details and token IDs

## Step 2: Add NFTs to MetaMask Manually

### Method 1: Using MetaMask NFT Tab

1. **Open MetaMask** and ensure you're on **Sepolia Testnet**
2. **Click the "NFTs" tab** (next to "Tokens")
3. **Click "Import NFT"** at the bottom
4. **Enter the details**:
   - **Address**: Your NFT contract address (from `.env` file)
   - **Token ID**: The specific token ID you own (from verification script)
5. **Click "Import"**

### Method 2: Using Etherscan

1. **Go to Sepolia Etherscan**: https://sepolia.etherscan.io/
2. **Search for your contract address**
3. **Go to the "Contract" tab** and then "Read Contract"
4. **Use `ownerOf` function** with your token ID to verify ownership
5. **Use `tokenURI` function** to see the metadata

### Method 3: Using OpenSea Testnet

1. **Go to OpenSea Testnet**: https://testnets.opensea.io/
2. **Connect your MetaMask wallet**
3. **Search for your contract address**
4. **Your NFTs should appear in your profile**

## Step 3: Troubleshooting Common Issues

### Issue 1: NFTs Minted to Server Wallet Instead of Your Wallet

**Symptoms**: Verification script shows NFTs owned by a different address

**Solution**: 
- Check the server logs during minting for the `ownerAddress` parameter
- Ensure your wallet is connected when minting
- Verify the frontend is sending your wallet address correctly

### Issue 2: NFTs Not Visible in MetaMask

**Symptoms**: You own the NFTs but they don't appear in MetaMask

**Solutions**:
1. **Refresh MetaMask**: Close and reopen the extension
2. **Switch Networks**: Switch to mainnet and back to Sepolia
3. **Clear Cache**: Clear MetaMask cache in browser settings
4. **Manual Import**: Use the import NFT feature as described above

### Issue 3: Contract Not Found

**Symptoms**: MetaMask can't find the contract

**Solutions**:
1. **Verify Contract Address**: Double-check the contract address in your `.env` file
2. **Check Network**: Ensure you're on the correct network (Sepolia)
3. **Wait for Confirmation**: Ensure the minting transaction was confirmed

## Step 4: Environment Variables Check

Verify your `.env` file has the correct values:

```bash
# Check these environment variables
NFT_CONTRACT_ADDRESS=0x... # Should be a valid contract address, not 0x0000...
SEPOLIA_RPC_URL=https://... # Should be a working Sepolia RPC URL
SERVER_WALLET_PRIVATE_KEY=0x... # Server wallet private key (for gas payments)
```

## Step 5: Debug Minting Process

If NFTs are consistently minted to the wrong address, add these debug logs:

1. **Frontend**: Check browser console for wallet address logs
2. **Backend**: Check server logs for recipient address confirmation
3. **Blockchain**: Use the verification script to see actual ownership

## Example: Complete Verification Flow

```bash
# 1. Check your wallet address in MetaMask
# Copy your wallet address (0x...)

# 2. Find your collection ID
# Check the minting success response or database

# 3. Run verification
node scripts/verify-nft-ownership.js 0xYourWalletAddress 1

# 4. If NFTs are owned by your wallet, manually import to MetaMask
# If NFTs are owned by server wallet, check the minting logs

# 5. Check transaction on Etherscan
# Go to https://sepolia.etherscan.io/tx/YOUR_TRANSACTION_HASH
```

## Getting Help

If you're still having issues:

1. **Check Server Logs**: Look for minting-related logs with recipient addresses
2. **Verify Transaction**: Check the transaction hash on Etherscan
3. **Run Verification Script**: Use the provided script to see actual ownership
4. **Check Network**: Ensure you're on Sepolia testnet in MetaMask

## Contract Information

- **Network**: Sepolia Testnet
- **Contract Type**: ERC-721 (NFT)
- **Contract Address**: Check your `.env` file for `NFT_CONTRACT_ADDRESS`
- **Explorer**: https://sepolia.etherscan.io/ 