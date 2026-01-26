import { ethers, Contract, Signer } from "ethers";
import { Address } from "viem";

/**
 * CrossChainSDK - TypeScript SDK for cross-chain airdrop operations
 * Provides high-level interfaces for Bridge, Aggregator, and Messaging
 */

export enum ChainId {
  ETHEREUM = 1,
  ARBITRUM = 42161,
  OPTIMISM = 10,
  POLYGON = 137,
  AVALANCHE = 43114,
  BASE = 8453,
}

export enum MessageType {
  AIRDROP_DISTRIBUTION = 0,
  ALLOCATION_UPDATE = 1,
  CLAIM_NOTIFICATION = 2,
  BRIDGE_STATUS = 3,
  RECOVERY_REQUEST = 4,
}

export interface BridgeConfig {
  address: string;
  abi: any;
  chainId: ChainId;
  rpcUrl: string;
}

export interface CrossChainMessage {
  messageId: number;
  sourceChainId: number;
  destChainId: number;
  messageType: MessageType;
  sender: string;
  payload: string;
  timestamp: number;
  processed: boolean;
}

export interface AirdropCampaign {
  campaignId: number;
  name: string;
  token: string;
  totalAmount: ethers.BigNumberish;
  chainAllocations: Map<ChainId, ethers.BigNumberish>;
  creator: string;
  createdAt: number;
}

export interface MultiChainRecipient {
  recipient: string;
  totalAmount: ethers.BigNumberish;
  chainAmounts: Map<ChainId, ethers.BigNumberish>;
  claimedChains: ChainId[];
}

export class CrossChainBridgeClient {
  private contract: Contract;
  private signer: Signer;
  private chainId: ChainId;

  constructor(
    contractAddress: string,
    abi: any,
    signer: Signer,
    chainId: ChainId
  ) {
    this.contract = new ethers.Contract(contractAddress, abi, signer);
    this.signer = signer;
    this.chainId = chainId;
  }

  /**
   * Bridge tokens to another chain
   */
  async bridgeTokens(
    tokenAddress: string,
    amount: ethers.BigNumberish,
    destChain: ChainId,
    recipient: string,
    gasLimit?: ethers.BigNumberish
  ): Promise<string> {
    try {
      const tx = await this.contract.bridgeTokens(
        tokenAddress,
        amount,
        destChain,
        recipient,
        {
          gasLimit: gasLimit || 300000,
        }
      );

      const receipt = await tx.wait();
      console.log(`Bridge transaction confirmed: ${receipt.transactionHash}`);
      return receipt.transactionHash;
    } catch (error) {
      console.error("Bridge tokens error:", error);
      throw error;
    }
  }

  /**
   * Complete a bridge transaction
   */
  async completeBridge(
    bridgeId: ethers.BigNumberish
  ): Promise<string> {
    try {
      const tx = await this.contract.completeBridge(bridgeId);
      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (error) {
      console.error("Complete bridge error:", error);
      throw error;
    }
  }

  /**
   * Get bridge status
   */
  async getBridgeStatus(bridgeId: ethers.BigNumberish): Promise<any> {
    try {
      const status = await this.contract.bridges(bridgeId);
      return status;
    } catch (error) {
      console.error("Get bridge status error:", error);
      throw error;
    }
  }

  /**
   * Get user bridge history
   */
  async getUserBridges(userAddress: string): Promise<any[]> {
    try {
      const bridges = await this.contract.getUserBridges(userAddress);
      return bridges;
    } catch (error) {
      console.error("Get user bridges error:", error);
      throw error;
    }
  }

  /**
   * Register token bridge
   */
  async registerTokenBridge(
    tokenAddress: string,
    destChain: ChainId,
    bridgeAddress: string
  ): Promise<string> {
    try {
      const tx = await this.contract.registerTokenBridge(
        tokenAddress,
        destChain,
        bridgeAddress
      );
      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (error) {
      console.error("Register token bridge error:", error);
      throw error;
    }
  }

  /**
   * Calculate bridge fee
   */
  async calculateBridgeFee(amount: ethers.BigNumberish): Promise<ethers.BigNumber> {
    try {
      const fee = await this.contract.calculateBridgeFee(amount);
      return fee;
    } catch (error) {
      console.error("Calculate bridge fee error:", error);
      throw error;
    }
  }
}

export class ChainAggregatorClient {
  private contract: Contract;
  private signer: Signer;

  constructor(contractAddress: string, abi: any, signer: Signer) {
    this.contract = new ethers.Contract(contractAddress, abi, signer);
    this.signer = signer;
  }

  /**
   * Create a new airdrop campaign
   */
  async createCampaign(
    campaignId: ethers.BigNumberish,
    name: string,
    tokenAddress: string,
    totalAmount: ethers.BigNumberish
  ): Promise<string> {
    try {
      const tx = await this.contract.createCampaign(
        campaignId,
        name,
        tokenAddress,
        totalAmount,
        {
          gasLimit: 300000,
        }
      );
      const receipt = await tx.wait();
      console.log(`Campaign created: ${name} (ID: ${campaignId})`);
      return receipt.transactionHash;
    } catch (error) {
      console.error("Create campaign error:", error);
      throw error;
    }
  }

  /**
   * Set allocation for a specific chain
   */
  async setChainAllocation(
    campaignId: ethers.BigNumberish,
    chainId: ChainId,
    amount: ethers.BigNumberish
  ): Promise<string> {
    try {
      const tx = await this.contract.setChainAllocation(
        campaignId,
        chainId,
        amount
      );
      const receipt = await tx.wait();
      console.log(`Chain allocation set for campaign ${campaignId} on chain ${chainId}`);
      return receipt.transactionHash;
    } catch (error) {
      console.error("Set chain allocation error:", error);
      throw error;
    }
  }

  /**
   * Set multi-chain airdrop for recipients
   */
  async setMultiChainAirdrop(
    campaignId: ethers.BigNumberish,
    recipients: string[],
    amounts: ethers.BigNumberish[]
  ): Promise<string> {
    try {
      const tx = await this.contract.setMultiChainAirdrop(
        campaignId,
        recipients,
        amounts,
        {
          gasLimit: 500000,
        }
      );
      const receipt = await tx.wait();
      console.log(`Multi-chain airdrop set for ${recipients.length} recipients`);
      return receipt.transactionHash;
    } catch (error) {
      console.error("Set multi-chain airdrop error:", error);
      throw error;
    }
  }

  /**
   * Claim airdrop for a single chain
   */
  async claimAirdrop(
    campaignId: ethers.BigNumberish,
    chainId: ChainId
  ): Promise<string> {
    try {
      const tx = await this.contract.claimAirdrop(campaignId, chainId);
      const receipt = await tx.wait();
      console.log(`Airdrop claimed on chain ${chainId}`);
      return receipt.transactionHash;
    } catch (error) {
      console.error("Claim airdrop error:", error);
      throw error;
    }
  }

  /**
   * Claim airdrop across multiple chains (aggregated)
   */
  async claimMultiChainAirdrop(
    campaignId: ethers.BigNumberish,
    chains: ChainId[]
  ): Promise<string> {
    try {
      const tx = await this.contract.claimMultiChainAirdrop(
        campaignId,
        chains,
        {
          gasLimit: 400000,
        }
      );
      const receipt = await tx.wait();
      console.log(`Multi-chain airdrop claimed on ${chains.length} chains`);
      return receipt.transactionHash;
    } catch (error) {
      console.error("Claim multi-chain airdrop error:", error);
      throw error;
    }
  }

  /**
   * Get campaign details
   */
  async getCampaign(campaignId: ethers.BigNumberish): Promise<any> {
    try {
      const campaign = await this.contract.campaigns(campaignId);
      return campaign;
    } catch (error) {
      console.error("Get campaign error:", error);
      throw error;
    }
  }

  /**
   * Get user claim status for campaign
   */
  async getClaimStatus(
    campaignId: ethers.BigNumberish,
    userAddress: string
  ): Promise<any> {
    try {
      const status = await this.contract.getClaimStatus(
        campaignId,
        userAddress
      );
      return status;
    } catch (error) {
      console.error("Get claim status error:", error);
      throw error;
    }
  }

  /**
   * Finalize campaign and recover unclaimed tokens
   */
  async finalizeCampaign(campaignId: ethers.BigNumberish): Promise<string> {
    try {
      const tx = await this.contract.finalizeCampaign(campaignId);
      const receipt = await tx.wait();
      console.log(`Campaign ${campaignId} finalized`);
      return receipt.transactionHash;
    } catch (error) {
      console.error("Finalize campaign error:", error);
      throw error;
    }
  }
}

export class LayerZeroMessengerClient {
  private contract: Contract;
  private signer: Signer;

  constructor(contractAddress: string, abi: any, signer: Signer) {
    this.contract = new ethers.Contract(contractAddress, abi, signer);
    this.signer = signer;
  }

  /**
   * Send airdrop distribution via LayerZero
   */
  async sendAirdropDistribution(
    destChainId: number,
    tokenAddress: string,
    recipientAddress: string,
    amount: ethers.BigNumberish,
    campaignId: ethers.BigNumberish,
    adapterParams: string,
    gasPrice?: ethers.BigNumberish
  ): Promise<string> {
    try {
      const signerAddress = await this.signer.getAddress();
      const tx = await this.contract.sendAirdropDistribution(
        destChainId,
        tokenAddress,
        recipientAddress,
        amount,
        campaignId,
        adapterParams,
        {
          gasLimit: 350000,
          gasPrice: gasPrice,
          value: ethers.utils.parseEther("0.5"), // Estimate for LZ fee
        }
      );

      const receipt = await tx.wait();
      console.log(`Airdrop distribution sent via LayerZero on chain ${destChainId}`);
      return receipt.transactionHash;
    } catch (error) {
      console.error("Send airdrop distribution error:", error);
      throw error;
    }
  }

  /**
   * Send allocation update via LayerZero
   */
  async sendAllocationUpdate(
    destChainId: number,
    campaignId: ethers.BigNumberish,
    recipients: string[],
    amounts: ethers.BigNumberish[],
    adapterParams: string
  ): Promise<string> {
    try {
      const tx = await this.contract.sendAllocationUpdate(
        destChainId,
        campaignId,
        recipients,
        amounts,
        adapterParams,
        {
          gasLimit: 500000,
          value: ethers.utils.parseEther("1.0"),
        }
      );

      const receipt = await tx.wait();
      console.log(`Allocation update sent to chain ${destChainId}`);
      return receipt.transactionHash;
    } catch (error) {
      console.error("Send allocation update error:", error);
      throw error;
    }
  }

  /**
   * Get message details
   */
  async getMessage(messageId: ethers.BigNumberish): Promise<any> {
    try {
      const message = await this.contract.getMessage(messageId);
      return message;
    } catch (error) {
      console.error("Get message error:", error);
      throw error;
    }
  }

  /**
   * Get user messages
   */
  async getUserMessages(userAddress: string): Promise<any[]> {
    try {
      const messages = await this.contract.getUserMessages(userAddress);
      return messages;
    } catch (error) {
      console.error("Get user messages error:", error);
      throw error;
    }
  }

  /**
   * Estimate LayerZero fee
   */
  async estimateLayerZeroFee(
    destChainId: number,
    adapterParams: string
  ): Promise<{ nativeFee: ethers.BigNumber; zroFee: ethers.BigNumber }> {
    try {
      const fees = await this.contract.getLayerZeroQuote(
        destChainId,
        adapterParams
      );
      return {
        nativeFee: fees[0],
        zroFee: fees[1],
      };
    } catch (error) {
      console.error("Estimate LayerZero fee error:", error);
      throw error;
    }
  }
}

export class WormholeMessengerClient {
  private contract: Contract;
  private signer: Signer;

  constructor(contractAddress: string, abi: any, signer: Signer) {
    this.contract = new ethers.Contract(contractAddress, abi, signer);
    this.signer = signer;
  }

  /**
   * Send airdrop distribution via Wormhole
   */
  async sendAirdropDistribution(
    destChainId: number,
    tokenAddress: string,
    recipientAddress: string,
    amount: ethers.BigNumberish,
    campaignId: ethers.BigNumberish,
    gasPrice?: ethers.BigNumberish
  ): Promise<string> {
    try {
      const tx = await this.contract.sendAirdropDistribution(
        destChainId,
        tokenAddress,
        recipientAddress,
        amount,
        campaignId,
        {
          gasLimit: 300000,
          gasPrice: gasPrice,
          value: ethers.utils.parseEther("0.1"), // Wormhole fee
        }
      );

      const receipt = await tx.wait();
      console.log(`Airdrop distribution sent via Wormhole to chain ${destChainId}`);
      return receipt.transactionHash;
    } catch (error) {
      console.error("Send airdrop distribution error:", error);
      throw error;
    }
  }

  /**
   * Send allocation update via Wormhole Relayer
   */
  async sendAllocationUpdate(
    destChainId: number,
    campaignId: ethers.BigNumberish,
    recipients: string[],
    amounts: ethers.BigNumberish[]
  ): Promise<string> {
    try {
      const tx = await this.contract.sendAllocationUpdate(
        destChainId,
        campaignId,
        recipients,
        amounts,
        {
          gasLimit: 400000,
          value: ethers.utils.parseEther("0.2"),
        }
      );

      const receipt = await tx.wait();
      console.log(`Allocation update sent via Wormhole to chain ${destChainId}`);
      return receipt.transactionHash;
    } catch (error) {
      console.error("Send allocation update error:", error);
      throw error;
    }
  }

  /**
   * Send claim notification
   */
  async sendClaimNotification(
    destChainId: number,
    campaignId: ethers.BigNumberish,
    recipientAddress: string,
    amount: ethers.BigNumberish
  ): Promise<string> {
    try {
      const tx = await this.contract.sendClaimNotification(
        destChainId,
        campaignId,
        recipientAddress,
        amount,
        {
          gasLimit: 250000,
          value: ethers.utils.parseEther("0.05"),
        }
      );

      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (error) {
      console.error("Send claim notification error:", error);
      throw error;
    }
  }

  /**
   * Process VAA from Wormhole Guardian
   */
  async processVAA(encodedVAA: string, srcChainId: number): Promise<string> {
    try {
      const tx = await this.contract.processVAA(encodedVAA, srcChainId);
      const receipt = await tx.wait();
      console.log(`VAA processed from chain ${srcChainId}`);
      return receipt.transactionHash;
    } catch (error) {
      console.error("Process VAA error:", error);
      throw error;
    }
  }

  /**
   * Get message details
   */
  async getMessage(messageId: ethers.BigNumberish): Promise<any> {
    try {
      const message = await this.contract.getMessage(messageId);
      return message;
    } catch (error) {
      console.error("Get message error:", error);
      throw error;
    }
  }

  /**
   * Get user messages
   */
  async getUserMessages(userAddress: string): Promise<any[]> {
    try {
      const messages = await this.contract.getUserMessages(userAddress);
      return messages;
    } catch (error) {
      console.error("Get user messages error:", error);
      throw error;
    }
  }

  /**
   * Check if VAA is processed
   */
  async isVAAProcessed(encodedVAA: string): Promise<boolean> {
    try {
      return await this.contract.isVAAProcessed(encodedVAA);
    } catch (error) {
      console.error("Check VAA processed error:", error);
      throw error;
    }
  }
}

/**
 * Unified CrossChainSDK class for managing all cross-chain operations
 */
export class CrossChainSDK {
  private bridges: Map<ChainId, CrossChainBridgeClient> = new Map();
  private aggregator: ChainAggregatorClient | null = null;
  private layerZero: LayerZeroMessengerClient | null = null;
  private wormhole: WormholeMessengerClient | null = null;

  /**
   * Initialize bridge client for a chain
   */
  addBridge(chainId: ChainId, client: CrossChainBridgeClient): void {
    this.bridges.set(chainId, client);
  }

  /**
   * Get bridge client
   */
  getBridge(chainId: ChainId): CrossChainBridgeClient | undefined {
    return this.bridges.get(chainId);
  }

  /**
   * Set aggregator client
   */
  setAggregator(client: ChainAggregatorClient): void {
    this.aggregator = client;
  }

  /**
   * Get aggregator client
   */
  getAggregator(): ChainAggregatorClient | null {
    return this.aggregator;
  }

  /**
   * Set LayerZero messenger
   */
  setLayerZeroMessenger(client: LayerZeroMessengerClient): void {
    this.layerZero = client;
  }

  /**
   * Get LayerZero messenger
   */
  getLayerZeroMessenger(): LayerZeroMessengerClient | null {
    return this.layerZero;
  }

  /**
   * Set Wormhole messenger
   */
  setWormholeMessenger(client: WormholeMessengerClient): void {
    this.wormhole = client;
  }

  /**
   * Get Wormhole messenger
   */
  getWormholeMessenger(): WormholeMessengerClient | null {
    return this.wormhole;
  }

  /**
   * Execute multi-chain airdrop distribution
   */
  async executeMultiChainDistribution(
    campaigns: AirdropCampaign[]
  ): Promise<Map<ChainId, string>> {
    const results = new Map<ChainId, string>();

    if (!this.aggregator) {
      throw new Error("Aggregator not initialized");
    }

    for (const campaign of campaigns) {
      for (const [chainId, amount] of campaign.chainAllocations) {
        try {
          const txHash = await this.aggregator.setChainAllocation(
            campaign.campaignId,
            chainId,
            amount
          );
          results.set(chainId, txHash);
        } catch (error) {
          console.error(
            `Failed to set allocation for chain ${chainId}:`,
            error
          );
        }
      }
    }

    return results;
  }
}

export default CrossChainSDK;
