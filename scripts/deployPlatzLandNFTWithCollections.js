"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// scripts/deployPlatzLandNFTWithCollections.ts
var hardhat_1 = require("hardhat");
var ethers = hardhat_1.default.ethers;
var fs = require("fs");
var path = require("path");
var CONTRACT_CONFIG_PATH = path.join(process.cwd(), "config/contracts.ts");
var ENV_EXAMPLE_PATH = path.join(process.cwd(), ".env.local.example");
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var deployer, balanceBefore, Factory, platzLandNFT, contractAddress, balanceAfter;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ethers.getSigners()];
                case 1:
                    deployer = (_a.sent())[0];
                    console.log("Deploying contracts with the account: ".concat(deployer.address));
                    return [4 /*yield*/, ethers.provider.getBalance(deployer.address)];
                case 2:
                    balanceBefore = _a.sent();
                    console.log("Account balance before deployment: ".concat(ethers.formatEther(balanceBefore), " ETH"));
                    // Deploy the new contract version
                    console.log("Deploying PlatzLandNFTWithCollections contract...");
                    return [4 /*yield*/, ethers.getContractFactory("PlatzLandNFTWithCollections")];
                case 3:
                    Factory = _a.sent();
                    return [4 /*yield*/, Factory.deploy(deployer.address)];
                case 4:
                    platzLandNFT = _a.sent();
                    return [4 /*yield*/, platzLandNFT.waitForDeployment()];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, platzLandNFT.getAddress()];
                case 6:
                    contractAddress = _a.sent();
                    console.log("PlatzLandNFTWithCollections deployed to: ".concat(contractAddress));
                    return [4 /*yield*/, ethers.provider.getBalance(deployer.address)];
                case 7:
                    balanceAfter = _a.sent();
                    console.log("Account balance after deployment: ".concat(ethers.formatEther(balanceAfter), " ETH"));
                    console.log("Deployment cost: ".concat(ethers.formatEther(balanceBefore.sub(balanceAfter)), " ETH"));
                    // Update the contract addresses in config file
                    updateContractAddresses(contractAddress);
                    console.log("Deployment completed successfully!");
                    console.log("");
                    console.log("Next steps:");
                    console.log("1. Verify the contract on Etherscan");
                    console.log("   npx hardhat verify --network sepolia ".concat(contractAddress, " ").concat(deployer.address));
                    console.log("2. Update your .env.local file with the NFT contract address:");
                    console.log("   NFT_CONTRACT_ADDRESS=".concat(contractAddress));
                    return [2 /*return*/];
            }
        });
    });
}
// Function to update contract addresses in config/contracts.ts and .env.local.example
function updateContractAddresses(contractAddress) {
    console.log("Updating contract configurations...");
    try {
        // Read the existing file
        var content = fs.readFileSync(CONTRACT_CONFIG_PATH, "utf8");
        // Update the NFT contract address
        content = content.replace(/export const PLATZ_LAND_NFT_ADDRESS = .+;/, "export const PLATZ_LAND_NFT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS || \"".concat(contractAddress, "\";"));
        // Update the localhost address as well
        content = content.replace(/export const LOCALHOST_PLATZ_LAND_NFT_ADDRESS = .+;/, "export const LOCALHOST_PLATZ_LAND_NFT_ADDRESS = \"".concat(contractAddress, "\";"));
        // Write updated content
        fs.writeFileSync(CONTRACT_CONFIG_PATH, content);
        console.log("Updated contract addresses in ".concat(CONTRACT_CONFIG_PATH));
        // Append to .env.local.example
        var envExampleContent = "# Added by deployment script\nNFT_CONTRACT_ADDRESS=".concat(contractAddress, "\n");
        fs.writeFileSync(ENV_EXAMPLE_PATH, envExampleContent, { flag: 'a' });
        console.log("Appended contract address to ".concat(ENV_EXAMPLE_PATH));
    }
    catch (error) {
        console.error("Error updating config file:", error);
    }
}
main()
    .then(function () { return process.exit(0); })
    .catch(function (error) {
    console.error(error);
    process.exit(1);
});
