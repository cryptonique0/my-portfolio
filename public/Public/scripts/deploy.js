const hre = require("hardhat");

async function main() {
  console.log("Deploying Chess contracts to Base network...");

  // Deploy Chess contract
  const Chess = await hre.ethers.getContractFactory("Chess");
  const chess = await Chess.deploy();
  await chess.waitForDeployment();
  const chessAddress = await chess.getAddress();
  
  console.log(`Chess contract deployed to: ${chessAddress}`);

  // Deploy ChessFactory contract
  const ChessFactory = await hre.ethers.getContractFactory("ChessFactory");
  const factory = await ChessFactory.deploy(chessAddress);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  
  console.log(`ChessFactory contract deployed to: ${factoryAddress}`);

  // Wait for a few block confirmations
  console.log("Waiting for block confirmations...");
  await chess.deploymentTransaction().wait(5);
  await factory.deploymentTransaction().wait(5);

  // Verify contracts on Basescan
  if (process.env.BASESCAN_API_KEY) {
    console.log("Verifying contracts on Basescan...");
    
    try {
      await hre.run("verify:verify", {
        address: chessAddress,
        constructorArguments: [],
      });
      console.log("Chess contract verified");
    } catch (error) {
      console.log("Chess verification error:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: factoryAddress,
        constructorArguments: [chessAddress],
      });
      console.log("ChessFactory contract verified");
    } catch (error) {
      console.log("ChessFactory verification error:", error.message);
    }
  }

  console.log("\nDeployment Summary:");
  console.log("===================");
  console.log(`Chess: ${chessAddress}`);
  console.log(`ChessFactory: ${factoryAddress}`);
  console.log("\nSave these addresses to your .env file:");
  console.log(`CHESS_CONTRACT_ADDRESS=${chessAddress}`);
  console.log(`CHESS_FACTORY_ADDRESS=${factoryAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
