import { expect } from "chai";
import hre from "hardhat";

describe("LandMarketplace", function () {
  let platzLandNFT: any;
  let marketplace: any;
  let owner: any;
  let seller: any;
  let buyer: any;
  let thirdParty: any;
  
  const propertyReference = "LAND123456";
  const tokenURI = "ipfs://QmExample";
  let listingPrice: bigint;
  let defaultGasPrice: bigint;
  
  // Initial balances for tracking purposes
  let initialOwnerBalance: bigint;
  let initialSellerBalance: bigint;
  let initialBuyerBalance: bigint;
  
  beforeEach(async function () {
    const signers = await hre.ethers.getSigners();
    owner = signers[0];
    seller = signers[1];
    buyer = signers[2];
    thirdParty = signers[3];
    
    listingPrice = hre.ethers.parseEther("1.0");
    defaultGasPrice = hre.ethers.parseUnits("50", "gwei");
    
    // Deploy the NFT contract
    const PlatzLandNFT = await hre.ethers.getContractFactory("PlatzLandNFT");
    platzLandNFT = await PlatzLandNFT.deploy(owner.address);
    await platzLandNFT.waitForDeployment();
    
    // Deploy the marketplace contract
    const LandMarketplace = await hre.ethers.getContractFactory("LandMarketplace");
    marketplace = await LandMarketplace.deploy(owner.address);
    await marketplace.waitForDeployment();
    
    // Mint a token to the seller
    await platzLandNFT.mintLand(seller.address, propertyReference, tokenURI);
    
    // Store initial balances
    initialOwnerBalance = await hre.ethers.provider.getBalance(owner.address);
    initialSellerBalance = await hre.ethers.provider.getBalance(seller.address);
    initialBuyerBalance = await hre.ethers.provider.getBalance(buyer.address);
  });
  
  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await marketplace.owner()).to.equal(owner.address);
    });
    
    it("Should set the correct marketplace fee", async function () {
      expect(await marketplace.marketplaceFee()).to.equal(250); // 2.5%
    });
  });
  
  describe("Listing NFTs", function () {
    it("Should allow token owner to create a listing", async function () {
      // Approve marketplace
      await platzLandNFT.connect(seller).approve(await marketplace.getAddress(), 0);
      
      // Create listing
      await expect(
        marketplace.connect(seller).createListing(
          await platzLandNFT.getAddress(),
          0,
          listingPrice,
          hre.ethers.ZeroAddress // ETH payment
        )
      )
        .to.emit(marketplace, "ListingCreated")
        .withArgs(await platzLandNFT.getAddress(), 0, seller.address, listingPrice, hre.ethers.ZeroAddress);
        
      // Check listing
      const listing = await marketplace.getListing(await platzLandNFT.getAddress(), 0);
      expect(listing.seller).to.equal(seller.address);
      expect(listing.price).to.equal(listingPrice);
      expect(listing.isActive).to.be.true;
    });
    
    it("Should not allow non-owner to create a listing", async function () {
      await expect(
        marketplace.connect(buyer).createListing(
          await platzLandNFT.getAddress(),
          0,
          listingPrice,
          hre.ethers.ZeroAddress
        )
      ).to.be.revertedWith("Not the owner of the NFT");
    });
    
    it("Should not allow creating a listing without marketplace approval", async function () {
      await expect(
        marketplace.connect(seller).createListing(
          await platzLandNFT.getAddress(),
          0,
          listingPrice,
          hre.ethers.ZeroAddress
        )
      ).to.be.revertedWith("Marketplace not approved to transfer NFT");
    });
    
    it("Should not allow creating a listing with zero price", async function () {
      await platzLandNFT.connect(seller).approve(await marketplace.getAddress(), 0);
      
      await expect(
        marketplace.connect(seller).createListing(
          await platzLandNFT.getAddress(),
          0,
          0,
          hre.ethers.ZeroAddress
        )
      ).to.be.revertedWith("Price must be greater than zero");
    });
  });
  
  describe("Updating listings", function () {
    beforeEach(async function () {
      await platzLandNFT.connect(seller).approve(await marketplace.getAddress(), 0);
      await marketplace.connect(seller).createListing(
        await platzLandNFT.getAddress(),
        0,
        listingPrice,
        hre.ethers.ZeroAddress
      );
    });
    
    it("Should allow seller to update listing price", async function () {
      const newPrice = hre.ethers.parseEther("2.0");
      
      await expect(
        marketplace.connect(seller).updateListingPrice(
          await platzLandNFT.getAddress(),
          0,
          newPrice
        )
      )
        .to.emit(marketplace, "ListingUpdated")
        .withArgs(await platzLandNFT.getAddress(), 0, newPrice);
        
      const listing = await marketplace.getListing(await platzLandNFT.getAddress(), 0);
      expect(listing.price).to.equal(newPrice);
    });
    
    it("Should not allow non-seller to update listing price", async function () {
      await expect(
        marketplace.connect(buyer).updateListingPrice(
          await platzLandNFT.getAddress(),
          0,
          hre.ethers.parseEther("2.0")
        )
      ).to.be.revertedWith("Not the listing seller");
    });
  });
  
  describe("Cancelling listings", function () {
    beforeEach(async function () {
      await platzLandNFT.connect(seller).approve(await marketplace.getAddress(), 0);
      await marketplace.connect(seller).createListing(
        await platzLandNFT.getAddress(),
        0,
        listingPrice,
        hre.ethers.ZeroAddress
      );
    });
    
    it("Should allow seller to cancel listing", async function () {
      await expect(
        marketplace.connect(seller).cancelListing(
          await platzLandNFT.getAddress(),
          0
        )
      )
        .to.emit(marketplace, "ListingCancelled")
        .withArgs(await platzLandNFT.getAddress(), 0);
        
      const listing = await marketplace.getListing(await platzLandNFT.getAddress(), 0);
      expect(listing.isActive).to.be.false;
    });
    
    it("Should not allow non-seller to cancel listing", async function () {
      await expect(
        marketplace.connect(buyer).cancelListing(
          await platzLandNFT.getAddress(),
          0
        )
      ).to.be.revertedWith("Not the listing seller");
    });
  });
  
  describe("Purchasing NFTs", function () {
    beforeEach(async function () {
      await platzLandNFT.connect(seller).approve(await marketplace.getAddress(), 0);
      await marketplace.connect(seller).createListing(
        await platzLandNFT.getAddress(),
        0,
        listingPrice,
        hre.ethers.ZeroAddress
      );
    });
    
    it("Should allow buyer to purchase a listed NFT", async function () {
      const tx = await marketplace.connect(buyer).purchaseListing(
        await platzLandNFT.getAddress(),
        0,
        { value: listingPrice }
      );
      
      await expect(tx)
        .to.emit(marketplace, "ListingPurchased")
        .withArgs(
          await platzLandNFT.getAddress(),
          0,
          buyer.address,
          seller.address,
          listingPrice
        );
        
      // Check NFT ownership
      expect(await platzLandNFT.ownerOf(0)).to.equal(buyer.address);
      
      // Check listing status
      const listing = await marketplace.getListing(await platzLandNFT.getAddress(), 0);
      expect(listing.isActive).to.be.false;
      
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
      const buyerBalance = await hre.ethers.provider.getBalance(buyer.address);
      expect(buyerBalance).to.be.closeTo(
        initialBuyerBalance - listingPrice - gasCost,
        hre.ethers.parseEther("0.01") // Allow small deviation for gas estimation
      );
      
      // The seller should have received the price minus fees
      const sellerBalance = await hre.ethers.provider.getBalance(seller.address);
      expect(sellerBalance).to.be.closeTo(
        initialSellerBalance + sellerAmount,
        hre.ethers.parseEther("0.01")
      );
      
      // The owner should have received the fee
      const ownerBalance = await hre.ethers.provider.getBalance(owner.address);
      expect(ownerBalance).to.be.closeTo(
        initialOwnerBalance + feeAmount,
        hre.ethers.parseEther("0.01")
      );
    });
    
    it("Should refund excess payment", async function () {
      const excessPayment = hre.ethers.parseEther("0.5");
      const totalPayment = listingPrice + excessPayment;
      
      const tx = await marketplace.connect(buyer).purchaseListing(
        await platzLandNFT.getAddress(),
        0,
        { value: totalPayment }
      );
      
      // Get transaction receipt to calculate gas costs
      const receipt = await tx.wait();
      const gasUsed = receipt?.gasUsed || 0n;
      const gasPrice = receipt?.gasPrice || defaultGasPrice;
      const gasCost = gasUsed * gasPrice;
      
      // Buyer should only have spent list price + gas, not the excess
      const buyerBalance = await hre.ethers.provider.getBalance(buyer.address);
      expect(buyerBalance).to.be.closeTo(
        initialBuyerBalance - listingPrice - gasCost,
        hre.ethers.parseEther("0.01")
      );
    });
    
    it("Should fail if payment is insufficient", async function () {
      const insufficientPayment = hre.ethers.parseEther("0.5");
      await expect(
        marketplace.connect(buyer).purchaseListing(
          await platzLandNFT.getAddress(),
          0,
          { value: insufficientPayment }
        )
      ).to.be.revertedWith("Insufficient payment");
    });
    
    it("Should fail if listing is not active", async function () {
      // Cancel the listing first
      await marketplace.connect(seller).cancelListing(
        await platzLandNFT.getAddress(),
        0
      );
      
      await expect(
        marketplace.connect(buyer).purchaseListing(
          await platzLandNFT.getAddress(),
          0,
          { value: listingPrice }
        )
      ).to.be.revertedWith("Listing not active");
    });
  });
  
  describe("Bidding", function () {
    let bidAmount: bigint;
    let higherBidAmount: bigint;
    
    beforeEach(async function () {
      // Set bid amounts
      bidAmount = hre.ethers.parseEther("0.8");
      higherBidAmount = hre.ethers.parseEther("1.2");
      
      // Approve NFT for marketplace in case we need to accept a bid
      await platzLandNFT.connect(seller).approve(await marketplace.getAddress(), 0);
    });
    
    it("Should allow placing a bid", async function () {
      await expect(
        marketplace.connect(buyer).placeBid(
          await platzLandNFT.getAddress(),
          0,
          { value: bidAmount }
        )
      )
        .to.emit(marketplace, "BidPlaced")
        .withArgs(await platzLandNFT.getAddress(), 0, buyer.address, bidAmount);
        
      const highestBid = await marketplace.getHighestBid(await platzLandNFT.getAddress(), 0);
      expect(highestBid.bidder).to.equal(buyer.address);
      expect(highestBid.amount).to.equal(bidAmount);
    });
    
    it("Should replace previous bid with higher bid", async function () {
      // Place initial bid
      await marketplace.connect(buyer).placeBid(
        await platzLandNFT.getAddress(),
        0,
        { value: bidAmount }
      );
      
      const initialBuyerBalanceAfterBid = await hre.ethers.provider.getBalance(buyer.address);
      
      // Place higher bid from third party
      await marketplace.connect(thirdParty).placeBid(
        await platzLandNFT.getAddress(),
        0,
        { value: higherBidAmount }
      );
      
      // Check that highest bid is now from third party
      const highestBid = await marketplace.getHighestBid(await platzLandNFT.getAddress(), 0);
      expect(highestBid.bidder).to.equal(thirdParty.address);
      expect(highestBid.amount).to.equal(higherBidAmount);
      
      // Check that previous bidder got refunded
      const buyerBalanceAfterRefund = await hre.ethers.provider.getBalance(buyer.address);
      expect(buyerBalanceAfterRefund).to.be.closeTo(
        initialBuyerBalanceAfterBid + bidAmount,
        hre.ethers.parseEther("0.01")
      );
    });
    
    it("Should reject bids lower than current highest bid", async function () {
      // Place initial high bid
      await marketplace.connect(buyer).placeBid(
        await platzLandNFT.getAddress(),
        0,
        { value: higherBidAmount }
      );
      
      // Try to place lower bid
      await expect(
        marketplace.connect(thirdParty).placeBid(
          await platzLandNFT.getAddress(),
          0,
          { value: bidAmount }
        )
      ).to.be.revertedWith("Bid amount must be higher than current bid");
    });
    
    it("Should not allow owner to bid on their own NFT", async function () {
      await expect(
        marketplace.connect(seller).placeBid(
          await platzLandNFT.getAddress(),
          0,
          { value: bidAmount }
        )
      ).to.be.revertedWith("Cannot bid on your own NFT");
    });
    
    it("Should allow NFT owner to accept a bid", async function () {
      // Place a bid
      await marketplace.connect(buyer).placeBid(
        await platzLandNFT.getAddress(),
        0,
        { value: bidAmount }
      );
      
      // Accept the bid
      const tx = await marketplace.connect(seller).acceptBid(
        await platzLandNFT.getAddress(),
        0
      );
      
      await expect(tx)
        .to.emit(marketplace, "BidAccepted")
        .withArgs(
          await platzLandNFT.getAddress(),
          0,
          buyer.address,
          seller.address,
          bidAmount
        );
        
      // Check NFT ownership
      expect(await platzLandNFT.ownerOf(0)).to.equal(buyer.address);
      
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
      const sellerBalance = await hre.ethers.provider.getBalance(seller.address);
      expect(sellerBalance).to.be.closeTo(
        initialSellerBalance + sellerAmount - gasCost,
        hre.ethers.parseEther("0.01")
      );
      
      // Check that owner received fee
      const ownerBalance = await hre.ethers.provider.getBalance(owner.address);
      expect(ownerBalance).to.be.closeTo(
        initialOwnerBalance + feeAmount,
        hre.ethers.parseEther("0.01")
      );
      
      // Check that bid is cleared
      const highestBid = await marketplace.getHighestBid(await platzLandNFT.getAddress(), 0);
      expect(highestBid.bidder).to.equal(hre.ethers.ZeroAddress);
      expect(highestBid.amount).to.equal(0);
    });
    
    it("Should not allow accepting a bid without marketplace approval", async function () {
      // Remove approval
      await platzLandNFT.connect(seller).approve(hre.ethers.ZeroAddress, 0);
      
      // Place a bid
      await marketplace.connect(buyer).placeBid(
        await platzLandNFT.getAddress(),
        0,
        { value: bidAmount }
      );
      
      // Try to accept without approval
      await expect(
        marketplace.connect(seller).acceptBid(
          await platzLandNFT.getAddress(),
          0
        )
      ).to.be.revertedWith("Marketplace not approved to transfer NFT");
    });
    
    it("Should allow bidder to withdraw their bid", async function () {
      // Place a bid
      await marketplace.connect(buyer).placeBid(
        await platzLandNFT.getAddress(),
        0,
        { value: bidAmount }
      );
      
      const buyerBalanceAfterBid = await hre.ethers.provider.getBalance(buyer.address);
      
      // Withdraw the bid
      const tx = await marketplace.connect(buyer).withdrawBid(
        await platzLandNFT.getAddress(),
        0
      );
      
      await expect(tx)
        .to.emit(marketplace, "BidWithdrawn")
        .withArgs(await platzLandNFT.getAddress(), 0, buyer.address);
        
      // Get transaction receipt to calculate gas costs
      const receipt = await tx.wait();
      const gasUsed = receipt?.gasUsed || 0n;
      const gasPrice = receipt?.gasPrice || defaultGasPrice;
      const gasCost = gasUsed * gasPrice;
      
      // Check that bidder got their funds back minus gas
      const buyerBalanceAfterWithdraw = await hre.ethers.provider.getBalance(buyer.address);
      expect(buyerBalanceAfterWithdraw).to.be.closeTo(
        buyerBalanceAfterBid + bidAmount - gasCost,
        hre.ethers.parseEther("0.01")
      );
      
      // Check that bid is cleared
      const highestBid = await marketplace.getHighestBid(await platzLandNFT.getAddress(), 0);
      expect(highestBid.bidder).to.equal(hre.ethers.ZeroAddress);
      expect(highestBid.amount).to.equal(0);
    });
    
    it("Should not allow non-bidder to withdraw a bid", async function () {
      // Place a bid
      await marketplace.connect(buyer).placeBid(
        await platzLandNFT.getAddress(),
        0,
        { value: bidAmount }
      );
      
      // Try to withdraw as non-bidder
      await expect(
        marketplace.connect(thirdParty).withdrawBid(
          await platzLandNFT.getAddress(),
          0
        )
      ).to.be.revertedWith("Not the bidder");
    });
  });
  
  describe("Marketplace fees", function () {
    it("Should allow owner to update marketplace fee", async function () {
      const newFee = 300; // 3%
      
      await expect(marketplace.connect(owner).updateMarketplaceFee(newFee))
        .to.emit(marketplace, "MarketplaceFeeUpdated")
        .withArgs(250, newFee);
        
      expect(await marketplace.marketplaceFee()).to.equal(newFee);
    });
    
    it("Should not allow setting fee above maximum", async function () {
      const maxFee = await marketplace.MAX_FEE();
      const excessiveFee = maxFee + 100n;
      
      await expect(
        marketplace.connect(owner).updateMarketplaceFee(excessiveFee)
      ).to.be.revertedWith("Fee exceeds maximum");
    });
    
    it("Should not allow non-owner to update fee", async function () {
      // For Ownable v5.0+, we need to handle custom errors
      await expect(
        marketplace.connect(buyer).updateMarketplaceFee(300)
      ).to.be.reverted; // Just check for any revert, as the error message is a custom error
    });
  });
}); 