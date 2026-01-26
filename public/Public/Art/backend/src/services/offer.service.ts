/**
 * Offer Service - Handles all offer-related database operations
 */

import { supabase, supabaseAdmin } from '../config/supabase';
import { Offer } from '../types/database';
import { logger } from '../utils/logger';

export class OfferService {
  /**
   * Create offer
   */
  static async createOffer(
    offerData: Omit<Offer, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Offer | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('offers')
        .insert([offerData])
        .select()
        .single();

      if (error) throw error;
      logger.info(`Created offer: ${data.id}`);
      return data;
    } catch (error) {
      logger.error('Error creating offer:', error);
      return null;
    }
  }

  /**
   * Get offer by ID
   */
  static async getOfferById(offerId: string): Promise<Offer | null> {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('id', offerId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      logger.error('Error fetching offer:', error);
      return null;
    }
  }

  /**
   * Get offers for NFT
   */
  static async getNFTOffers(nftId: string, limit = 50): Promise<Offer[]> {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('nft_id', nftId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching NFT offers:', error);
      return [];
    }
  }

  /**
   * Get user's received offers
   */
  static async getUserReceivedOffers(userId: string, limit = 50, offset = 0): Promise<Offer[]> {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching user received offers:', error);
      return [];
    }
  }

  /**
   * Get user's sent offers
   */
  static async getUserSentOffers(userId: string, limit = 50, offset = 0): Promise<Offer[]> {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('proposer_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching user sent offers:', error);
      return [];
    }
  }

  /**
   * Accept offer
   */
  static async acceptOffer(offerId: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('offers')
        .update({
          status: 'accepted',
          updated_at: new Date().toISOString(),
        })
        .eq('id', offerId);

      if (error) throw error;
      logger.info(`Offer ${offerId} accepted`);
      return true;
    } catch (error) {
      logger.error('Error accepting offer:', error);
      return false;
    }
  }

  /**
   * Reject offer
   */
  static async rejectOffer(offerId: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('offers')
        .update({
          status: 'rejected',
          updated_at: new Date().toISOString(),
        })
        .eq('id', offerId);

      if (error) throw error;
      logger.info(`Offer ${offerId} rejected`);
      return true;
    } catch (error) {
      logger.error('Error rejecting offer:', error);
      return false;
    }
  }

  /**
   * Cancel offer
   */
  static async cancelOffer(offerId: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('offers')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', offerId);

      if (error) throw error;
      logger.info(`Offer ${offerId} cancelled`);
      return true;
    } catch (error) {
      logger.error('Error cancelling offer:', error);
      return false;
    }
  }

  /**
   * Get active offers for NFT
   */
  static async getActiveNFTOffers(nftId: string): Promise<Offer[]> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('nft_id', nftId)
        .eq('status', 'pending')
        .gt('expiry_date', now)
        .order('amount', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching active NFT offers:', error);
      return [];
    }
  }

  /**
   * Get highest offer for NFT
   */
  static async getHighestOffer(nftId: string): Promise<Offer | null> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('nft_id', nftId)
        .eq('status', 'pending')
        .gt('expiry_date', now)
        .order('amount', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      logger.error('Error fetching highest offer:', error);
      return null;
    }
  }
}
