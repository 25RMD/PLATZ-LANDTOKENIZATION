import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy PlatzLandNFT contract
  const PlatzLandNFT = await hre.ethers.getContractFactory("PlatzLandNFT");
  const platzLandNFT = await PlatzLandNFT.deploy(deployer.address);
  await platzLandNFT.waitForDeployment();

  const platzLandNFTAddress = await platzLandNFT.getAddress();
  console.log("PlatzLandNFT deployed to:", platzLandNFTAddress);

  // Deploy LandMarketplace contract
  const LandMarketplace = await hre.ethers.getContractFactory("LandMarketplace");
  const landMarketplace = await LandMarketplace.deploy(deployer.address);
  await landMarketplace.waitForDeployment();

  const landMarketplaceAddress = await landMarketplace.getAddress();
  console.log("LandMarketplace deployed to:", landMarketplaceAddress);

  console.log("Deployment complete!");
  
  // Optionally, save the contract addresses
  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const contractsDir = path.join(__dirname, '..', 'contract-addresses');
  
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  fs.writeFileSync(
      path.join(contractsDir, 'contracts.json'),
      JSON.stringify(
        {
          PlatzLandNFT: platzLandNFTAddress,
          LandMarketplace: landMarketplaceAddress,
        },
        null,
        2
      )
  );

    console.log('Contract addresses saved to contract-addresses/contracts.json');
  } catch (error) {
    console.log('Failed to save contract addresses:', error);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
  console.error(error);
    process.exit(1);
});
