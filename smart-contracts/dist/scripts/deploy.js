"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = __importDefault(require("hardhat"));
const { ethers, run, network } = hardhat_1.default;
async function main() {
    console.log("Deploying contracts...");
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    const initialOwner = deployer.address; // Marketplace and NFT contract owner
    const minBidIncrementPercentage = 5; // 5%
    // Deploy PlatzLandNFT
    console.log("Deploying PlatzLandNFT...");
    const PlatzLandNFTFactory = await ethers.getContractFactory("PlatzLandNFT");
    const platzLandNFT = await PlatzLandNFTFactory.deploy(initialOwner);
    await platzLandNFT.waitForDeployment();
    const platzLandNFTAddress = await platzLandNFT.getAddress();
    console.log(`PlatzLandNFT deployed to: ${platzLandNFTAddress}`);
    // Deploy LandMarketplace
    console.log("Deploying LandMarketplace...");
    const LandMarketplaceFactory = await ethers.getContractFactory("LandMarketplace");
    const landMarketplace = await LandMarketplaceFactory.deploy(initialOwner, platzLandNFTAddress, minBidIncrementPercentage);
    await landMarketplace.waitForDeployment();
    const landMarketplaceAddress = await landMarketplace.getAddress();
    console.log(`LandMarketplace deployed to: ${landMarketplaceAddress}`);
    // Verification (only on testnets/mainnet)
    if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
        console.log("Waiting for block confirmations before verification...");
        // Wait for a few blocks to be mined to ensure contract is propagated
        // For PlatzLandNFT
        // Not using hre.ethers.provider. όχι, this does not exist
        // await platzLandNFT.deploymentTransaction()?.wait(6) // Wait for 6 confirmations
        // For LandMarketplace
        // await landMarketplace.deploymentTransaction()?.wait(6)
        // It's often better to wait manually or use a more robust wait here.
        // Hardhat verify task has its own polling.
        // Let's try verifying after a short delay if the direct wait causes issues.
        await new Promise(resolve => setTimeout(resolve, 30000)); // 30s delay
        console.log("Verifying PlatzLandNFT on Etherscan...");
        try {
            await run("verify:verify", {
                address: platzLandNFTAddress,
                constructorArguments: [initialOwner],
                contract: "contracts/PlatzLandNFT.sol:PlatzLandNFT"
            });
            console.log("PlatzLandNFT verified successfully.");
        }
        catch (e) {
            if (e instanceof Error) {
                if (e.message.toLowerCase().includes("already verified")) {
                    console.log("PlatzLandNFT is already verified.");
                }
                else {
                    console.error("PlatzLandNFT verification failed:", e);
                }
            }
            else {
                console.error("PlatzLandNFT verification failed with unknown error type:", e);
            }
        }
        console.log("Verifying LandMarketplace on Etherscan...");
        try {
            await run("verify:verify", {
                address: landMarketplaceAddress,
                constructorArguments: [
                    initialOwner,
                    platzLandNFTAddress,
                    minBidIncrementPercentage
                ],
                contract: "contracts/LandMarketplace.sol:LandMarketplace"
            });
            console.log("LandMarketplace verified successfully.");
        }
        catch (e) {
            if (e instanceof Error) {
                if (e.message.toLowerCase().includes("already verified")) {
                    console.log("LandMarketplace is already verified.");
                }
                else {
                    console.error("LandMarketplace verification failed:", e);
                }
            }
            else {
                console.error("LandMarketplace verification failed with unknown error type:", e);
            }
        }
    }
    else {
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
