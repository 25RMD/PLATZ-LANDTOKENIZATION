const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Creating collection with account:", deployer.address);

  const contractAddress = "0x155e70f694E645907d36583Cca893BE52bf3A29f";
  const PlatzLandNFT = await ethers.getContractFactory("PlatzLandNFTWithCollections");
  const contract = PlatzLandNFT.attach(contractAddress);

  console.log("Creating test collection...");
  
  const mainTokenURI = "ipfs://QmTest1234/main.json";
  const quantity = 5;
  const collectionURI = "ipfs://QmTest1234/collection.json";
  const baseURI = "ipfs://QmTest1234/tokens/";

  const tx = await contract.createCollection(
    deployer.address,
    mainTokenURI,
    quantity,
    collectionURI,
    baseURI
  );

  console.log("Transaction hash:", tx.hash);
  await tx.wait();
  console.log("Collection created successfully!");

  const collectionCount = await contract.getCollectionCount();
  console.log("Total collections:", collectionCount.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 