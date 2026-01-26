// Achievement Types
export enum AchievementType {
  CREATOR = 'creator',
  COLLECTOR = 'collector',
  TRADER = 'trader',
  SOCIAL = 'social',
  MILESTONE = 'milestone',
  SPECIAL = 'special'
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: AchievementType;
<<<<<<< HEAD
  requirement: number;
=======
  requirement: number; // Value to reach
>>>>>>> 2caf294 (Initial commit with API documentation and features)
  xpReward: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
}

export interface UserAchievement {
  userId: string;
  achievementId: string;
  unlockedAt: Date;
<<<<<<< HEAD
  progress: number;
}

=======
  progress: number; // Current progress toward requirement
}

// Badge Types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirement: string;
  xpReward: number;
}

export interface UserBadge {
  userId: string;
  badgeId: string;
  earnedAt: Date;
  displayPosition: number;
}

// XP & Level Types
>>>>>>> 2caf294 (Initial commit with API documentation and features)
export interface UserLevel {
  userId: string;
  currentLevel: number;
  totalXP: number;
<<<<<<< HEAD
  xpForNextLevel: number;
  xpInCurrentLevel: number;
=======
  xpForNextLevel: number; // XP needed to reach next level
  xpInCurrentLevel: number; // XP earned in current level
>>>>>>> 2caf294 (Initial commit with API documentation and features)
}

export interface LevelConfig {
  level: number;
  minXP: number;
  maxXP: number;
  title: string;
  color: string;
}

<<<<<<< HEAD
=======
// XP Activity Log
>>>>>>> 2caf294 (Initial commit with API documentation and features)
export interface XPTransaction {
  id: string;
  userId: string;
  amount: number;
<<<<<<< HEAD
  reason: string;
  relatedId?: string;
  timestamp: Date;
}

=======
  reason: string; // 'mint', 'sell', 'bid', 'achievement', etc.
  relatedId?: string; // Reference to NFT, transaction, etc.
  timestamp: Date;
}

// Daily Rewards
>>>>>>> 2caf294 (Initial commit with API documentation and features)
export interface DailyReward {
  id: string;
  userId: string;
  date: Date;
  xpAmount: number;
  claimed: boolean;
  claimedAt?: Date;
<<<<<<< HEAD
  streak: number;
=======
  streak: number; // Consecutive days
>>>>>>> 2caf294 (Initial commit with API documentation and features)
}

export interface DailyRewardConfig {
  baseXP: number;
<<<<<<< HEAD
  streakBonus: number;
  maxStreak: number;
  resetTime: string;
}

=======
  streakBonus: number; // XP per consecutive day
  maxStreak: number;
  resetTime: string; // HH:mm format
}

// Lucky Draw Types
>>>>>>> 2caf294 (Initial commit with API documentation and features)
export enum LuckyDrawPrize {
  XP_100 = 'xp_100',
  XP_250 = 'xp_250',
  XP_500 = 'xp_500',
  XP_1000 = 'xp_1000',
  BADGE_RARE = 'badge_rare',
  BADGE_EPIC = 'badge_epic',
  NFT_DISCOUNT = 'nft_discount_10',
  FEATURE_BOOST = 'feature_boost'
}

export interface LuckyDrawPrizeConfig {
  id: string;
  type: LuckyDrawPrize;
  label: string;
<<<<<<< HEAD
  probability: number;
=======
  probability: number; // 0-1
>>>>>>> 2caf294 (Initial commit with API documentation and features)
  icon: string;
  color: string;
}

export interface LuckyDrawEntry {
  id: string;
  userId: string;
  drawnAt?: Date;
  prizeType?: LuckyDrawPrize;
  prizeValue?: number;
  claimed: boolean;
  claimedAt?: Date;
<<<<<<< HEAD
  eligibleAfter: Date;
}

=======
  eligibleAfter: Date; // Can draw again after this time
}

// Reward Types
>>>>>>> 2caf294 (Initial commit with API documentation and features)
export interface Reward {
  id: string;
  type: 'xp' | 'badge' | 'discount' | 'feature_boost';
  value: number | string;
  description: string;
  icon: string;
  expiresAt?: Date;
}

export interface UserReward {
  id: string;
  userId: string;
  rewardId: string;
  earnedAt: Date;
  usedAt?: Date;
  expiresAt?: Date;
}

<<<<<<< HEAD
=======
// Gamification Stats
>>>>>>> 2caf294 (Initial commit with API documentation and features)
export interface GamificationStats {
  userId: string;
  totalXP: number;
  currentLevel: number;
  achievementsUnlocked: number;
  badgesEarned: number;
  rewardsEarned: number;
  dailyStreakDays: number;
  lastActivityDate: Date;
<<<<<<< HEAD
  levelPercentage: number;
}

=======
  levelPercentage: number; // 0-100
}

// Leaderboard
>>>>>>> 2caf294 (Initial commit with API documentation and features)
export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar: string;
  totalXP: number;
  level: number;
  achievements: number;
  badges: number;
  rank: number;
}
