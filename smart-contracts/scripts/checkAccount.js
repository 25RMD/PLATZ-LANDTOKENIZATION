// Script to check which account is derived from the private key

const { ethers } = require("ethers");

async function main() {
  const privateKey = "8d442fd15cc758fa0bf73cfb9e8db6f757bd8c65f95792e80751cfc75a2c3a94";
  
  // Create a wallet from the private key
  const wallet = new ethers.Wallet(privateKey);
  
  console.log("Private Key:", privateKey);
  console.log("Derived Address:", wallet.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  }); 