import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

class WishlistServiceClass {
  async addToWishlist(userId: string, nftId: string, nftName?: string, nftImage?: string) {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .insert({ user_id: userId, nft_id: nftId, nft_name: nftName, nft_image: nftImage })
        .select('*')
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Failed to add to wishlist', error);
      throw error;
    }
  }

  async removeFromWishlist(userId: string, nftId: string) {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', userId)
        .eq('nft_id', nftId);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      logger.error('Failed to remove from wishlist', error);
      throw error;
    }
  }

  async getWishlist(userId: string, limit = 100, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('*')
        .eq('user_id', userId)
        .order('added_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Failed to fetch wishlist', error);
      throw error;
    }
  }

  async isWishlisted(userId: string, nftId: string): Promise<boolean> {
    const { data } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', userId)
      .eq('nft_id', nftId)
      .limit(1);
    return !!(data && data.length > 0);
  }
}

export const WishlistService = new WishlistServiceClass();