/**
 * Notification Preferences Service
 * Manages user notification settings and preferences
 */

import { supabase, supabaseAdmin } from '../config/supabase';
import { logger } from '../utils/logger';

export interface NotificationPreferences {
  user_id: string;
  email_on_sale: boolean;
  email_on_offer: boolean;
  email_on_follow: boolean;
  email_on_auction_bid: boolean;
  email_on_message: boolean;
  push_on_sale: boolean;
  push_on_offer: boolean;
  push_on_follow: boolean;
  push_on_auction_bid: boolean;
  push_on_message: boolean;
  in_app_on_sale: boolean;
  in_app_on_offer: boolean;
  in_app_on_follow: boolean;
  in_app_on_auction_bid: boolean;
  in_app_on_message: boolean;
  notify_frequency: 'instant' | 'daily' | 'weekly' | 'never';
  unsubscribe_all: boolean;
  updated_at: string;
}

export class NotificationPreferencesService {
  /**
   * Get user preferences
   */
  static async getPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      // Return defaults if no preferences found
      if (!data) {
        return this.getDefaultPreferences(userId);
      }
      
      return data;
    } catch (error) {
      logger.error('Error fetching notification preferences:', error);
      return null;
    }
  }

  /**
   * Update user preferences
   */
  static async updatePreferences(
    userId: string,
    updates: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      logger.info(`Updated notification preferences for user ${userId}`);
      return data;
    } catch (error) {
      logger.error('Error updating notification preferences:', error);
      return null;
    }
  }

  /**
   * Get default preferences
   */
  static getDefaultPreferences(userId: string): NotificationPreferences {
    return {
      user_id: userId,
      email_on_sale: true,
      email_on_offer: true,
      email_on_follow: false,
      email_on_auction_bid: true,
      email_on_message: true,
      push_on_sale: true,
      push_on_offer: true,
      push_on_follow: false,
      push_on_auction_bid: true,
      push_on_message: true,
      in_app_on_sale: true,
      in_app_on_offer: true,
      in_app_on_follow: true,
      in_app_on_auction_bid: true,
      in_app_on_message: true,
      notify_frequency: 'instant',
      unsubscribe_all: false,
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Bulk update multiple users' preferences
   */
  static async bulkUpdatePreferences(
    userIds: string[],
    updates: Partial<NotificationPreferences>
  ): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('notification_preferences')
        .update(updates)
        .in('user_id', userIds);

      if (error) throw error;
      logger.info(`Bulk updated preferences for ${userIds.length} users`);
      return true;
    } catch (error) {
      logger.error('Error bulk updating preferences:', error);
      return false;
    }
  }

  /**
   * Unsubscribe from all notifications
   */
  static async unsubscribeAll(userId: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('notification_preferences')
        .update({ unsubscribe_all: true })
        .eq('user_id', userId);

      if (error) throw error;
      logger.info(`User ${userId} unsubscribed from all notifications`);
      return true;
    } catch (error) {
      logger.error('Error unsubscribing user:', error);
      return false;
    }
  }

  /**
   * Resubscribe to notifications
   */
  static async resubscribe(userId: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('notification_preferences')
        .update({ unsubscribe_all: false })
        .eq('user_id', userId);

      if (error) throw error;
      logger.info(`User ${userId} resubscribed to notifications`);
      return true;
    } catch (error) {
      logger.error('Error resubscribing user:', error);
      return false;
    }
  }

  /**
   * Get users with specific notification enabled
   */
  static async getUsersWithNotificationEnabled(
    notificationType: string,
    channel: 'email' | 'push' | 'in_app' = 'email'
  ): Promise<string[]> {
    try {
      const column = `${channel}_on_${notificationType}`;
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('user_id')
        .eq(column, true)
        .eq('unsubscribe_all', false);

      if (error) throw error;
      return (data || []).map(item => item.user_id);
    } catch (error) {
      logger.error(`Error fetching users with ${notificationType} enabled:`, error);
      return [];
    }
  }

  /**
   * Get notification summary for user
   */
  static async getNotificationSummary(userId: string): Promise<{
    enabledChannels: string[];
    notificationTypes: string[];
    frequency: string;
    isUnsubscribed: boolean;
  } | null> {
    try {
      const prefs = await this.getPreferences(userId);
      if (!prefs) return null;

      const enabledChannels: string[] = [];
      const notificationTypes: string[] = [];

      // Check channels
      if (prefs.email_on_sale || prefs.email_on_offer || prefs.email_on_follow || prefs.email_on_auction_bid || prefs.email_on_message) {
        enabledChannels.push('email');
      }
      if (prefs.push_on_sale || prefs.push_on_offer || prefs.push_on_follow || prefs.push_on_auction_bid || prefs.push_on_message) {
        enabledChannels.push('push');
      }
      if (prefs.in_app_on_sale || prefs.in_app_on_offer || prefs.in_app_on_follow || prefs.in_app_on_auction_bid || prefs.in_app_on_message) {
        enabledChannels.push('in-app');
      }

      // Check notification types
      if (prefs.email_on_sale || prefs.push_on_sale || prefs.in_app_on_sale) notificationTypes.push('sale');
      if (prefs.email_on_offer || prefs.push_on_offer || prefs.in_app_on_offer) notificationTypes.push('offer');
      if (prefs.email_on_follow || prefs.push_on_follow || prefs.in_app_on_follow) notificationTypes.push('follow');
      if (prefs.email_on_auction_bid || prefs.push_on_auction_bid || prefs.in_app_on_auction_bid) notificationTypes.push('auction_bid');
      if (prefs.email_on_message || prefs.push_on_message || prefs.in_app_on_message) notificationTypes.push('message');

      return {
        enabledChannels,
        notificationTypes,
        frequency: prefs.notify_frequency,
        isUnsubscribed: prefs.unsubscribe_all,
      };
    } catch (error) {
      logger.error('Error getting notification summary:', error);
      return null;
    }
  }
}

export const notificationPreferencesService = new NotificationPreferencesService();
