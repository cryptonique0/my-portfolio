
import { 
	makeContractCall, 
	broadcastTransaction, 
	AnchorMode,
	listCV,
	principalCV,
	uintCV
} from '@stacks/transactions';
import { StacksTestnet, StacksMainnet } from '@stacks/network';

interface SetupConfig {
	network: 'testnet' | 'mainnet';
	senderKey: string;
	contractAddress: string;
	whitelistAddresses: string[];
	allocations: number[];
}

async function setupAirdrop(config: SetupConfig) {
	const network = config.network === 'mainnet' 
		? new StacksMainnet() 
		: new StacksTestnet();

	console.log('Setting up airdrop campaign...\n');

	try {
		// 1. Create Airdrop
		console.log('Step 1: Creating airdrop...');
		const createAirdropTx = await makeContractCall({
			contractAddress: config.contractAddress,
			contractName: 'airdrop-manager',
			functionName: 'create-airdrop',
			functionArgs: [
				principalCV(`${config.contractAddress}.airdrop-token`),
				uintCV(1000000000000), // 1 million tokens (with 6 decimals)
				uintCV(1), // Start block
				uintCV(100000), // End block
			],
			senderKey: config.senderKey,
			network,
			anchorMode: AnchorMode.Any,
		});

		const createResponse = await broadcastTransaction(createAirdropTx, network);
		console.log(`Airdrop created. TX ID: ${createResponse.txid}\n`);

		// Wait for confirmation
		await new Promise(resolve => setTimeout(resolve, 30000));

		// 2. Add addresses to whitelist
		console.log('Step 2: Adding addresses to whitelist...');
		const whitelistTx = await makeContractCall({
			contractAddress: config.contractAddress,
			contractName: 'whitelist-manager',
			functionName: 'batch-add-to-whitelist',
			functionArgs: [
				listCV(config.whitelistAddresses.map(addr => principalCV(addr))),
				uintCV(1), // Tier 1 (Bronze)
			],
			senderKey: config.senderKey,
			network,
			anchorMode: AnchorMode.Any,
		});

		const whitelistResponse = await broadcastTransaction(whitelistTx, network);
		console.log(`Addresses whitelisted. TX ID: ${whitelistResponse.txid}\n`);

		// Wait for confirmation
		await new Promise(resolve => setTimeout(resolve, 30000));

		// 3. Set allocations
		console.log('Step 3: Setting allocations...');
		const allocationsTx = await makeContractCall({
			contractAddress: config.contractAddress,
			contractName: 'airdrop-manager',
			functionName: 'batch-set-allocations',
			functionArgs: [
				uintCV(1), // Airdrop ID
				listCV(config.whitelistAddresses.map(addr => principalCV(addr))),
				listCV(config.allocations.map(amount => uintCV(amount))),
			],
			senderKey: config.senderKey,
			network,
			anchorMode: AnchorMode.Any,
		});

		const allocationsResponse = await broadcastTransaction(allocationsTx, network);
		console.log(`Allocations set. TX ID: ${allocationsResponse.txid}\n`);

		console.log('\u2705 Airdrop setup completed successfully!');
		console.log('\nNext steps:');
		console.log('1. Verify transactions on explorer');
		console.log('2. Users can now claim their tokens');
		console.log('3. Monitor claims through the contract read functions');

	} catch (error) {
		console.error('\u274c Setup failed:', error);
		throw error;
	}
}

// Example usage
const config: SetupConfig = {
	network: (process.env.NETWORK || 'testnet') as 'testnet' | 'mainnet',
	senderKey: process.env.STACKS_PRIVATE_KEY!,
	contractAddress: process.env.CONTRACT_ADDRESS!,
	whitelistAddresses: [
		// Add recipient addresses here
		'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
		'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5',
		'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
	],
	allocations: [
		5000000, // 5 tokens with 6 decimals
		10000000, // 10 tokens
		15000000, // 15 tokens
	],
};

// Validate environment
if (!config.senderKey || !config.contractAddress) {
	console.error('Error: STACKS_PRIVATE_KEY and CONTRACT_ADDRESS environment variables are required');
	console.log('\nUsage:');
	console.log('NETWORK=testnet STACKS_PRIVATE_KEY=your_key CONTRACT_ADDRESS=your_address npm run setup');
	process.exit(1);
}

// Run setup
setupAirdrop(config);
