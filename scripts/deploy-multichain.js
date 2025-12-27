/**
 * Deployment Script for Multi-Chain Resume Contracts
 * Deploys to Base, Ethereum, and prepares Stacks contracts
 */

const hre = require('hardhat');

async function main() {
  console.log('🚀 Starting Multi-Chain Resume Deployment...\n');

  const [deployer] = await hre.ethers.getSigners();
  console.log(`📝 Deploying with account: ${deployer.address}\n`);

  // Get network info
  const network = await hre.ethers.provider.getNetwork();
  console.log(`🌐 Deploying to network: ${network.name} (ID: ${network.chainId})\n`);

  // ============ Deploy OnChainResumeEnhanced ============
  console.log('📦 Deploying OnChainResumeEnhanced...');
  const OnChainResumeEnhanced = await hre.ethers.getContractFactory('OnChainResumeEnhanced');
  const resumeContract = await OnChainResumeEnhanced.deploy();
  await resumeContract.deployed();
  console.log(`✅ OnChainResumeEnhanced deployed to: ${resumeContract.address}\n`);

  // ============ Deploy Reputation Token ============
  console.log('📦 Deploying Reputation Token (RRep)...');
  // Note: You'll need to create a ReputationToken contract
  // This is a placeholder - implement based on your token requirements
  const ReputationToken = await hre.ethers.getContractFactory('ReputationToken');
  let reputationToken;
  try {
    reputationToken = await ReputationToken.deploy('Resume Reputation', 'RRep');
    await reputationToken.deployed();
    console.log(`✅ ReputationToken deployed to: ${reputationToken.address}\n`);

    // Link reputation token to main contract
    await resumeContract.setReputationToken(reputationToken.address);
    console.log('✅ Reputation token linked to Resume contract\n');
  } catch (error) {
    console.log('⚠️  Reputation token deployment skipped (contract may not exist yet)\n');
  }

  // ============ Initialize Badges ============
  console.log('🎖️  Initializing Achievement Badges...');
  const badges = [
    {
      type: 'profile_complete',
      name: 'Profile Architect',
      tier: 1, // Bronze
      imageUrl: '/badges/profile-architect.svg',
      requiredScore: 0,
    },
    {
      type: 'first_credential',
      name: 'First Step',
      tier: 1,
      imageUrl: '/badges/first-step.svg',
      requiredScore: 0,
    },
    {
      type: 'five_credentials',
      name: 'Credential Collector',
      tier: 2, // Silver
      imageUrl: '/badges/credential-collector.svg',
      requiredScore: 0,
    },
    {
      type: 'verified_expert',
      name: 'Verified Expert',
      tier: 3, // Gold
      imageUrl: '/badges/verified-expert.svg',
      requiredScore: 500,
    },
    {
      type: 'community_contributor',
      name: 'Community Builder',
      tier: 2,
      imageUrl: '/badges/community-builder.svg',
      requiredScore: 200,
    },
    {
      type: 'reputation_milestone',
      name: 'Reputation Legend',
      tier: 4, // Platinum
      imageUrl: '/badges/reputation-legend.svg',
      requiredScore: 1000,
    },
    {
      type: 'skill_master',
      name: 'Skill Master',
      tier: 3,
      imageUrl: '/badges/skill-master.svg',
      requiredScore: 400,
    },
    {
      type: 'social_butterfly',
      name: 'Social Butterfly',
      tier: 2,
      imageUrl: '/badges/social-butterfly.svg',
      requiredScore: 300,
    },
    {
      type: 'early_adopter',
      name: 'Pioneer',
      tier: 4,
      imageUrl: '/badges/pioneer.svg',
      requiredScore: 0,
    },
    {
      type: 'chain_explorer',
      name: 'Multi-Chain Explorer',
      tier: 5, // Diamond
      imageUrl: '/badges/chain-explorer.svg',
      requiredScore: 600,
    },
  ];

  for (const badge of badges) {
    try {
      const tx = await resumeContract.createBadge(
        badge.type,
        badge.name,
        badge.tier,
        badge.imageUrl,
        badge.requiredScore
      );
      await tx.wait();
      console.log(`  ✅ Created badge: ${badge.name}`);
    } catch (error) {
      console.log(`  ⚠️  Failed to create badge ${badge.name}: ${error.message}`);
    }
  }
  console.log();

  // ============ Save Deployment Info ============
  console.log('💾 Saving deployment information...\n');

  const deploymentInfo = {
    network: {
      name: network.name,
      chainId: network.chainId,
    },
    contracts: {
      OnChainResumeEnhanced: resumeContract.address,
      ReputationToken: reputationToken?.address || 'Not deployed',
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    badges: badges.length,
  };

  const fs = require('fs');
  const deploymentPath = `./deployments/${network.chainId}-${network.name}.json`;

  // Create deployments directory if it doesn't exist
  if (!fs.existsSync('./deployments')) {
    fs.mkdirSync('./deployments');
  }

  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`✅ Deployment info saved to: ${deploymentPath}\n`);

  // ============ Verification Instructions ============
  console.log('🔍 Verification Instructions:\n');
  console.log('For Base Mainnet:');
  console.log(
    `  npx hardhat verify --network base ${resumeContract.address}\n`
  );

  console.log('For Base Sepolia:');
  console.log(
    `  npx hardhat verify --network base-sepolia ${resumeContract.address}\n`
  );

  console.log('For Ethereum:');
  console.log(
    `  npx hardhat verify --network mainnet ${resumeContract.address}\n`
  );

  // ============ Stacks Deployment Instructions ============
  console.log('📚 Stacks Deployment Instructions:\n');
  console.log('For Stacks Mainnet:');
  console.log('  1. Install Clarity CLI: https://github.com/stacks-network/clarity-cli');
  console.log('  2. Deploy contract: clarity-cli execute contracts/OnChainResume.clar');
  console.log('  3. Update NEXT_PUBLIC_STACKS_RESUME_CONTRACT in .env.local\n');

  console.log('For Stacks Testnet:');
  console.log('  1. Deploy to testnet using Clarity IDE or CLI');
  console.log(
    '  2. Update NEXT_PUBLIC_STACKS_RESUME_CONTRACT_TESTNET in .env.local\n'
  );

  // ============ Environment Variable Instructions ============
  console.log('📝 Update Your .env.local File:\n');
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${resumeContract.address}`);
  if (reputationToken) {
    console.log(`NEXT_PUBLIC_REPUTATION_TOKEN=${reputationToken.address}`);
  }
  console.log();

  // ============ Deployment Summary ============
  console.log('═════════════════════════════════════════');
  console.log('✅ DEPLOYMENT COMPLETE!');
  console.log('═════════════════════════════════════════\n');

  console.log('Contract Addresses:');
  console.log(`  OnChainResumeEnhanced: ${resumeContract.address}`);
  if (reputationToken) {
    console.log(`  ReputationToken:       ${reputationToken.address}`);
  }
  console.log();

  console.log('Network Information:');
  console.log(`  Network: ${network.name}`);
  console.log(`  Chain ID: ${network.chainId}`);
  console.log(`  Deployer: ${deployer.address}`);
  console.log();

  console.log('Next Steps:');
  console.log('  1. ✅ Verify contracts on block explorer');
  console.log('  2. ✅ Deploy to Stacks network');
  console.log('  3. ✅ Update environment variables');
  console.log('  4. ✅ Test on testnet before production');
  console.log('  5. ✅ Deploy frontend to production\n');

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:');
    console.error(error);
    process.exit(1);
  });
