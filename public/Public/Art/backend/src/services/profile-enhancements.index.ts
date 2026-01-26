// Profile Enhancement Services Exports

export { ProfileService } from './profile.service';
export { AchievementsService } from './achievements.service';
export { VerificationService } from './verification.service';
export { TradingStatsService } from './trading-stats.service';

// Types
export type {
  UserProfile,
  SocialLinks,
  PortfolioStats,
} from './profile.service';

export type {
  Achievement,
  UserAchievement,
  AchievementProgress,
} from './achievements.service';

export type {
  VerificationRequest,
  VerificationCriteria,
} from './verification.service';

export type {
  TradingStats,
  TradingActivity,
  TopTrade,
} from './trading-stats.service';
