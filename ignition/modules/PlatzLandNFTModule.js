const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("PlatzLandNFTModule", (m) => {
  // Get the deployer address
  const deployer = m.getAccount(0);

  // Deploy the PlatzLandNFTWithCollections contract
  // The constructor only takes initialOwner parameter
  const platzLandNFT = m.contract("PlatzLandNFTWithCollections", [deployer]);

  return { platzLandNFT };
}); 