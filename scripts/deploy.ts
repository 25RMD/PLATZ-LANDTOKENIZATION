import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("Deploying PlatzLandNFT contract...");

  // Deploy the contract
  const PlatzLandNFT = await ethers.getContractFactory("PlatzLandNFT");
  const platzLandNFT = await PlatzLandNFT.deploy();

  await platzLandNFT.waitForDeployment();

  const contractAddress = await platzLandNFT.getAddress();
  console.log(`PlatzLandNFT deployed to: ${contractAddress}`);

  // Save the contract address and ABI to a file for frontend use
  const contractsDir = path.join(__dirname, "..", "lib", "contracts");
  
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  // Save contract address
  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ PlatzLandNFT: contractAddress }, null, 2)
  );

  // Save contract ABI
  const artifact = require("../artifacts/contracts/PlatzLandNFT.sol/PlatzLandNFT.json");
  fs.writeFileSync(
    path.join(contractsDir, "PlatzLandNFT.json"),
    JSON.stringify(artifact, null, 2)
  );

  console.log("Contract address and ABI saved to lib/contracts/");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
