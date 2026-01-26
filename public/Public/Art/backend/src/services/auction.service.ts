/**
 * Auction Service - Handles all auction-related database operations
 */

import { supabase, supabaseAdmin } from '../config/supabase';
import { Auction, Bid } from '../types/database';
import { logger } from '../utils/logger';

export class AuctionService {
  /**
   * Create auction
   */
  static async createAuction(
    auctionData: Omit<Auction, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Auction | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('auctions')
        .insert([auctionData])
        .select()
        .single();

      if (error) throw error;
      logger.info(`Created auction: ${data.id}`);
      return data;
    } catch (error) {
      logger.error('Error creating auction:', error);
      return null;
    }
  }

  /**
   * Get auction by ID
   */
  static async getAuctionById(auctionId: string): Promise<Auction | null> {
    try {
      const { data, error } = await supabase
        .from('auctions')
        .select('*')
        .eq('id', auctionId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      logger.error('Error fetching auction:', error);
      return null;
    }
  }

  /**
   * Get auction by NFT ID
   */
  static async getAuctionByNFTId(nftId: string): Promise<Auction | null> {
    try {
      const { data, error } = await supabase
        .from('auctions')
        .select('*')
        .eq('nft_id', nftId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      logger.error('Error fetching auction by NFT:', error);
      return null;
    }
  }

  /**
   * Get active auctions
   */
  static async getActiveAuctions(limit = 50, offset = 0): Promise<Auction[]> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('auctions')
        .select('*')
        .eq('status', 'active')
        .gt('end_date', now)
        .order('end_date', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching active auctions:', error);
      return [];
    }
  }

  /**
   * Get user's auctions
   */
  static async getUserAuctions(userId: string, limit = 50, offset = 0): Promise<Auction[]> {
    try {
      const { data, error } = await supabase
        .from('auctions')
        .select('*')
        .eq('creator_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching user auctions:', error);
      return [];
    }
  }

  /**
   * Place bid on auction
   */
  static async placeBid(
    auctionId: string,
    bidderId: string,
    amount: number
  ): Promise<Bid | null> {
    try {
      // Get current auction to verify bid amount
      const auction = await this.getAuctionById(auctionId);
      if (!auction || auction.status !== 'active') {
        throw new Error('Auction not found or not active');
      }

      if (amount <= auction.current_price) {
        throw new Error('Bid must be higher than current price');
      }

      // Create bid record
      const { data: bidData, error: bidError } = await supabaseAdmin
        .from('bids')
        .insert([
          {
            auction_id: auctionId,
            bidder_id: bidderId,
            amount,
            status: 'confirmed',
          },
        ])
        .select()
        .single();

      if (bidError) throw bidError;

      // Update auction with new highest bid
      await supabaseAdmin
        .from('auctions')
        .update({
          current_price: amount,
          highest_bidder_id: bidderId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', auctionId);

      logger.info(`Bid placed on auction ${auctionId}: ${amount}`);
      return bidData;
    } catch (error) {
      logger.error('Error placing bid:', error);
      return null;
    }
  }

  /**
   * Get auction bids
   */
  static async getAuctionBids(auctionId: string, limit = 50): Promise<Bid[]> {
    try {
      const { data, error } = await supabase
        .from('bids')
        .select('*')
        .eq('auction_id', auctionId)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching auction bids:', error);
      return [];
    }
  }

  /**
   * Get user's bids
   */
  static async getUserBids(userId: string, limit = 50, offset = 0): Promise<Bid[]> {
    try {
      const { data, error } = await supabase
        .from('bids')
        .select('*')
        .eq('bidder_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching user bids:', error);
      return [];
    }
  }

  /**
   * End auction
   */
  static async endAuction(auctionId: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('auctions')
        .update({
          status: 'ended',
          updated_at: new Date().toISOString(),
        })
        .eq('id', auctionId);

      if (error) throw error;
      logger.info(`Auction ${auctionId} ended`);
      return true;
    } catch (error) {
      logger.error('Error ending auction:', error);
      return false;
    }
  }

  /**
   * Cancel auction
   */
  static async cancelAuction(auctionId: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('auctions')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', auctionId);

      if (error) throw error;
      logger.info(`Auction ${auctionId} cancelled`);
      return true;
    } catch (error) {
      logger.error('Error cancelling auction:', error);
      return false;
    }
  }

  /**
   * Get auction with details
   */
  static async getAuctionDetails(auctionId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('auctions')
        .select(`
          *,
          nft:nft_id(name, image_url, owner_id),
          creator:creator_id(username, avatar_url),
          highest_bidder:highest_bidder_id(username),
          bids:bids(count)
        `)
        .eq('id', auctionId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      logger.error('Error fetching auction details:', error);
      return null;
    }
  }

  /**
   * Get ending soon auctions
   */
  static async getEndingSoonAuctions(hoursUntilEnd = 24, limit = 10): Promise<Auction[]> {
    try {
      const now = new Date();
      const endTime = new Date(now.getTime() + hoursUntilEnd * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('auctions')
        .select('*')
        .eq('status', 'active')
        .gt('end_date', now.toISOString())
        .lt('end_date', endTime.toISOString())
        .order('end_date', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching ending soon auctions:', error);
      return [];
    }
  }

  /**
   * Settle auction after end time with on-chain settlement
   */
  static async settleAuctionWithBlockchain(
    auctionId: string,
    settlementTxHash: string
  ): Promise<Auction | null> {
    try {
      const { data, error } = await supabase
        .from('auctions')
        .update({
          status: 'settled',
          settlement_tx_hash: settlementTxHash,
          updated_at: new Date().toISOString(),
        })
        .eq('id', auctionId)
        .select()
        .single();

      if (error) throw error;
      logger.info(`Settled auction ${auctionId} with tx ${settlementTxHash}`);
      return data;
    } catch (error) {
      logger.error('Error settling auction:', error);
      return null;
    }
  }

  /**
   * Get auction statistics for dashboard
   */
  static async getAuctionStats(): Promise<{
    activeAuctions: number;
    totalAuctions: number;
    totalBids: number;
    settlementRate: string;
  }> {
    try {
      const [active, total, bids] = await Promise.all([
        supabase
          .from('auctions')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'active'),
        supabase
          .from('auctions')
          .select('id', { count: 'exact', head: true }),
        supabase
          .from('bids')
          .select('id', { count: 'exact', head: true }),
      ]);

      const activeCount = active.count || 0;
      const totalCount = total.count || 0;
      const settlementRate = totalCount > 0 
        ? ((activeCount / totalCount) * 100).toFixed(2)
        : '0';

      return {
        activeAuctions: activeCount,
        totalAuctions: totalCount,
        totalBids: bids.count || 0,
        settlementRate,
      };
    } catch (error) {
      logger.error('Error getting auction stats:', error);
      return {
        activeAuctions: 0,
        totalAuctions: 0,
        totalBids: 0,
        settlementRate: '0',
      };
    }
  }
}
