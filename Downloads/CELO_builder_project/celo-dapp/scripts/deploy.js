// Hardhat deployment script that uses the Hardhat Runtime Environment (hre).
// Usage (local): npx hardhat run scripts/deploy.js --network alfajores
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying SimplePayments with account:", deployer.address);

  const Factory = await hre.ethers.getContractFactory("SimplePayments");
  const contract = await Factory.deploy();
  await contract.deployed();

  console.log("SimplePayments deployed to:", contract.address);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
