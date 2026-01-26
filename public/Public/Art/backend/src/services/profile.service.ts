import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import { IPFSService } from './ipfs';

export interface UserProfile {
  user_id: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  banner_url?: string;
  website?: string;
  twitter?: string;
  instagram?: string;
  discord?: string;
  telegram?: string;
  portfolio_value?: number;
  total_sales?: number;
  total_purchases?: number;
  nfts_created?: number;
  nfts_owned?: number;
  followers_count?: number;
  following_count?: number;
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SocialLinks {
  website?: string;
  twitter?: string;
  instagram?: string;
  discord?: string;
  telegram?: string;
  github?: string;
  youtube?: string;
  linkedin?: string;
}

export interface PortfolioStats {
  user_id: string;
  total_value: number;
  nfts_owned: number;
  nfts_created: number;
  total_sales_value: number;
  total_purchases_value: number;
  profit_loss: number;
  best_sale?: number;
  most_valuable_nft?: string;
  updated_at: string;
}

class ProfileServiceClass {
  /**
   * Get user profile by user ID
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        logger.error(`Error fetching profile for user ${userId}:`, error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      logger.error('Error in getProfile:', error);
      return null;
    }
  }

  /**
   * Get user profile by username
   */
  async getProfileByUsername(username: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        logger.error(`Error fetching profile for username ${username}:`, error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      logger.error('Error in getProfileByUsername:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<boolean> {
    try {
      // Filter out fields that shouldn't be updated directly
      const allowedFields = [
        'username',
        'bio',
        'avatar_url',
        'banner_url',
        'website',
        'twitter',
        'instagram',
        'discord',
        'telegram',
      ];

      const filteredUpdates = Object.keys(updates)
        .filter((key) => allowedFields.includes(key))
        .reduce((obj: any, key) => {
          obj[key] = updates[key as keyof UserProfile];
          return obj;
        }, {});

      const { error } = await supabase
        .from('users')
        .update({ ...filteredUpdates, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (error) {
        logger.error(`Error updating profile for user ${userId}:`, error);
        return false;
      }

      logger.info(`Profile updated for user ${userId}`);
      return true;
    } catch (error) {
      logger.error('Error in updateProfile:', error);
      return false;
    }
  }

  /**
   * Update avatar
   */
  async updateAvatar(userId: string, avatarFile: Buffer, filename: string): Promise<string | null> {
    try {
      // Upload to IPFS
      const ipfsHash = await IPFSService.uploadFile(avatarFile, filename);
      if (!ipfsHash) {
        logger.error('Failed to upload avatar to IPFS');
        return null;
      }

      const avatarUrl = `ipfs://${ipfsHash}`;

      // Update user profile
      const success = await this.updateProfile(userId, { avatar_url: avatarUrl });
      if (!success) {
        return null;
      }

      return avatarUrl;
    } catch (error) {
      logger.error('Error in updateAvatar:', error);
      return null;
    }
  }

  /**
   * Update banner
   */
  async updateBanner(userId: string, bannerFile: Buffer, filename: string): Promise<string | null> {
    try {
      // Upload to IPFS
      const ipfsHash = await IPFSService.uploadFile(bannerFile, filename);
      if (!ipfsHash) {
        logger.error('Failed to upload banner to IPFS');
        return null;
      }

      const bannerUrl = `ipfs://${ipfsHash}`;

      // Update user profile
      const success = await this.updateProfile(userId, { banner_url: bannerUrl });
      if (!success) {
        return null;
      }

      return bannerUrl;
    } catch (error) {
      logger.error('Error in updateBanner:', error);
      return null;
    }
  }

  /**
   * Update social links
   */
  async updateSocialLinks(userId: string, links: SocialLinks): Promise<boolean> {
    try {
      // Validate URLs
      const validatedLinks: Partial<SocialLinks> = {};
      
      if (links.website) {
        validatedLinks.website = this.validateUrl(links.website) ? links.website : undefined;
      }
      if (links.twitter) {
        validatedLinks.twitter = this.validateTwitterHandle(links.twitter);
      }
      if (links.instagram) {
        validatedLinks.instagram = this.validateInstagramHandle(links.instagram);
      }
      if (links.discord) {
        validatedLinks.discord = links.discord;
      }
      if (links.telegram) {
        validatedLinks.telegram = this.validateTelegramHandle(links.telegram);
      }

      return await this.updateProfile(userId, validatedLinks);
    } catch (error) {
      logger.error('Error in updateSocialLinks:', error);
      return false;
    }
  }

  /**
   * Get portfolio statistics
   */
  async getPortfolioStats(userId: string): Promise<PortfolioStats | null> {
    try {
      // Get owned NFTs count and total value
      const { data: ownedNfts, error: ownedError } = await supabase
        .from('nfts')
        .select('price')
        .eq('owner_id', userId);

      if (ownedError) {
        logger.error('Error fetching owned NFTs:', ownedError);
      }

      // Get created NFTs count
      const { data: createdNfts, error: createdError } = await supabase
        .from('nfts')
        .select('id')
        .eq('creator_id', userId);

      if (createdError) {
        logger.error('Error fetching created NFTs:', createdError);
      }

      // Get sales transactions
      const { data: sales, error: salesError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('seller_id', userId)
        .eq('type', 'sale');

      if (salesError) {
        logger.error('Error fetching sales:', salesError);
      }

      // Get purchase transactions
      const { data: purchases, error: purchasesError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('buyer_id', userId)
        .eq('type', 'sale');

      if (purchasesError) {
        logger.error('Error fetching purchases:', purchasesError);
      }

      const totalValue = ownedNfts?.reduce((sum, nft) => sum + (nft.price || 0), 0) || 0;
      const totalSalesValue = sales?.reduce((sum, sale) => sum + (sale.amount || 0), 0) || 0;
      const totalPurchasesValue = purchases?.reduce((sum, purchase) => sum + (purchase.amount || 0), 0) || 0;
      const profitLoss = totalSalesValue - totalPurchasesValue;
      const bestSale = sales && sales.length > 0 ? Math.max(...sales.map(s => s.amount || 0)) : 0;

      const stats: PortfolioStats = {
        user_id: userId,
        total_value: totalValue,
        nfts_owned: ownedNfts?.length || 0,
        nfts_created: createdNfts?.length || 0,
        total_sales_value: totalSalesValue,
        total_purchases_value: totalPurchasesValue,
        profit_loss: profitLoss,
        best_sale: bestSale,
        updated_at: new Date().toISOString(),
      };

      // Update user profile with stats
      await supabase
        .from('users')
        .update({
          portfolio_value: totalValue,
          nfts_owned: ownedNfts?.length || 0,
          nfts_created: createdNfts?.length || 0,
          total_sales: totalSalesValue,
          total_purchases: totalPurchasesValue,
        })
        .eq('user_id', userId);

      return stats;
    } catch (error) {
      logger.error('Error in getPortfolioStats:', error);
      return null;
    }
  }

  /**
   * Get portfolio value history (last 30 days)
   */
  async getPortfolioHistory(userId: string, days: number = 30): Promise<any[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('portfolio_snapshots')
        .select('*')
        .eq('user_id', userId)
        .gte('snapshot_date', startDate.toISOString())
        .order('snapshot_date', { ascending: true });

      if (error) {
        logger.error('Error fetching portfolio history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getPortfolioHistory:', error);
      return [];
    }
  }

  /**
   * Take portfolio snapshot (for tracking value over time)
   */
  async takePortfolioSnapshot(userId: string): Promise<boolean> {
    try {
      const stats = await this.getPortfolioStats(userId);
      if (!stats) {
        return false;
      }

      const { error } = await supabase
        .from('portfolio_snapshots')
        .insert({
          user_id: userId,
          total_value: stats.total_value,
          nfts_count: stats.nfts_owned,
          snapshot_date: new Date().toISOString(),
        });

      if (error) {
        logger.error('Error taking portfolio snapshot:', error);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error in takePortfolioSnapshot:', error);
      return false;
    }
  }

  /**
   * Validate URL
   */
  private validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate and format Twitter handle
   */
  private validateTwitterHandle(handle: string): string {
    // Remove @ if present and validate
    const cleanHandle = handle.replace('@', '').trim();
    return cleanHandle.match(/^[A-Za-z0-9_]{1,15}$/) ? `@${cleanHandle}` : handle;
  }

  /**
   * Validate and format Instagram handle
   */
  private validateInstagramHandle(handle: string): string {
    // Remove @ if present and validate
    const cleanHandle = handle.replace('@', '').trim();
    return cleanHandle.match(/^[A-Za-z0-9_.]{1,30}$/) ? `@${cleanHandle}` : handle;
  }

  /**
   * Validate and format Telegram handle
   */
  private validateTelegramHandle(handle: string): string {
    // Remove @ if present and validate
    const cleanHandle = handle.replace('@', '').trim();
    return cleanHandle.match(/^[A-Za-z0-9_]{5,32}$/) ? `@${cleanHandle}` : handle;
  }

  /**
   * Search profiles
   */
  async searchProfiles(query: string, limit: number = 20): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`username.ilike.%${query}%,bio.ilike.%${query}%`)
        .limit(limit);

      if (error) {
        logger.error('Error searching profiles:', error);
        return [];
      }

      return data as UserProfile[];
    } catch (error) {
      logger.error('Error in searchProfiles:', error);
      return [];
    }
  }

  /**
   * Get top profiles by portfolio value
   */
  async getTopProfiles(limit: number = 10): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('portfolio_value', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Error fetching top profiles:', error);
        return [];
      }

      return data as UserProfile[];
    } catch (error) {
      logger.error('Error in getTopProfiles:', error);
      return [];
    }
  }

  /**
   * Get verified profiles
   */
  async getVerifiedProfiles(limit: number = 20): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('is_verified', true)
        .order('followers_count', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Error fetching verified profiles:', error);
        return [];
      }

      return data as UserProfile[];
    } catch (error) {
      logger.error('Error in getVerifiedProfiles:', error);
      return [];
    }
  }
}

export const ProfileService = new ProfileServiceClass();
