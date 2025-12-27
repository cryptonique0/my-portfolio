/**
 * Web3 Resume Advanced Features
 * Includes achievement badges, NFT minting, reputation tokens, and more
 */

// Badge Tiers and Types
export enum BadgeTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond',
}

export enum AchievementType {
  PROFILE_COMPLETE = 'profile_complete',
  FIRST_CREDENTIAL = 'first_credential',
  FIVE_CREDENTIALS = 'five_credentials',
  VERIFIED_EXPERT = 'verified_expert',
  COMMUNITY_CONTRIBUTOR = 'community_contributor',
  REPUTATION_MILESTONE = 'reputation_milestone',
  SKILL_MASTER = 'skill_master',
  SOCIAL_BUTTERFLY = 'social_butterfly',
  EARLY_ADOPTER = 'early_adopter',
  CHAIN_EXPLORER = 'chain_explorer',
}

// Achievement Badge Definition
export interface AchievementBadge {
  id: AchievementType;
  name: string;
  description: string;
  icon: string;
  tier: BadgeTier;
  nftTokenId?: number;
  unlockedAt?: Date;
  chainDeployed?: string[];
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  imageUrl: string;
  contractAddress?: string;
}

// Reputation Levels
export enum ReputationLevel {
  NOVICE = 'novice',
  APPRENTICE = 'apprentice',
  JOURNEYMAN = 'journeyman',
  EXPERT = 'expert',
  MASTER = 'master',
  LEGEND = 'legend',
}

export interface ReputationTier {
  level: ReputationLevel;
  minScore: number;
  maxScore: number;
  title: string;
  benefits: string[];
  color: string;
}

// NFT Metadata for Achievements
export interface AchievementNFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: {
    trait_type: string;
    value: string | number;
  }[];
  external_url: string;
  properties: {
    category: string;
    files: {
      uri: string;
      type: string;
    }[];
  };
}

// Reputation Tokens/Points System
export interface ReputationToken {
  symbol: string;
  name: string;
  decimals: number;
  chainIds: (number | string)[];
  totalSupply?: number;
  description: string;
}

// Achievement Badge Definitions
export const ACHIEVEMENT_BADGES: Record<AchievementType, AchievementBadge> = {
  [AchievementType.PROFILE_COMPLETE]: {
    id: AchievementType.PROFILE_COMPLETE,
    name: 'Profile Architect',
    description: 'Complete your entire profile with all sections filled out',
    icon: '🏗️',
    tier: BadgeTier.BRONZE,
    rarity: 'common',
    imageUrl: '/badges/profile-architect.svg',
  },
  [AchievementType.FIRST_CREDENTIAL]: {
    id: AchievementType.FIRST_CREDENTIAL,
    name: 'First Step',
    description: 'Add your first credential to your resume',
    icon: '🎓',
    tier: BadgeTier.BRONZE,
    rarity: 'common',
    imageUrl: '/badges/first-step.svg',
  },
  [AchievementType.FIVE_CREDENTIALS]: {
    id: AchievementType.FIVE_CREDENTIALS,
    name: 'Credential Collector',
    description: 'Add and verify 5 credentials on-chain',
    icon: '📚',
    tier: BadgeTier.SILVER,
    rarity: 'uncommon',
    imageUrl: '/badges/credential-collector.svg',
  },
  [AchievementType.VERIFIED_EXPERT]: {
    id: AchievementType.VERIFIED_EXPERT,
    name: 'Verified Expert',
    description: 'Get verified as an expert in your field',
    icon: '✨',
    tier: BadgeTier.GOLD,
    rarity: 'rare',
    imageUrl: '/badges/verified-expert.svg',
  },
  [AchievementType.COMMUNITY_CONTRIBUTOR]: {
    id: AchievementType.COMMUNITY_CONTRIBUTOR,
    name: 'Community Builder',
    description: 'Contribute to and verify other community members',
    icon: '🤝',
    tier: BadgeTier.SILVER,
    rarity: 'uncommon',
    imageUrl: '/badges/community-builder.svg',
  },
  [AchievementType.REPUTATION_MILESTONE]: {
    id: AchievementType.REPUTATION_MILESTONE,
    name: 'Reputation Legend',
    description: 'Reach 1000 reputation score',
    icon: '👑',
    tier: BadgeTier.PLATINUM,
    rarity: 'epic',
    imageUrl: '/badges/reputation-legend.svg',
  },
  [AchievementType.SKILL_MASTER]: {
    id: AchievementType.SKILL_MASTER,
    name: 'Skill Master',
    description: 'Demonstrate mastery in 5 different skills',
    icon: '🎯',
    tier: BadgeTier.GOLD,
    rarity: 'rare',
    imageUrl: '/badges/skill-master.svg',
  },
  [AchievementType.SOCIAL_BUTTERFLY]: {
    id: AchievementType.SOCIAL_BUTTERFLY,
    name: 'Social Butterfly',
    description: 'Connect with 50 other professionals on-chain',
    icon: '🦋',
    tier: BadgeTier.SILVER,
    rarity: 'uncommon',
    imageUrl: '/badges/social-butterfly.svg',
  },
  [AchievementType.EARLY_ADOPTER]: {
    id: AchievementType.EARLY_ADOPTER,
    name: 'Pioneer',
    description: 'Join the platform in the first month of launch',
    icon: '🚀',
    tier: BadgeTier.PLATINUM,
    rarity: 'epic',
    imageUrl: '/badges/pioneer.svg',
  },
  [AchievementType.CHAIN_EXPLORER]: {
    id: AchievementType.CHAIN_EXPLORER,
    name: 'Multi-Chain Explorer',
    description: 'Deploy your resume across 3+ different blockchains',
    icon: '🗺️',
    tier: BadgeTier.DIAMOND,
    rarity: 'legendary',
    imageUrl: '/badges/chain-explorer.svg',
    chainDeployed: ['8453', '1', '0', '2147483648'],
  },
};

// Reputation Tiers
export const REPUTATION_TIERS: ReputationTier[] = [
  {
    level: ReputationLevel.NOVICE,
    minScore: 0,
    maxScore: 99,
    title: 'Novice',
    benefits: ['Basic profile visibility', 'Community access'],
    color: '#6B7280',
  },
  {
    level: ReputationLevel.APPRENTICE,
    minScore: 100,
    maxScore: 249,
    title: 'Apprentice',
    benefits: ['Enhanced profile', 'Credential verification', 'Badge minting'],
    color: '#3B82F6',
  },
  {
    level: ReputationLevel.JOURNEYMAN,
    minScore: 250,
    maxScore: 499,
    title: 'Journeyman',
    benefits: ['All previous + Priority verification', 'Mentor features'],
    color: '#8B5CF6',
  },
  {
    level: ReputationLevel.EXPERT,
    minScore: 500,
    maxScore: 999,
    title: 'Expert',
    benefits: [
      'All previous + Expert badge',
      'Higher verification weight',
      'Community leadership',
    ],
    color: '#F59E0B',
  },
  {
    level: ReputationLevel.MASTER,
    minScore: 1000,
    maxScore: 4999,
    title: 'Master',
    benefits: [
      'All previous + Master badge',
      'Governance participation',
      'Custom profile features',
    ],
    color: '#EF4444',
  },
  {
    level: ReputationLevel.LEGEND,
    minScore: 5000,
    maxScore: Infinity,
    title: 'Legend',
    benefits: [
      'All previous + Legend status',
      'DAO voting rights',
      'Revenue sharing',
      'Featured placement',
    ],
    color: '#FBBF24',
  },
];

// Reputation Tokens (can be deployed on each chain)
export const REPUTATION_TOKENS: Record<string, ReputationToken> = {
  RESUME_REP: {
    symbol: 'RRep',
    name: 'Resume Reputation',
    decimals: 18,
    chainIds: ['8453', '1', '84532', '11155111'], // EVM chains
    description: 'Earn reputation tokens for verified credentials and achievements',
  },
  STACKS_REP: {
    symbol: 'SRep',
    name: 'Stacks Resume Reputation',
    decimals: 6,
    chainIds: ['0', '2147483648'], // Stacks chains
    description: 'Earn reputation on Stacks blockchain',
  },
};

// NFT Minting Costs
export const NFT_MINTING_COSTS = {
  EVM: {
    baseGasCost: 50000, // in wei units
    platformFee: 0.01, // ETH
  },
  STACKS: {
    baseGasCost: 180, // STX microamounts
    platformFee: 0.1, // STX
  },
};

// Achievement Verification Rules
export const ACHIEVEMENT_RULES = {
  [AchievementType.PROFILE_COMPLETE]: {
    requiredFields: [
      'name',
      'email',
      'bio',
      'profileImage',
      'skills',
      'experience',
    ],
    points: 50,
  },
  [AchievementType.FIRST_CREDENTIAL]: {
    requiredCredentials: 1,
    points: 100,
  },
  [AchievementType.FIVE_CREDENTIALS]: {
    requiredCredentials: 5,
    points: 250,
  },
  [AchievementType.VERIFIED_EXPERT]: {
    requiredVerifications: 10,
    requiredCredentials: 5,
    points: 500,
  },
  [AchievementType.COMMUNITY_CONTRIBUTOR]: {
    requiredVerificationsGiven: 5,
    points: 200,
  },
  [AchievementType.REPUTATION_MILESTONE]: {
    requiredReputationScore: 1000,
    points: 1000,
  },
  [AchievementType.SKILL_MASTER]: {
    requiredSkills: 5,
    minSkillLevel: 4, // out of 5
    points: 400,
  },
  [AchievementType.SOCIAL_BUTTERFLY]: {
    requiredConnections: 50,
    points: 300,
  },
  [AchievementType.EARLY_ADOPTER]: {
    launchDate: new Date('2024-01-01'),
    points: 750,
  },
  [AchievementType.CHAIN_EXPLORER]: {
    requiredChainCount: 3,
    points: 600,
  },
};

/**
 * Calculate reputation level based on score
 */
export function getReputationLevel(score: number): ReputationTier {
  return REPUTATION_TIERS.find(
    (tier) => score >= tier.minScore && score <= tier.maxScore
  ) || REPUTATION_TIERS[0];
}

/**
 * Check if achievement conditions are met
 */
export function checkAchievementEligibility(
  achievementType: AchievementType,
  userStats: Record<string, any>
): boolean {
  const rules = ACHIEVEMENT_RULES[achievementType];
  if (!rules) return false;

  switch (achievementType) {
    case AchievementType.PROFILE_COMPLETE:
      return rules.requiredFields.every((field) => userStats[field]);

    case AchievementType.FIRST_CREDENTIAL:
      return userStats.credentialCount >= rules.requiredCredentials;

    case AchievementType.FIVE_CREDENTIALS:
      return userStats.credentialCount >= rules.requiredCredentials;

    case AchievementType.VERIFIED_EXPERT:
      return (
        userStats.verificationCount >= rules.requiredVerifications &&
        userStats.credentialCount >= rules.requiredCredentials
      );

    case AchievementType.COMMUNITY_CONTRIBUTOR:
      return userStats.verificationsGiven >= rules.requiredVerificationsGiven;

    case AchievementType.REPUTATION_MILESTONE:
      return userStats.reputationScore >= rules.requiredReputationScore;

    case AchievementType.SKILL_MASTER:
      return (
        userStats.skillCount >= rules.requiredSkills &&
        userStats.avgSkillLevel >= rules.minSkillLevel
      );

    case AchievementType.SOCIAL_BUTTERFLY:
      return userStats.connectionCount >= rules.requiredConnections;

    case AchievementType.EARLY_ADOPTER:
      return new Date(userStats.joinDate) <= rules.launchDate;

    case AchievementType.CHAIN_EXPLORER:
      return userStats.deployedChainCount >= rules.requiredChainCount;

    default:
      return false;
  }
}

/**
 * Generate NFT metadata for achievement
 */
export function generateAchievementNFTMetadata(
  badge: AchievementBadge,
  ownerAddress: string
): AchievementNFTMetadata {
  return {
    name: badge.name,
    description: badge.description,
    image: badge.imageUrl,
    external_url: `https://talent-resume.web3/achievements/${badge.id}`,
    attributes: [
      { trait_type: 'Tier', value: badge.tier },
      { trait_type: 'Rarity', value: badge.rarity },
      { trait_type: 'Achievement Type', value: badge.id },
      { trait_type: 'Owner', value: ownerAddress },
      { trait_type: 'Unlocked Date', value: new Date().toISOString() },
    ],
    properties: {
      category: 'achievement',
      files: [
        {
          uri: badge.imageUrl,
          type: 'image/svg+xml',
        },
      ],
    },
  };
}
