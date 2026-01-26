import { 
  makeContractDeploy,
  broadcastTransaction,
  AnchorMode
} from '@stacks/transactions';
import { readFileSync } from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.contracts' });

interface DeploymentConfig {
  contractName: string;
  filePath: string;
  privateKey: string;
  network: 'testnet' | 'mainnet';
}

async function deployContract(config: DeploymentConfig) {
  try {
    console.log(`\n🚀 Deploying ${config.contractName}...`);
    
    // Read contract source
    const contractSource = readFileSync(config.filePath, 'utf-8');
    console.log(`📄 Contract source loaded (${contractSource.length} bytes)`);
    
    // Create deployment transaction
    const txOptions = {
      contractName: config.contractName,
      codeBody: contractSource,
      senderKey: config.privateKey,
      network: config.network,
      anchorMode: AnchorMode.Any,
      fee: 10000, // STX microunits for deployment
    };
    
    console.log('⏳ Creating transaction...');
    const transaction = await makeContractDeploy(txOptions);
    
    console.log('📡 Broadcasting transaction...');
    const broadcastResponse = await broadcastTransaction(transaction, config.network);
    
    // Get sender address from transaction
    const { getAddressFromPrivateKey, TransactionVersion } = await import('@stacks/transactions');
    const senderAddress = getAddressFromPrivateKey(
      config.privateKey,
      config.network === 'testnet' ? TransactionVersion.Testnet : TransactionVersion.Mainnet
    );
    const contractAddress = `${senderAddress}.${config.contractName}`;
    
    console.log('\n✅ Contract deployment initiated!');
    console.log(`   Transaction ID: ${broadcastResponse.txid}`);
    console.log(`   Contract Address: ${contractAddress}`);
    console.log(`   Network: ${config.network}`);
    console.log('   Status: Pending confirmation (5-15 minutes)\n');
    
    return {
      txid: broadcastResponse.txid,
      contractAddress,
      network: config.network
    };
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

async function main() {
  const privateKey = process.env.STACKS_PRIVATE_KEY;
  const network = (process.env.STACKS_NETWORK || 'testnet') as 'testnet' | 'mainnet';
  
  if (!privateKey) {
    console.error('❌ Error: STACKS_PRIVATE_KEY not set in .env.contracts');
    process.exit(1);
  }
  
  console.log('╔════════════════════════════════════════╗');
  console.log('║  BitArt Market Contract Deployment    ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`Network: ${network.toUpperCase()}`);
  
  // Deploy contracts in order
  const deployments = [
    {
      contractName: 'bitart-nft',
      filePath: './contracts/nft.clar',
      privateKey,
      network
    },
    {
      contractName: 'bitart-marketplace',
      filePath: './contracts/marketplace.clar',
      privateKey,
      network
    },
    {
      contractName: 'bitart-auction',
      filePath: './contracts/auction.clar',
      privateKey,
      network
    }
  ];
  
  const results = [];
  
  for (const deployment of deployments) {
    const result = await deployContract(deployment);
    results.push(result);
    
    // Wait between deployments to avoid nonce issues
    console.log('⏳ Waiting 10 seconds before next deployment...\n');
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
  
  // Summary
  console.log('\n════════════════════════════════════════');
  console.log('📋 DEPLOYMENT SUMMARY');
  console.log('════════════════════════════════════════');
  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${deployments[index].contractName}`);
    console.log(`   Address: ${result.contractAddress}`);
    console.log(`   TXID: ${result.txid}`);
  });
  console.log('\n✅ All contracts deployed! Verify on:');
  console.log(`   ${network === 'testnet' 
    ? 'https://explorer.stacks.co/?chain=testnet' 
    : 'https://explorer.stacks.co/'}`);
}

main().catch(console.error);
