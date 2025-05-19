const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Get the deployer's wallet
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);

  // Get balance before deployment
  const balanceBefore = await ethers.provider.getBalance(deployer.address);
  console.log(`Account balance before deployment: ${ethers.formatEther(balanceBefore)} ETH`);

  // Deploy the new contract version with collections support
  console.log("Deploying PlatzLandNFTWithCollections contract...");
  
  // Use the updated contract name
  const PlatzLandNFTWithCollections = await ethers.getContractFactory("PlatzLandNFTWithCollections");
  const platzLandNFT = await PlatzLandNFTWithCollections.deploy(deployer.address);
  await platzLandNFT.waitForDeployment();

  const contractAddress = await platzLandNFT.getAddress();
  console.log(`PlatzLandNFTWithCollections deployed to: ${contractAddress}`);

  // Get balance after deployment to see gas cost
  const balanceAfter = await ethers.provider.getBalance(deployer.address);
  console.log(`Account balance after deployment: ${ethers.formatEther(balanceAfter)} ETH`);
  console.log(`Deployment cost: ${ethers.formatEther(balanceBefore - balanceAfter)} ETH`);

  // Update the contract addresses in config file
  updateContractAddresses(contractAddress);

  console.log("Deployment completed successfully!");
  console.log("");
  console.log("Next steps:");
  console.log("1. Verify the contract on Etherscan");
  console.log(`   npx hardhat verify --network sepolia ${contractAddress} ${deployer.address}`);
  console.log("2. Update your .env.local file with the NFT contract address:");
  console.log(`   NFT_CONTRACT_ADDRESS=${contractAddress}`);
}

function updateContractAddresses(contractAddress) {
  // Path to the config file
  const configPath = path.resolve(__dirname, "../config/contracts.ts");
  
  try {
    // Read the existing file
    let content = fs.readFileSync(configPath, "utf8");
    
    // Update the NFT contract address
    content = content.replace(
      /export const PLATZ_LAND_NFT_ADDRESS = .+;/,
      `export const PLATZ_LAND_NFT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS || "${contractAddress}";`
    );
    
    // Update the localhost address as well
    content = content.replace(
      /export const LOCALHOST_PLATZ_LAND_NFT_ADDRESS = .+;/,
      `export const LOCALHOST_PLATZ_LAND_NFT_ADDRESS = "${contractAddress}";`
    );
    
    // Write updated content
    fs.writeFileSync(configPath, content);
    console.log(`Updated contract addresses in ${configPath}`);
    
    // Also update .env.local file
    const envLocalPath = path.resolve(__dirname, "../.env.local");
    
    try {
      let envContent = fs.readFileSync(envLocalPath, "utf8");
      
      // Update or add NFT contract address
      if (envContent.includes("NFT_CONTRACT_ADDRESS=")) {
        envContent = envContent.replace(
          /NFT_CONTRACT_ADDRESS=.+/,
          `NFT_CONTRACT_ADDRESS=${contractAddress}`
        );
      } else {
        envContent += `\n\n# Contract address (updated by deployment script)\nNFT_CONTRACT_ADDRESS=${contractAddress}\n`;
      }
      
      fs.writeFileSync(envLocalPath, envContent);
      console.log(`Updated contract address in ${envLocalPath}`);
    } catch (err) {
      // If .env.local doesn't exist, create .env.local.example
      const envExamplePath = path.resolve(__dirname, "../.env.local.example");
      const envExampleContent = `# Added by deployment script
# New PlatzLandNFTWithCollections contract address
NFT_CONTRACT_ADDRESS=${contractAddress}
`;
      
      fs.writeFileSync(envExamplePath, envExampleContent, { flag: 'a' });
      console.log(`Added contract address to ${envExamplePath}`);
    }
  } catch (error) {
    console.error("Error updating config file:", error);
  }
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 