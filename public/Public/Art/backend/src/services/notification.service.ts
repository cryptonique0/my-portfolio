/**
 * Notification Service - Handles all notification-related operations
 */

import { supabase, supabaseAdmin } from '../config/supabase';
import { Notification } from '../types/database';
import { logger } from '../utils/logger';

export class NotificationService {
  /**
   * Create notification
   */
  static async createNotification(
    notificationData: Omit<Notification, 'id' | 'created_at'>
  ): Promise<Notification | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('notifications')
        .insert([notificationData])
        .select()
        .single();

      if (error) throw error;
      logger.info(`Created notification for user ${notificationData.user_id}`);
      return data;
    } catch (error) {
      logger.error('Error creating notification:', error);
      return null;
    }
  }

  /**
   * Get user notifications
   */
  static async getUserNotifications(userId: string, limit = 50, offset = 0): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching notifications:', error);
      return [];
    }
  }

  /**
   * Get unread notifications
   */
  static async getUnreadNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('read', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching unread notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Error deleting notification:', error);
      return false;
    }
  }

  /**
   * Get unread count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      logger.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Send purchase notification
   */
  static async notifyPurchase(sellerId: string, buyerUsername: string, nftName: string): Promise<void> {
    await this.createNotification({
      user_id: sellerId,
      type: 'sale',
      title: 'Your NFT Sold!',
      message: `${buyerUsername} purchased "${nftName}"`,
      read: false,
      data: { type: 'sale' },
    });
  }

  /**
   * Send auction bid notification
   */
  static async notifyAuctionBid(
    auctionCreatorId: string,
    bidderUsername: string,
    nftName: string,
    amount: number
  ): Promise<void> {
    await this.createNotification({
      user_id: auctionCreatorId,
      type: 'auction_bid',
      title: 'New Bid on Your Auction!',
      message: `${bidderUsername} bid ${amount} on "${nftName}"`,
      read: false,
      data: { type: 'auction_bid', amount },
    });
  }

  /**
   * Send offer notification
   */
  static async notifyOffer(
    recipientId: string,
    proposerUsername: string,
    nftName: string,
    amount: number
  ): Promise<void> {
    await this.createNotification({
      user_id: recipientId,
      type: 'offer',
      title: 'New Offer Received!',
      message: `${proposerUsername} offered ${amount} for "${nftName}"`,
      read: false,
      data: { type: 'offer', amount },
    });
  }

  /**
   * Send follow notification
   */
  static async notifyFollow(followedId: string, followerUsername: string): Promise<void> {
    await this.createNotification({
      user_id: followedId,
      type: 'follow',
      title: 'New Follower!',
      message: `${followerUsername} started following you`,
      read: false,
      data: { type: 'follow' },
    });
  }
}
