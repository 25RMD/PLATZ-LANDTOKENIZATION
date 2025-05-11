// Script to check which account Hardhat is actually using

const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Hardhat is using account address:", deployer.address);
  
  // Also check the balance of this account on Sepolia
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  // Also validate if this is the expected address
  const expectedAddress = "0x3ec4bfe3167ba77A5906C034AABE5537BA7c4B07";
  console.log("Is this the expected address?", deployer.address === expectedAddress);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  }); 