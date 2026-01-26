import React from 'react';

interface PlayerComparisonProps {
  userRating: number;
  bestRating?: number;
  personalBest?: number;
  trend?: number;
}

export default function PlayerComparison({
  userRating,
  bestRating = 3200,
  personalBest = 2450,
  trend = 50,
}: PlayerComparisonProps) {
  const percentageOfBest = (userRating / bestRating) * 100;

  return (
    <div className="px-4 py-6 space-y-4 border-t border-slate-200 dark:border-slate-700">
      <h2 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
        Performance Comparison
      </h2>

      <div className="space-y-4">
        {/* Against Best Rating */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                Current vs World Best
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                {userRating} / {bestRating}
              </p>
            </div>
            <span className="text-2xl">🌍</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(percentageOfBest, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-semibold">
            {percentageOfBest.toFixed(1)}% of world best
          </p>
        </div>

        {/* Personal Best */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                Personal Best
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                {personalBest}
              </p>
            </div>
            <span className="text-2xl">⭐</span>
          </div>
          {trend !== 0 && (
            <div
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold ${
                trend > 0
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                {trend > 0 ? 'trending_up' : 'trending_down'}
              </span>
              {trend > 0 ? '+' : ''}{trend} points this session
            </div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card p-3 text-center">
            <p className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase mb-1">
              Rank Position
            </p>
            <p className="text-2xl font-black text-gradient-blue-purple">Top 5%</p>
          </div>
          <div className="card p-3 text-center">
            <p className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase mb-1">
              Next Milestone
            </p>
            <p className="text-2xl font-black text-gradient-blue-purple">+750 pts</p>
          </div>
        </div>
      </div>
    </div>
  );
}
