const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying OnChainResume contract...");

  // Get the contract factory
  const OnChainResume = await hre.ethers.getContractFactory("OnChainResume");

  // Deploy the contract
  const contract = await OnChainResume.deploy();
  await contract.deployed();

  console.log("\n✅ Contract deployed successfully!");
  console.log(`📍 Contract Address: ${contract.address}`);
  console.log(`🌐 Network: ${hre.network.name}`);
  console.log(`⛓️  Chain ID: ${(await hre.ethers.provider.getNetwork()).chainId}`);

  // Save deployment info
  const deploymentInfo = {
    contractAddress: contract.address,
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId,
    deployedAt: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const filename = path.join(deploymentsDir, `${hre.network.name}-deployment.json`);
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));

  console.log(`\n📄 Deployment info saved to: ${filename}`);

  // Export for next.js config
  const envContent = `# Contract Deployment Info
NEXT_PUBLIC_CONTRACT_ADDRESS=${contract.address}
NEXT_PUBLIC_NETWORK=${hre.network.name}
NEXT_PUBLIC_CHAIN_ID=${(await hre.ethers.provider.getNetwork()).chainId}
`;

  fs.appendFileSync(path.join(__dirname, "..", ".env.local"), "\n" + envContent);
  console.log("✅ Environment variables updated");

  return contract.address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
