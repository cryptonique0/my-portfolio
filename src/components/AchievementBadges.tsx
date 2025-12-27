/**
 * Achievement Badge Components
 * Display and manage achievement badges and NFTs
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  ACHIEVEMENT_BADGES,
  REPUTATION_TIERS,
  BadgeTier,
  AchievementType,
  ReputationLevel,
  checkAchievementEligibility,
} from '@/lib/features';
import { ReputationTier } from '@/lib/features';

interface BadgeDisplayProps {
  achievementType: AchievementType;
  isUnlocked?: boolean;
  nftTokenId?: number;
  className?: string;
}

/**
 * Display a single achievement badge
 */
export function AchievementBadge({
  achievementType,
  isUnlocked = false,
  nftTokenId,
  className = '',
}: BadgeDisplayProps) {
  const badge = ACHIEVEMENT_BADGES[achievementType];

  if (!badge) return null;

  const tierColors: Record<BadgeTier, string> = {
    [BadgeTier.BRONZE]: 'from-amber-600 to-amber-400',
    [BadgeTier.SILVER]: 'from-slate-400 to-slate-300',
    [BadgeTier.GOLD]: 'from-yellow-500 to-yellow-300',
    [BadgeTier.PLATINUM]: 'from-cyan-400 to-blue-300',
    [BadgeTier.DIAMOND]: 'from-purple-400 to-pink-300',
  };

  const rarityBorder: Record<string, string> = {
    common: 'border-gray-300',
    uncommon: 'border-green-400',
    rare: 'border-blue-400',
    epic: 'border-purple-500',
    legendary: 'border-yellow-500',
  };

  return (
    <div
      className={`relative group ${className}`}
      title={badge.description}
    >
      <div
        className={`relative w-24 h-24 rounded-lg border-2 ${rarityBorder[badge.rarity]} ${
          isUnlocked ? `bg-gradient-to-br ${tierColors[badge.tier]} shadow-lg` : 'bg-gray-200 opacity-40'
        } flex flex-col items-center justify-center p-2 cursor-pointer transition-transform hover:scale-110`}
      >
        <span className="text-3xl">{badge.icon}</span>
        {isUnlocked && (
          <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
        )}
        {nftTokenId && (
          <div className="absolute bottom-1 right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs">
            ◆
          </div>
        )}
      </div>

      {/* Tooltip on Hover */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
        <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
          <div className="font-bold">{badge.name}</div>
          <div className="text-gray-300">{badge.tier.charAt(0).toUpperCase() + badge.tier.slice(1)}</div>
          {nftTokenId && <div className="text-purple-300">NFT #{nftTokenId}</div>}
        </div>
      </div>
    </div>
  );
}

/**
 * Achievement Gallery - Display all achievements
 */
export interface AchievementGalleryProps {
  unlockedAchievements?: AchievementType[];
  nftTokenIds?: Record<AchievementType, number>;
  className?: string;
  columns?: number;
}

export function AchievementGallery({
  unlockedAchievements = [],
  nftTokenIds = {},
  className = '',
  columns = 4,
}: AchievementGalleryProps) {
  const allAchievements = Object.keys(ACHIEVEMENT_BADGES) as AchievementType[];

  return (
    <div
      className={`grid gap-4 ${
        columns === 3
          ? 'grid-cols-3'
          : columns === 4
          ? 'grid-cols-4'
          : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
      } ${className}`}
    >
      {allAchievements.map((achievementType) => (
        <AchievementBadge
          key={achievementType}
          achievementType={achievementType}
          isUnlocked={unlockedAchievements.includes(achievementType)}
          nftTokenId={nftTokenIds[achievementType]}
        />
      ))}
    </div>
  );
}

/**
 * Reputation Level Display
 */
export interface ReputationLevelDisplayProps {
  score: number;
  showDetails?: boolean;
  className?: string;
}

export function ReputationLevelDisplay({
  score,
  showDetails = true,
  className = '',
}: ReputationLevelDisplayProps) {
  const tier = REPUTATION_TIERS.find(
    (t) => score >= t.minScore && score <= t.maxScore
  ) || REPUTATION_TIERS[0];

  const progressPercent = ((score - tier.minScore) / (tier.maxScore - tier.minScore)) * 100;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold"
            style={{ backgroundColor: tier.color }}
          >
            {tier.level.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-lg text-gray-900">{tier.title}</div>
            <div className="text-sm text-gray-600">{score} points</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="h-full transition-all duration-300 rounded-full"
          style={{
            backgroundColor: tier.color,
            width: `${Math.min(progressPercent, 100)}%`,
          }}
        />
      </div>

      {/* Next Level Info */}
      {score < tier.maxScore && (
        <div className="text-xs text-gray-600">
          {tier.maxScore - score} points to next level
        </div>
      )}

      {/* Benefits List */}
      {showDetails && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs font-semibold text-gray-700 mb-2">BENEFITS:</div>
          <ul className="space-y-1">
            {tier.benefits.map((benefit, idx) => (
              <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Reputation Tier Progression
 */
export interface ReputationProgressionProps {
  currentScore: number;
  className?: string;
}

export function ReputationProgression({ currentScore, className = '' }: ReputationProgressionProps) {
  return (
    <div className={`flex gap-2 ${className}`}>
      {REPUTATION_TIERS.map((tier) => {
        const isActive = currentScore >= tier.minScore;
        const isNext = currentScore < tier.minScore && currentScore >= REPUTATION_TIERS[
          REPUTATION_TIERS.indexOf(tier) - 1
        ]?.minScore;

        return (
          <div
            key={tier.level}
            className={`flex flex-col items-center gap-1 flex-1 ${isActive ? 'opacity-100' : 'opacity-50'}`}
            title={tier.title}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all ${
                isActive
                  ? 'scale-100'
                  : isNext
                  ? 'scale-90 ring-2 ring-offset-2'
                  : 'scale-75'
              }`}
              style={{
                backgroundColor: tier.color,
                boxShadow: isNext ? `0 0 0 2px ${tier.color}` : 'none',
              }}
            >
              {tier.level.charAt(0).toUpperCase()}
            </div>
            <div className="text-xs font-medium text-gray-700 text-center">{tier.title}</div>
            <div className="text-xs text-gray-500">{tier.minScore}+</div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Achievement Eligibility Checker
 */
export interface AchievementEligibilityProps {
  achievementType: AchievementType;
  userStats: Record<string, any>;
  onUnlock?: () => void;
  className?: string;
}

export function AchievementEligibility({
  achievementType,
  userStats,
  onUnlock,
  className = '',
}: AchievementEligibilityProps) {
  const badge = ACHIEVEMENT_BADGES[achievementType];
  const isEligible = checkAchievementEligibility(achievementType, userStats);

  if (!badge) return null;

  return (
    <div
      className={`p-4 rounded-lg border-2 ${
        isEligible
          ? 'border-green-300 bg-green-50'
          : 'border-gray-300 bg-gray-50'
      } ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl">{badge.icon}</span>

        <div className="flex-1">
          <div className="font-bold text-gray-900">{badge.name}</div>
          <div className="text-sm text-gray-600 mb-3">{badge.description}</div>

          {isEligible && (
            <button
              onClick={onUnlock}
              className="inline-flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded text-sm font-medium hover:bg-green-600 transition-colors"
            >
              <span>Unlock Achievement</span>
              <span>→</span>
            </button>
          )}

          {!isEligible && (
            <div className="text-xs text-gray-500">
              <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                Not yet eligible
              </span>
            </div>
          )}
        </div>

        <div
          className={`px-3 py-1 rounded text-xs font-semibold ${
            isEligible
              ? 'bg-green-200 text-green-800'
              : 'bg-gray-200 text-gray-800'
          }`}
        >
          {badge.tier.toUpperCase()}
        </div>
      </div>
    </div>
  );
}

/**
 * Badge Collection Stats
 */
export interface BadgeCollectionStatsProps {
  unlockedCount: number;
  totalCount?: number;
  nftCount?: number;
  className?: string;
}

export function BadgeCollectionStats({
  unlockedCount,
  totalCount = Object.keys(ACHIEVEMENT_BADGES).length,
  nftCount = 0,
  className = '',
}: BadgeCollectionStatsProps) {
  const percentage = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className={`grid grid-cols-3 gap-3 ${className}`}>
      <div className="bg-blue-50 rounded-lg p-3 text-center">
        <div className="text-2xl font-bold text-blue-600">{unlockedCount}</div>
        <div className="text-xs text-gray-600">Achievements</div>
      </div>

      <div className="bg-purple-50 rounded-lg p-3 text-center">
        <div className="text-2xl font-bold text-purple-600">{nftCount}</div>
        <div className="text-xs text-gray-600">NFTs Minted</div>
      </div>

      <div className="bg-green-50 rounded-lg p-3 text-center">
        <div className="text-2xl font-bold text-green-600">{percentage}%</div>
        <div className="text-xs text-gray-600">Collection</div>
      </div>
    </div>
  );
}
