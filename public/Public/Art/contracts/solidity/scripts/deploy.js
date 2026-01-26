const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying BitArt contracts to Base Mainnet...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log(`📍 Deploying from account: ${deployer.address}`);
  console.log(`💰 Account balance: ${await deployer.provider.getBalance(deployer.address)}`);

  // Deploy BitArtNFT
  console.log("\n⏳ Deploying BitArtNFT...");
  const BitArtNFT = await hre.ethers.getContractFactory("BitArtNFT");
  const nftContract = await BitArtNFT.deploy();
  await nftContract.deployed();
  console.log(`✅ BitArtNFT deployed to: ${nftContract.address}`);

  // Deploy BitArtMarketplace
  console.log("\n⏳ Deploying BitArtMarketplace...");
  const BitArtMarketplace = await hre.ethers.getContractFactory("BitArtMarketplace");
  const marketplaceContract = await BitArtMarketplace.deploy(nftContract.address);
  await marketplaceContract.deployed();
  console.log(`✅ BitArtMarketplace deployed to: ${marketplaceContract.address}`);

  // Deploy BitArtAuction
  console.log("\n⏳ Deploying BitArtAuction...");
  const BitArtAuction = await hre.ethers.getContractFactory("BitArtAuction");
  const auctionContract = await BitArtAuction.deploy(nftContract.address);
  await auctionContract.deployed();
  console.log(`✅ BitArtAuction deployed to: ${auctionContract.address}`);

  // Print deployment summary
  console.log("\n" + "=".repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log(`Network: ${hre.network.name}`);
  console.log(`Deployer: ${deployer.address}\n`);
  console.log(`BitArtNFT: ${nftContract.address}`);
  console.log(`BitArtMarketplace: ${marketplaceContract.address}`);
  console.log(`BitArtAuction: ${auctionContract.address}`);
  console.log("=".repeat(60));

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      nft: nftContract.address,
      marketplace: marketplaceContract.address,
      auction: auctionContract.address,
    },
  };

  const fs = require("fs");
  fs.writeFileSync(
    "deployments.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n💾 Deployment info saved to deployments.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
