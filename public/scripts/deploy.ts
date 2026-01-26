import { ethers } from "hardhat";

async function main() {
  console.log("Deploying AirStack Airdrop System to Base Chain...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Config from env (with sensible defaults)
  const REFERRAL_REWARD_AMOUNT = process.env.REFERRAL_REWARD_AMOUNT || "1000"; // in token units
  const REFERRAL_COOLDOWN = Number(process.env.REFERRAL_COOLDOWN || 86400); // seconds
  const STAKING_REWARD_RATE = process.env.STAKING_REWARD_RATE || ethers.parseUnits("1", 18).toString(); // scaled 1e18
  const FAIRLAUNCH_START = Number(process.env.FAIRLAUNCH_START || Math.floor(Date.now() / 1000) + 60);
  const FAIRLAUNCH_END = Number(process.env.FAIRLAUNCH_END || FAIRLAUNCH_START + 3600);
  const PRICE_WINDOW = Number(process.env.PRICE_WINDOW || 3600);

  // Deploy AirdropToken
  console.log("\nDeploying AirdropToken...");
  const AirdropToken = await ethers.getContractFactory("AirdropToken");
  const token = await AirdropToken.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("AirdropToken deployed to:", tokenAddress);

  // Deploy AirdropManager
  console.log("\nDeploying AirdropManager...");
  const AirdropManager = await ethers.getContractFactory("AirdropManager");
  const manager = await AirdropManager.deploy();
  await manager.waitForDeployment();
  const managerAddress = await manager.getAddress();
  console.log("AirdropManager deployed to:", managerAddress);

  // Deploy WhitelistManager
  console.log("\nDeploying WhitelistManager...");
  const WhitelistManager = await ethers.getContractFactory("WhitelistManager");
  const whitelist = await WhitelistManager.deploy();
  await whitelist.waitForDeployment();
  const whitelistAddress = await whitelist.getAddress();
  console.log("WhitelistManager deployed to:", whitelistAddress);

  // Deploy VestingSchedule
  console.log("\nDeploying VestingSchedule...");
  const VestingSchedule = await ethers.getContractFactory("VestingSchedule");
  const vesting = await VestingSchedule.deploy();
  await vesting.waitForDeployment();
  const vestingAddress = await vesting.getAddress();
  console.log("VestingSchedule deployed to:", vestingAddress);

  // Deploy Governance
  console.log("\nDeploying Governance...");
  const Governance = await ethers.getContractFactory("Governance");
  const governance = await Governance.deploy();
  await governance.waitForDeployment();
  const governanceAddress = await governance.getAddress();
  console.log("Governance deployed to:", governanceAddress);

  // Deploy MerkleTree
  console.log("\nDeploying MerkleTree...");
  const MerkleTree = await ethers.getContractFactory("MerkleTree");
  const merkleTree = await MerkleTree.deploy();
  await merkleTree.waitForDeployment();
  const merkleAddress = await merkleTree.getAddress();
  console.log("MerkleTree deployed to:", merkleAddress);

  // Deploy ETHAirdropManager
  console.log("\nDeploying ETHAirdropManager...");
  const ETHAirdropManager = await ethers.getContractFactory("ETHAirdropManager");
  const ethManager = await ETHAirdropManager.deploy();
  await ethManager.waitForDeployment();
  const ethManagerAddress = await ethManager.getAddress();
  console.log("ETHAirdropManager deployed to:", ethManagerAddress);

  // Deploy AirdropAggregator
  console.log("\nDeploying AirdropAggregator...");
  const AirdropAggregator = await ethers.getContractFactory("AirdropAggregator");
  const aggregator = await AirdropAggregator.deploy();
  await aggregator.waitForDeployment();
  const aggregatorAddress = await aggregator.getAddress();
  console.log("AirdropAggregator deployed to:", aggregatorAddress);

  // Deploy Analytics
  console.log("\nDeploying Analytics...");
  const Analytics = await ethers.getContractFactory("Analytics");
  const analytics = await Analytics.deploy();
  await analytics.waitForDeployment();
  const analyticsAddress = await analytics.getAddress();
  console.log("Analytics deployed to:", analyticsAddress);

  // Deploy RoleBasedAccessControl
  console.log("\nDeploying RoleBasedAccessControl...");
  const RoleBasedAccessControl = await ethers.getContractFactory("RoleBasedAccessControl");
  const rbac = await RoleBasedAccessControl.deploy();
  await rbac.waitForDeployment();
  const rbacAddress = await rbac.getAddress();
  console.log("RBAC deployed to:", rbacAddress);

  // Deploy KYCAMLCompliance
  console.log("\nDeploying KYCAMLCompliance...");
  const KYCAMLCompliance = await ethers.getContractFactory("KYCAMLCompliance");
  const kyc = await KYCAMLCompliance.deploy();
  await kyc.waitForDeployment();
  const kycAddress = await kyc.getAddress();
  console.log("KYCAMLCompliance deployed to:", kycAddress);

  // Deploy MultiSigVault
  console.log("\nDeploying MultiSigVault...");
  const MultiSigVault = await ethers.getContractFactory("MultiSigVault");
  const multisig = await MultiSigVault.deploy();
  await multisig.waitForDeployment();
  const multisigAddress = await multisig.getAddress();
  console.log("MultiSigVault deployed to:", multisigAddress);

  // Deploy SnapshotEligibility (for token)
  console.log("\nDeploying SnapshotEligibility...");
  const SnapshotEligibility = await ethers.getContractFactory("SnapshotEligibility");
  const snapshot = await SnapshotEligibility.deploy(tokenAddress);
  await snapshot.waitForDeployment();
  const snapshotAddress = await snapshot.getAddress();
  console.log("SnapshotEligibility deployed to:", snapshotAddress);

  // Deploy ReferralBountySystem
  console.log("\nDeploying ReferralBountySystem...");
  const ReferralBountySystem = await ethers.getContractFactory("ReferralBountySystem");
  const referral = await ReferralBountySystem.deploy(
    tokenAddress,
    ethers.parseUnits(REFERRAL_REWARD_AMOUNT, 6),
    REFERRAL_COOLDOWN
  );
  await referral.waitForDeployment();
  const referralAddress = await referral.getAddress();
  console.log("ReferralBountySystem deployed to:", referralAddress);

  // Deploy StakingRewards
  console.log("\nDeploying StakingRewards...");
  const StakingRewards = await ethers.getContractFactory("StakingRewards");
  const staking = await StakingRewards.deploy(
    tokenAddress,
    tokenAddress,
    STAKING_REWARD_RATE
  );
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("StakingRewards deployed to:", stakingAddress);

  // Deploy FairLaunchMechanism
  console.log("\nDeploying FairLaunchMechanism...");
  const FairLaunchMechanism = await ethers.getContractFactory("FairLaunchMechanism");
  const fair = await FairLaunchMechanism.deploy(tokenAddress, FAIRLAUNCH_START, FAIRLAUNCH_END);
  await fair.waitForDeployment();
  const fairAddress = await fair.getAddress();
  console.log("FairLaunchMechanism deployed to:", fairAddress);

  // Deploy PriceDiscovery
  console.log("\nDeploying PriceDiscovery...");
  const PriceDiscovery = await ethers.getContractFactory("PriceDiscovery");
  const price = await PriceDiscovery.deploy(PRICE_WINDOW);
  await price.waitForDeployment();
  const priceAddress = await price.getAddress();
  console.log("PriceDiscovery deployed to:", priceAddress);

  // Deploy advanced managers
  console.log("\nDeploying MultiTokenAirdropManager...");
  const MultiTokenAirdropManager = await ethers.getContractFactory("MultiTokenAirdropManager");
  const multiTokenManager = await MultiTokenAirdropManager.deploy();
  await multiTokenManager.waitForDeployment();
  const multiTokenManagerAddress = await multiTokenManager.getAddress();
  console.log("MultiTokenAirdropManager deployed to:", multiTokenManagerAddress);

  console.log("\nDeploying NFTAirdropManager...");
  const NFTAirdropManager = await ethers.getContractFactory("NFTAirdropManager");
  const nftManager = await NFTAirdropManager.deploy();
  await nftManager.waitForDeployment();
  const nftManagerAddress = await nftManager.getAddress();
  console.log("NFTAirdropManager deployed to:", nftManagerAddress);

  console.log("\nDeploying LPTokenDistributor...");
  const LPTokenDistributor = await ethers.getContractFactory("LPTokenDistributor");
  const lpDistributor = await LPTokenDistributor.deploy();
  await lpDistributor.waitForDeployment();
  const lpDistributorAddress = await lpDistributor.getAddress();
  console.log("LPTokenDistributor deployed to:", lpDistributorAddress);

  console.log("\nDeploying DynamicAllocationManager...");
  const DynamicAllocationManager = await ethers.getContractFactory("DynamicAllocationManager");
  const dynAlloc = await DynamicAllocationManager.deploy();
  await dynAlloc.waitForDeployment();
  const dynAllocAddress = await dynAlloc.getAddress();
  console.log("DynamicAllocationManager deployed to:", dynAllocAddress);

  // Wire RBAC/KYC for advanced managers
  console.log("\nWiring RBAC/KYC into advanced managers...");
  await (await multiTokenManager.setAccessControl(rbacAddress)).wait();
  await (await multiTokenManager.setCompliance(kycAddress, true)).wait();
  await (await nftManager.setAccessControl(rbacAddress)).wait();
  await (await nftManager.setCompliance(kycAddress, true)).wait();
  await (await lpDistributor.setAccessControl(rbacAddress)).wait();
  await (await lpDistributor.setCompliance(kycAddress, true)).wait();
  await (await dynAlloc.setAccessControl(rbacAddress)).wait();
  await (await dynAlloc.setCompliance(kycAddress, true)).wait();

  // Save deployment addresses
  const deploymentInfo = {
    network: "base",
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      AirdropToken: tokenAddress,
      AirdropManager: managerAddress,
      WhitelistManager: whitelistAddress,
      VestingSchedule: vestingAddress,
      Governance: governanceAddress,
      MerkleTree: merkleAddress,
      ETHAirdropManager: ethManagerAddress,
      AirdropAggregator: aggregatorAddress,
      Analytics: analyticsAddress,
      RoleBasedAccessControl: rbacAddress,
      KYCAMLCompliance: kycAddress,
      MultiSigVault: multisigAddress,
      SnapshotEligibility: snapshotAddress,
      ReferralBountySystem: referralAddress,
      StakingRewards: stakingAddress,
      FairLaunchMechanism: fairAddress,
      PriceDiscovery: priceAddress,
      MultiTokenAirdropManager: multiTokenManagerAddress,
      NFTAirdropManager: nftManagerAddress,
      LPTokenDistributor: lpDistributorAddress,
      DynamicAllocationManager: dynAllocAddress,
    },
  };

  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Transfer some tokens to manager for testing
  console.log("\nTransferring tokens to AirdropManager...");
  const transferAmount = ethers.parseUnits("1000000", 6); // 1M tokens
  await token.transfer(managerAddress, transferAmount);
  console.log("Transferred 1,000,000 tokens to AirdropManager");

  console.log("\nDeployment complete!");
  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
