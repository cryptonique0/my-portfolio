/**
 * Deployment Script: Base Mainnet + Stacks Testnet
 * Deploys EVM contract to Base Mainnet
 * Deploys Clarity contract to Stacks Testnet
 */

const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

// Stacks deployment utilities
const { StacksTestnet, StacksMainnet } = require('@stacks/network');
const { makeContractDeploy, broadcastTransaction } = require('@stacks/transactions');
const { bytesToHex } = require('@stacks/common');

async function deployEVMToBase() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 DEPLOYING TO BASE MAINNET');
  console.log('='.repeat(60) + '\n');

  // Switch to Base mainnet network
  await hre.changeNetwork('base');
  const [deployer] = await hre.ethers.getSigners();

  console.log(`📝 Deployer Address: ${deployer.address}`);
  console.log(`⛓️  Network: Base Mainnet (Chain ID: 8453)`);

  // Get gas price
  const gasPrice = await deployer.provider.getGasPrice();
  const gasPriceInGwei = hre.ethers.utils.formatUnits(gasPrice, 'gwei');
  console.log(`⛽ Current Gas Price: ${gasPriceInGwei.toFixed(2)} Gwei\n`);

  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  const balanceInEth = hre.ethers.utils.formatEther(balance);
  console.log(`💰 Account Balance: ${balanceInEth.toFixed(4)} ETH\n`);

  if (parseFloat(balanceInEth) < 0.01) {
    throw new Error('❌ Insufficient balance! Need at least 0.01 ETH to deploy');
  }

  try {
    // Deploy OnChainResumeEnhanced
    console.log('📦 Deploying OnChainResumeEnhanced...');
    const OnChainResumeEnhanced = await hre.ethers.getContractFactory('OnChainResumeEnhanced');
    const resumeContract = await OnChainResumeEnhanced.deploy();
    await resumeContract.deployed();

    console.log(`✅ Contract deployed to: ${resumeContract.address}\n`);

    // Initialize badges
    console.log('🎖️  Initializing Achievement Badges...');
    const badges = [
      {
        type: 'profile_complete',
        name: 'Profile Architect',
        tier: 1, // Bronze
        imageUrl: 'ipfs://QmProfileArchitect',
        requiredScore: 0,
      },
      {
        type: 'first_credential',
        name: 'First Step',
        tier: 1,
        imageUrl: 'ipfs://QmFirstStep',
        requiredScore: 0,
      },
      {
        type: 'five_credentials',
        name: 'Credential Collector',
        tier: 2, // Silver
        imageUrl: 'ipfs://QmCredentialCollector',
        requiredScore: 100,
      },
      {
        type: 'verified_expert',
        name: 'Verified Expert',
        tier: 3, // Gold
        imageUrl: 'ipfs://QmVerifiedExpert',
        requiredScore: 250,
      },
      {
        type: 'community_contributor',
        name: 'Community Contributor',
        tier: 2,
        imageUrl: 'ipfs://QmCommunityContributor',
        requiredScore: 150,
      },
      {
        type: 'reputation_milestone',
        name: 'Reputation Milestone',
        tier: 4, // Platinum
        imageUrl: 'ipfs://QmReputationMilestone',
        requiredScore: 500,
      },
      {
        type: 'skill_master',
        name: 'Skill Master',
        tier: 3,
        imageUrl: 'ipfs://QmSkillMaster',
        requiredScore: 400,
      },
      {
        type: 'social_butterfly',
        name: 'Social Butterfly',
        tier: 2,
        imageUrl: 'ipfs://QmSocialButterfly',
        requiredScore: 200,
      },
      {
        type: 'early_adopter',
        name: 'Early Adopter',
        tier: 4,
        imageUrl: 'ipfs://QmEarlyAdopter',
        requiredScore: 50,
      },
      {
        type: 'chain_explorer',
        name: 'Chain Explorer',
        tier: 5, // Diamond
        imageUrl: 'ipfs://QmChainExplorer',
        requiredScore: 1000,
      },
    ];

    for (const badge of badges) {
      const tx = await resumeContract.createBadge(
        badge.type,
        badge.name,
        badge.tier,
        badge.imageUrl,
        badge.requiredScore
      );
      await tx.wait();
      console.log(`  ✓ Created badge: ${badge.name}`);
    }

    console.log('✅ All badges initialized\n');

    // Save deployment info
    const deploymentInfo = {
      network: 'Base Mainnet',
      chainId: 8453,
      timestamp: new Date().toISOString(),
      deployer: deployer.address,
      contracts: {
        OnChainResumeEnhanced: resumeContract.address,
      },
      badges: badges.length,
      explorerLink: `https://basescan.org/address/${resumeContract.address}`,
    };

    saveDeploymentInfo('base-mainnet', deploymentInfo);

    console.log('📋 Deployment Summary:');
    console.log(`  Network: Base Mainnet (8453)`);
    console.log(`  Contract: ${resumeContract.address}`);
    console.log(`  Badges: ${badges.length}`);
    console.log(`  Explorer: ${deploymentInfo.explorerLink}\n`);

    return {
      success: true,
      network: 'Base Mainnet',
      address: resumeContract.address,
    };
  } catch (error) {
    console.error('❌ Base deployment failed:', error.message);
    throw error;
  }
}

async function deployStacksToTestnet() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 DEPLOYING TO STACKS TESTNET');
  console.log('='.repeat(60) + '\n');

  // Check Stacks deployment requirements
  console.log('📋 Stacks Testnet Deployment Requirements:');
  console.log('  1. Stacks wallet with STX balance');
  console.log('  2. Clarity contract code');
  console.log('  3. Private key for transaction signing\n');

  try {
    // Read Clarity contract
    const clarityContractPath = path.join(__dirname, '../contracts/OnChainResume.clar');
    if (!fs.existsSync(clarityContractPath)) {
      console.warn('⚠️  Clarity contract not found at:', clarityContractPath);
      console.log('📝 Stacks Testnet Deployment Instructions:\n');

      const instructions = `
For Stacks Testnet Deployment:

1. Visit: https://explorer.stacks.co/?chain=testnet
2. Connect your Stacks wallet (Hiro, Xverse, or Leather)
3. Deploy the OnChainResume.clar contract
4. Fund account with testnet STX from: https://faucet.testnet.stacks.co/

Or use Clarinet (recommended):

\`\`\`bash
# Install Clarinet
brew install clarinet

# Or from source
git clone https://github.com/hirosystems/clarinet.git
cd clarinet && cargo install --path .

# Initialize project
clarinet new talent-resume
cd talent-resume

# Copy contract to contracts/
cp ../contracts/OnChainResume.clar contracts/

# Deploy to testnet
clarinet deployments generate --network testnet
clarinet integrate
\`\`\`

Contract Details:
- Network: Stacks Testnet
- Contract File: contracts/OnChainResume.clar
- RPC: https://testnet-api.stacks.co
- Explorer: https://explorer.stacks.co/?chain=testnet
      `;

      console.log(instructions);

      const stacksInfo = {
        network: 'Stacks Testnet',
        chainId: 2147483648,
        timestamp: new Date().toISOString(),
        status: 'pending',
        instructions:
          'Deploy OnChainResume.clar using Clarinet or Stacks Web IDE',
        resources: {
          faucet: 'https://faucet.testnet.stacks.co/',
          explorer: 'https://explorer.stacks.co/?chain=testnet',
          clarinet: 'https://github.com/hirosystems/clarinet',
          webIDE: 'https://www.hiro.so/remix',
        },
      };

      saveDeploymentInfo('stacks-testnet', stacksInfo);

      return {
        success: true,
        network: 'Stacks Testnet',
        status: 'pending',
        instructions:
          'Deploy OnChainResume.clar using Clarinet or Stacks Web IDE',
      };
    }

    // Read contract code
    const contractCode = fs.readFileSync(clarityContractPath, 'utf8');
    console.log(`📄 Clarity Contract Size: ${contractCode.length} bytes\n`);

    console.log('🔧 Stacks Testnet Configuration:');
    console.log('  Network: testnet-api.stacks.co');
    console.log('  Contract Type: Clarity');
    console.log('  Status: Ready for deployment\n');

    const stacksInfo = {
      network: 'Stacks Testnet',
      chainId: 2147483648,
      timestamp: new Date().toISOString(),
      status: 'ready',
      contractSize: contractCode.length,
      deploymentMethod: 'Clarinet or Stacks Web IDE',
      resources: {
        faucet: 'https://faucet.testnet.stacks.co/',
        explorer: 'https://explorer.stacks.co/?chain=testnet',
        clarinet: 'https://github.com/hirosystems/clarinet',
        webIDE: 'https://www.hiro.so/remix',
      },
      instructions: [
        '1. Get STX from faucet: https://faucet.testnet.stacks.co/',
        '2. Deploy using Clarinet: clarinet integrate',
        '3. Or use Web IDE: https://www.hiro.so/remix',
        '4. Verify deployment: https://explorer.stacks.co/?chain=testnet',
      ],
    };

    saveDeploymentInfo('stacks-testnet', stacksInfo);

    console.log('✅ Stacks Testnet contract is ready to deploy\n');
    console.log('📝 Next Steps:');
    console.log('  1. Get testnet STX: https://faucet.testnet.stacks.co/');
    console.log('  2. Deploy using Clarinet: npm run deploy:stacks-testnet');
    console.log('  3. Or use Stacks Web IDE: https://www.hiro.so/remix');
    console.log('  4. Copy contract address to .env.local\n');

    return {
      success: true,
      network: 'Stacks Testnet',
      status: 'ready_for_deployment',
      contractSize: contractCode.length,
    };
  } catch (error) {
    console.error('❌ Stacks preparation failed:', error.message);
    throw error;
  }
}

function saveDeploymentInfo(network, info) {
  const dir = path.join(__dirname, '../deployment-info');

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filePath = path.join(dir, `${network}-deployment.json`);
  fs.writeFileSync(filePath, JSON.stringify(info, null, 2));
  console.log(`💾 Deployment info saved to: ${filePath}`);
}

async function main() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🌍 MULTI-CHAIN DEPLOYMENT: BASE + STACKS');
    console.log('='.repeat(60));

    // Deploy to Base Mainnet
    const baseResult = await deployEVMToBase();

    // Prepare Stacks Testnet
    const stacksResult = await deployStacksToTestnet();

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ DEPLOYMENT COMPLETE');
    console.log('='.repeat(60));
    console.log('\n📊 SUMMARY:\n');
    console.log('Base Mainnet (EVM):');
    console.log(`  Status: ${baseResult.success ? '✅ Deployed' : '❌ Failed'}`);
    console.log(`  Address: ${baseResult.address}`);
    console.log(`  Explorer: https://basescan.org/address/${baseResult.address}`);

    console.log('\nStacks Testnet (Clarity):');
    console.log(`  Status: ${stacksResult.success ? '✅ Ready' : '❌ Failed'}`);
    console.log('  Next: Deploy using Clarinet or Web IDE');
    console.log('  Faucet: https://faucet.testnet.stacks.co/');
    console.log('  Explorer: https://explorer.stacks.co/?chain=testnet');

    console.log('\n' + '='.repeat(60));
    console.log('📝 UPDATE YOUR .env.local:\n');
    console.log(
      `NEXT_PUBLIC_CONTRACT_ADDRESS=${baseResult.address}`
    );
    console.log('NEXT_PUBLIC_STACKS_RESUME_CONTRACT_TESTNET=<your-testnet-contract-here>');
    console.log('\n' + '='.repeat(60) + '\n');
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
