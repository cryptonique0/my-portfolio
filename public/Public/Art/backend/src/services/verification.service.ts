import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

export interface VerificationRequest {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  request_type: 'creator' | 'influencer' | 'business' | 'developer';
  social_proof: string[];
  portfolio_links: string[];
  reason: string;
  admin_notes?: string;
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export interface VerificationCriteria {
  min_followers?: number;
  min_nfts_created?: number;
  min_sales_volume?: number;
  social_links_required?: boolean;
  portfolio_required?: boolean;
}

class VerificationServiceClass {
  // Verification criteria by type
  private readonly CRITERIA: { [key: string]: VerificationCriteria } = {
    creator: {
      min_nfts_created: 5,
      min_sales_volume: 10,
      social_links_required: true,
      portfolio_required: true,
    },
    influencer: {
      min_followers: 1000,
      social_links_required: true,
    },
    business: {
      min_sales_volume: 50,
      social_links_required: true,
      portfolio_required: true,
    },
    developer: {
      min_nfts_created: 1,
      social_links_required: true,
    },
  };

  /**
   * Submit verification request
   */
  async submitVerificationRequest(
    userId: string,
    requestType: 'creator' | 'influencer' | 'business' | 'developer',
    data: {
      social_proof: string[];
      portfolio_links: string[];
      reason: string;
    }
  ): Promise<VerificationRequest | null> {
    try {
      // Check if user already has a pending request
      const { data: existing } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .single();

      if (existing) {
        logger.warn(`User ${userId} already has a pending verification request`);
        return null;
      }

      // Check if user is already verified
      const { data: user } = await supabase
        .from('users')
        .select('is_verified')
        .eq('user_id', userId)
        .single();

      if (user?.is_verified) {
        logger.warn(`User ${userId} is already verified`);
        return null;
      }

      // Create verification request
      const { data: request, error } = await supabase
        .from('verification_requests')
        .insert({
          user_id: userId,
          status: 'pending',
          request_type: requestType,
          social_proof: data.social_proof,
          portfolio_links: data.portfolio_links,
          reason: data.reason,
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        logger.error('Error submitting verification request:', error);
        return null;
      }

      logger.info(`Verification request submitted for user ${userId}`);
      return request as VerificationRequest;
    } catch (error) {
      logger.error('Error in submitVerificationRequest:', error);
      return null;
    }
  }

  /**
   * Get verification request
   */
  async getVerificationRequest(requestId: string): Promise<VerificationRequest | null> {
    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (error) {
        logger.error('Error fetching verification request:', error);
        return null;
      }

      return data as VerificationRequest;
    } catch (error) {
      logger.error('Error in getVerificationRequest:', error);
      return null;
    }
  }

  /**
   * Get user's verification requests
   */
  async getUserVerificationRequests(userId: string): Promise<VerificationRequest[]> {
    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', userId)
        .order('submitted_at', { ascending: false });

      if (error) {
        logger.error('Error fetching user verification requests:', error);
        return [];
      }

      return data as VerificationRequest[];
    } catch (error) {
      logger.error('Error in getUserVerificationRequests:', error);
      return [];
    }
  }

  /**
   * Get all pending verification requests (admin)
   */
  async getPendingVerificationRequests(limit: number = 50): Promise<VerificationRequest[]> {
    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('status', 'pending')
        .order('submitted_at', { ascending: true })
        .limit(limit);

      if (error) {
        logger.error('Error fetching pending verification requests:', error);
        return [];
      }

      return data as VerificationRequest[];
    } catch (error) {
      logger.error('Error in getPendingVerificationRequests:', error);
      return [];
    }
  }

  /**
   * Check if user meets verification criteria
   */
  async checkVerificationEligibility(
    userId: string,
    requestType: 'creator' | 'influencer' | 'business' | 'developer'
  ): Promise<{ eligible: boolean; reasons: string[] }> {
    try {
      const criteria = this.CRITERIA[requestType];
      const reasons: string[] = [];

      // Get user stats
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!user) {
        return { eligible: false, reasons: ['User not found'] };
      }

      // Check criteria
      if (criteria.min_followers && (user.followers_count || 0) < criteria.min_followers) {
        reasons.push(`Need at least ${criteria.min_followers} followers (current: ${user.followers_count || 0})`);
      }

      if (criteria.min_nfts_created && (user.nfts_created || 0) < criteria.min_nfts_created) {
        reasons.push(`Need at least ${criteria.min_nfts_created} NFTs created (current: ${user.nfts_created || 0})`);
      }

      if (criteria.min_sales_volume && (user.total_sales || 0) < criteria.min_sales_volume) {
        reasons.push(`Need at least ${criteria.min_sales_volume} STX in sales (current: ${user.total_sales || 0})`);
      }

      if (criteria.social_links_required) {
        const hasSocialLinks = user.twitter || user.instagram || user.website;
        if (!hasSocialLinks) {
          reasons.push('Need at least one social media link');
        }
      }

      return {
        eligible: reasons.length === 0,
        reasons,
      };
    } catch (error) {
      logger.error('Error in checkVerificationEligibility:', error);
      return { eligible: false, reasons: ['Error checking eligibility'] };
    }
  }

  /**
   * Approve verification request (admin)
   */
  async approveVerificationRequest(
    requestId: string,
    adminId: string,
    adminNotes?: string
  ): Promise<boolean> {
    try {
      // Get request
      const request = await this.getVerificationRequest(requestId);
      if (!request) {
        logger.error(`Verification request not found: ${requestId}`);
        return false;
      }

      if (request.status !== 'pending') {
        logger.error(`Verification request already processed: ${requestId}`);
        return false;
      }

      // Update request status
      const { error: requestError } = await supabase
        .from('verification_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminId,
          admin_notes: adminNotes,
        })
        .eq('id', requestId);

      if (requestError) {
        logger.error('Error updating verification request:', requestError);
        return false;
      }

      // Update user verification status
      const { error: userError } = await supabase
        .from('users')
        .update({
          is_verified: true,
          verified_at: new Date().toISOString(),
        })
        .eq('user_id', request.user_id);

      if (userError) {
        logger.error('Error updating user verification status:', userError);
        return false;
      }

      logger.info(`Verification approved for user ${request.user_id} by admin ${adminId}`);
      return true;
    } catch (error) {
      logger.error('Error in approveVerificationRequest:', error);
      return false;
    }
  }

  /**
   * Reject verification request (admin)
   */
  async rejectVerificationRequest(
    requestId: string,
    adminId: string,
    adminNotes: string
  ): Promise<boolean> {
    try {
      const request = await this.getVerificationRequest(requestId);
      if (!request) {
        logger.error(`Verification request not found: ${requestId}`);
        return false;
      }

      if (request.status !== 'pending') {
        logger.error(`Verification request already processed: ${requestId}`);
        return false;
      }

      const { error } = await supabase
        .from('verification_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminId,
          admin_notes: adminNotes,
        })
        .eq('id', requestId);

      if (error) {
        logger.error('Error rejecting verification request:', error);
        return false;
      }

      logger.info(`Verification rejected for user ${request.user_id} by admin ${adminId}`);
      return true;
    } catch (error) {
      logger.error('Error in rejectVerificationRequest:', error);
      return false;
    }
  }

  /**
   * Revoke verification (admin)
   */
  async revokeVerification(userId: string, adminId: string, reason: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          is_verified: false,
          verified_at: null,
        })
        .eq('user_id', userId);

      if (error) {
        logger.error('Error revoking verification:', error);
        return false;
      }

      // Log revocation
      await supabase.from('verification_revocations').insert({
        user_id: userId,
        revoked_by: adminId,
        reason,
        revoked_at: new Date().toISOString(),
      });

      logger.info(`Verification revoked for user ${userId} by admin ${adminId}`);
      return true;
    } catch (error) {
      logger.error('Error in revokeVerification:', error);
      return false;
    }
  }

  /**
   * Get verification statistics
   */
  async getVerificationStats(): Promise<{
    total_verified: number;
    pending_requests: number;
    approved_this_month: number;
    rejected_this_month: number;
  }> {
    try {
      // Get total verified users
      const { count: totalVerified } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_verified', true);

      // Get pending requests
      const { count: pendingRequests } = await supabase
        .from('verification_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get this month's stats
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const { count: approvedThisMonth } = await supabase
        .from('verification_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .gte('reviewed_at', monthStart.toISOString());

      const { count: rejectedThisMonth } = await supabase
        .from('verification_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'rejected')
        .gte('reviewed_at', monthStart.toISOString());

      return {
        total_verified: totalVerified || 0,
        pending_requests: pendingRequests || 0,
        approved_this_month: approvedThisMonth || 0,
        rejected_this_month: rejectedThisMonth || 0,
      };
    } catch (error) {
      logger.error('Error in getVerificationStats:', error);
      return {
        total_verified: 0,
        pending_requests: 0,
        approved_this_month: 0,
        rejected_this_month: 0,
      };
    }
  }

  /**
   * Auto-verify eligible users (cron job)
   */
  async autoVerifyEligibleUsers(): Promise<number> {
    try {
      let verifiedCount = 0;

      // Get users who meet auto-verification criteria but aren't verified
      const { data: users } = await supabase
        .from('users')
        .select('user_id, nfts_created, total_sales, followers_count')
        .eq('is_verified', false)
        .gte('nfts_created', 10)
        .gte('total_sales', 20);

      if (!users || users.length === 0) {
        return 0;
      }

      for (const user of users) {
        // Check if they have social links
        const { data: userData } = await supabase
          .from('users')
          .select('twitter, instagram, website')
          .eq('user_id', user.user_id)
          .single();

        const hasSocialLinks = userData?.twitter || userData?.instagram || userData?.website;

        if (hasSocialLinks) {
          const { error } = await supabase
            .from('users')
            .update({
              is_verified: true,
              verified_at: new Date().toISOString(),
            })
            .eq('user_id', user.user_id);

          if (!error) {
            verifiedCount++;
            logger.info(`Auto-verified user ${user.user_id}`);
          }
        }
      }

      return verifiedCount;
    } catch (error) {
      logger.error('Error in autoVerifyEligibleUsers:', error);
      return 0;
    }
  }
}

export const VerificationService = new VerificationServiceClass();
