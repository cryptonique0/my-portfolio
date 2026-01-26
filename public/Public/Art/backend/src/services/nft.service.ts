/**
 * NFT Service - Handles all NFT-related database operations
 */

import { supabase, supabaseAdmin } from '../config/supabase';
import { NFT } from '../types/database';
import { logger } from '../utils/logger';

export class NFTService {
  /**
   * Create NFT record
   */
  static async createNFT(nftData: Omit<NFT, 'id' | 'created_at' | 'updated_at'>): Promise<NFT | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('nfts')
        .insert([nftData])
        .select()
        .single();

      if (error) throw error;
      logger.info(`Created NFT: ${data.id}`);
      return data;
    } catch (error) {
      logger.error('Error creating NFT:', error);
      return null;
    }
  }

  /**
   * Get NFT by ID
   */
  static async getNFTById(nftId: string): Promise<NFT | null> {
    try {
      const { data, error } = await supabase
        .from('nfts')
        .select('*')
        .eq('id', nftId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      logger.error('Error fetching NFT:', error);
      return null;
    }
  }

  /**
   * Get NFTs by owner
   */
  static async getNFTsByOwner(ownerId: string, limit = 50, offset = 0): Promise<NFT[]> {
    try {
      const { data, error } = await supabase
        .from('nfts')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching NFTs by owner:', error);
      return [];
    }
  }

  /**
   * Get NFTs by creator
   */
  static async getNFTsByCreator(creatorId: string, limit = 50, offset = 0): Promise<NFT[]> {
    try {
      const { data, error } = await supabase
        .from('nfts')
        .select('*')
        .eq('creator_id', creatorId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching NFTs by creator:', error);
      return [];
    }
  }

  /**
   * Get NFTs for sale
   */
  static async getNFTsForSale(limit = 50, offset = 0): Promise<NFT[]> {
    try {
      const { data, error } = await supabase
        .from('nfts')
        .select('*')
        .eq('for_sale', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching NFTs for sale:', error);
      return [];
    }
  }

  /**
   * Get NFTs by collection
   */
  static async getNFTsByCollection(collectionId: string, limit = 50, offset = 0): Promise<NFT[]> {
    try {
      const { data, error } = await supabase
        .from('nfts')
        .select('*')
        .eq('collection_id', collectionId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching NFTs by collection:', error);
      return [];
    }
  }

  /**
   * Update NFT
   */
  static async updateNFT(nftId: string, updates: Partial<NFT>): Promise<NFT | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('nfts')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', nftId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error updating NFT:', error);
      return null;
    }
  }

  /**
   * List NFT for sale
   */
  static async listNFT(nftId: string, price: number): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('nfts')
        .update({
          for_sale: true,
          price,
          updated_at: new Date().toISOString(),
        })
        .eq('id', nftId);

      if (error) throw error;
      logger.info(`NFT ${nftId} listed for sale at ${price}`);
      return true;
    } catch (error) {
      logger.error('Error listing NFT:', error);
      return false;
    }
  }

  /**
   * Delist NFT
   */
  static async delistNFT(nftId: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('nfts')
        .update({
          for_sale: false,
          price: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', nftId);

      if (error) throw error;
      logger.info(`NFT ${nftId} delisted`);
      return true;
    } catch (error) {
      logger.error('Error delisting NFT:', error);
      return false;
    }
  }

  /**
   * Transfer NFT ownership
   */
  static async transferNFT(nftId: string, newOwnerId: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('nfts')
        .update({
          owner_id: newOwnerId,
          for_sale: false,
          price: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', nftId);

      if (error) throw error;
      logger.info(`NFT ${nftId} transferred to ${newOwnerId}`);
      return true;
    } catch (error) {
      logger.error('Error transferring NFT:', error);
      return false;
    }
  }

  /**
   * Get NFT with full details (owner, creator, auction, bids)
   */
  static async getNFTDetails(nftId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('nfts')
        .select(`
          *,
          owner:owner_id(username, avatar_url),
          creator:creator_id(username, avatar_url),
          auctions(*)
        `)
        .eq('id', nftId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      logger.error('Error fetching NFT details:', error);
      return null;
    }
  }

  /**
   * Search NFTs
   */
  static async searchNFTs(query: string, limit = 20): Promise<NFT[]> {
    try {
      const { data, error } = await supabase
        .from('nfts')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error searching NFTs:', error);
      return [];
    }
  }

  /**
   * Get trending NFTs
   */
  static async getTrendingNFTs(limit = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('nfts')
        .select('*, transaction_count:transactions(count)')
        .eq('for_sale', false)
        .order('transaction_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching trending NFTs:', error);
      return [];
    }
  }

  /**
   * Get floor price for collection
   */
  static async getCollectionFloorPrice(collectionId: string): Promise<number | null> {
    try {
      const { data, error } = await supabase
        .from('nfts')
        .select('price')
        .eq('collection_id', collectionId)
        .eq('for_sale', true)
        .order('price', { ascending: true })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data?.price || null;
    } catch (error) {
      logger.error('Error fetching floor price:', error);
      return null;
    }
  }
}
