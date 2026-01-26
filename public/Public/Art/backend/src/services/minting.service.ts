/**
 * NFT Minting Service
 * Handles NFT creation and minting on blockchain
 */

import { supabase } from '../config/supabase';
import { BlockchainService } from './blockchain.service';
import { TransactionTracker } from './transaction-tracker.service';
import { logger } from '../utils/logger';

export interface MintMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{ trait_type: string; value: string | number }>;
  externalUrl?: string;
  animationUrl?: string;
}

export interface NFTMintRequest {
  creatorId: string;
  creatorAddress: string;
  collectionId: string;
  name: string;
  description: string;
  imageUrl: string;
  imageIPFS?: string;
  royaltyPercentage: number;
  attributes?: Array<{ trait_type: string; value: string }>;
  contractAddress: string;
}

export class NFTMintingService {
  /**
   * Prepare NFT for minting
   * Validates metadata and uploads to IPFS
   */
  static async prepareMint(request: NFTMintRequest): Promise<{
    metadataIPFS: string;
    metadata: MintMetadata;
  }> {
    try {
      // Validate inputs
      if (!BlockchainService.isValidAddress(request.creatorAddress)) {
        throw new Error('Invalid creator address');
      }

      if (request.royaltyPercentage < 0 || request.royaltyPercentage > 50) {
        throw new Error('Royalty percentage must be between 0 and 50');
      }

      // Prepare metadata
      const metadata: MintMetadata = {
        name: request.name,
        description: request.description,
        image: request.imageUrl,
        attributes: request.attributes || [],
      };

      // Upload metadata to IPFS
      const metadataIPFS = await BlockchainService.uploadMetadataToIPFS(metadata);

      return { metadataIPFS, metadata };
    } catch (error) {
      logger.error('Error preparing mint:', error);
      throw error;
    }
  }

  /**
   * Create NFT record in database
   */
  static async createNFTRecord(
    request: NFTMintRequest,
    metadataIPFS: string,
    tokenId: string
  ): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('nfts')
        .insert({
          creator_id: request.creatorId,
          creator_address: request.creatorAddress,
          collection_id: request.collectionId,
          name: request.name,
          description: request.description,
          image_url: request.imageUrl,
          metadata_ipfs: metadataIPFS,
          contract_address: request.contractAddress,
          token_id: tokenId,
          royalty_percentage: request.royaltyPercentage,
          blockchain: 'base',
          status: 'minting',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error creating NFT record:', error);
      throw error;
    }
  }

  /**
   * Update NFT status after mint confirmation
   */
  static async updateNFTStatus(
    nftId: string,
    status: 'minted' | 'failed',
    txHash?: string,
    error?: string
  ): Promise<any> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (txHash) updateData.mint_tx_hash = txHash;
      if (error) updateData.mint_error = error;

      const { data, error: updateError } = await supabase
        .from('nfts')
        .update(updateData)
        .eq('id', nftId)
        .select()
        .single();

      if (updateError) throw updateError;
      return data;
    } catch (error) {
      logger.error('Error updating NFT status:', error);
      throw error;
    }
  }

  /**
   * Get estimated gas for minting
   */
  static async estimateMintGas(
    contractAddress: string,
    metadataURI: string
  ): Promise<{ gas: string; estimatedCostETH: string; estimatedCostUSD: string }> {
    try {
      // Mock estimation (integrate with actual contract)
      const gasMock = {
        gas: '100000', // typical mint gas
        estimatedCostETH: '0.002', // rough estimate
        estimatedCostUSD: '5.50', // rough estimate
      };

      return gasMock;
    } catch (error) {
      logger.error('Error estimating mint gas:', error);
      throw error;
    }
  }

  /**
   * Get minting stats
   */
  static async getMintingStats(): Promise<{
    totalMinted: number;
    totalMintingFailed: number;
    totalInProgress: number;
    totalSupply: number;
  }> {
    try {
      const [minted, failed, inProgress] = await Promise.all([
        supabase
          .from('nfts')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'minted'),
        supabase
          .from('nfts')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'failed'),
        supabase
          .from('nfts')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'minting'),
      ]);

      return {
        totalMinted: minted.count || 0,
        totalMintingFailed: failed.count || 0,
        totalInProgress: inProgress.count || 0,
        totalSupply: (minted.count || 0) + (inProgress.count || 0),
      };
    } catch (error) {
      logger.error('Error getting minting stats:', error);
      return {
        totalMinted: 0,
        totalMintingFailed: 0,
        totalInProgress: 0,
        totalSupply: 0,
      };
    }
  }

  /**
   * Get user's minting history
   */
  static async getUserMints(userId: string, limit = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('nfts')
        .select('*')
        .eq('creator_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching user mints:', error);
      return [];
    }
  }

  /**
   * Batch mint NFTs
   */
  static async batchMint(
    requests: NFTMintRequest[]
  ): Promise<Array<{ request: NFTMintRequest; nftId: string; metadataIPFS: string } | { request: NFTMintRequest; error: string }>> {
    const results = [];

    for (const request of requests) {
      try {
        const { metadataIPFS } = await this.prepareMint(request);
        const nft = await this.createNFTRecord(request, metadataIPFS, Date.now().toString());
        results.push({ request, nftId: nft.id, metadataIPFS });
      } catch (error: any) {
        results.push({ request, error: error.message });
      }
    }

    return results;
  }
}

export default NFTMintingService;
