// Deploy advanced chess contracts
import { ethers } from "hardhat";

async function main() {
  console.log("Deploying advanced chess learning platform...");

  // Deploy ChessAcademy
  console.log("\n1. Deploying ChessAcademy...");
  const ChessAcademy = await ethers.getContractFactory("ChessAcademy");
  const academy = await ChessAcademy.deploy();
  await academy.waitForDeployment();
  const academyAddress = await academy.getAddress();
  console.log("ChessAcademy deployed to:", academyAddress);

  // Deploy ChessCoach
  console.log("\n2. Deploying ChessCoach...");
  const [deployer] = await ethers.getSigners();
  const platformWallet = deployer.address; // Use deployer as platform wallet for now
  
  const ChessCoach = await ethers.getContractFactory("ChessCoach");
  const coach = await ChessCoach.deploy(platformWallet);
  await coach.waitForDeployment();
  const coachAddress = await coach.getAddress();
  console.log("ChessCoach deployed to:", coachAddress);

  // Deploy ChessPuzzles
  console.log("\n3. Deploying ChessPuzzles...");
  const ChessPuzzles = await ethers.getContractFactory("ChessPuzzles");
  const puzzles = await ChessPuzzles.deploy();
  await puzzles.waitForDeployment();
  const puzzlesAddress = await puzzles.getAddress();
  console.log("ChessPuzzles deployed to:", puzzlesAddress);

  // Setup initial data
  console.log("\n4. Setting up initial achievements and learning paths...");
  
  // Create sample achievements
  await academy.createAchievement(
    "First Steps",
    "Complete your first lesson",
    "ipfs://QmFirstSteps",
    0,
    1,
    0, // Opening
    0
  );
  console.log("Created achievement: First Steps");

  await academy.createAchievement(
    "Tactical Master",
    "Reach 800 rating in tactics",
    "ipfs://QmTacticalMaster",
    10,
    5,
    3, // Tactics
    800
  );
  console.log("Created achievement: Tactical Master");

  await academy.createAchievement(
    "Endgame Expert",
    "Reach 900 rating in endgames",
    "ipfs://QmEndgameExpert",
    20,
    10,
    2, // Endgame
    900
  );
  console.log("Created achievement: Endgame Expert");

  // Create sample learning path
  const lessonIds = []; // Would be populated with actual lesson IDs
  const focusAreas = [0, 3]; // Opening and Tactics
  
  await academy.createLearningPath(
    "Beginner Fundamentals",
    "Master the basics of chess",
    lessonIds,
    3, // Difficulty 1-10
    focusAreas,
    10 // Estimated hours
  );
  console.log("Created learning path: Beginner Fundamentals");

  // Create sample puzzle
  await puzzles.createPuzzle(
    "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
    ["e2e4", "e7e5", "g1f3"], // Sample solution
    3, // Tactics
    1, // Intermediate
    1500,
    { value: ethers.parseEther("0.01") } // 0.01 ETH reward pool
  );
  console.log("Created sample puzzle");

  // Fund the daily leaderboard prize pool
  console.log("\n5. Funding daily leaderboard prize pool...");
  await puzzles.fundLeaderboardPrizePool({
    value: ethers.parseEther("0.5") // Initial 0.5 ETH funding (5 days worth)
  });
  console.log("Funded leaderboard prize pool with 0.5 ETH");

  console.log("\n✅ Deployment complete!");
  console.log("\n📝 Contract Addresses:");
  console.log("ChessAcademy:", academyAddress);
  console.log("ChessCoach:", coachAddress);
  console.log("ChessPuzzles:", puzzlesAddress);
  console.log("\n💡 Update these addresses in contracts/addresses.ts");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
