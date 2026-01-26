/**
 * Transaction Tracking Service
 * Monitors on-chain transaction status and updates database
 */

import { supabase } from '../config/supabase';
import { BlockchainService } from './blockchain.service';
import { logger } from '../utils/logger';

export interface TransactionRecord {
  id: string;
  hash: string;
  user_id: string;
  type: 'mint' | 'list' | 'buy' | 'sell' | 'bid' | 'approve';
  status: 'pending' | 'confirmed' | 'failed';
  nft_id?: string;
  collection_id?: string;
  amount?: string;
  gas_used?: string;
  block_number?: number;
  confirmations?: number;
  error?: string;
  created_at: string;
  updated_at: string;
}

export class TransactionTracker {
  private static pollInterval = 5000; // 5 seconds
  private static maxConfirmations = 12; // ~3 minutes on Base

  /**
   * Create transaction record
   */
  static async createTransaction(
    hash: string,
    userId: string,
    type: string,
    nftId?: string,
    collectionId?: string,
    amount?: string
  ): Promise<TransactionRecord | null> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          hash,
          user_id: userId,
          type,
          status: 'pending',
          nft_id: nftId,
          collection_id: collectionId,
          amount,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error creating transaction record:', error);
      throw error;
    }
  }

  /**
   * Get transaction by hash
   */
  static async getTransaction(hash: string): Promise<TransactionRecord | null> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('hash', hash)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      logger.error('Error fetching transaction:', error);
      return null;
    }
  }

  /**
   * Get user transactions
   */
  static async getUserTransactions(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<TransactionRecord[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching user transactions:', error);
      return [];
    }
  }

  /**
   * Poll and update transaction status
   */
  static async pollTransactionStatus(hash: string): Promise<TransactionRecord | null> {
    try {
      const tx = await this.getTransaction(hash);
      if (!tx) return null;

      // If already confirmed/failed, don't poll again
      if (tx.status !== 'pending') {
        return tx;
      }

      // Get on-chain status
      const chainStatus = await BlockchainService.getTransactionStatus(hash);

      // Update record
      const { data, error } = await supabase
        .from('transactions')
        .update({
          status: chainStatus.status,
          block_number: chainStatus.blockNumber,
          gas_used: chainStatus.gasUsed,
          confirmations: chainStatus.confirmations,
          updated_at: new Date().toISOString(),
        })
        .eq('hash', hash)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error polling transaction status:', error);
      return null;
    }
  }

  /**
   * Start polling a transaction
   * Returns a promise that resolves when transaction is confirmed
   */
  static async watchTransaction(
    hash: string,
    timeoutMs: number = 300000 // 5 minutes
  ): Promise<TransactionRecord> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const pollFn = async () => {
        try {
          const tx = await this.pollTransactionStatus(hash);

          if (!tx) {
            reject(new Error('Transaction not found'));
            return;
          }

          if (tx.status === 'confirmed') {
            resolve(tx);
            return;
          }

          if (tx.status === 'failed') {
            reject(new Error('Transaction failed on-chain'));
            return;
          }

          if (Date.now() - startTime > timeoutMs) {
            reject(new Error('Transaction polling timeout'));
            return;
          }

          // Continue polling
          setTimeout(pollFn, this.pollInterval);
        } catch (error) {
          reject(error);
        }
      };

      pollFn();
    });
  }

  /**
   * Mark transaction as failed
   */
  static async failTransaction(hash: string, error: string): Promise<boolean> {
    try {
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          status: 'failed',
          error,
          updated_at: new Date().toISOString(),
        })
        .eq('hash', hash);

      if (updateError) throw updateError;
      return true;
    } catch (error) {
      logger.error('Error failing transaction:', error);
      return false;
    }
  }

  /**
   * Get transaction summary for user
   */
  static async getTransactionSummary(userId: string): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    failed: number;
    lastTransaction?: TransactionRecord;
  }> {
    try {
      const { data: txs, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      const summary = {
        total: txs?.length || 0,
        pending: txs?.filter((t: any) => t.status === 'pending').length || 0,
        confirmed: txs?.filter((t: any) => t.status === 'confirmed').length || 0,
        failed: txs?.filter((t: any) => t.status === 'failed').length || 0,
        lastTransaction: txs?.[0],
      };

      return summary;
    } catch (error) {
      logger.error('Error getting transaction summary:', error);
      return { total: 0, pending: 0, confirmed: 0, failed: 0 };
    }
  }

  /**
   * Clean up old pending transactions (>24h)
   */
  static async cleanupOldTransactions(): Promise<number> {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { data: oldTxs, error: fetchError } = await supabase
        .from('transactions')
        .select('id, hash')
        .eq('status', 'pending')
        .lt('created_at', oneDayAgo);

      if (fetchError) throw fetchError;

      if (!oldTxs || oldTxs.length === 0) return 0;

      // Check each one final time
      for (const tx of oldTxs) {
        await this.pollTransactionStatus(tx.hash);
      }

      return oldTxs.length;
    } catch (error) {
      logger.error('Error cleaning up old transactions:', error);
      return 0;
    }
  }
}

export default TransactionTracker;
