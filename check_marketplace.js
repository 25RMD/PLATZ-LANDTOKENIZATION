const { ethers } = require("hardhat");

async function main() {
  // Get the contract address from env or config
  const MARKETPLACE_ADDRESS = process.env.MARKETPLACE_CONTRACT_ADDRESS || "0x6b2956dCadCe4c2De0a6c5Dd9dA1a8a52c30d5D9";
  const NFT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS || "0x155e70f694E645907d36583Cca893BE52bf3A29f";
  
  console.log("Checking marketplace listings...");
  console.log("Marketplace Address:", MARKETPLACE_ADDRESS);
  console.log("NFT Address:", NFT_ADDRESS);
  
  // Get the contract factory
  const LandMarketplace = await ethers.getContractFactory("LandMarketplace");
  const marketplace = LandMarketplace.attach(MARKETPLACE_ADDRESS);
  
  // Check collection ID 27 (the latest from API)
  const collectionId = 27;
  console.log(`\nChecking collection ${collectionId}...`);
  
  try {
    const listing = await marketplace.collectionListings(collectionId);
    console.log("Collection listing:", {
      seller: listing[0],
      mainTokenId: listing[1].toString(),
      price: ethers.formatEther(listing[2]),
      paymentToken: listing[3],
      isActive: listing[4]
    });
  } catch (error) {
    console.log("Error checking collection listing:", error.message);
  }
  
  // Also check getCollectionListing function if it exists
  try {
    const listing2 = await marketplace.getCollectionListing(collectionId);
    console.log("getCollectionListing result:", {
      seller: listing2[0],
      mainTokenId: listing2[1].toString(),
      price: ethers.formatEther(listing2[2]),
      paymentToken: listing2[3],
      isActive: listing2[4]
    });
  } catch (error) {
    console.log("getCollectionListing not available or error:", error.message);
  }
}

main().catch(console.error);
