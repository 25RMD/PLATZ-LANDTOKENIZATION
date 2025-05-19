import { ethers } from "hardhat";

async function main() {
    console.log("Deploying PlatzLandNFT and LandMarketplace contracts...");

    // Deploy the PlatzLandNFT contract
    const PlatzLandNFT = await ethers.getContractFactory("PlatzLandNFT");
    const platzLandNFT = await PlatzLandNFT.deploy("Platz Land NFT", "PLATZ");
    
    await platzLandNFT.waitForDeployment();
    const nftAddress = await platzLandNFT.getAddress();
    console.log(`PlatzLandNFT deployed to: ${nftAddress}`);

    // Deploy the LandMarketplace contract with the NFT contract address
    const LandMarketplace = await ethers.getContractFactory("LandMarketplace");
    const landMarketplace = await LandMarketplace.deploy(nftAddress, 250); // 2.5% marketplace fee
    
    await landMarketplace.waitForDeployment();
    const marketplaceAddress = await landMarketplace.getAddress();
    console.log(`LandMarketplace deployed to: ${marketplaceAddress}`);

    // Grant the marketplace contract the MINTER_ROLE
    const MINTER_ROLE = await platzLandNFT.MINTER_ROLE();
    await platzLandNFT.grantRole(MINTER_ROLE, marketplaceAddress);
    console.log(`Granted MINTER_ROLE to LandMarketplace contract`);

    console.log("\nDeployment complete!");
    console.log("--------------------");
    console.log("PlatzLandNFT:", nftAddress);
    console.log("LandMarketplace:", marketplaceAddress);
    console.log("--------------------");
    console.log("Verify contracts with:");
    console.log(`npx hardhat verify --network sepolia ${nftAddress} "Platz Land NFT" "PLATZ"`);
    console.log(`npx hardhat verify --network sepolia ${marketplaceAddress} ${nftAddress} 250`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 