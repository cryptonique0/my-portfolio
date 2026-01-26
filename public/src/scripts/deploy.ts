

import { makeContractDeploy, broadcastTransaction, AnchorMode } from '@stacks/transactions';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import * as fs from 'fs';
import * as path from 'path';


/**
 * Deployment configuration for a single contract.
 */
export interface DeployConfig {
	network: 'testnet' | 'mainnet';
	senderKey: string;
	contractName: string;
	codeBody: string;
}

/**
 * Result of a contract deployment.
 */
export interface DeployResult {
	txid: string;
	contractName: string;
	success: boolean;
	error?: unknown;
}

/**
 * Deploy a single contract and return a typed result.
 */
export async function deployContract(config: DeployConfig): Promise<DeployResult> {
	const network = config.network === 'mainnet'
		? new StacksMainnet()
		: new StacksTestnet();

	console.log(`Deploying ${config.contractName} to ${config.network}...`);

	const txOptions = {
		contractName: config.contractName,
		codeBody: config.codeBody,
		senderKey: config.senderKey,
		network,
		anchorMode: AnchorMode.Any,
	};

	try {
		const transaction = await makeContractDeploy(txOptions);
		const broadcastResponse = await broadcastTransaction(transaction, network);

		console.log(`Transaction ID: ${broadcastResponse.txid}`);
		console.log(`Contract deployed successfully!`);

		return {
			txid: broadcastResponse.txid,
			contractName: config.contractName,
			success: true,
		};
	} catch (error) {
		console.error(`Error deploying contract:`, error);
		return {
			txid: '',
			contractName: config.contractName,
			success: false,
			error,
		};
	}
}

async function deployAll() {
	// Read environment variables
	const network = (process.env.NETWORK || 'testnet') as 'testnet' | 'mainnet';
	const senderKey = process.env.STACKS_PRIVATE_KEY;

	if (!senderKey) {
		throw new Error('STACKS_PRIVATE_KEY environment variable is required');
	}


	// Ensure contract files exist and read them
	function assertFileExists(filePath: string) {
		if (!fs.existsSync(filePath)) {
			throw new Error(`Contract file not found: ${filePath}`);
		}
	}

	const contractPaths = [
		'./src/contracts/airdrop-token.clar',
		'./src/contracts/whitelist-manager.clar',
		'./src/contracts/airdrop-manager.clar',
	];
	contractPaths.forEach(assertFileExists);

	const tokenCode = fs.readFileSync('./src/contracts/airdrop-token.clar', 'utf8');
	const whitelistCode = fs.readFileSync('./src/contracts/whitelist-manager.clar', 'utf8');
	const airdropCode = fs.readFileSync('./src/contracts/airdrop-manager.clar', 'utf8');

	console.log('Starting deployment sequence...\n');

	// Deploy contracts in order
	try {
		// 1. Deploy token contract
		const tokenResult = await deployContract({
			network,
			senderKey,
			contractName: 'airdrop-token',
			codeBody: tokenCode,
		});
		if (!tokenResult.success) throw tokenResult.error;

		console.log('\nWaiting 30 seconds before next deployment...\n');
		await new Promise(resolve => setTimeout(resolve, 30000));

		// 2. Deploy whitelist manager
		const whitelistResult = await deployContract({
			network,
			senderKey,
			contractName: 'whitelist-manager',
			codeBody: whitelistCode,
		});
		if (!whitelistResult.success) throw whitelistResult.error;

		console.log('\nWaiting 30 seconds before next deployment...\n');
		await new Promise(resolve => setTimeout(resolve, 30000));

		// 3. Deploy airdrop manager
		const airdropResult = await deployContract({
			network,
			senderKey,
			contractName: 'airdrop-manager',
			codeBody: airdropCode,
		});
		if (!airdropResult.success) throw airdropResult.error;

		console.log('\n705 All contracts deployed successfully!');
	} catch (error) {
		console.error('\n74c Deployment failed:', error);
		process.exit(1);
	}
}

// Run deployment
deployAll();
