#!/bin/bash
# Script to deploy and verify the PlatzLandNFTWithCollections contract

# Set variables
NETWORK=${1:-sepolia}  # Default to sepolia if no argument provided
SCRIPT_DIR=$(dirname "$0")
SMART_CONTRACTS_DIR="$SCRIPT_DIR/../smart-contracts"

echo "======================================"
echo "Deploying and verifying PlatzLandNFTWithCollections on $NETWORK"
echo "======================================"

# Navigate to the smart contracts directory
cd "$SMART_CONTRACTS_DIR" || { echo "Failed to navigate to smart contracts directory"; exit 1; }

# Step 1: Deploy the contract
echo "Step 1: Deploying contract..."
npx hardhat run scripts/deploy-collections.js --network $NETWORK

# Check if deployment was successful
if [ $? -ne 0 ]; then
  echo "Contract deployment failed. Exiting."
  exit 1
fi

# Let the blockchain confirm the transaction
echo "Waiting 30 seconds for blockchain confirmation..."
sleep 30

# Step 2: Verify the contract
echo "Step 2: Verifying contract..."
node ../scripts/verifyContract.js

echo "======================================"
echo "Deployment and verification process completed"
echo "======================================"

# Return to original directory
cd - > /dev/null 