import { ethers } from 'hardhat';

/**
 * Deploy AchievementBadges Contract
 * 
 * This script deploys the ERC1155 Achievement Badges contract to the configured network
 * 
 * Usage:
 *   npx hardhat run scripts/deploy-badges.js --network base-mainnet
 *   npx hardhat run scripts/deploy-badges.js --network base-sepolia
 */

async function main() {
  console.log('🚀 Deploying AchievementBadges Contract...\n');

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deploying with account: ${deployer.address}`);

  // Get account balance
  const balance = await deployer.provider?.getBalance(deployer.address);
  console.log(`💰 Account balance: ${ethers.formatEther(balance)} ETH\n`);

  // Deploy contract
  const AchievementBadges = await ethers.getContractFactory('AchievementBadges');
  
  // Optional: Set OnChainResume contract address if deploying with it
  const onChainResumeAddress = process.env.ONCHAIN_RESUME_ADDRESS || ethers.ZeroAddress;
  
  console.log('📦 Deploying contract...');
  const achievementBadges = await AchievementBadges.deploy();
  
  await achievementBadges.deploymentTransaction()?.wait();
  const deployedAddress = await achievementBadges.getAddress();

  console.log(`✅ AchievementBadges deployed to: ${deployedAddress}\n`);

  // Set resume contract address if provided
  if (onChainResumeAddress !== ethers.ZeroAddress) {
    console.log(`🔗 Setting OnChainResume contract address: ${onChainResumeAddress}`);
    const tx = await achievementBadges.setResumeContractAddress(onChainResumeAddress);
    await tx.wait();
    console.log('✅ Resume contract address set\n');
  }

  // Initialize base URI for metadata
  const baseURI = process.env.BADGE_METADATA_URI || 'ipfs://';
  if (baseURI !== 'ipfs://') {
    console.log(`📍 Setting base URI: ${baseURI}`);
    const tx = await achievementBadges.setBaseURI(baseURI);
    await tx.wait();
    console.log('✅ Base URI set\n');
  }

  // Create default badges if this is a new deployment
  const totalBadges = await achievementBadges.getTotalBadgeTypes();
  if (totalBadges === 0n) {
    console.log('🏅 Creating default badges...\n');
    await createDefaultBadges(achievementBadges, deployer);
  }

  // Display deployment info
  console.log('\n📋 Deployment Summary:');
  console.log(`Network: ${ethers.provider.network?.name || 'unknown'}`);
  console.log(`Chain ID: ${(await ethers.provider.getNetwork()).chainId}`);
  console.log(`Contract Address: ${deployedAddress}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Total Badges: ${totalBadges}`);

  // Save deployment info
  const deploymentInfo = {
    network: ethers.provider.network?.name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    contractAddress: deployedAddress,
    deployer: deployer.address,
    deploymentBlock: await ethers.provider.getBlockNumber(),
    deploymentDate: new Date().toISOString(),
    transactionHash: achievementBadges.deploymentTransaction()?.hash,
  };

  console.log('\n💾 Deployment info (save this):');
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Update environment variables
  console.log('\n📝 Update your .env.local with:');
  console.log(`ACHIEVEMENT_BADGES_ADDRESS=${deployedAddress}`);
  console.log(`ACHIEVEMENT_BADGES_CHAIN=${(await ethers.provider.getNetwork()).chainId}`);

  return achievementBadges;
}

/**
 * Create default badges for the platform
 */
async function createDefaultBadges(contract: any, deployer: any) {
  const badges = [
    {
      name: 'Verified Professional',
      description: 'First resume verified on-chain',
      requiredReputation: 0,
      maxSupply: 1000,
      imageURI: 'ipfs://QmVerifiedProfessional',
    },
    {
      name: 'Rising Star',
      description: 'Reputation score above 1000',
      requiredReputation: 1000,
      maxSupply: 500,
      imageURI: 'ipfs://QmRisingStar',
    },
    {
      name: 'Expert Developer',
      description: 'Reputation score above 5000',
      requiredReputation: 5000,
      maxSupply: 100,
      imageURI: 'ipfs://QmExpertDeveloper',
    },
    {
      name: 'Hall of Fame',
      description: 'Reputation score above 10000',
      requiredReputation: 10000,
      maxSupply: 50,
      imageURI: 'ipfs://QmHallOfFame',
    },
    {
      name: 'Verified Credential',
      description: 'First credential verified',
      requiredReputation: 100,
      maxSupply: 3000,
      imageURI: 'ipfs://QmVerifiedCredential',
    },
    {
      name: 'Community Champion',
      description: 'Helped other community members',
      requiredReputation: 2000,
      maxSupply: 500,
      imageURI: 'ipfs://QmCommunityChampion',
    },
    {
      name: 'Thought Leader',
      description: 'Industry recognition and influence',
      requiredReputation: 7000,
      maxSupply: 50,
      imageURI: 'ipfs://QmThoughtLeader',
    },
    {
      name: 'Profile Pioneer',
      description: 'Early platform adopter',
      requiredReputation: 500,
      maxSupply: 200,
      imageURI: 'ipfs://QmProfilePioneer',
    },
    {
      name: 'Reputation Milestone',
      description: 'Reached 8000+ reputation',
      requiredReputation: 8000,
      maxSupply: 100,
      imageURI: 'ipfs://QmReputationMilestone',
    },
  ];

  for (let i = 0; i < badges.length; i++) {
    const badge = badges[i];
    console.log(`  Creating badge ${i + 1}/${badges.length}: ${badge.name}`);
    
    try {
      const tx = await contract.createBadge(
        i, // badgeId
        badge.name,
        badge.description,
        badge.requiredReputation,
        badge.maxSupply,
        badge.imageURI
      );
      
      const receipt = await tx.wait();
      console.log(`    ✅ Badge created (tx: ${receipt.hash.slice(0, 10)}...)`);
    } catch (error) {
      console.error(`    ❌ Failed to create badge: ${error}`);
    }
  }

  console.log(`\n✅ Created ${badges.length} default badges`);
}

// Run deployment
main()
  .then(() => {
    console.log('\n🎉 Deployment completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Deployment failed:');
    console.error(error);
    process.exit(1);
  });

/**
 * Expected output:
 * 
 * 🚀 Deploying AchievementBadges Contract...
 * 
 * 📝 Deploying with account: 0x...
 * 💰 Account balance: 5.123456 ETH
 * 
 * 📦 Deploying contract...
 * ✅ AchievementBadges deployed to: 0x...
 * 
 * 🏅 Creating default badges...
 * 
 *   Creating badge 1/9: Verified Professional
 *     ✅ Badge created (tx: 0x...)
 *   Creating badge 2/9: Rising Star
 *     ✅ Badge created (tx: 0x...)
 *   ...
 * 
 * ✅ Created 9 default badges
 * 
 * 📋 Deployment Summary:
 * Network: base-mainnet
 * Chain ID: 8453
 * Contract Address: 0x...
 * Deployer: 0x...
 * Total Badges: 9
 * 
 * 💾 Deployment info (save this):
 * {
 *   "network": "base-mainnet",
 *   "chainId": 8453,
 *   "contractAddress": "0x...",
 *   "deployer": "0x...",
 *   "deploymentBlock": 12345678,
 *   "deploymentDate": "2025-01-15T10:30:00.000Z",
 *   "transactionHash": "0x..."
 * }
 * 
 * 📝 Update your .env.local with:
 * ACHIEVEMENT_BADGES_ADDRESS=0x...
 * ACHIEVEMENT_BADGES_CHAIN=8453
 * 
 * 🎉 Deployment completed successfully!
 */
