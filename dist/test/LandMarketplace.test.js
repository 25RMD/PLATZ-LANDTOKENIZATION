"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const hardhat_1 = __importDefault(require("hardhat"));
describe("LandMarketplace", function () {
    let platzLandNFT;
    let marketplace;
    let owner;
    let seller;
    let buyer;
    let thirdParty;
    const propertyReference = "LAND123456";
    const tokenURI = "ipfs://QmExample";
    let listingPrice;
    let defaultGasPrice;
    // Initial balances for tracking purposes
    let initialOwnerBalance;
    let initialSellerBalance;
    let initialBuyerBalance;
    beforeEach(async function () {
        const signers = await hardhat_1.default.ethers.getSigners();
        owner = signers[0];
        seller = signers[1];
        buyer = signers[2];
        thirdParty = signers[3];
        listingPrice = hardhat_1.default.ethers.parseEther("1.0");
        defaultGasPrice = hardhat_1.default.ethers.parseUnits("50", "gwei");
        // Deploy the NFT contract
        const PlatzLandNFT = await hardhat_1.default.ethers.getContractFactory("PlatzLandNFT");
        platzLandNFT = await PlatzLandNFT.deploy(owner.address);
        await platzLandNFT.waitForDeployment();
        // Deploy the marketplace contract
        const LandMarketplace = await hardhat_1.default.ethers.getContractFactory("LandMarketplace");
        marketplace = await LandMarketplace.deploy(owner.address);
        await marketplace.waitForDeployment();
        // Mint a token to the seller
        await platzLandNFT.mintLand(seller.address, propertyReference, tokenURI);
        // Store initial balances
        initialOwnerBalance = await hardhat_1.default.ethers.provider.getBalance(owner.address);
        initialSellerBalance = await hardhat_1.default.ethers.provider.getBalance(seller.address);
        initialBuyerBalance = await hardhat_1.default.ethers.provider.getBalance(buyer.address);
    });
    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            (0, chai_1.expect)(await marketplace.owner()).to.equal(owner.address);
        });
        it("Should set the correct marketplace fee", async function () {
            (0, chai_1.expect)(await marketplace.marketplaceFee()).to.equal(250); // 2.5%
        });
    });
    describe("Listing NFTs", function () {
        it("Should allow token owner to create a listing", async function () {
            // Approve marketplace
            await platzLandNFT.connect(seller).approve(await marketplace.getAddress(), 0);
            // Create listing
            await (0, chai_1.expect)(marketplace.connect(seller).createListing(await platzLandNFT.getAddress(), 0, listingPrice, hardhat_1.default.ethers.ZeroAddress // ETH payment
            ))
                .to.emit(marketplace, "ListingCreated")
                .withArgs(await platzLandNFT.getAddress(), 0, seller.address, listingPrice, hardhat_1.default.ethers.ZeroAddress);
            // Check listing
            const listing = await marketplace.getListing(await platzLandNFT.getAddress(), 0);
            (0, chai_1.expect)(listing.seller).to.equal(seller.address);
            (0, chai_1.expect)(listing.price).to.equal(listingPrice);
            (0, chai_1.expect)(listing.isActive).to.be.true;
        });
        it("Should not allow non-owner to create a listing", async function () {
            await (0, chai_1.expect)(marketplace.connect(buyer).createListing(await platzLandNFT.getAddress(), 0, listingPrice, hardhat_1.default.ethers.ZeroAddress)).to.be.revertedWith("Not the owner of the NFT");
        });
        it("Should not allow creating a listing without marketplace approval", async function () {
            await (0, chai_1.expect)(marketplace.connect(seller).createListing(await platzLandNFT.getAddress(), 0, listingPrice, hardhat_1.default.ethers.ZeroAddress)).to.be.revertedWith("Marketplace not approved to transfer NFT");
        });
        it("Should not allow creating a listing with zero price", async function () {
            await platzLandNFT.connect(seller).approve(await marketplace.getAddress(), 0);
            await (0, chai_1.expect)(marketplace.connect(seller).createListing(await platzLandNFT.getAddress(), 0, 0, hardhat_1.default.ethers.ZeroAddress)).to.be.revertedWith("Price must be greater than zero");
        });
    });
    describe("Updating listings", function () {
        beforeEach(async function () {
            await platzLandNFT.connect(seller).approve(await marketplace.getAddress(), 0);
            await marketplace.connect(seller).createListing(await platzLandNFT.getAddress(), 0, listingPrice, hardhat_1.default.ethers.ZeroAddress);
        });
        it("Should allow seller to update listing price", async function () {
            const newPrice = hardhat_1.default.ethers.parseEther("2.0");
            await (0, chai_1.expect)(marketplace.connect(seller).updateListingPrice(await platzLandNFT.getAddress(), 0, newPrice))
                .to.emit(marketplace, "ListingUpdated")
                .withArgs(await platzLandNFT.getAddress(), 0, newPrice);
            const listing = await marketplace.getListing(await platzLandNFT.getAddress(), 0);
            (0, chai_1.expect)(listing.price).to.equal(newPrice);
        });
        it("Should not allow non-seller to update listing price", async function () {
            await (0, chai_1.expect)(marketplace.connect(buyer).updateListingPrice(await platzLandNFT.getAddress(), 0, hardhat_1.default.ethers.parseEther("2.0"))).to.be.revertedWith("Not the listing seller");
        });
    });
    describe("Cancelling listings", function () {
        beforeEach(async function () {
            await platzLandNFT.connect(seller).approve(await marketplace.getAddress(), 0);
            await marketplace.connect(seller).createListing(await platzLandNFT.getAddress(), 0, listingPrice, hardhat_1.default.ethers.ZeroAddress);
        });
        it("Should allow seller to cancel listing", async function () {
            await (0, chai_1.expect)(marketplace.connect(seller).cancelListing(await platzLandNFT.getAddress(), 0))
                .to.emit(marketplace, "ListingCancelled")
                .withArgs(await platzLandNFT.getAddress(), 0);
            const listing = await marketplace.getListing(await platzLandNFT.getAddress(), 0);
            (0, chai_1.expect)(listing.isActive).to.be.false;
        });
        it("Should not allow non-seller to cancel listing", async function () {
            await (0, chai_1.expect)(marketplace.connect(buyer).cancelListing(await platzLandNFT.getAddress(), 0)).to.be.revertedWith("Not the listing seller");
        });
    });
    describe("Purchasing NFTs", function () {
        beforeEach(async function () {
            await platzLandNFT.connect(seller).approve(await marketplace.getAddress(), 0);
            await marketplace.connect(seller).createListing(await platzLandNFT.getAddress(), 0, listingPrice, hardhat_1.default.ethers.ZeroAddress);
        });
        it("Should allow buyer to purchase a listed NFT", async function () {
            const tx = await marketplace.connect(buyer).purchaseListing(await platzLandNFT.getAddress(), 0, { value: listingPrice });
            await (0, chai_1.expect)(tx)
                .to.emit(marketplace, "ListingPurchased")
                .withArgs(await platzLandNFT.getAddress(), 0, buyer.address, seller.address, listingPrice);
            // Check NFT ownership
            (0, chai_1.expect)(await platzLandNFT.ownerOf(0)).to.equal(buyer.address);
            // Check listing status
            const listing = await marketplace.getListing(await platzLandNFT.getAddress(), 0);
            (0, chai_1.expect)(listing.isActive).to.be.false;
            // Calculate expected fee and seller amount
            const feePercentage = await marketplace.marketplaceFee();
            const feeAmount = (listingPrice * feePercentage) / 10000n;
            const sellerAmount = listingPrice - feeAmount;
            // Get transaction receipt to calculate gas costs
            const receipt = await tx.wait();
            const gasUsed = receipt?.gasUsed || 0n;
            const gasPrice = receipt?.gasPrice || defaultGasPrice;
            const gasCost = gasUsed * gasPrice;
            // Check balances - the buyer should have spent listing price + gas
            const buyerBalance = await hardhat_1.default.ethers.provider.getBalance(buyer.address);
            (0, chai_1.expect)(buyerBalance).to.be.closeTo(initialBuyerBalance - listingPrice - gasCost, hardhat_1.default.ethers.parseEther("0.01") // Allow small deviation for gas estimation
            );
            // The seller should have received the price minus fees
            const sellerBalance = await hardhat_1.default.ethers.provider.getBalance(seller.address);
            (0, chai_1.expect)(sellerBalance).to.be.closeTo(initialSellerBalance + sellerAmount, hardhat_1.default.ethers.parseEther("0.01"));
            // The owner should have received the fee
            const ownerBalance = await hardhat_1.default.ethers.provider.getBalance(owner.address);
            (0, chai_1.expect)(ownerBalance).to.be.closeTo(initialOwnerBalance + feeAmount, hardhat_1.default.ethers.parseEther("0.01"));
        });
        it("Should refund excess payment", async function () {
            const excessPayment = hardhat_1.default.ethers.parseEther("0.5");
            const totalPayment = listingPrice + excessPayment;
            const tx = await marketplace.connect(buyer).purchaseListing(await platzLandNFT.getAddress(), 0, { value: totalPayment });
            // Get transaction receipt to calculate gas costs
            const receipt = await tx.wait();
            const gasUsed = receipt?.gasUsed || 0n;
            const gasPrice = receipt?.gasPrice || defaultGasPrice;
            const gasCost = gasUsed * gasPrice;
            // Buyer should only have spent list price + gas, not the excess
            const buyerBalance = await hardhat_1.default.ethers.provider.getBalance(buyer.address);
            (0, chai_1.expect)(buyerBalance).to.be.closeTo(initialBuyerBalance - listingPrice - gasCost, hardhat_1.default.ethers.parseEther("0.01"));
        });
        it("Should fail if payment is insufficient", async function () {
            const insufficientPayment = hardhat_1.default.ethers.parseEther("0.5");
            await (0, chai_1.expect)(marketplace.connect(buyer).purchaseListing(await platzLandNFT.getAddress(), 0, { value: insufficientPayment })).to.be.revertedWith("Insufficient payment");
        });
        it("Should fail if listing is not active", async function () {
            // Cancel the listing first
            await marketplace.connect(seller).cancelListing(await platzLandNFT.getAddress(), 0);
            await (0, chai_1.expect)(marketplace.connect(buyer).purchaseListing(await platzLandNFT.getAddress(), 0, { value: listingPrice })).to.be.revertedWith("Listing not active");
        });
    });
    describe("Bidding", function () {
        let bidAmount;
        let higherBidAmount;
        beforeEach(async function () {
            // Set bid amounts
            bidAmount = hardhat_1.default.ethers.parseEther("0.8");
            higherBidAmount = hardhat_1.default.ethers.parseEther("1.2");
            // Approve NFT for marketplace in case we need to accept a bid
            await platzLandNFT.connect(seller).approve(await marketplace.getAddress(), 0);
        });
        it("Should allow placing a bid", async function () {
            await (0, chai_1.expect)(marketplace.connect(buyer).placeBid(await platzLandNFT.getAddress(), 0, { value: bidAmount }))
                .to.emit(marketplace, "BidPlaced")
                .withArgs(await platzLandNFT.getAddress(), 0, buyer.address, bidAmount);
            const highestBid = await marketplace.getHighestBid(await platzLandNFT.getAddress(), 0);
            (0, chai_1.expect)(highestBid.bidder).to.equal(buyer.address);
            (0, chai_1.expect)(highestBid.amount).to.equal(bidAmount);
        });
        it("Should replace previous bid with higher bid", async function () {
            // Place initial bid
            await marketplace.connect(buyer).placeBid(await platzLandNFT.getAddress(), 0, { value: bidAmount });
            const initialBuyerBalanceAfterBid = await hardhat_1.default.ethers.provider.getBalance(buyer.address);
            // Place higher bid from third party
            await marketplace.connect(thirdParty).placeBid(await platzLandNFT.getAddress(), 0, { value: higherBidAmount });
            // Check that highest bid is now from third party
            const highestBid = await marketplace.getHighestBid(await platzLandNFT.getAddress(), 0);
            (0, chai_1.expect)(highestBid.bidder).to.equal(thirdParty.address);
            (0, chai_1.expect)(highestBid.amount).to.equal(higherBidAmount);
            // Check that previous bidder got refunded
            const buyerBalanceAfterRefund = await hardhat_1.default.ethers.provider.getBalance(buyer.address);
            (0, chai_1.expect)(buyerBalanceAfterRefund).to.be.closeTo(initialBuyerBalanceAfterBid + bidAmount, hardhat_1.default.ethers.parseEther("0.01"));
        });
        it("Should reject bids lower than current highest bid", async function () {
            // Place initial high bid
            await marketplace.connect(buyer).placeBid(await platzLandNFT.getAddress(), 0, { value: higherBidAmount });
            // Try to place lower bid
            await (0, chai_1.expect)(marketplace.connect(thirdParty).placeBid(await platzLandNFT.getAddress(), 0, { value: bidAmount })).to.be.revertedWith("Bid amount must be higher than current bid");
        });
        it("Should not allow owner to bid on their own NFT", async function () {
            await (0, chai_1.expect)(marketplace.connect(seller).placeBid(await platzLandNFT.getAddress(), 0, { value: bidAmount })).to.be.revertedWith("Cannot bid on your own NFT");
        });
        it("Should allow NFT owner to accept a bid", async function () {
            // Place a bid
            await marketplace.connect(buyer).placeBid(await platzLandNFT.getAddress(), 0, { value: bidAmount });
            // Accept the bid
            const tx = await marketplace.connect(seller).acceptBid(await platzLandNFT.getAddress(), 0);
            await (0, chai_1.expect)(tx)
                .to.emit(marketplace, "BidAccepted")
                .withArgs(await platzLandNFT.getAddress(), 0, buyer.address, seller.address, bidAmount);
            // Check NFT ownership
            (0, chai_1.expect)(await platzLandNFT.ownerOf(0)).to.equal(buyer.address);
            // Calculate expected fee and seller amount
            const feePercentage = await marketplace.marketplaceFee();
            const feeAmount = (bidAmount * feePercentage) / 10000n;
            const sellerAmount = bidAmount - feeAmount;
            // Get transaction receipt to calculate gas costs
            const receipt = await tx.wait();
            const gasUsed = receipt?.gasUsed || 0n;
            const gasPrice = receipt?.gasPrice || defaultGasPrice;
            const gasCost = gasUsed * gasPrice;
            // Check seller balance - should have received bid amount minus fee
            const sellerBalance = await hardhat_1.default.ethers.provider.getBalance(seller.address);
            (0, chai_1.expect)(sellerBalance).to.be.closeTo(initialSellerBalance + sellerAmount - gasCost, hardhat_1.default.ethers.parseEther("0.01"));
            // Check that owner received fee
            const ownerBalance = await hardhat_1.default.ethers.provider.getBalance(owner.address);
            (0, chai_1.expect)(ownerBalance).to.be.closeTo(initialOwnerBalance + feeAmount, hardhat_1.default.ethers.parseEther("0.01"));
            // Check that bid is cleared
            const highestBid = await marketplace.getHighestBid(await platzLandNFT.getAddress(), 0);
            (0, chai_1.expect)(highestBid.bidder).to.equal(hardhat_1.default.ethers.ZeroAddress);
            (0, chai_1.expect)(highestBid.amount).to.equal(0);
        });
        it("Should not allow accepting a bid without marketplace approval", async function () {
            // Remove approval
            await platzLandNFT.connect(seller).approve(hardhat_1.default.ethers.ZeroAddress, 0);
            // Place a bid
            await marketplace.connect(buyer).placeBid(await platzLandNFT.getAddress(), 0, { value: bidAmount });
            // Try to accept without approval
            await (0, chai_1.expect)(marketplace.connect(seller).acceptBid(await platzLandNFT.getAddress(), 0)).to.be.revertedWith("Marketplace not approved to transfer NFT");
        });
        it("Should allow bidder to withdraw their bid", async function () {
            // Place a bid
            await marketplace.connect(buyer).placeBid(await platzLandNFT.getAddress(), 0, { value: bidAmount });
            const buyerBalanceAfterBid = await hardhat_1.default.ethers.provider.getBalance(buyer.address);
            // Withdraw the bid
            const tx = await marketplace.connect(buyer).withdrawBid(await platzLandNFT.getAddress(), 0);
            await (0, chai_1.expect)(tx)
                .to.emit(marketplace, "BidWithdrawn")
                .withArgs(await platzLandNFT.getAddress(), 0, buyer.address);
            // Get transaction receipt to calculate gas costs
            const receipt = await tx.wait();
            const gasUsed = receipt?.gasUsed || 0n;
            const gasPrice = receipt?.gasPrice || defaultGasPrice;
            const gasCost = gasUsed * gasPrice;
            // Check that bidder got their funds back minus gas
            const buyerBalanceAfterWithdraw = await hardhat_1.default.ethers.provider.getBalance(buyer.address);
            (0, chai_1.expect)(buyerBalanceAfterWithdraw).to.be.closeTo(buyerBalanceAfterBid + bidAmount - gasCost, hardhat_1.default.ethers.parseEther("0.01"));
            // Check that bid is cleared
            const highestBid = await marketplace.getHighestBid(await platzLandNFT.getAddress(), 0);
            (0, chai_1.expect)(highestBid.bidder).to.equal(hardhat_1.default.ethers.ZeroAddress);
            (0, chai_1.expect)(highestBid.amount).to.equal(0);
        });
        it("Should not allow non-bidder to withdraw a bid", async function () {
            // Place a bid
            await marketplace.connect(buyer).placeBid(await platzLandNFT.getAddress(), 0, { value: bidAmount });
            // Try to withdraw as non-bidder
            await (0, chai_1.expect)(marketplace.connect(thirdParty).withdrawBid(await platzLandNFT.getAddress(), 0)).to.be.revertedWith("Not the bidder");
        });
    });
    describe("Marketplace fees", function () {
        it("Should allow owner to update marketplace fee", async function () {
            const newFee = 300; // 3%
            await (0, chai_1.expect)(marketplace.connect(owner).updateMarketplaceFee(newFee))
                .to.emit(marketplace, "MarketplaceFeeUpdated")
                .withArgs(250, newFee);
            (0, chai_1.expect)(await marketplace.marketplaceFee()).to.equal(newFee);
        });
        it("Should not allow setting fee above maximum", async function () {
            const maxFee = await marketplace.MAX_FEE();
            const excessiveFee = maxFee + 100n;
            await (0, chai_1.expect)(marketplace.connect(owner).updateMarketplaceFee(excessiveFee)).to.be.revertedWith("Fee exceeds maximum");
        });
        it("Should not allow non-owner to update fee", async function () {
            // For Ownable v5.0+, we need to handle custom errors
            await (0, chai_1.expect)(marketplace.connect(buyer).updateMarketplaceFee(300)).to.be.reverted; // Just check for any revert, as the error message is a custom error
        });
    });
});
