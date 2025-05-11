import hre from "hardhat";
import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { PlatzLandNFT } from "../typechain-types"; // Adjust path based on your typechain output

const { ethers } = hre; // Destructure ethers from HRE

describe("PlatzLandNFT", function () {
    let deployer: HardhatEthersSigner;
    let user1: HardhatEthersSigner;
    let user2: HardhatEthersSigner;
    let landNFT: PlatzLandNFT;

    const TOKEN_NAME = "PlatzLandToken";
    const TOKEN_SYMBOL = "PLT";

    beforeEach(async function () {
        [deployer, user1, user2] = await ethers.getSigners();

        const PlatzLandNFTFactory = await ethers.getContractFactory("PlatzLandNFT");
        landNFT = await PlatzLandNFTFactory.connect(deployer).deploy(deployer.address) as PlatzLandNFT;
        await landNFT.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await landNFT.owner()).to.equal(deployer.address);
        });

        it("Should have correct name and symbol", async function () {
            expect(await landNFT.name()).to.equal(TOKEN_NAME);
            expect(await landNFT.symbol()).to.equal(TOKEN_SYMBOL);
        });

        it("Should initialize _nextTokenId to 1", async function () {
            // We can't directly check private state, so we mint one and check its ID
            const tokenURI = "ipfs://someuri/1";
            const propertyRef = "Parcel-ABC-123";
            await landNFT.connect(deployer).safeMint(user1.address, tokenURI, propertyRef);
            expect(await landNFT.ownerOf(1)).to.equal(user1.address); // Token ID should be 1
        });
    });

    describe("Minting", function () {
        const tokenId = 1;
        const tokenURI = "ipfs://someuri/1";
        const propertyRef = "Parcel-ABC-123";

        it("Should allow owner to mint an NFT", async function () {
            await expect(landNFT.connect(deployer).safeMint(user1.address, tokenURI, propertyRef))
                .to.emit(landNFT, "NFTMinted")
                .withArgs(user1.address, tokenId, tokenURI, propertyRef);
            
            expect(await landNFT.ownerOf(tokenId)).to.equal(user1.address);
            expect(await landNFT.tokenURI(tokenId)).to.equal(tokenURI);
            expect(await landNFT.getPropertyReference(tokenId)).to.equal(propertyRef);
            expect(await landNFT.totalSupply()).to.equal(1);
        });

        it("Should not allow non-owner to mint an NFT", async function () {
            await expect(landNFT.connect(user1).safeMint(user2.address, tokenURI, propertyRef))
                .to.be.revertedWithCustomError(landNFT, "OwnableUnauthorizedAccount").withArgs(user1.address);
        });

        it("Should correctly increment token IDs", async function () {
            await landNFT.connect(deployer).safeMint(user1.address, "uri1", "ref1"); // Token ID 1
            await landNFT.connect(deployer).safeMint(user2.address, "uri2", "ref2"); // Token ID 2

            expect(await landNFT.ownerOf(1)).to.equal(user1.address);
            expect(await landNFT.ownerOf(2)).to.equal(user2.address);
            expect(await landNFT.totalSupply()).to.equal(2);
        });
    });

    describe("Token URI and Property Reference", function () {
        const tokenId = 1;
        const nonExistentTokenId = 99;
        const tokenURI = "ipfs://unique/uri";
        const propertyRef = "UniquePropRef";

        beforeEach(async function () {
            await landNFT.connect(deployer).safeMint(user1.address, tokenURI, propertyRef);
        });

        it("tokenURI should return correct URI for existing token", async function () {
            expect(await landNFT.tokenURI(tokenId)).to.equal(tokenURI);
        });

        it("tokenURI should revert for non-existent token", async function () {
            await expect(landNFT.tokenURI(nonExistentTokenId))
                .to.be.revertedWithCustomError(landNFT, "ERC721NonexistentToken")
                .withArgs(nonExistentTokenId);
        });
        
        it("getPropertyReference should return correct ref for existing token", async function () {
            expect(await landNFT.getPropertyReference(tokenId)).to.equal(propertyRef);
        });

        it("getPropertyReference should revert for non-existent token", async function () {
            await expect(landNFT.getPropertyReference(nonExistentTokenId))
                .to.be.revertedWithCustomError(landNFT, "ERC721NonexistentToken")
                .withArgs(nonExistentTokenId);
        });
    });

    // TODO: Add tests for ERC721 transfer, approval, ERC721Enumerable, Ownable functions
}); 