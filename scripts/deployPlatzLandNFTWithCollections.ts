// scripts/deployPlatzLandNFTWithCollections.ts
import hre from "hardhat";
const { ethers } = hre;
import * as fs from "fs";
import * as path from "path";

const CONTRACT_CONFIG_PATH = path.join(process.cwd(), "config/contracts.ts");
const ENV_EXAMPLE_PATH = path.join(process.cwd(), ".env.local.example");

async function main() {
  // Get the deployer's wallet
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);

  // Get balance before deployment
  const balanceBefore = await ethers.provider.getBalance(deployer.address);
  console.log(`Account balance before deployment: ${ethers.formatEther(balanceBefore)} ETH`);

  // Deploy the new contract version
  console.log("Deploying PlatzLandNFTWithCollections contract...");
  const Factory = await ethers.getContractFactory("PlatzLandNFTWithCollections");
  const platzLandNFT = await Factory.deploy(deployer.address);
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

// Function to update contract addresses in config/contracts.ts and .env.local.example
function updateContractAddresses(contractAddress: string) {
  console.log("Updating contract configurations...");

  try {
    // Read the existing file
    let content = fs.readFileSync(CONTRACT_CONFIG_PATH, "utf8");
    
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
    fs.writeFileSync(CONTRACT_CONFIG_PATH, content);
    console.log(`Updated contract addresses in ${CONTRACT_CONFIG_PATH}`);
    
    // Append to .env.local.example
    const envExampleContent = `# Added by deployment script
NFT_CONTRACT_ADDRESS=${contractAddress}
`;
    fs.writeFileSync(ENV_EXAMPLE_PATH, envExampleContent, { flag: 'a' });
    console.log(`Appended contract address to ${ENV_EXAMPLE_PATH}`);
  } catch (error) {
    console.error("Error updating config file:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
