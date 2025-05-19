import { expect } from "chai";
import hre from "hardhat";

describe("PlatzLandNFT", function () {
  let platzLandNFT: any;
  let owner: any;
  let addr1: any;
  let addr2: any;

  const propertyReference = "LAND123456";
  const tokenURI = "ipfs://QmExample";

  beforeEach(async function () {
    const signers = await hre.ethers.getSigners();
    owner = signers[0];
    addr1 = signers[1];
    addr2 = signers[2];
    
    const PlatzLandNFT = await hre.ethers.getContractFactory("PlatzLandNFT");
    platzLandNFT = await PlatzLandNFT.deploy(owner.address);
    await platzLandNFT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await platzLandNFT.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      expect(await platzLandNFT.name()).to.equal("Platz Land Token");
      expect(await platzLandNFT.symbol()).to.equal("PLTZ");
    });
  });

  describe("Minting", function () {
    it("Should mint a new token", async function () {
      const mintTx = await platzLandNFT.mintLand(addr1.address, propertyReference, tokenURI);
      await mintTx.wait();

      expect(await platzLandNFT.ownerOf(0)).to.equal(addr1.address);
      expect(await platzLandNFT.tokenURI(0)).to.equal(tokenURI);
    });

    it("Should emit PropertyMinted event on minting", async function () {
      await expect(platzLandNFT.mintLand(addr1.address, propertyReference, tokenURI))
        .to.emit(platzLandNFT, "PropertyMinted")
        .withArgs(0, addr1.address, propertyReference);
    });

    it("Should store property details correctly", async function () {
      await platzLandNFT.mintLand(addr1.address, propertyReference, tokenURI);
      
      const propertyDetails = await platzLandNFT.getPropertyDetails(0);
      
      expect(propertyDetails.propertyReference).to.equal(propertyReference);
      expect(propertyDetails.creator).to.equal(owner.address);
      
      // Skip exact timestamp check because it's non-deterministic
      // Just ensure it's a reasonable timestamp (greater than 2023-01-01)
      const jan2023Timestamp = 1672531200; // 2023-01-01
      expect(Number(propertyDetails.mintTimestamp)).to.be.greaterThan(jan2023Timestamp);
    });

    it("Should mint multiple tokens with incremental IDs", async function () {
      await platzLandNFT.mintLand(addr1.address, "LAND1", "uri1");
      await platzLandNFT.mintLand(addr2.address, "LAND2", "uri2");
      
      expect(await platzLandNFT.ownerOf(0)).to.equal(addr1.address);
      expect(await platzLandNFT.ownerOf(1)).to.equal(addr2.address);
      
      expect(await platzLandNFT.tokenURI(0)).to.equal("uri1");
      expect(await platzLandNFT.tokenURI(1)).to.equal("uri2");
    });
  });

  describe("Token existence", function () {
    it("Should correctly report token existence", async function () {
      await platzLandNFT.mintLand(addr1.address, propertyReference, tokenURI);
      
      expect(await platzLandNFT.exists(0)).to.be.true;
      expect(await platzLandNFT.exists(1)).to.be.false;
    });
  });

  describe("Burning", function () {
    beforeEach(async function() {
      await platzLandNFT.mintLand(addr1.address, propertyReference, tokenURI);
    });

    it("Should allow token owner to burn their token", async function () {
      await platzLandNFT.connect(addr1).burn(0);
      
      await expect(platzLandNFT.ownerOf(0)).to.be.revertedWithCustomError(
        platzLandNFT,
        "ERC721NonexistentToken"
      );
      expect(await platzLandNFT.exists(0)).to.be.false;
    });

    it("Should allow approved address to burn a token", async function () {
      await platzLandNFT.connect(addr1).approve(addr2.address, 0);
      await platzLandNFT.connect(addr2).burn(0);
      
      expect(await platzLandNFT.exists(0)).to.be.false;
    });

    it("Should not allow unauthorized addresses to burn tokens", async function () {
      await expect(platzLandNFT.connect(addr2).burn(0)).to.be.revertedWith(
        "PlatzLandNFT: caller is not owner nor approved"
      );
    });
  });

  describe("Property details", function () {
    beforeEach(async function() {
      await platzLandNFT.mintLand(addr1.address, propertyReference, tokenURI);
    });

    it("Should return property details for existing token", async function () {
      const details = await platzLandNFT.getPropertyDetails(0);
      expect(details.propertyReference).to.equal(propertyReference);
    });

    it("Should revert when querying non-existent token", async function () {
      await expect(platzLandNFT.getPropertyDetails(999)).to.be.revertedWithCustomError(
        platzLandNFT,
        "ERC721NonexistentToken"
      );
    });
  });
}); 