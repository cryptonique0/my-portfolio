/**
 * Transaction Service - Handles all transaction-related database operations
 */

import { supabase, supabaseAdmin } from '../config/supabase';
import { Transaction } from '../types/database';
import { logger } from '../utils/logger';

export class TransactionService {
  /**
   * Create transaction record
   */
  static async createTransaction(
    transactionData: Omit<Transaction, 'id' | 'created_at'>
  ): Promise<Transaction | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('transactions')
        .insert([transactionData])
        .select()
        .single();

      if (error) throw error;
      logger.info(`Created transaction: ${data.id}`);
      return data;
    } catch (error) {
      logger.error('Error creating transaction:', error);
      return null;
    }
  }

  /**
   * Get transaction by ID
   */
  static async getTransactionById(transactionId: string): Promise<Transaction | null> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      logger.error('Error fetching transaction:', error);
      return null;
    }
  }

  /**
   * Get transaction by hash
   */
  static async getTransactionByHash(hash: string): Promise<Transaction | null> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('transaction_hash', hash)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      logger.error('Error fetching transaction by hash:', error);
      return null;
    }
  }

  /**
   * Get user's transaction history
   */
  static async getUserTransactionHistory(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching user transaction history:', error);
      return [];
    }
  }

  /**
   * Get NFT transaction history
   */
  static async getNFTTransactionHistory(
    nftId: string,
    limit = 50,
    offset = 0
  ): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('nft_id', nftId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching NFT transaction history:', error);
      return [];
    }
  }

  /**
   * Get user sales
   */
  static async getUserSales(userId: string, limit = 50, offset = 0): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('seller_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching user sales:', error);
      return [];
    }
  }

  /**
   * Get user purchases
   */
  static async getUserPurchases(userId: string, limit = 50, offset = 0): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('buyer_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching user purchases:', error);
      return [];
    }
  }

  /**
   * Update transaction status
   */
  static async updateTransactionStatus(
    transactionId: string,
    status: 'pending' | 'completed' | 'failed'
  ): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('transactions')
        .update({ status })
        .eq('id', transactionId);

      if (error) throw error;
      logger.info(`Updated transaction ${transactionId} status to ${status}`);
      return true;
    } catch (error) {
      logger.error('Error updating transaction status:', error);
      return false;
    }
  }

  /**
   * Get transaction volume for user
   */
  static async getUserVolume(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('price')
        .eq('seller_id', userId)
        .eq('status', 'completed');

      if (error) throw error;

      const total = (data || []).reduce((sum, t) => sum + parseFloat(t.price), 0);
      return total;
    } catch (error) {
      logger.error('Error calculating user volume:', error);
      return 0;
    }
  }

  /**
   * Get total platform volume
   */
  static async getPlatformVolume(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('price')
        .eq('status', 'completed');

      if (error) throw error;

      const total = (data || []).reduce((sum, t) => sum + parseFloat(t.price), 0);
      return total;
    } catch (error) {
      logger.error('Error calculating platform volume:', error);
      return 0;
    }
  }

  /**
   * Get transaction with details
   */
  static async getTransactionDetails(transactionId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          nft:nft_id(name, image_url),
          seller:seller_id(username, avatar_url),
          buyer:buyer_id(username, avatar_url)
        `)
        .eq('id', transactionId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      logger.error('Error fetching transaction details:', error);
      return null;
    }
  }

  /**
   * Get recent sales
   */
  static async getRecentSales(limit = 20): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          nft:nft_id(name, image_url),
          buyer:buyer_id(username)
        `)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching recent sales:', error);
      return [];
    }
  }
}
