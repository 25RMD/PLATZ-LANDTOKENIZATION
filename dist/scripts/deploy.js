"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = __importDefault(require("hardhat"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
async function main() {
    const [deployer] = await hardhat_1.default.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    // Deploy PlatzLandNFT contract
    const PlatzLandNFT = await hardhat_1.default.ethers.getContractFactory("PlatzLandNFT");
    const platzLandNFT = await PlatzLandNFT.deploy(deployer.address);
    await platzLandNFT.waitForDeployment();
    const platzLandNFTAddress = await platzLandNFT.getAddress();
    console.log("PlatzLandNFT deployed to:", platzLandNFTAddress);
    // Deploy LandMarketplace contract
    const LandMarketplace = await hardhat_1.default.ethers.getContractFactory("LandMarketplace");
    const landMarketplace = await LandMarketplace.deploy(deployer.address);
    await landMarketplace.waitForDeployment();
    const landMarketplaceAddress = await landMarketplace.getAddress();
    console.log("LandMarketplace deployed to:", landMarketplaceAddress);
    console.log("Deployment complete!");
    // Optionally, save the contract addresses
    try {
        const __dirname = path_1.default.dirname((0, url_1.fileURLToPath)(import.meta.url));
        const contractsDir = path_1.default.join(__dirname, '..', 'contract-addresses');
        if (!fs_1.default.existsSync(contractsDir)) {
            fs_1.default.mkdirSync(contractsDir, { recursive: true });
        }
        fs_1.default.writeFileSync(path_1.default.join(contractsDir, 'contracts.json'), JSON.stringify({
            PlatzLandNFT: platzLandNFTAddress,
            LandMarketplace: landMarketplaceAddress,
        }, null, 2));
        console.log('Contract addresses saved to contract-addresses/contracts.json');
    }
    catch (error) {
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
