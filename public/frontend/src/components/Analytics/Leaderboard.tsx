'use client';

import React, { useState, useEffect } from 'react';

interface LeaderboardEntry {
  rank: number;
  address: string;
  totalClaimed: string;
  claimCount: number;
  percentageOfTotal: number;
  joinDate: Date;
  lastClaimDate: Date;
}

export const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'claimed' | 'count' | 'percentage'>('claimed');
  const [filterAddress, setFilterAddress] = useState('');

  useEffect(() => {
    loadLeaderboard();
  }, [sortBy]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      const mockData: LeaderboardEntry[] = Array.from({ length: 20 }, (_, i) => ({
        rank: i + 1,
        address: `0x${Math.random().toString(16).slice(2, 42)}`,
        totalClaimed: (BigInt(Math.random() * 1e18 * 1000000).toString()),
        claimCount: Math.floor(Math.random() * 20) + 1,
        percentageOfTotal: 100 / 20,
        joinDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        lastClaimDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      }));

      setEntries(mockData);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = entries.filter(entry =>
    entry.address.toLowerCase().includes(filterAddress.toLowerCase())
  );

  const sortedEntries = [...filteredEntries].sort((a, b) => {
    switch (sortBy) {
      case 'claimed':
        return BigInt(b.totalClaimed) - BigInt(a.totalClaimed);
      case 'count':
        return b.claimCount - a.claimCount;
      case 'percentage':
        return b.percentageOfTotal - a.percentageOfTotal;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <h2 className="text-2xl font-bold text-white mb-4">Leaderboard</h2>
          
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Filter by address..."
                value={filterAddress}
                onChange={(e) => setFilterAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              {['claimed', 'count', 'percentage'].map((sort) => (
                <button
                  key={sort}
                  onClick={() => setSortBy(sort as any)}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    sortBy === sort
                      ? 'bg-white text-blue-600'
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  }`}
                >
                  {sort === 'claimed' && 'Total'}
                  {sort === 'count' && 'Count'}
                  {sort === 'percentage' && '%'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Rank</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Address</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-300">Total Claimed</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-300">Claims</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-300">% of Total</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Last Claim</th>
              </tr>
            </thead>
            <tbody>
              {sortedEntries.map((entry, index) => (
                <tr
                  key={entry.address}
                  className={`border-b border-slate-700 transition-colors ${
                    index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-750'
                  } hover:bg-slate-700`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-blue-400">#{entry.rank}</span>
                      {entry.rank === 1 && <span>🥇</span>}
                      {entry.rank === 2 && <span>🥈</span>}
                      {entry.rank === 3 && <span>🥉</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-sm text-gray-300 bg-slate-900 px-2 py-1 rounded">
                      {entry.address.slice(0, 8)}...{entry.address.slice(-6)}
                    </code>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-semibold text-green-400">
                      {(Number(entry.totalClaimed) / 1e18).toFixed(2)} tokens
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-white">{entry.claimCount}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-purple-400">{entry.percentageOfTotal.toFixed(2)}%</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-400 text-sm">
                      {formatRelativeTime(entry.lastClaimDate)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-700 text-sm text-gray-400">
          Showing {sortedEntries.length} of {entries.length} entries
        </div>
      </div>
    </div>
  );
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  return 'just now';
}

export default Leaderboard;
