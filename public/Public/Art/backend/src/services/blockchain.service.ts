/**
 * Blockchain Service
 * Handles smart contract interactions using ethers.js
 */

import { ethers, Contract, ContractInterface, Signer } from 'ethers';
import { config } from '../config/env';
import { logger } from '../utils/logger';

export interface MintParams {
  address: string; // Minter address
  name: string;
  description: string;
  imageUrl: string;
  royaltyPercentage: number;
  collectionAddress?: string;
}

export interface ListParams {
  nftAddress: string;
  tokenId: string;
  price: string; // in wei
  signer: Signer;
}

export interface AuctionParams {
  nftAddress: string;
  tokenId: string;
  startingPrice: string; // in wei
  endTime: number; // unix timestamp
  signer: Signer;
}

export interface BidParams {
  auctionId: string;
  bidAmount: string; // in wei
  signer: Signer;
}

export class BlockchainService {
  private static provider: ethers.Provider;
  private static nftContract: Contract;
  private static marketplaceContract: Contract;
  private static auctionContract: Contract;

  /**
   * Initialize blockchain service with provider and contracts
   */
  static initialize() {
    try {
      const network = config.network === 'mainnet' ? 'mainnet' : 'sepolia';
      const rpcUrl = config.network === 'mainnet'
        ? 'https://mainnet.base.org'
        : 'https://sepolia.base.org';

      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      logger.info(`Blockchain service initialized with ${network}`);
    } catch (error) {
      logger.error('Error initializing blockchain service:', error);
    }
  }

  /**
   * Get provider instance
   */
  static getProvider(): ethers.Provider {
    if (!this.provider) this.initialize();
    return this.provider;
  }

  /**
   * Estimate gas for transaction
   */
  static async estimateGas(
    to: string,
    data: string,
    value: string = '0'
  ): Promise<{ gas: string; estimatedCost: string }> {
    try {
      const provider = this.getProvider();
      const gasEstimate = await provider.estimateGas({
        to,
        data,
        value,
      });

      const gasPrice = await provider.getGasPrice();
      const estimatedCost = (gasEstimate * gasPrice).toString();

      return {
        gas: gasEstimate.toString(),
        estimatedCost,
      };
    } catch (error) {
      logger.error('Error estimating gas:', error);
      throw error;
    }
  }

  /**
   * Verify wallet signature
   */
  static async verifySignature(
    address: string,
    message: string,
    signature: string
  ): Promise<boolean> {
    try {
      const recovered = ethers.verifyMessage(message, signature);
      return recovered.toLowerCase() === address.toLowerCase();
    } catch (error) {
      logger.error('Error verifying signature:', error);
      return false;
    }
  }

  /**
   * Get transaction receipt status
   */
  static async getTransactionStatus(hash: string): Promise<{
    status: 'pending' | 'confirmed' | 'failed';
    blockNumber?: number;
    gasUsed?: string;
    confirmations?: number;
  }> {
    try {
      const provider = this.getProvider();
      const receipt = await provider.getTransactionReceipt(hash);

      if (!receipt) {
        return { status: 'pending' };
      }

      const currentBlock = await provider.getBlockNumber();
      const confirmations = currentBlock - receipt.blockNumber;

      return {
        status: receipt.status === 1 ? 'confirmed' : 'failed',
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        confirmations,
      };
    } catch (error) {
      logger.error('Error getting transaction status:', error);
      return { status: 'pending' };
    }
  }

  /**
   * Get NFT metadata from IPFS
   */
  static async getNFTMetadata(ipfsHash: string): Promise<any> {
    try {
      const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch metadata');
      return response.json();
    } catch (error) {
      logger.error('Error fetching NFT metadata:', error);
      throw error;
    }
  }

  /**
   * Upload metadata to IPFS (stub - integrate with actual IPFS service)
   */
  static async uploadMetadataToIPFS(metadata: {
    name: string;
    description: string;
    image: string;
    attributes?: any[];
  }): Promise<string> {
    try {
      // In production, integrate with Pinata or Web3.Storage
      // For now, return a placeholder hash
      const jsonStr = JSON.stringify(metadata);
      const hash = ethers.id(jsonStr).slice(2);
      logger.info(`Metadata uploaded with hash: ${hash}`);
      return hash;
    } catch (error) {
      logger.error('Error uploading metadata to IPFS:', error);
      throw error;
    }
  }

  /**
   * Validate Ethereum address
   */
  static isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  /**
   * Convert between ETH and Wei
   */
  static parseEther(value: string): string {
    return ethers.parseEther(value).toString();
  }

  static formatEther(value: string): string {
    return ethers.formatEther(value);
  }

  /**
   * Get network info
   */
  static async getNetworkInfo() {
    try {
      const provider = this.getProvider();
      const network = await provider.getNetwork();
      const blockNumber = await provider.getBlockNumber();
      const gasPrice = await provider.getGasPrice();

      return {
        chainId: network.chainId,
        name: network.name,
        blockNumber,
        gasPrice: gasPrice.toString(),
        gasPriceGwei: ethers.formatUnits(gasPrice, 'gwei'),
      };
    } catch (error) {
      logger.error('Error getting network info:', error);
      throw error;
    }
  }

  /**
   * Check token allowance for marketplace
   */
  static async checkTokenAllowance(
    tokenAddress: string,
    ownerAddress: string,
    spenderAddress: string
  ): Promise<string> {
    try {
      // ERC-20 allowance function
      const ERC20_ABI = [
        'function allowance(address owner, address spender) public view returns (uint256)',
      ];
      const contract = new Contract(tokenAddress, ERC20_ABI, this.getProvider());
      const allowance = await contract.allowance(ownerAddress, spenderAddress);
      return allowance.toString();
    } catch (error) {
      logger.error('Error checking token allowance:', error);
      throw error;
    }
  }

  /**
   * Get wallet balance
   */
  static async getBalance(address: string): Promise<string> {
    try {
      const provider = this.getProvider();
      const balance = await provider.getBalance(address);
      return balance.toString();
    } catch (error) {
      logger.error('Error getting wallet balance:', error);
      throw error;
    }
  }

  /**
   * Format transaction display data
   */
  static formatTransaction(tx: any): {
    hash: string;
    from: string;
    to: string;
    value: string;
    valueEth: string;
    data: string;
    gas: string;
    gasPrice: string;
    nonce: number;
  } {
    return {
      hash: tx.hash || '',
      from: tx.from || '',
      to: tx.to || '',
      value: tx.value?.toString() || '0',
      valueEth: ethers.formatEther(tx.value || '0'),
      data: tx.data || '',
      gas: tx.gasLimit?.toString() || '',
      gasPrice: ethers.formatUnits(tx.gasPrice || '0', 'gwei'),
      nonce: tx.nonce || 0,
    };
  }
}

// Initialize on module load
BlockchainService.initialize();

export default BlockchainService;
