// Profile Enhancement Components Exports

// Main Profile Components
export { ProfileEditor } from './ProfileEditor';
export { 
  PortfolioDashboard, 
  TradingStatistics, 
  AchievementsBadges 
} from './ProfileDashboards';
export { 
  VerificationBadge, 
  VerificationRequestForm, 
  VerificationRequestsList 
} from './VerificationComponents';

// Hooks
export {
  useProfile,
  useAchievements,
  useTradingStats,
  useVerification,
  // Types
  type UserProfile,
  type SocialLinks,
  type PortfolioStats,
  type Achievement,
  type UserAchievement,
  type AchievementProgress,
  type TradingStats,
  type TradingActivity,
  type VerificationRequest,
} from '../../hooks/useProfileEnhancements';
