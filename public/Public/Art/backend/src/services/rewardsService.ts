<<<<<<< HEAD
import { DailyReward, LuckyDrawEntry, LuckyDrawPrize, LuckyDrawPrizeConfig } from '../types/gamification';

const LUCKY_DRAW_PRIZES: LuckyDrawPrizeConfig[] = [
  { id: 'xp_100', type: LuckyDrawPrize.XP_100, label: '100 XP', probability: 0.30, icon: '⭐', color: '#3B82F6' },
  { id: 'xp_250', type: LuckyDrawPrize.XP_250, label: '250 XP', probability: 0.25, icon: '✨', color: '#8B5CF6' },
  { id: 'xp_500', type: LuckyDrawPrize.XP_500, label: '500 XP', probability: 0.15, icon: '💎', color: '#EC4899' },
  { id: 'xp_1000', type: LuckyDrawPrize.XP_1000, label: '1000 XP', probability: 0.08, icon: '👑', color: '#F59E0B' },
  { id: 'badge_rare', type: LuckyDrawPrize.BADGE_RARE, label: 'Rare Badge', probability: 0.10, icon: '🎖️', color: '#EC4899' },
  { id: 'badge_epic', type: LuckyDrawPrize.BADGE_EPIC, label: 'Epic Badge', probability: 0.07, icon: '🏆', color: '#EF4444' },
  { id: 'nft_discount', type: LuckyDrawPrize.NFT_DISCOUNT, label: '10% Discount', probability: 0.04, icon: '🎁', color: '#10B981' },
  { id: 'feature_boost', type: LuckyDrawPrize.FEATURE_BOOST, label: 'Feature Boost', probability: 0.01, icon: '🚀', color: '#06B6D4' }
];

const dailyRewards = new Map<string, DailyReward[]>();
const luckyDraws = new Map<string, LuckyDrawEntry[]>();

export const rewardsService = {
=======
import { DailyReward, DailyRewardConfig, LuckyDrawEntry, LuckyDrawPrizeConfig, LuckyDrawPrize } from '../types/gamification';

const DAILY_REWARD_CONFIG: DailyRewardConfig = {
  baseXP: 50,
  streakBonus: 10, // 10 XP per consecutive day
  maxStreak: 365,
  resetTime: '00:00' // UTC
};

const LUCKY_DRAW_PRIZES: LuckyDrawPrizeConfig[] = [
  {
    id: 'xp_100',
    type: LuckyDrawPrize.XP_100,
    label: '100 XP',
    probability: 0.30,
    icon: '⭐',
    color: '#3B82F6'
  },
  {
    id: 'xp_250',
    type: LuckyDrawPrize.XP_250,
    label: '250 XP',
    probability: 0.25,
    icon: '✨',
    color: '#8B5CF6'
  },
  {
    id: 'xp_500',
    type: LuckyDrawPrize.XP_500,
    label: '500 XP',
    probability: 0.15,
    icon: '💎',
    color: '#EC4899'
  },
  {
    id: 'xp_1000',
    type: LuckyDrawPrize.XP_1000,
    label: '1000 XP',
    probability: 0.08,
    icon: '👑',
    color: '#F59E0B'
  },
  {
    id: 'badge_rare',
    type: LuckyDrawPrize.BADGE_RARE,
    label: 'Rare Badge',
    probability: 0.10,
    icon: '🎖️',
    color: '#EC4899'
  },
  {
    id: 'badge_epic',
    type: LuckyDrawPrize.BADGE_EPIC,
    label: 'Epic Badge',
    probability: 0.07,
    icon: '🏆',
    color: '#EF4444'
  },
  {
    id: 'nft_discount',
    type: LuckyDrawPrize.NFT_DISCOUNT,
    label: '10% Discount',
    probability: 0.04,
    icon: '🎁',
    color: '#10B981'
  },
  {
    id: 'feature_boost',
    type: LuckyDrawPrize.FEATURE_BOOST,
    label: 'Feature Boost',
    probability: 0.01,
    icon: '🚀',
    color: '#06B6D4'
  }
];

// In-memory storage for demo
const dailyRewards = new Map<string, DailyReward[]>();
const luckyDraws = new Map<string, LuckyDrawEntry[]>();

// Helper: Get today's date at midnight UTC
function getTodayKey(): string {
  const date = new Date();
  return date.toISOString().split('T')[0];
}

// Helper: Check if date is today
function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

export const rewardsService = {
  // Get or create daily reward for today
>>>>>>> 2caf294 (Initial commit with API documentation and features)
  async getDailyReward(userId: string): Promise<DailyReward> {
    const userRewards = dailyRewards.get(userId) || [];
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

<<<<<<< HEAD
=======
    // Find today's reward
>>>>>>> 2caf294 (Initial commit with API documentation and features)
    let todayReward = userRewards.find(r => {
      const rewardDate = new Date(r.date);
      return rewardDate.getTime() === today.getTime();
    });

    if (!todayReward) {
<<<<<<< HEAD
=======
      // Check for streak
>>>>>>> 2caf294 (Initial commit with API documentation and features)
      let streak = 0;
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const yesterdayReward = userRewards.find(r => {
        const rewardDate = new Date(r.date);
        return rewardDate.getTime() === yesterday.getTime();
      });

      if (yesterdayReward?.claimed) {
        streak = yesterdayReward.streak + 1;
<<<<<<< HEAD
      }

      const xpAmount = 50 + (streak * 10);
      todayReward = {
        id: `reward_${userId}_${today.toISOString().split('T')[0]}`,
=======
      } else if (userRewards.length > 0) {
        streak = 0;
      }

      const xpAmount = DAILY_REWARD_CONFIG.baseXP + (streak * DAILY_REWARD_CONFIG.streakBonus);

      todayReward = {
        id: `reward_${userId}_${getTodayKey()}`,
>>>>>>> 2caf294 (Initial commit with API documentation and features)
        userId,
        date: today,
        xpAmount,
        claimed: false,
<<<<<<< HEAD
        streak
=======
        streak: streak
>>>>>>> 2caf294 (Initial commit with API documentation and features)
      };

      userRewards.push(todayReward);
      dailyRewards.set(userId, userRewards);
    }

    return todayReward;
  },

<<<<<<< HEAD
  async claimDailyReward(userId: string): Promise<DailyReward | null> {
    const reward = await this.getDailyReward(userId);
=======
  // Claim daily reward
  async claimDailyReward(userId: string): Promise<DailyReward | null> {
    const reward = await this.getDailyReward(userId);

>>>>>>> 2caf294 (Initial commit with API documentation and features)
    if (reward.claimed) return null;

    reward.claimed = true;
    reward.claimedAt = new Date();

    const userRewards = dailyRewards.get(userId) || [];
    const index = userRewards.findIndex(r => r.id === reward.id);
    if (index !== -1) {
      userRewards[index] = reward;
      dailyRewards.set(userId, userRewards);
    }

    return reward;
  },

<<<<<<< HEAD
=======
  // Get daily reward history
  async getDailyRewardHistory(userId: string, days = 30): Promise<DailyReward[]> {
    const userRewards = dailyRewards.get(userId) || [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return userRewards
      .filter(r => new Date(r.date) >= cutoffDate)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  // Get current streak
  async getCurrentStreak(userId: string): Promise<number> {
    const reward = await this.getDailyReward(userId);
    return reward.streak;
  },

  // Draw a lucky prize
>>>>>>> 2caf294 (Initial commit with API documentation and features)
  drawPrize(): LuckyDrawPrizeConfig {
    const rand = Math.random();
    let cumulative = 0;

    for (const prize of LUCKY_DRAW_PRIZES) {
      cumulative += prize.probability;
      if (rand <= cumulative) {
        return prize;
      }
    }

    return LUCKY_DRAW_PRIZES[0];
  },

<<<<<<< HEAD
  async createLuckyDrawEntry(userId: string): Promise<LuckyDrawEntry> {
    const userDraws = luckyDraws.get(userId) || [];
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

=======
  // Create lucky draw entry
  async createLuckyDrawEntry(userId: string): Promise<LuckyDrawEntry> {
    const userDraws = luckyDraws.get(userId) || [];

    // Check if user can draw (once per day)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
>>>>>>> 2caf294 (Initial commit with API documentation and features)
    const todayEntry = userDraws.find(d => {
      if (!d.drawnAt) return false;
      const drawnDate = new Date(d.drawnAt);
      return drawnDate.getTime() === today.getTime();
    });

    if (todayEntry && todayEntry.drawnAt) {
<<<<<<< HEAD
      return todayEntry;
    }

    const prizeConfig = this.drawPrize();
=======
      // User already drew today, return entry
      return todayEntry;
    }

    // Create new entry
    const prizeConfig = this.drawPrize();
    const prizeValue = this.getPrizeValue(prizeConfig.type);

>>>>>>> 2caf294 (Initial commit with API documentation and features)
    const entry: LuckyDrawEntry = {
      id: `draw_${userId}_${Date.now()}`,
      userId,
      drawnAt: new Date(),
      prizeType: prizeConfig.type,
<<<<<<< HEAD
      prizeValue: this.getPrizeValue(prizeConfig.type),
      claimed: false,
      eligibleAfter: new Date(Date.now() + 24 * 60 * 60 * 1000)
=======
      prizeValue,
      claimed: false,
      eligibleAfter: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
>>>>>>> 2caf294 (Initial commit with API documentation and features)
    };

    userDraws.push(entry);
    luckyDraws.set(userId, userDraws);
<<<<<<< HEAD
    return entry;
  },

=======

    return entry;
  },

  // Claim lucky draw prize
>>>>>>> 2caf294 (Initial commit with API documentation and features)
  async claimLuckyDrawPrize(userId: string, drawId: string): Promise<LuckyDrawEntry | null> {
    const userDraws = luckyDraws.get(userId) || [];
    const entry = userDraws.find(d => d.id === drawId);

    if (!entry || entry.claimed) return null;

    entry.claimed = true;
    entry.claimedAt = new Date();

    const index = userDraws.findIndex(d => d.id === drawId);
    if (index !== -1) {
      userDraws[index] = entry;
      luckyDraws.set(userId, userDraws);
    }

    return entry;
  },

<<<<<<< HEAD
=======
  // Get lucky draw history
  async getLuckyDrawHistory(userId: string, limit = 10): Promise<LuckyDrawEntry[]> {
    const userDraws = luckyDraws.get(userId) || [];
    return userDraws
      .sort((a, b) => (b.drawnAt?.getTime() || 0) - (a.drawnAt?.getTime() || 0))
      .slice(0, limit);
  },

  // Get prize configurations
  getPrizeConfigs(): LuckyDrawPrizeConfig[] {
    return LUCKY_DRAW_PRIZES;
  },

  // Get prize value
  getPrizeValue(prizeType: LuckyDrawPrize): number {
    switch (prizeType) {
      case LuckyDrawPrize.XP_100:
        return 100;
      case LuckyDrawPrize.XP_250:
        return 250;
      case LuckyDrawPrize.XP_500:
        return 500;
      case LuckyDrawPrize.XP_1000:
        return 1000;
      case LuckyDrawPrize.NFT_DISCOUNT:
        return 10; // 10% discount
      default:
        return 0;
    }
  },

  // Check if user is eligible to draw
>>>>>>> 2caf294 (Initial commit with API documentation and features)
  async canUserDraw(userId: string): Promise<boolean> {
    const userDraws = luckyDraws.get(userId) || [];
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const todayEntry = userDraws.find(d => {
      if (!d.drawnAt) return false;
      const drawnDate = new Date(d.drawnAt);
      return drawnDate.getTime() === today.getTime();
    });

    return !todayEntry;
<<<<<<< HEAD
  },

  getPrizeValue(prizeType: LuckyDrawPrize): number {
    switch (prizeType) {
      case LuckyDrawPrize.XP_100: return 100;
      case LuckyDrawPrize.XP_250: return 250;
      case LuckyDrawPrize.XP_500: return 500;
      case LuckyDrawPrize.XP_1000: return 1000;
      case LuckyDrawPrize.NFT_DISCOUNT: return 10;
      default: return 0;
    }
=======
>>>>>>> 2caf294 (Initial commit with API documentation and features)
  }
};
