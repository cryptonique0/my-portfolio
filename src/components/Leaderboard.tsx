'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAccount } from 'wagmi';

interface LeaderboardEntry {
  rank: number;
  address: string;
  handle: string;
  reputation: number;
  reputationTier: string;
  achievementCount: number;
  verified: boolean;
  credentialCount?: number;
}

interface LeaderboardProps {
  limit?: number;
  showPagination?: boolean;
  showCurrentUserRank?: boolean;
}

/**
 * Enhanced Leaderboard Component
 * Features:
 * - Paginated ranking view (10 entries per page)
 * - Sort by reputation score
 * - Highlight current user rank
 * - Responsive design with animations
 */
export function Leaderboard({ limit = 50, showPagination = true, showCurrentUserRank = true }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'reputation' | 'achievements'>('reputation');
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const { address } = useAccount();

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/leaderboard?limit=${limit}&sortBy=${sortBy}`);
        if (!response.ok) throw new Error('Failed to fetch leaderboard');
        
        const data = await response.json();
        
        // Ensure data is an array
        const leaderboardData = Array.isArray(data) ? data : data.entries || data.data || [];
        
        setEntries(leaderboardData);

        // Find current user in leaderboard
        if (address && showCurrentUserRank) {
          const currentUserEntry = leaderboardData.find(
            (entry: LeaderboardEntry) => entry.address.toLowerCase() === address.toLowerCase()
          );
          setUserRank(currentUserEntry || null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
        setEntries([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [limit, sortBy, address, showCurrentUserRank]);

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

  // Pagination
  const totalPages = Math.ceil((entries?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEntries = (entries || []).slice(startIndex, startIndex + itemsPerPage);

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
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <p className="text-red-400">{error}</p>
      </motion.div>
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
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">🏆 Top Profiles</h2>
            <p className="text-gray-400">Ranked by reputation score across the network</p>
          </div>
          
          {/* Sort Controls */}
          <div className="flex gap-2">
            {(['reputation', 'achievements'] as const).map((sort) => (
              <button
                key={sort}
                onClick={() => {
                  setSortBy(sort);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  sortBy === sort
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {sort === 'reputation' ? '⭐ Reputation' : '🏅 Achievements'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current User Rank Card */}
      <AnimatePresence>
        {userRank && showCurrentUserRank && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8 p-6 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/50 backdrop-blur"
          >
            <h3 className="text-lg font-semibold text-white mb-2">Your Ranking</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300">
                  You are ranked <span className="text-2xl font-bold text-purple-400">#{userRank.rank}</span> with{' '}
                  <span className="font-bold text-pink-400">{userRank.reputation}</span> reputation points
                </p>
              </div>
              <div className="text-4xl">{getRankMedal(userRank.rank)}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leaderboard Table Header */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 mb-4 text-sm font-semibold text-gray-400 border-b border-purple-500/20">
        <div className="col-span-1">Rank</div>
        <div className="col-span-6">Profile</div>
        <div className="col-span-2">Achievements</div>
        <div className="col-span-3">Score</div>
      </div>

      {/* Leaderboard Entries */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        <AnimatePresence mode="changeable">
          {paginatedEntries.map((entry) => (
            <motion.div
              key={entry.address}
              variants={itemVariants}
              layout
              exit={{ opacity: 0, x: -20 }}
              whileHover={{ scale: 1.02, x: 10 }}
              className={`relative overflow-hidden rounded-xl border transition-all backdrop-blur cursor-pointer group ${
                entry.rank <= 3
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50 shadow-lg'
                  : 'bg-white/5 border-purple-500/20 hover:border-purple-500/50'
              }`}
            >
              <Link href={`/profile/${entry.handle}`}>
                <div className="p-6">
                  <div className="flex items-center gap-4 md:gap-6">
                    {/* Rank */}
                    <div className="flex-shrink-0 w-12 text-center">
                      <span
                        className={`text-2xl font-bold ${
                          entry.rank <= 3 ? '' : 'text-gray-400'
                        }`}
                      >
                        {getRankMedal(entry.rank)}
                      </span>
                    </div>

                    {/* Avatar */}
                    <motion.div
                      className="relative flex-shrink-0"
                      whileHover={{ scale: 1.1 }}
                    >
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                        {entry.handle.charAt(0).toUpperCase()}
                      </div>
                      {entry.verified && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-slate-900 flex items-center justify-center"
                        >
                          <span className="text-white text-xs font-bold">✓</span>
                        </motion.div>
                      )}
                    </motion.div>

                    {/* Profile Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg md:text-xl font-bold text-white truncate mb-1">
                        @{entry.handle}
                      </h3>
                      <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm">
                        <span className="text-gray-400">
                          {entry.achievementCount} {entry.achievementCount === 1 ? 'achievement' : 'achievements'}
                        </span>
                        <span className="text-gray-600">•</span>
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`px-2 py-1 rounded-full bg-gradient-to-r ${getTierColor(
                            entry.reputationTier
                          )} text-slate-900 font-semibold text-xs uppercase whitespace-nowrap`}
                        >
                          {entry.reputationTier}
                        </motion.span>
                      </div>
                    </div>

                    {/* Reputation Score */}
                    <motion.div
                      className="flex-shrink-0 text-right"
                      whileHover={{ scale: 1.1 }}
                    >
                      <div
                        className={`w-16 md:w-20 h-16 md:h-20 rounded-full bg-gradient-to-br ${getTierColor(
                          entry.reputationTier
                        )} flex flex-col items-center justify-center shadow-lg`}
                      >
                        <span className="text-xl md:text-2xl font-bold text-slate-900">
                          {entry.reputation}
                        </span>
                        <span className="text-xs font-semibold text-slate-900">
                          REP
                        </span>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex items-center justify-center gap-2"
        >
          {/* Previous Button */}
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
          >
            ← Previous
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <motion.button
                key={page}
                onClick={() => setCurrentPage(page)}
                whileHover={{ scale: 1.1 }}
                className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                  currentPage === page
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {page}
              </motion.button>
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
          >
            Next →
          </button>
        </motion.div>
      )}

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm">
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, entries.length)} of {entries.length} profiles
        </p>
        <p className="text-gray-600 text-xs mt-2">
          Rankings update every 5 minutes • Based on on-chain reputation
        </p>
      </div>
    </div>
  );
}
