'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { AnimatedTimeline, TimelineEvent } from '@/components/AnimatedTimeline';
import { AchievementBadges, AchievementBadge } from '@/components/AchievementBadgesNFT';
import { useAccount } from 'wagmi';

interface ProfileData {
  address: string;
  handle: string;
  bio?: string;
  title?: string;
  location?: string;
  website?: string;
  twitter?: string;
  github?: string;
  reputation: number;
  reputationTier: string;
  verified: boolean;
  createdAt: string;
  credentialCount: number;
  achievementCount: number;
}

/**
 * Complete Profile View Component
 * Displays user profile with timeline, achievements, and credentials
 */
export default function ProfileViewPage() {
  const params = useParams();
  const handle = params.handle as string;
  const { address: connectedAddress } = useAccount();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [achievements, setAchievements] = useState<AchievementBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'timeline' | 'achievements' | 'credentials'>('timeline');

  useEffect(() => {
    if (!handle) return;

    const fetchProfileData = async () => {
      try {
        setIsLoading(true);

        // Fetch profile
        const profileRes = await fetch(`/api/profile/${handle}`);
        if (!profileRes.ok) throw new Error('Profile not found');
        const profileData = await profileRes.json();
        setProfile(profileData);

        // Fetch timeline events
        const timelineRes = await fetch(`/api/profile/${handle}/timeline`);
        if (timelineRes.ok) {
          const timelineData = await timelineRes.json();
          setTimelineEvents(timelineData);
        }

        // Fetch achievements
        const achievementsRes = await fetch(`/api/profile/${handle}/achievements`);
        if (achievementsRes.ok) {
          const achievementsData = await achievementsRes.json();
          setAchievements(achievementsData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [handle]);

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'platinum':
        return 'from-slate-300 via-slate-100 to-slate-300';
      case 'gold':
        return 'from-yellow-400 via-yellow-300 to-yellow-500';
      case 'silver':
        return 'from-gray-300 via-gray-200 to-gray-400';
      case 'bronze':
        return 'from-orange-400 via-orange-300 to-orange-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error || 'Profile not found'}</p>
          <Link href="/dashboard" className="text-purple-400 hover:text-purple-300">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = connectedAddress?.toLowerCase() === profile.address.toLowerCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-purple-500/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-purple-400 hover:text-purple-300">
            ← Back
          </Link>
          {isOwnProfile && (
            <Link
              href="/profile/edit"
              className="px-4 py-2 rounded-lg border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 transition-all"
            >
              Edit Profile
            </Link>
          )}
        </div>
      </nav>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-6 py-12"
      >
        <div className="p-8 rounded-2xl bg-white/5 border border-purple-500/20 backdrop-blur mb-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-5xl font-bold text-white">
                {profile.handle.charAt(0).toUpperCase()}
              </div>
              {profile.verified && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-green-500 border-4 border-slate-900 flex items-center justify-center"
                >
                  <span className="text-white text-xl">✓</span>
                </motion.div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">@{profile.handle}</h1>
                  {profile.title && <p className="text-xl text-gray-300 mb-2">{profile.title}</p>}
                  {profile.bio && <p className="text-gray-400 max-w-2xl">{profile.bio}</p>}
                </div>

                {/* Reputation Badge */}
                <div className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-24 h-24 rounded-full bg-gradient-to-br ${getTierColor(
                      profile.reputationTier
                    )} flex flex-col items-center justify-center shadow-lg`}
                  >
                    <span className="text-2xl font-bold text-slate-900">{profile.reputation}</span>
                    <span className="text-xs font-semibold text-slate-900 uppercase">
                      {profile.reputationTier}
                    </span>
                  </motion.div>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex flex-wrap items-center gap-4 mb-4">
                {profile.location && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <span>📍</span>
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-purple-400 hover:text-purple-300"
                  >
                    <span>🌐</span>
                    <span>Website</span>
                  </a>
                )}
                {profile.twitter && (
                  <a
                    href={`https://twitter.com/${profile.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-purple-400 hover:text-purple-300"
                  >
                    <span>𝕏</span>
                    <span>@{profile.twitter}</span>
                  </a>
                )}
                {profile.github && (
                  <a
                    href={`https://github.com/${profile.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-purple-400 hover:text-purple-300"
                  >
                    <span>⚙️</span>
                    <span>{profile.github}</span>
                  </a>
                )}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-4">
                <div className="px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30">
                  <span className="text-purple-300 font-semibold">{profile.achievementCount}</span>
                  <span className="text-gray-400 ml-2">Achievements</span>
                </div>
                <div className="px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <span className="text-blue-300 font-semibold">{profile.credentialCount}</span>
                  <span className="text-gray-400 ml-2">Credentials</span>
                </div>
                <div className="px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30">
                  <span className="text-green-300 font-semibold">
                    {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                  <span className="text-gray-400 ml-2">Member since</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-purple-500/20">
          {['timeline', 'achievements', 'credentials'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={`px-6 py-3 font-semibold capitalize transition-all ${
                activeTab === tab
                  ? 'text-white border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'timeline' && <AnimatedTimeline events={timelineEvents} />}

          {activeTab === 'achievements' && (
            <AchievementBadges badges={achievements} />
          )}

          {activeTab === 'credentials' && (
            <div className="text-center py-12">
              <p className="text-gray-400">Credentials view coming soon</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
