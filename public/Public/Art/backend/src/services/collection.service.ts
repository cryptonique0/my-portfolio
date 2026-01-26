/**
 * Collection Service - Handles all collection-related operations
 */

import { supabase, supabaseAdmin } from '../config/supabase';
import { Collection } from '../types/database';
import { logger } from '../utils/logger';

export class CollectionService {
  /**
   * Create collection
   */
  static async createCollection(
    collectionData: Omit<Collection, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Collection | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('collections')
        .insert([collectionData])
        .select()
        .single();

      if (error) throw error;
      logger.info(`Created collection: ${data.id}`);
      return data;
    } catch (error) {
      logger.error('Error creating collection:', error);
      return null;
    }
  }

  /**
   * Get collection by ID
   */
  static async getCollectionById(collectionId: string): Promise<Collection | null> {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('id', collectionId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      logger.error('Error fetching collection:', error);
      return null;
    }
  }

  /**
   * Get collections by creator
   */
  static async getCreatorCollections(creatorId: string, limit = 50, offset = 0): Promise<Collection[]> {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('creator_id', creatorId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching creator collections:', error);
      return [];
    }
  }

  /**
   * Get all collections
   */
  static async getAllCollections(limit = 50, offset = 0): Promise<Collection[]> {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching collections:', error);
      return [];
    }
  }

  /**
   * Update collection
   */
  static async updateCollection(collectionId: string, updates: Partial<Collection>): Promise<Collection | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('collections')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', collectionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error updating collection:', error);
      return null;
    }
  }

  /**
   * Get trending collections
   */
  static async getTrendingCollections(limit = 10): Promise<Collection[]> {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .order('volume', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching trending collections:', error);
      return [];
    }
  }

  /**
   * Search collections
   */
  static async searchCollections(query: string, limit = 20): Promise<Collection[]> {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error searching collections:', error);
      return [];
    }
  }

  /**
   * Get collection with items
   */
  static async getCollectionWithItems(collectionId: string, limit = 50): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select(`
          *,
          creator:creator_id(username, avatar_url),
          nfts:nfts(count),
          items:nfts(id, name, image_url, price, owner_id)
        `)
        .eq('id', collectionId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      logger.error('Error fetching collection with items:', error);
      return null;
    }
  }

  /**
   * Update collection stats
   */
  static async updateCollectionStats(collectionId: string): Promise<boolean> {
    try {
      const collection = await this.getCollectionById(collectionId);
      if (!collection) return false;

      // Get floor price
      const { data: floorData } = await supabase
        .from('nfts')
        .select('price')
        .eq('collection_id', collectionId)
        .eq('for_sale', true)
        .order('price', { ascending: true })
        .limit(1)
        .single();

      const floorPrice = floorData?.price || null;

      // Get volume
      const { data: volumeData } = await supabase
        .from('transactions')
        .select('price')
        .in(
          'nft_id',
          (
            await supabase.from('nfts').select('id').eq('collection_id', collectionId)
          ).data?.map((n) => n.id) || []
        )
        .eq('status', 'completed');

      const volume = (volumeData || []).reduce((sum, t) => sum + parseFloat(t.price), 0);

      // Get item count
      const { count } = await supabase
        .from('nfts')
        .select('*', { count: 'exact', head: true })
        .eq('collection_id', collectionId);

      await supabaseAdmin
        .from('collections')
        .update({
          floor_price: floorPrice,
          volume,
          item_count: count || 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', collectionId);

      return true;
    } catch (error) {
      logger.error('Error updating collection stats:', error);
      return false;
    }
  }
}
