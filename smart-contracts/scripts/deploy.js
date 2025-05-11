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
var hardhat_1 = require("hardhat");
var run = hardhat_1.default.run, network = hardhat_1.default.network;
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var deployer, initialOwner, minBidIncrementPercentage, PlatzLandNFTFactory, platzLandNFT, platzLandNFTAddress, LandMarketplaceFactory, landMarketplace, landMarketplaceAddress, e_1, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Deploying contracts...");
                    return [4 /*yield*/, hardhat_1.ethers.getSigners()];
                case 1:
                    deployer = (_a.sent())[0];
                    console.log("Deploying with account:", deployer.address);
                    initialOwner = deployer.address;
                    minBidIncrementPercentage = 5;
                    // Deploy PlatzLandNFT
                    console.log("Deploying PlatzLandNFT...");
                    return [4 /*yield*/, hardhat_1.ethers.getContractFactory("PlatzLandNFT")];
                case 2:
                    PlatzLandNFTFactory = _a.sent();
                    return [4 /*yield*/, PlatzLandNFTFactory.deploy(initialOwner)];
                case 3:
                    platzLandNFT = _a.sent();
                    return [4 /*yield*/, platzLandNFT.waitForDeployment()];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, platzLandNFT.getAddress()];
                case 5:
                    platzLandNFTAddress = _a.sent();
                    console.log("PlatzLandNFT deployed to: ".concat(platzLandNFTAddress));
                    // Deploy LandMarketplace
                    console.log("Deploying LandMarketplace...");
                    return [4 /*yield*/, hardhat_1.ethers.getContractFactory("LandMarketplace")];
                case 6:
                    LandMarketplaceFactory = _a.sent();
                    return [4 /*yield*/, LandMarketplaceFactory.deploy(initialOwner, platzLandNFTAddress, minBidIncrementPercentage)];
                case 7:
                    landMarketplace = _a.sent();
                    return [4 /*yield*/, landMarketplace.waitForDeployment()];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, landMarketplace.getAddress()];
                case 9:
                    landMarketplaceAddress = _a.sent();
                    console.log("LandMarketplace deployed to: ".concat(landMarketplaceAddress));
                    if (!(network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY)) return [3 /*break*/, 19];
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
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 30000); })];
                case 10:
                    // Wait for a few blocks to be mined to ensure contract is propagated
                    // For PlatzLandNFT
                    // Not using hre.ethers.provider. όχι, this does not exist
                    // await platzLandNFT.deploymentTransaction()?.wait(6) // Wait for 6 confirmations
                    // For LandMarketplace
                    // await landMarketplace.deploymentTransaction()?.wait(6)
                    // It's often better to wait manually or use a more robust wait here.
                    // Hardhat verify task has its own polling.
                    // Let's try verifying after a short delay if the direct wait causes issues.
                    _a.sent(); // 30s delay
                    console.log("Verifying PlatzLandNFT on Etherscan...");
                    _a.label = 11;
                case 11:
                    _a.trys.push([11, 13, , 14]);
                    return [4 /*yield*/, run("verify:verify", {
                            address: platzLandNFTAddress,
                            constructorArguments: [initialOwner],
                            contract: "contracts/PlatzLandNFT.sol:PlatzLandNFT"
                        })];
                case 12:
                    _a.sent();
                    console.log("PlatzLandNFT verified successfully.");
                    return [3 /*break*/, 14];
                case 13:
                    e_1 = _a.sent();
                    if (e_1 instanceof Error) {
                        if (e_1.message.toLowerCase().includes("already verified")) {
                            console.log("PlatzLandNFT is already verified.");
                        }
                        else {
                            console.error("PlatzLandNFT verification failed:", e_1);
                        }
                    }
                    else {
                        console.error("PlatzLandNFT verification failed with unknown error type:", e_1);
                    }
                    return [3 /*break*/, 14];
                case 14:
                    console.log("Verifying LandMarketplace on Etherscan...");
                    _a.label = 15;
                case 15:
                    _a.trys.push([15, 17, , 18]);
                    return [4 /*yield*/, run("verify:verify", {
                            address: landMarketplaceAddress,
                            constructorArguments: [
                                initialOwner,
                                platzLandNFTAddress,
                                minBidIncrementPercentage
                            ],
                            contract: "contracts/LandMarketplace.sol:LandMarketplace"
                        })];
                case 16:
                    _a.sent();
                    console.log("LandMarketplace verified successfully.");
                    return [3 /*break*/, 18];
                case 17:
                    e_2 = _a.sent();
                    if (e_2 instanceof Error) {
                        if (e_2.message.toLowerCase().includes("already verified")) {
                            console.log("LandMarketplace is already verified.");
                        }
                        else {
                            console.error("LandMarketplace verification failed:", e_2);
                        }
                    }
                    else {
                        console.error("LandMarketplace verification failed with unknown error type:", e_2);
                    }
                    return [3 /*break*/, 18];
                case 18: return [3 /*break*/, 20];
                case 19:
                    console.log("Skipping verification: Not on Sepolia or Etherscan API key not set.");
                    _a.label = 20;
                case 20:
                    console.log("Deployment and verification process completed.");
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .then(function () { return process.exit(0); })
    .catch(function (error) {
    console.error(error);
    process.exit(1);
});
