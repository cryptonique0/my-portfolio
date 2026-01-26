/**
 * Admin Service
 * Handles user management, bans, suspensions, moderation, and system settings
 */

import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

export interface AdminStats {
  totalUsers: number;
  bannedUsers: number;
  suspendedUsers: number;
  moderationCases: number;
  totalAdminActions: number;
}

export interface UserWithStatus {
  id: string;
  email: string;
  username?: string;
  role: string;
  created_at: string;
  banned: boolean;
  suspended: boolean;
  lastAction?: string;
}

export interface BanRecord {
  id: string;
  user_id: string;
  reason: string;
  permanent: boolean;
  expires_at?: string;
  created_at: string;
}

export interface SuspensionRecord {
  id: string;
  user_id: string;
  reason: string;
  duration_days: number;
  expires_at: string;
  created_at: string;
}

export interface ModerationCase {
  id: string;
  nft_id: string;
  reason: string;
  status: string;
  action_taken?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminAction {
  id: string;
  admin_id: string;
  action_type: string;
  target_type: string;
  target_id: string;
  reason?: string;
  created_at: string;
}

export class AdminService {
  /**
   * Get admin statistics
   */
  static async getAdminStats(): Promise<AdminStats> {
    try {
      const [usersCount, bannedCount, suspendedCount, moderationCount, actionsCount] = await Promise.all([
        supabase
          .from('auth.users')
          .select('id', { count: 'exact', head: true })
          .then(res => res.count || 0),
        supabase
          .from('user_bans')
          .select('id', { count: 'exact', head: true })
          .eq('active', true)
          .then(res => res.count || 0),
        supabase
          .from('user_suspensions')
          .select('id', { count: 'exact', head: true })
          .eq('active', true)
          .then(res => res.count || 0),
        supabase
          .from('nft_moderation')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending')
          .then(res => res.count || 0),
        supabase
          .from('admin_actions')
          .select('id', { count: 'exact', head: true })
          .then(res => res.count || 0),
      ]);

      return {
        totalUsers: usersCount,
        bannedUsers: bannedCount,
        suspendedUsers: suspendedCount,
        moderationCases: moderationCount,
        totalAdminActions: actionsCount,
      };
    } catch (error) {
      logger.error('Error fetching admin stats:', error);
      throw error;
    }
  }

  /**
   * Get all users with status (banned/suspended)
   */
  static async getAllUsers(limit: number = 50, offset: number = 0): Promise<UserWithStatus[]> {
    try {
      const { data: users, error } = await supabase.rpc('get_users_with_status', {
        limit,
        offset,
      });

      if (error) throw error;
      return users || [];
    } catch (error) {
      logger.error('Error fetching users:', error);
      return [];
    }
  }

  /**
   * Get users pending moderation action
   */
  static async getFlaggedUsers(limit: number = 20): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('admin_actions')
        .select('*, users:admin_id(username, email)')
        .eq('action_type', 'warning')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching flagged users:', error);
      return [];
    }
  }

  /**
   * Ban a user (permanent)
   */
  static async banUser(userId: string, adminId: string, reason: string): Promise<BanRecord | null> {
    try {
      const { data, error } = await supabase
        .from('user_bans')
        .insert({
          user_id: userId,
          banned_by: adminId,
          reason,
          permanent: true,
          active: true,
        })
        .select()
        .single();

      if (error) throw error;

      // Log admin action
      await this.logAdminAction(adminId, 'ban', 'user', userId, reason);

      return data;
    } catch (error) {
      logger.error('Error banning user:', error);
      throw error;
    }
  }

  /**
   * Suspend a user (temporary)
   */
  static async suspendUser(userId: string, adminId: string, reason: string, durationDays: number): Promise<SuspensionRecord | null> {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + durationDays);

      const { data, error } = await supabase
        .from('user_suspensions')
        .insert({
          user_id: userId,
          suspended_by: adminId,
          reason,
          duration_days: durationDays,
          expires_at: expiresAt.toISOString(),
          active: true,
        })
        .select()
        .single();

      if (error) throw error;

      // Log admin action
      await this.logAdminAction(adminId, 'suspend', 'user', userId, reason);

      return data;
    } catch (error) {
      logger.error('Error suspending user:', error);
      throw error;
    }
  }

  /**
   * Unban a user
   */
  static async unbanUser(userId: string, adminId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_bans')
        .update({ active: false })
        .eq('user_id', userId)
        .eq('active', true);

      if (error) throw error;

      // Log admin action
      await this.logAdminAction(adminId, 'unban', 'user', userId);

      return true;
    } catch (error) {
      logger.error('Error unbanning user:', error);
      return false;
    }
  }

  /**
   * Get active bans for a user
   */
  static async getUserBans(userId: string): Promise<BanRecord[]> {
    try {
      const { data, error } = await supabase
        .from('user_bans')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching user bans:', error);
      return [];
    }
  }

  /**
   * Get active suspensions for a user
   */
  static async getUserSuspensions(userId: string): Promise<SuspensionRecord[]> {
    try {
      const { data, error } = await supabase
        .from('user_suspensions')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true)
        .gte('expires_at', new Date().toISOString());

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching user suspensions:', error);
      return [];
    }
  }

  /**
   * Flag or moderate an NFT
   */
  static async moderateNFT(
    nftId: string,
    reason: string,
    description: string,
    adminId: string,
    actionTaken: string = 'none'
  ): Promise<ModerationCase | null> {
    try {
      const { data, error } = await supabase
        .from('nft_moderation')
        .insert({
          nft_id: nftId,
          moderated_by: adminId,
          reason,
          description,
          status: 'approved',
          action_taken: actionTaken,
        })
        .select()
        .single();

      if (error) throw error;

      // Log admin action
      await this.logAdminAction(adminId, 'delete_nft', 'nft', nftId, reason);

      return data;
    } catch (error) {
      logger.error('Error moderating NFT:', error);
      throw error;
    }
  }

  /**
   * Get pending moderation cases
   */
  static async getPendingModerationCases(limit: number = 50): Promise<ModerationCase[]> {
    try {
      const { data, error } = await supabase
        .from('nft_moderation')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching moderation cases:', error);
      return [];
    }
  }

  /**
   * Approve or reject a moderation case
   */
  static async resolveModerationCase(
    caseId: string,
    status: 'approved' | 'rejected',
    adminId: string,
    actionTaken?: string
  ): Promise<ModerationCase | null> {
    try {
      const { data, error } = await supabase
        .from('nft_moderation')
        .update({
          status,
          moderated_by: adminId,
          action_taken: actionTaken || 'none',
          updated_at: new Date().toISOString(),
        })
        .eq('id', caseId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error resolving moderation case:', error);
      throw error;
    }
  }

  /**
   * Get system settings
   */
  static async getSettings(): Promise<Record<string, any>> {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('key, value');

      if (error) throw error;

      const settings: Record<string, any> = {};
      data?.forEach((row: any) => {
        settings[row.key] = row.value;
      });
      return settings;
    } catch (error) {
      logger.error('Error fetching settings:', error);
      return {};
    }
  }

  /**
   * Update a system setting
   */
  static async updateSetting(key: string, value: any, adminId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          key,
          value,
          updated_by: adminId,
          updated_at: new Date().toISOString(),
        })
        .eq('key', key);

      if (error) throw error;

      // Log admin action
      await this.logAdminAction(adminId, 'update_settings', 'settings', key);

      return true;
    } catch (error) {
      logger.error('Error updating setting:', error);
      return false;
    }
  }

  /**
   * Get admin action history
   */
  static async getAdminActionHistory(limit: number = 100): Promise<AdminAction[]> {
    try {
      const { data, error } = await supabase
        .from('admin_actions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching admin action history:', error);
      return [];
    }
  }

  /**
   * Log an admin action
   */
  private static async logAdminAction(
    adminId: string,
    actionType: string,
    targetType: string,
    targetId: string,
    reason?: string
  ): Promise<void> {
    try {
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: adminId,
          action_type: actionType,
          target_type: targetType,
          target_id: targetId,
          reason,
        });
    } catch (error) {
      logger.error('Error logging admin action:', error);
    }
  }

  /**
   * Get transaction summary for monitoring
   */
  static async getTransactionSummary(hours: number = 24): Promise<any> {
    try {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .gte('created_at', since)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const summary = {
        total: data?.length || 0,
        totalVolume: data?.reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0,
        byType: {} as Record<string, number>,
        byStatus: {} as Record<string, number>,
      };

      data?.forEach((tx: any) => {
        summary.byType[tx.type] = (summary.byType[tx.type] || 0) + 1;
        summary.byStatus[tx.status] = (summary.byStatus[tx.status] || 0) + 1;
      });

      return summary;
    } catch (error) {
      logger.error('Error fetching transaction summary:', error);
      return null;
    }
  }
}
