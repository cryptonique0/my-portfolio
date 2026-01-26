import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'trading' | 'social' | 'creation' | 'collection' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
  requirement_type: string;
  requirement_value: number;
  points: number;
  is_hidden: boolean;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  progress?: number;
  achievement?: Achievement;
}

export interface AchievementProgress {
  achievement_id: string;
  current_value: number;
  required_value: number;
  percentage: number;
  unlocked: boolean;
}

class AchievementsServiceClass {
  // Predefined achievements
  private readonly ACHIEVEMENTS = [
    // Trading achievements
    { name: 'First Sale', description: 'Make your first NFT sale', icon: '💰', category: 'trading', tier: 'bronze', requirement_type: 'total_sales', requirement_value: 1, points: 10 },
    { name: 'Big Spender', description: 'Spend 10 STX on NFTs', icon: '💸', category: 'trading', tier: 'silver', requirement_type: 'total_spent', requirement_value: 10, points: 25 },
    { name: 'Whale', description: 'Portfolio value exceeds 100 STX', icon: '🐋', category: 'trading', tier: 'gold', requirement_type: 'portfolio_value', requirement_value: 100, points: 50 },
    { name: 'Profit Master', description: 'Earn 50 STX profit', icon: '📈', category: 'trading', tier: 'platinum', requirement_type: 'profit', requirement_value: 50, points: 100 },
    { name: 'Trading Legend', description: 'Complete 100 trades', icon: '⚡', category: 'trading', tier: 'legendary', requirement_type: 'total_trades', requirement_value: 100, points: 200 },
    
    // Social achievements
    { name: 'Popular', description: 'Get 10 followers', icon: '👥', category: 'social', tier: 'bronze', requirement_type: 'followers', requirement_value: 10, points: 10 },
    { name: 'Influencer', description: 'Get 100 followers', icon: '⭐', category: 'social', tier: 'silver', requirement_type: 'followers', requirement_value: 100, points: 25 },
    { name: 'Celebrity', description: 'Get 1000 followers', icon: '🌟', category: 'social', tier: 'gold', requirement_type: 'followers', requirement_value: 1000, points: 100 },
    { name: 'Social Butterfly', description: 'Follow 50 users', icon: '🦋', category: 'social', tier: 'bronze', requirement_type: 'following', requirement_value: 50, points: 10 },
    
    // Creation achievements
    { name: 'First Creation', description: 'Mint your first NFT', icon: '🎨', category: 'creation', tier: 'bronze', requirement_type: 'nfts_created', requirement_value: 1, points: 10 },
    { name: 'Prolific Creator', description: 'Mint 10 NFTs', icon: '🖼️', category: 'creation', tier: 'silver', requirement_type: 'nfts_created', requirement_value: 10, points: 25 },
    { name: 'Master Artist', description: 'Mint 50 NFTs', icon: '🎭', category: 'creation', tier: 'gold', requirement_type: 'nfts_created', requirement_value: 50, points: 75 },
    { name: 'Art Factory', description: 'Mint 100 NFTs', icon: '🏭', category: 'creation', tier: 'platinum', requirement_type: 'nfts_created', requirement_value: 100, points: 150 },
    
    // Collection achievements
    { name: 'Collector', description: 'Own 5 NFTs', icon: '🗂️', category: 'collection', tier: 'bronze', requirement_type: 'nfts_owned', requirement_value: 5, points: 10 },
    { name: 'Hoarder', description: 'Own 25 NFTs', icon: '💎', category: 'collection', tier: 'silver', requirement_type: 'nfts_owned', requirement_value: 25, points: 25 },
    { name: 'Museum Curator', description: 'Own 100 NFTs', icon: '🏛️', category: 'collection', tier: 'gold', requirement_type: 'nfts_owned', requirement_value: 100, points: 100 },
    
    // Special achievements
    { name: 'Early Adopter', description: 'Join BitArt Market in the first month', icon: '🚀', category: 'special', tier: 'gold', requirement_type: 'early_adopter', requirement_value: 1, points: 50, is_hidden: false },
    { name: 'Verified Creator', description: 'Get verified status', icon: '✅', category: 'special', tier: 'platinum', requirement_type: 'verified', requirement_value: 1, points: 100 },
    { name: 'Blue Chip Holder', description: 'Own an NFT worth 50+ STX', icon: '💠', category: 'special', tier: 'platinum', requirement_type: 'expensive_nft', requirement_value: 50, points: 75 },
    { name: 'Community Champion', description: 'Hidden achievement', icon: '🏆', category: 'special', tier: 'legendary', requirement_type: 'manual', requirement_value: 1, points: 500, is_hidden: true },
  ];

  /**
   * Initialize achievements in database
   */
  async initializeAchievements(): Promise<boolean> {
    try {
      for (const achievement of this.ACHIEVEMENTS) {
        // Check if achievement already exists
        const { data: existing } = await supabase
          .from('achievements')
          .select('id')
          .eq('name', achievement.name)
          .single();

        if (!existing) {
          const { error } = await supabase
            .from('achievements')
            .insert({
              ...achievement,
              is_hidden: achievement.is_hidden || false,
            });

          if (error) {
            logger.error(`Error inserting achievement ${achievement.name}:`, error);
          }
        }
      }

      logger.info('Achievements initialized');
      return true;
    } catch (error) {
      logger.error('Error in initializeAchievements:', error);
      return false;
    }
  }

  /**
   * Get all achievements
   */
  async getAllAchievements(includeHidden: boolean = false): Promise<Achievement[]> {
    try {
      let query = supabase.from('achievements').select('*');

      if (!includeHidden) {
        query = query.eq('is_hidden', false);
      }

      const { data, error } = await query.order('points', { ascending: true });

      if (error) {
        logger.error('Error fetching achievements:', error);
        return [];
      }

      return data as Achievement[];
    } catch (error) {
      logger.error('Error in getAllAchievements:', error);
      return [];
    }
  }

  /**
   * Get user achievements
   */
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });

      if (error) {
        logger.error('Error fetching user achievements:', error);
        return [];
      }

      return data as UserAchievement[];
    } catch (error) {
      logger.error('Error in getUserAchievements:', error);
      return [];
    }
  }

  /**
   * Get achievement progress for user
   */
  async getAchievementProgress(userId: string): Promise<AchievementProgress[]> {
    try {
      const achievements = await this.getAllAchievements(false);
      const userAchievements = await this.getUserAchievements(userId);
      const unlockedIds = new Set(userAchievements.map(ua => ua.achievement_id));

      // Get user stats
      const { data: userStats } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!userStats) {
        return [];
      }

      const progress: AchievementProgress[] = [];

      for (const achievement of achievements) {
        let currentValue = 0;

        // Calculate current value based on requirement type
        switch (achievement.requirement_type) {
          case 'total_sales':
            currentValue = userStats.total_sales || 0;
            break;
          case 'total_spent':
            currentValue = userStats.total_purchases || 0;
            break;
          case 'portfolio_value':
            currentValue = userStats.portfolio_value || 0;
            break;
          case 'profit':
            currentValue = (userStats.total_sales || 0) - (userStats.total_purchases || 0);
            break;
          case 'total_trades':
            currentValue = (userStats.total_sales || 0) + (userStats.total_purchases || 0);
            break;
          case 'followers':
            currentValue = userStats.followers_count || 0;
            break;
          case 'following':
            currentValue = userStats.following_count || 0;
            break;
          case 'nfts_created':
            currentValue = userStats.nfts_created || 0;
            break;
          case 'nfts_owned':
            currentValue = userStats.nfts_owned || 0;
            break;
          case 'verified':
            currentValue = userStats.is_verified ? 1 : 0;
            break;
          default:
            currentValue = 0;
        }

        const percentage = Math.min(100, (currentValue / achievement.requirement_value) * 100);

        progress.push({
          achievement_id: achievement.id,
          current_value: currentValue,
          required_value: achievement.requirement_value,
          percentage,
          unlocked: unlockedIds.has(achievement.id),
        });
      }

      return progress;
    } catch (error) {
      logger.error('Error in getAchievementProgress:', error);
      return [];
    }
  }

  /**
   * Check and unlock achievements for user
   */
  async checkAndUnlockAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      const progress = await this.getAchievementProgress(userId);
      const newlyUnlocked: UserAchievement[] = [];

      for (const item of progress) {
        if (!item.unlocked && item.percentage >= 100) {
          const unlocked = await this.unlockAchievement(userId, item.achievement_id);
          if (unlocked) {
            newlyUnlocked.push(unlocked);
          }
        }
      }

      return newlyUnlocked;
    } catch (error) {
      logger.error('Error in checkAndUnlockAchievements:', error);
      return [];
    }
  }

  /**
   * Unlock achievement for user
   */
  async unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement | null> {
    try {
      // Check if already unlocked
      const { data: existing } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .eq('achievement_id', achievementId)
        .single();

      if (existing) {
        return existing as UserAchievement;
      }

      // Unlock achievement
      const { data, error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievementId,
          unlocked_at: new Date().toISOString(),
        })
        .select(`
          *,
          achievement:achievements(*)
        `)
        .single();

      if (error) {
        logger.error('Error unlocking achievement:', error);
        return null;
      }

      logger.info(`Achievement unlocked for user ${userId}: ${achievementId}`);
      return data as UserAchievement;
    } catch (error) {
      logger.error('Error in unlockAchievement:', error);
      return null;
    }
  }

  /**
   * Manually unlock achievement (for special achievements)
   */
  async manuallyUnlockAchievement(userId: string, achievementName: string): Promise<boolean> {
    try {
      const { data: achievement } = await supabase
        .from('achievements')
        .select('id')
        .eq('name', achievementName)
        .single();

      if (!achievement) {
        logger.error(`Achievement not found: ${achievementName}`);
        return false;
      }

      const unlocked = await this.unlockAchievement(userId, achievement.id);
      return unlocked !== null;
    } catch (error) {
      logger.error('Error in manuallyUnlockAchievement:', error);
      return false;
    }
  }

  /**
   * Get user achievement stats
   */
  async getUserAchievementStats(userId: string): Promise<{
    total_unlocked: number;
    total_points: number;
    completion_percentage: number;
    next_achievements: Achievement[];
  }> {
    try {
      const allAchievements = await this.getAllAchievements(false);
      const userAchievements = await this.getUserAchievements(userId);
      const progress = await this.getAchievementProgress(userId);

      const totalPoints = userAchievements.reduce((sum, ua) => {
        const achievement = ua.achievement as Achievement;
        return sum + (achievement?.points || 0);
      }, 0);

      const completionPercentage = (userAchievements.length / allAchievements.length) * 100;

      // Get next 3 closest achievements
      const nextAchievements = progress
        .filter(p => !p.unlocked && p.percentage > 0)
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 3)
        .map(p => allAchievements.find(a => a.id === p.achievement_id))
        .filter(Boolean) as Achievement[];

      return {
        total_unlocked: userAchievements.length,
        total_points: totalPoints,
        completion_percentage: completionPercentage,
        next_achievements: nextAchievements,
      };
    } catch (error) {
      logger.error('Error in getUserAchievementStats:', error);
      return {
        total_unlocked: 0,
        total_points: 0,
        completion_percentage: 0,
        next_achievements: [],
      };
    }
  }

  /**
   * Get leaderboard by achievement points
   */
  async getAchievementLeaderboard(limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          user_id,
          achievement:achievements(points)
        `);

      if (error) {
        logger.error('Error fetching achievement leaderboard:', error);
        return [];
      }

      // Group by user and sum points
      const userPoints: { [key: string]: number } = {};
      data.forEach((item: any) => {
        if (!userPoints[item.user_id]) {
          userPoints[item.user_id] = 0;
        }
        userPoints[item.user_id] += item.achievement?.points || 0;
      });

      // Sort by points and get top users
      const leaderboard = Object.entries(userPoints)
        .map(([user_id, points]) => ({ user_id, points }))
        .sort((a, b) => b.points - a.points)
        .slice(0, limit);

      // Get user details
      const userIds = leaderboard.map(item => item.user_id);
      const { data: users } = await supabase
        .from('users')
        .select('user_id, username, avatar_url, is_verified')
        .in('user_id', userIds);

      // Merge user details with points
      return leaderboard.map(item => {
        const user = users?.find(u => u.user_id === item.user_id);
        return {
          ...user,
          achievement_points: item.points,
        };
      });
    } catch (error) {
      logger.error('Error in getAchievementLeaderboard:', error);
      return [];
    }
  }
}

export const AchievementsService = new AchievementsServiceClass();
