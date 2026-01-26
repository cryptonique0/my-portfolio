// CLI for interacting with AirStack contracts
// Provides convenient commands for common operations

import { 
  makeContractCall, 
  broadcastTransaction, 
  AnchorMode,
  listCV,
  principalCV,
  uintCV,
  stringAsciiCV,
  stringUtf8CV
} from '@stacks/transactions';
import { StacksTestnet, StacksMainnet } from '@stacks/network';

interface CLIConfig {
  network: 'testnet' | 'mainnet';
  contractAddress: string;
  privateKey: string;
}

export class AirStackCLI {
  private network: StacksTestnet | StacksMainnet;
  private config: CLIConfig;

  constructor(config: CLIConfig) {
    this.config = config;
    this.network = config.network === 'mainnet' 
      ? new StacksMainnet() 
      : new StacksTestnet();
  }

  async addToWhitelist(address: string, tier: number): Promise<string> {
    console.log(`Adding ${address} to whitelist (tier ${tier})...`);

    const tx = await makeContractCall({
      contractAddress: this.config.contractAddress,
      contractName: 'whitelist-manager',
      functionName: 'add-to-whitelist',
      functionArgs: [principalCV(address), uintCV(tier)],
      senderKey: this.config.privateKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
    });

    const response = await broadcastTransaction(tx, this.network);
    return response.txid;
  }

  async setAllocation(airdropId: number, recipient: string, amount: number): Promise<string> {
    console.log(`Setting allocation for ${recipient}: ${amount} tokens...`);

    const tx = await makeContractCall({
      contractAddress: this.config.contractAddress,
      contractName: 'airdrop-manager',
      functionName: 'set-allocation',
      functionArgs: [uintCV(airdropId), principalCV(recipient), uintCV(amount)],
      senderKey: this.config.privateKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
    });

    const response = await broadcastTransaction(tx, this.network);
    return response.txid;
  }

  async createVestingSchedule(
    beneficiary: string,
    totalAmount: number,
    startBlock: number,
    cliffBlock: number,
    endBlock: number
  ): Promise<string> {
    console.log(`Creating vesting schedule for ${beneficiary}...`);

    const tx = await makeContractCall({
      contractAddress: this.config.contractAddress,
      contractName: 'vesting-schedule',
      functionName: 'create-vesting-schedule',
      functionArgs: [
        principalCV(beneficiary),
        uintCV(totalAmount),
        uintCV(startBlock),
        uintCV(cliffBlock),
        uintCV(endBlock),
      ],
      senderKey: this.config.privateKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
    });

    const response = await broadcastTransaction(tx, this.network);
    return response.txid;
  }

  async createGovernanceProposal(
    title: string,
    description: string,
    duration: number
  ): Promise<string> {
    console.log(`Creating proposal: "${title}"...`);

    const tx = await makeContractCall({
      contractAddress: this.config.contractAddress,
      contractName: 'governance',
      functionName: 'create-proposal',
      functionArgs: [stringAsciiCV(title), stringAsciiCV(description), uintCV(duration)],
      senderKey: this.config.privateKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
    });

    const response = await broadcastTransaction(tx, this.network);
    return response.txid;
  }

  async voteOnProposal(proposalId: number, position: boolean): Promise<string> {
    const voteType = position ? 'YES' : 'NO';
    console.log(`Voting ${voteType} on proposal ${proposalId}...`);

    const tx = await makeContractCall({
      contractAddress: this.config.contractAddress,
      contractName: 'governance',
      functionName: 'vote-on-proposal',
      functionArgs: [uintCV(proposalId), principalCV(this.config.privateKey)],
      senderKey: this.config.privateKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
    });

    const response = await broadcastTransaction(tx, this.network);
    return response.txid;
  }
}

// Export for use in other scripts
export default AirStackCLI;
