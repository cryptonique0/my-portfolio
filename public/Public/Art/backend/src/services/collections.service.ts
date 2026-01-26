import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

class CollectionsServiceClass {
  async createCollection(userId: string, name: string, description?: string, tags?: string[]) {
    const { data, error } = await supabase
      .from('collections')
      .insert({ user_id: userId, name, description, tags })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async updateCollection(collectionId: string, userId: string, updates: Partial<{ name: string; description: string; tags: string[] }>) {
    const { data, error } = await supabase
      .from('collections')
      .update({ ...updates })
      .eq('id', collectionId)
      .eq('user_id', userId)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async deleteCollection(collectionId: string, userId: string) {
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', collectionId)
      .eq('user_id', userId);
    if (error) throw error;
    return { success: true };
  }

  async listCollections(userId: string) {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async addItem(collectionId: string, userId: string, nftId: string, nftName?: string, nftImage?: string, note?: string, tags?: string[]) {
    // Ensure collection belongs to user
    const { data: collection } = await supabase
      .from('collections')
      .select('id,user_id')
      .eq('id', collectionId)
      .single();
    if (!collection || collection.user_id !== userId) {
      throw new Error('Unauthorized');
    }

    const { data, error } = await supabase
      .from('collection_items')
      .insert({ collection_id: collectionId, nft_id: nftId, nft_name: nftName, nft_image: nftImage, note, tags })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async removeItem(collectionId: string, userId: string, nftId: string) {
    // Ensure collection belongs to user
    const { data: collection } = await supabase
      .from('collections')
      .select('id,user_id')
      .eq('id', collectionId)
      .single();
    if (!collection || collection.user_id !== userId) {
      throw new Error('Unauthorized');
    }

    const { error } = await supabase
      .from('collection_items')
      .delete()
      .eq('collection_id', collectionId)
      .eq('nft_id', nftId);
    if (error) throw error;
    return { success: true };
  }

  async listItems(collectionId: string, userId: string) {
    // Ensure collection belongs to user
    const { data: collection } = await supabase
      .from('collections')
      .select('id,user_id')
      .eq('id', collectionId)
      .single();
    if (!collection || collection.user_id !== userId) {
      throw new Error('Unauthorized');
    }

    const { data, error } = await supabase
      .from('collection_items')
      .select('*')
      .eq('collection_id', collectionId)
      .order('added_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }
}

export const CollectionsService = new CollectionsServiceClass();