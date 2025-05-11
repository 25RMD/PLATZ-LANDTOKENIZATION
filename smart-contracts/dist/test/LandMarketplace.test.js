"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = __importDefault(require("hardhat"));
const chai_1 = require("chai");
const hardhat_network_helpers_1 = require("@nomicfoundation/hardhat-network-helpers");
const { ethers } = hardhat_1.default;
describe("LandMarketplace", function () {
    async function deployContractsFixture() {
        const [deployer, seller, buyer, bidder1, bidder2, otherUser, newAdmin] = await ethers.getSigners();
        const PlatzLandNFTFactory = await ethers.getContractFactory("PlatzLandNFT");
        const landNFT = await PlatzLandNFTFactory.connect(deployer).deploy(deployer.address);
        await landNFT.waitForDeployment();
        const landNFTAddress = await landNFT.getAddress();
        const minBidIncrementPercentage = 5; // 5%
        const LandMarketplaceFactory = await ethers.getContractFactory("LandMarketplace");
        const marketplace = await LandMarketplaceFactory.connect(deployer).deploy(deployer.address, landNFTAddress, minBidIncrementPercentage);
        await marketplace.waitForDeployment();
        await landNFT.connect(deployer).safeMint(otherUser.address, "ipfs://token3", "Parcel-3"); // Mint one for otherUser for bid testing
        await landNFT.connect(deployer).safeMint(seller.address, "ipfs://token1", "Parcel-1"); // Token ID 1
        await landNFT.connect(deployer).safeMint(seller.address, "ipfs://token2", "Parcel-2"); // Token ID 2
        return { marketplace, landNFT, deployer, seller, buyer, bidder1, bidder2, otherUser, newAdmin, minBidIncrementPercentage, landNFTAddress };
    }
    describe("Deployment", function () {
        it("Should set the right owner for marketplace", async function () {
            const { marketplace, deployer } = await (0, hardhat_network_helpers_1.loadFixture)(deployContractsFixture);
            (0, chai_1.expect)(await marketplace.owner()).to.equal(deployer.address);
        });
        it("Should set the correct minimum bid increment percentage", async function () {
            const { marketplace, minBidIncrementPercentage } = await (0, hardhat_network_helpers_1.loadFixture)(deployContractsFixture);
            (0, chai_1.expect)(await marketplace.minBidIncrementPercentage()).to.equal(minBidIncrementPercentage);
        });
    });
    describe("Fixed-Price Listing: listNFT", function () {
        const tokenIdToList = 1;
        const listingPrice = ethers.parseEther("1"); // 1 ETH
        it("Should allow NFT owner to list their token", async function () {
            const { marketplace, landNFT, seller } = await (0, hardhat_network_helpers_1.loadFixture)(deployContractsFixture);
            await landNFT.connect(seller).approve(await marketplace.getAddress(), tokenIdToList);
            await (0, chai_1.expect)(marketplace.connect(seller).listNFT(tokenIdToList, listingPrice))
                .to.emit(marketplace, "NFTListed")
                .withArgs(tokenIdToList, seller.address, listingPrice);
            const listing = await marketplace.getListing(tokenIdToList);
            (0, chai_1.expect)(listing.seller).to.equal(seller.address);
            (0, chai_1.expect)(listing.price).to.equal(listingPrice);
            (0, chai_1.expect)(listing.active).to.be.true;
        });
        it("Should NOT allow listing if price is zero", async function () {
            const { marketplace, landNFT, seller } = await (0, hardhat_network_helpers_1.loadFixture)(deployContractsFixture);
            await landNFT.connect(seller).approve(await marketplace.getAddress(), tokenIdToList);
            await (0, chai_1.expect)(marketplace.connect(seller).listNFT(tokenIdToList, 0))
                .to.be.revertedWith("Marketplace: Price must be > 0");
        });
        it("Should NOT allow non-owner to list an NFT", async function () {
            const { marketplace, landNFT, buyer, seller } = await (0, hardhat_network_helpers_1.loadFixture)(deployContractsFixture);
            // Ensure token 1 is owned by seller, not buyer
            (0, chai_1.expect)(await landNFT.ownerOf(tokenIdToList)).to.equal(seller.address);
            await (0, chai_1.expect)(marketplace.connect(buyer).listNFT(tokenIdToList, listingPrice))
                .to.be.revertedWith("Marketplace: Not owner");
        });
        it("Should NOT allow listing if token is already listed", async function () {
            const { marketplace, landNFT, seller } = await (0, hardhat_network_helpers_1.loadFixture)(deployContractsFixture);
            await landNFT.connect(seller).approve(await marketplace.getAddress(), tokenIdToList);
            await marketplace.connect(seller).listNFT(tokenIdToList, listingPrice); // First listing
            await (0, chai_1.expect)(marketplace.connect(seller).listNFT(tokenIdToList, listingPrice)) // Try listing again
                .to.be.revertedWith("Marketplace: Already listed");
        });
        it("Should NOT allow listing if marketplace is not approved for the token", async function () {
            const { marketplace, seller } = await (0, hardhat_network_helpers_1.loadFixture)(deployContractsFixture);
            await (0, chai_1.expect)(marketplace.connect(seller).listNFT(tokenIdToList, listingPrice))
                .to.be.revertedWith("Marketplace: Not approved");
        });
        it("Should allow listing if marketplace is approved for all by owner", async function () {
            const { marketplace, landNFT, seller } = await (0, hardhat_network_helpers_1.loadFixture)(deployContractsFixture);
            await landNFT.connect(seller).setApprovalForAll(await marketplace.getAddress(), true);
            await (0, chai_1.expect)(marketplace.connect(seller).listNFT(tokenIdToList, listingPrice))
                .to.emit(marketplace, "NFTListed")
                .withArgs(tokenIdToList, seller.address, listingPrice);
        });
    });
    // --- Tests for buyNFT ---
    describe("Fixed-Price Sale: buyNFT", function () {
        const tokenIdToBuy = 1;
        const listingPrice = ethers.parseEther("1");
        let setup; // To store fixture data for this describe block
        beforeEach(async function () {
            setup = await (0, hardhat_network_helpers_1.loadFixture)(deployContractsFixture);
            const { landNFT, marketplace, seller } = setup;
            await landNFT.connect(seller).approve(await marketplace.getAddress(), tokenIdToBuy);
            await marketplace.connect(seller).listNFT(tokenIdToBuy, listingPrice);
        });
        it("Should allow a user to buy a listed NFT", async function () {
            const { marketplace, landNFT, seller, buyer } = setup;
            const sellerInitialBalance = await ethers.provider.getBalance(seller.address);
            await (0, chai_1.expect)(marketplace.connect(buyer).buyNFT(tokenIdToBuy, { value: listingPrice }))
                .to.emit(marketplace, "NFTSold")
                .withArgs(tokenIdToBuy, seller.address, buyer.address, listingPrice);
            (0, chai_1.expect)(await landNFT.ownerOf(tokenIdToBuy)).to.equal(buyer.address);
            const listing = await marketplace.getListing(tokenIdToBuy);
            (0, chai_1.expect)(listing.active).to.be.false;
            // Check seller received funds (approximately, considering gas costs for seller is hard)
            // We expect seller's balance to increase by listingPrice
            const sellerFinalBalance = await ethers.provider.getBalance(seller.address);
            (0, chai_1.expect)(sellerFinalBalance).to.equal(sellerInitialBalance + listingPrice);
        });
        it("Should NOT allow buying if listing is not active (e.g. bought already)", async function () {
            const { marketplace, landNFT, seller, buyer } = setup;
            // First buyer buys it
            await marketplace.connect(buyer).buyNFT(tokenIdToBuy, { value: listingPrice });
            // Second buyer tries to buy again
            await (0, chai_1.expect)(marketplace.connect(buyer).buyNFT(tokenIdToBuy, { value: listingPrice }))
                .to.be.revertedWith("Marketplace: Not listed"); // Because it's not active anymore
        });
        it("Should NOT allow buying with incorrect ETH amount", async function () {
            const { marketplace, buyer } = setup;
            const wrongPrice = ethers.parseEther("0.5");
            await (0, chai_1.expect)(marketplace.connect(buyer).buyNFT(tokenIdToBuy, { value: wrongPrice }))
                .to.be.revertedWith("Marketplace: Incorrect ETH amount");
        });
        it("Should NOT allow seller to buy their own NFT", async function () {
            const { marketplace, seller } = setup;
            await (0, chai_1.expect)(marketplace.connect(seller).buyNFT(tokenIdToBuy, { value: listingPrice }))
                .to.be.revertedWith("Marketplace: Owner cannot buy");
        });
        it("buyNFT should void an active bid and refund bidder", async function () {
            // This test needs more specific setup, might not fit well with the shared beforeEach here
            // Let's use loadFixture directly for this more complex scenario
            const { marketplace, landNFT, seller, buyer, bidder1 } = await (0, hardhat_network_helpers_1.loadFixture)(deployContractsFixture);
            const tokenIdWithBidAndSale = 2; // seller owns this token
            const bidAmount = ethers.parseEther("0.5");
            const salePriceForToken2 = ethers.parseEther("1");
            // Bidder1 makes a bid on Token 2
            await marketplace.connect(bidder1).makeBid(tokenIdWithBidAndSale, { value: bidAmount });
            const bidder1InitialBalance = await ethers.provider.getBalance(bidder1.address);
            // Seller lists Token 2 for a fixed price
            await landNFT.connect(seller).approve(await marketplace.getAddress(), tokenIdWithBidAndSale);
            await marketplace.connect(seller).listNFT(tokenIdWithBidAndSale, salePriceForToken2);
            // Buyer buys Token 2
            await marketplace.connect(buyer).buyNFT(tokenIdWithBidAndSale, { value: salePriceForToken2 });
            const highestBid = await marketplace.getHighestBid(tokenIdWithBidAndSale);
            (0, chai_1.expect)(highestBid.active).to.be.false;
            const bidder1FinalBalance = await ethers.provider.getBalance(bidder1.address);
            (0, chai_1.expect)(bidder1FinalBalance).to.equal(bidder1InitialBalance + bidAmount);
        });
    });
    // --- Tests for cancelListing ---
    describe("Fixed-Price Listing: cancelListing", function () {
        const tokenIdToCancel = 1;
        const listingPrice = ethers.parseEther("1");
        let setup;
        beforeEach(async function () {
            setup = await (0, hardhat_network_helpers_1.loadFixture)(deployContractsFixture);
            const { landNFT, marketplace, seller } = setup;
            await landNFT.connect(seller).approve(await marketplace.getAddress(), tokenIdToCancel);
            await marketplace.connect(seller).listNFT(tokenIdToCancel, listingPrice);
        });
        it("Should allow lister to cancel their listing", async function () {
            const { marketplace, seller } = setup;
            await (0, chai_1.expect)(marketplace.connect(seller).cancelListing(tokenIdToCancel))
                .to.emit(marketplace, "NFTListingCancelled")
                .withArgs(tokenIdToCancel, seller.address);
            const listing = await marketplace.getListing(tokenIdToCancel);
            (0, chai_1.expect)(listing.active).to.be.false;
        });
        it("Should NOT allow non-lister to cancel a listing", async function () {
            const { marketplace, buyer } = setup;
            await (0, chai_1.expect)(marketplace.connect(buyer).cancelListing(tokenIdToCancel))
                .to.be.revertedWith("Marketplace: Not lister");
        });
        it("Should NOT allow cancelling if listing is not active (e.g. already cancelled)", async function () {
            const { marketplace, seller } = setup;
            await marketplace.connect(seller).cancelListing(tokenIdToCancel); // Cancel it first
            await (0, chai_1.expect)(marketplace.connect(seller).cancelListing(tokenIdToCancel))
                .to.be.revertedWith("Marketplace: Not listed");
        });
    });
    // --- Tests for updateListingPrice ---
    describe("Fixed-Price Listing: updateListingPrice", function () {
        const tokenIdToUpdate = 1;
        const initialPrice = ethers.parseEther("1");
        const newPrice = ethers.parseEther("1.5");
        let setup;
        beforeEach(async function () {
            setup = await (0, hardhat_network_helpers_1.loadFixture)(deployContractsFixture);
            const { landNFT, marketplace, seller } = setup;
            await landNFT.connect(seller).approve(await marketplace.getAddress(), tokenIdToUpdate);
            await marketplace.connect(seller).listNFT(tokenIdToUpdate, initialPrice);
        });
        it("Should allow lister to update the price of their listing", async function () {
            const { marketplace, seller } = setup;
            await (0, chai_1.expect)(marketplace.connect(seller).updateListingPrice(tokenIdToUpdate, newPrice))
                .to.emit(marketplace, "NFTPriceUpdated")
                .withArgs(tokenIdToUpdate, seller.address, newPrice);
            const listing = await marketplace.getListing(tokenIdToUpdate);
            (0, chai_1.expect)(listing.price).to.equal(newPrice);
        });
        it("Should NOT allow non-lister to update price", async function () {
            const { marketplace, buyer } = setup;
            await (0, chai_1.expect)(marketplace.connect(buyer).updateListingPrice(tokenIdToUpdate, newPrice))
                .to.be.revertedWith("Marketplace: Not lister");
        });
        it("Should NOT allow updating price if listing is not active (e.g. cancelled)", async function () {
            const { marketplace, seller } = setup;
            await marketplace.connect(seller).cancelListing(tokenIdToUpdate); // Cancel it first
            await (0, chai_1.expect)(marketplace.connect(seller).updateListingPrice(tokenIdToUpdate, newPrice))
                .to.be.revertedWith("Marketplace: Not listed");
        });
        it("Should NOT allow updating price to zero", async function () {
            const { marketplace, seller } = setup;
            await (0, chai_1.expect)(marketplace.connect(seller).updateListingPrice(tokenIdToUpdate, 0))
                .to.be.revertedWith("Marketplace: Price must be > 0");
        });
    });
    // --- Bidding Tests ---
    describe("Bidding: makeBid", function () {
        const tokenIdToBidOn = 2; // Owned by seller
        const nonExistentTokenId = 999;
        const initialBidAmount = ethers.parseEther("0.1");
        it("Should allow a user to make a bid on an NFT", async function () {
            const { marketplace, bidder1 } = await (0, hardhat_network_helpers_1.loadFixture)(deployContractsFixture);
            await (0, chai_1.expect)(marketplace.connect(bidder1).makeBid(tokenIdToBidOn, { value: initialBidAmount }))
                .to.emit(marketplace, "NewHighestBid")
                .withArgs(tokenIdToBidOn, bidder1.address, initialBidAmount);
            const bid = await marketplace.getHighestBid(tokenIdToBidOn);
            (0, chai_1.expect)(bid.bidder).to.equal(bidder1.address);
            (0, chai_1.expect)(bid.amount).to.equal(initialBidAmount);
            (0, chai_1.expect)(bid.active).to.be.true;
        });
        it("Should NOT allow owner to bid on their own NFT", async function () {
            const { marketplace, seller } = await (0, hardhat_network_helpers_1.loadFixture)(deployContractsFixture);
            await (0, chai_1.expect)(marketplace.connect(seller).makeBid(tokenIdToBidOn, { value: initialBidAmount }))
                .to.be.revertedWith("Marketplace: Owner cannot bid");
        });
        it("Should NOT allow bidding on a non-existent token", async function () {
            const { marketplace, bidder1, landNFT } = await (0, hardhat_network_helpers_1.loadFixture)(deployContractsFixture);
            await (0, chai_1.expect)(marketplace.connect(bidder1).makeBid(nonExistentTokenId, { value: initialBidAmount }))
                .to.be.revertedWithCustomError(landNFT, "ERC721NonexistentToken")
                .withArgs(nonExistentTokenId);
        });
        it("Should require new bid to be higher than current highest bid by minBidIncrementPercentage", async function () {
            const { marketplace, bidder1, bidder2, minBidIncrementPercentage } = await (0, hardhat_network_helpers_1.loadFixture)(deployContractsFixture);
            await marketplace.connect(bidder1).makeBid(tokenIdToBidOn, { value: initialBidAmount });
            const requiredIncrement = (initialBidAmount * BigInt(minBidIncrementPercentage)) / 100n;
            const lowBidAmount = initialBidAmount + requiredIncrement - 1n; // One wei less than required
            const validNextBidAmount = initialBidAmount + requiredIncrement;
            await (0, chai_1.expect)(marketplace.connect(bidder2).makeBid(tokenIdToBidOn, { value: lowBidAmount }))
                .to.be.revertedWith("Marketplace: Bid too low");
            await (0, chai_1.expect)(marketplace.connect(bidder2).makeBid(tokenIdToBidOn, { value: validNextBidAmount }))
                .to.emit(marketplace, "NewHighestBid"); // Should succeed
        });
        it("Should refund previous highest bidder when a new higher bid is made", async function () {
            const { marketplace, bidder1, bidder2, minBidIncrementPercentage } = await (0, hardhat_network_helpers_1.loadFixture)(deployContractsFixture);
            const bidder1InitialEthBalance = await ethers.provider.getBalance(bidder1.address);
            // Bidder1 makes a bid (pays gas)
            const tx1 = await marketplace.connect(bidder1).makeBid(tokenIdToBidOn, { value: initialBidAmount });
            const receipt1 = await tx1.wait();
            const gasPaid1 = receipt1.gasUsed * receipt1.gasPrice;
            const bidder1BalanceAfterBid1 = await ethers.provider.getBalance(bidder1.address);
            (0, chai_1.expect)(bidder1BalanceAfterBid1).to.equal(bidder1InitialEthBalance - initialBidAmount - gasPaid1);
            // Bidder2 makes a higher bid
            const higherBidAmount = initialBidAmount + (initialBidAmount * BigInt(minBidIncrementPercentage) / 100n) + ethers.parseEther("0.01");
            await marketplace.connect(bidder2).makeBid(tokenIdToBidOn, { value: higherBidAmount });
            // Bidder1 should be refunded
            const bidder1FinalEthBalance = await ethers.provider.getBalance(bidder1.address);
            // Expected: bidder1BalanceAfterBid1 + initialBidAmount = bidder1InitialEthBalance - gasPaid1
            (0, chai_1.expect)(bidder1FinalEthBalance).to.equal(bidder1InitialEthBalance - gasPaid1);
        });
    });
    describe("Bidding: acceptBid", function () {
        const tokenIdToAcceptBidFor = 2;
        const bidAmount = ethers.parseEther("0.2");
        let setup;
        beforeEach(async function () {
            setup = await (0, hardhat_network_helpers_1.loadFixture)(deployContractsFixture);
            const { marketplace, bidder1 } = setup;
            await marketplace.connect(bidder1).makeBid(tokenIdToAcceptBidFor, { value: bidAmount });
        });
        it("Should allow NFT owner to accept an active bid", async function () {
            const { marketplace, landNFT, seller, bidder1 } = setup;
            await landNFT.connect(seller).approve(await marketplace.getAddress(), tokenIdToAcceptBidFor);
            const sellerInitialBalance = await ethers.provider.getBalance(seller.address);
            const tx = await marketplace.connect(seller).acceptBid(tokenIdToAcceptBidFor);
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed;
            const gasPrice = receipt.gasPrice;
            const gasPaidBySeller = gasUsed * gasPrice;
            await (0, chai_1.expect)(tx)
                .to.emit(marketplace, "BidAccepted")
                .withArgs(tokenIdToAcceptBidFor, seller.address, bidder1.address, bidAmount);
            (0, chai_1.expect)(await landNFT.ownerOf(tokenIdToAcceptBidFor)).to.equal(bidder1.address);
            const bid = await marketplace.getHighestBid(tokenIdToAcceptBidFor);
            (0, chai_1.expect)(bid.active).to.be.false;
            const sellerFinalBalance = await ethers.provider.getBalance(seller.address);
            // Broke down the arithmetic for TSC
            const sumSellerGain = sellerInitialBalance + bidAmount;
            const expectedSellerBalance = sumSellerGain - gasPaidBySeller;
            (0, chai_1.expect)(sellerFinalBalance).to.equal(expectedSellerBalance);
        });
        it("Should deactivate fixed-price listing when a bid is accepted", async function () {
            const { marketplace, landNFT, seller } = setup;
            const listingPrice = ethers.parseEther("1");
            await landNFT.connect(seller).approve(await marketplace.getAddress(), tokenIdToAcceptBidFor);
            await marketplace.connect(seller).listNFT(tokenIdToAcceptBidFor, listingPrice);
            await marketplace.connect(seller).acceptBid(tokenIdToAcceptBidFor);
            const listing = await marketplace.getListing(tokenIdToAcceptBidFor);
            (0, chai_1.expect)(listing.active).to.be.false;
        });
        it("Should NOT allow non-owner to accept a bid", async function () {
            const { marketplace, otherUser } = setup;
            await (0, chai_1.expect)(marketplace.connect(otherUser).acceptBid(tokenIdToAcceptBidFor))
                .to.be.revertedWith("Marketplace: Not owner");
        });
        it("Should NOT allow accepting a bid if no active bid exists", async function () {
            const { marketplace, seller, bidder1, landNFT } = setup;
            await marketplace.connect(bidder1).withdrawBid(tokenIdToAcceptBidFor);
            await landNFT.connect(seller).approve(await marketplace.getAddress(), tokenIdToAcceptBidFor);
            await (0, chai_1.expect)(marketplace.connect(seller).acceptBid(tokenIdToAcceptBidFor))
                .to.be.revertedWith("Marketplace: No active bid");
        });
        it("Should NOT allow accepting bid if marketplace is not approved", async function () {
            const { marketplace, seller } = setup;
            await (0, chai_1.expect)(marketplace.connect(seller).acceptBid(tokenIdToAcceptBidFor))
                .to.be.revertedWith("Marketplace: Not approved");
        });
    });
    describe("Bidding: withdrawBid", function () {
        const tokenIdToWithdrawFrom = 2;
        const bidAmount = ethers.parseEther("0.3");
        let setup;
        beforeEach(async function () {
            setup = await (0, hardhat_network_helpers_1.loadFixture)(deployContractsFixture);
            const { marketplace, bidder1 } = setup;
            await marketplace.connect(bidder1).makeBid(tokenIdToWithdrawFrom, { value: bidAmount });
        });
        it("Should allow the highest bidder to withdraw their active bid", async function () {
            const { marketplace, bidder1 } = setup;
            const bidder1InitialBalance = await ethers.provider.getBalance(bidder1.address);
            const tx = await marketplace.connect(bidder1).withdrawBid(tokenIdToWithdrawFrom);
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed;
            const gasPrice = receipt.gasPrice;
            const gasPaid = gasUsed * gasPrice;
            await (0, chai_1.expect)(tx)
                .to.emit(marketplace, "BidWithdrawn")
                .withArgs(tokenIdToWithdrawFrom, bidder1.address, bidAmount);
            const bid = await marketplace.getHighestBid(tokenIdToWithdrawFrom);
            (0, chai_1.expect)(bid.active).to.be.false;
            const bidder1FinalBalance = await ethers.provider.getBalance(bidder1.address);
            // Broke down the arithmetic for TSC
            const sumBidderRefund = bidder1InitialBalance + bidAmount;
            const expectedBidderBalance = sumBidderRefund - gasPaid;
            (0, chai_1.expect)(bidder1FinalBalance).to.equal(expectedBidderBalance);
        });
        it("Should NOT allow non-highest bidder to withdraw a bid", async function () {
            const { marketplace, bidder2 } = setup;
            await (0, chai_1.expect)(marketplace.connect(bidder2).withdrawBid(tokenIdToWithdrawFrom))
                .to.be.revertedWith("Marketplace: Not highest bidder or bid inactive");
        });
        it("Should NOT allow withdrawing if bid is not active", async function () {
            const { marketplace, seller, bidder1, landNFT } = setup;
            await landNFT.connect(seller).approve(await marketplace.getAddress(), tokenIdToWithdrawFrom);
            await marketplace.connect(seller).acceptBid(tokenIdToWithdrawFrom);
            await (0, chai_1.expect)(marketplace.connect(bidder1).withdrawBid(tokenIdToWithdrawFrom))
                .to.be.revertedWith("Marketplace: Not highest bidder or bid inactive");
        });
    });
    describe("Admin Functions", function () {
        it("Owner should be able to set NFT contract address", async function () {
            const { marketplace, deployer, landNFTAddress } = await (0, hardhat_network_helpers_1.loadFixture)(deployContractsFixture);
            const newNftAddress = ethers.Wallet.createRandom().address; // Create a random new address
            await (0, chai_1.expect)(marketplace.connect(deployer).setNftContractAddress(newNftAddress))
                .to.not.be.reverted; // Simple check, ideally would verify interaction with new address
            // We can't directly read the private _landNft, so this test is a bit limited
            // A more robust test might involve calling a function that uses _landNft and seeing if it targets the new one (if possible)
            // Or, if there was an event emitted or a public variable to check.
        });
        it("Non-owner should NOT be able to set NFT contract address", async function () {
            const { marketplace, otherUser } = await (0, hardhat_network_helpers_1.loadFixture)(deployContractsFixture);
            const newNftAddress = ethers.Wallet.createRandom().address;
            await (0, chai_1.expect)(marketplace.connect(otherUser).setNftContractAddress(newNftAddress))
                .to.be.revertedWithCustomError(marketplace, "OwnableUnauthorizedAccount").withArgs(otherUser.address);
        });
        it("Owner should be able to set minimum bid increment percentage", async function () {
            const { marketplace, deployer } = await (0, hardhat_network_helpers_1.loadFixture)(deployContractsFixture);
            const newPercentage = 10;
            await marketplace.connect(deployer).setMinBidIncrementPercentage(newPercentage);
            (0, chai_1.expect)(await marketplace.minBidIncrementPercentage()).to.equal(newPercentage);
        });
        it("Non-owner should NOT be able to set minimum bid increment percentage", async function () {
            const { marketplace, otherUser } = await (0, hardhat_network_helpers_1.loadFixture)(deployContractsFixture);
            const newPercentage = 10;
            await (0, chai_1.expect)(marketplace.connect(otherUser).setMinBidIncrementPercentage(newPercentage))
                .to.be.revertedWithCustomError(marketplace, "OwnableUnauthorizedAccount").withArgs(otherUser.address);
        });
    });
    // TODO: Reentrancy guard checks 
});
