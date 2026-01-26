const hre = require("hardhat");

async function main() {
  const deployments = require("../deployments.json");

  const nftAddress = deployments.contracts.nft;
  const marketplaceAddress = deployments.contracts.marketplace;
  const auctionAddress = deployments.contracts.auction;

  console.log("🔍 Verifying contracts on Basescan...\n");

  try {
    console.log("⏳ Verifying BitArtNFT...");
    await hre.run("verify:verify", {
      address: nftAddress,
      constructorArguments: [],
    });
    console.log("✅ BitArtNFT verified\n");
  } catch (error) {
    console.error("❌ BitArtNFT verification failed:", error.message, "\n");
  }

  try {
    console.log("⏳ Verifying BitArtMarketplace...");
    await hre.run("verify:verify", {
      address: marketplaceAddress,
      constructorArguments: [nftAddress],
    });
    console.log("✅ BitArtMarketplace verified\n");
  } catch (error) {
    console.error("❌ BitArtMarketplace verification failed:", error.message, "\n");
  }

  try {
    console.log("⏳ Verifying BitArtAuction...");
    await hre.run("verify:verify", {
      address: auctionAddress,
      constructorArguments: [nftAddress],
    });
    console.log("✅ BitArtAuction verified\n");
  } catch (error) {
    console.error("❌ BitArtAuction verification failed:", error.message, "\n");
  }

  console.log("🎉 Verification complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
