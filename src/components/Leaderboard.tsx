'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface LeaderboardEntry {
  rank: number;
  address: string;
  handle: string;
  reputation: number;
  reputationTier: string;
  achievementCount: number;
  verified: boolean;
}

/**
 * Top Profiles Leaderboard Component
 * Displays top users by reputation score
 */
export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard?limit=50');
        if (!response.ok) throw new Error('Failed to fetch leaderboard');
        
        const data = await response.json();
        setEntries(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

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

  const getRankMedal = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Loading leaderboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No profiles yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-bold text-white mb-2">🏆 Top Profiles</h2>
        <p className="text-gray-400">Ranked by reputation score on Base</p>
      </div>

      {/* Leaderboard */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {entries.map((entry) => (
          <motion.div
            key={entry.address}
            variants={itemVariants}
            whileHover={{ scale: 1.02, x: 10 }}
            className="relative"
          >
            <Link href={`/profile/${entry.handle}`}>
              <div
                className={`p-6 rounded-xl border transition-all cursor-pointer ${
                  entry.rank <= 3
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50 shadow-lg'
                    : 'bg-white/5 border-purple-500/20 hover:border-purple-500/50'
                } backdrop-blur`}
              >
                <div className="flex items-center gap-6">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-16 text-center">
                    <span
                      className={`text-3xl font-bold ${
                        entry.rank <= 3 ? '' : 'text-gray-400'
                      }`}
                    >
                      {getRankMedal(entry.rank)}
                    </span>
                  </div>

                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold text-white">
                      {entry.handle.charAt(0).toUpperCase()}
                    </div>
                    {entry.verified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-slate-900 flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">
                      @{entry.handle}
                    </h3>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-400">
                        {entry.achievementCount} achievements
                      </span>
                      <span className="text-gray-600">•</span>
                      <span
                        className={`px-2 py-1 rounded-full bg-gradient-to-r ${getTierColor(
                          entry.reputationTier
                        )} text-slate-900 font-semibold text-xs uppercase`}
                      >
                        {entry.reputationTier}
                      </span>
                    </div>
                  </div>

                  {/* Reputation Score */}
                  <div className="flex-shrink-0 text-right">
                    <div
                      className={`w-20 h-20 rounded-full bg-gradient-to-br ${getTierColor(
                        entry.reputationTier
                      )} flex flex-col items-center justify-center shadow-lg`}
                    >
                      <span className="text-2xl font-bold text-slate-900">
                        {entry.reputation}
                      </span>
                      <span className="text-xs font-semibold text-slate-900">
                        REP
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm">
          Rankings update every 5 minutes • Based on on-chain reputation
        </p>
      </div>
    </div>
  );
}
