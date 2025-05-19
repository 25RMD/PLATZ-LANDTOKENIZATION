const hre = require("hardhat");
const { ethers, run, network } = hre;

async function main() {
  console.log("Deploying PlatzLandNFTWithCollections contract...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Contract parameters
  const nftName = "PlatzLand Token";
  const nftSymbol = "PLATZ";
  
  // Deploy PlatzLandNFTWithCollections
  console.log("Deploying PlatzLandNFTWithCollections...");
  const PlatzLandNFTFactory = await ethers.getContractFactory("PlatzLandNFTWithCollections");
  const platzLandNFT = await PlatzLandNFTFactory.deploy(nftName, nftSymbol);
  await platzLandNFT.waitForDeployment();
  const platzLandNFTAddress = await platzLandNFT.getAddress();
  
  console.log(`PlatzLandNFTWithCollections deployed to: ${platzLandNFTAddress}`);
  
  // Write the contract address to .env.local file for easy access
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '../../.env.local');
  
  try {
    // Read existing .env.local file
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update or add NFT_CONTRACT_ADDRESS
    if (envContent.includes('NFT_CONTRACT_ADDRESS=')) {
      envContent = envContent.replace(
        /NFT_CONTRACT_ADDRESS=.*/,
        `NFT_CONTRACT_ADDRESS=${platzLandNFTAddress}`
      );
    } else {
      envContent += `\nNFT_CONTRACT_ADDRESS=${platzLandNFTAddress}\n`;
    }
    
    // Write back to .env.local
    fs.writeFileSync(envPath, envContent);
    console.log(`.env.local updated with NFT_CONTRACT_ADDRESS=${platzLandNFTAddress}`);
  } catch (error) {
    console.warn("Failed to update .env.local file:", error.message);
  }
  
  // Verify on Etherscan if we're on a supported network
  if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
    console.log("Waiting for block confirmations before verification...");
    
    // Wait for 30 seconds to ensure the contract is propagated
    await new Promise(resolve => setTimeout(resolve, 30000)); // 30s delay
    
    console.log("Verifying PlatzLandNFTWithCollections on Etherscan...");
    try {
      await run("verify:verify", {
        address: platzLandNFTAddress,
        constructorArguments: [nftName, nftSymbol],
        contract: "contracts/PlatzLandNFTWithCollections.sol:PlatzLandNFTWithCollections"
      });
      console.log("PlatzLandNFTWithCollections verified successfully.");
    } catch (e) {
      if (e instanceof Error) {
        if (e.message.toLowerCase().includes("already verified")) {
          console.log("PlatzLandNFTWithCollections is already verified.");
        } else {
          console.error("PlatzLandNFTWithCollections verification failed:", e);
        }
      } else {
        console.error("PlatzLandNFTWithCollections verification failed with unknown error type:", e);
      }
    }
  } else {
    console.log("Skipping verification: Not on Sepolia or Etherscan API key not set.");
  }
  
  console.log("Deployment and verification process completed.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 