import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying LandMarketplace with the account:", deployer.address);

  // Deploy LandMarketplace contract
  const LandMarketplace = await hre.ethers.getContractFactory("LandMarketplace");
  const landMarketplace = await LandMarketplace.deploy(deployer.address);
  await landMarketplace.waitForDeployment();

  const landMarketplaceAddress = await landMarketplace.getAddress();
  console.log("LandMarketplace deployed to:", landMarketplaceAddress);

  // Optionally, update .env.local
  const envPath = path.join(process.cwd(), ".env.local");
  try {
    let envContent = fs.readFileSync(envPath, "utf8");
    if (envContent.includes("MARKETPLACE_CONTRACT_ADDRESS=")) {
      envContent = envContent.replace(
        /MARKETPLACE_CONTRACT_ADDRESS=.*/,
        `MARKETPLACE_CONTRACT_ADDRESS=${landMarketplaceAddress}`
      );
    } else {
      envContent += `\nMARKETPLACE_CONTRACT_ADDRESS=${landMarketplaceAddress}\n`;
    }
    fs.writeFileSync(envPath, envContent);
    console.log(`Updated MARKETPLACE_CONTRACT_ADDRESS in .env.local`);
  } catch (e) {
    console.warn("Could not update .env.local:", e);
  }

  // Optionally, update config/contracts.ts
  const configPath = path.join(process.cwd(), "config/contracts.ts");
  try {
    let configContent = fs.readFileSync(configPath, "utf8");
    configContent = configContent.replace(
      /export const MARKETPLACE_CONTRACT_ADDRESS = .+;/,
      `export const MARKETPLACE_CONTRACT_ADDRESS = process.env.MARKETPLACE_CONTRACT_ADDRESS || \"${landMarketplaceAddress}\";`
    );
    fs.writeFileSync(configPath, configContent);
    console.log(`Updated MARKETPLACE_CONTRACT_ADDRESS in config/contracts.ts`);
  } catch (e) {
    console.warn("Could not update config/contracts.ts:", e);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 