const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const TechTrust = await hre.ethers.getContractFactory("TechTrust");

  // Deploy the contract
  const techTrust = await TechTrust.deploy();

  console.log("TechTrust deployed to:", techTrust.address);
}

// Execute the script and handle errors
main().catch((error) => {
  console.error("Error in deployment:", error);
  process.exitCode = 1;
});
