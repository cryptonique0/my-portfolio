import React from 'react';
import { useProfile, useTradingStats, useAchievements } from '../../hooks/useProfileEnhancements';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface PortfolioDashboardProps {
  userId: string;
}

export const PortfolioDashboard: React.FC<PortfolioDashboardProps> = ({ userId }) => {
  const { portfolioStats, loading } = useProfile(userId);

  if (loading) {
    return <div className="animate-pulse">Loading portfolio...</div>;
  }

  if (!portfolioStats) {
    return <div className="text-gray-500">No portfolio data available</div>;
  }

  const isProfitable = (portfolioStats.profit_loss || 0) >= 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-6">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">📊 Portfolio Overview</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Value */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-6 text-white">
          <div className="text-sm opacity-90 mb-1">Total Value</div>
          <div className="text-3xl font-bold">{portfolioStats.total_value.toFixed(2)} STX</div>
        </div>

        {/* NFTs Owned */}
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg p-6 text-white">
          <div className="text-sm opacity-90 mb-1">NFTs Owned</div>
          <div className="text-3xl font-bold">{portfolioStats.nfts_owned}</div>
        </div>

        {/* NFTs Created */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg p-6 text-white">
          <div className="text-sm opacity-90 mb-1">NFTs Created</div>
          <div className="text-3xl font-bold">{portfolioStats.nfts_created}</div>
        </div>

        {/* Profit/Loss */}
        <div className={`bg-gradient-to-br ${isProfitable ? 'from-green-500 to-lime-500' : 'from-red-500 to-orange-500'} rounded-lg p-6 text-white`}>
          <div className="text-sm opacity-90 mb-1">Profit/Loss</div>
          <div className="text-3xl font-bold">
            {isProfitable ? '+' : ''}{portfolioStats.profit_loss.toFixed(2)} STX
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sales & Purchases</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Sales</span>
              <span className="font-semibold text-green-600">{portfolioStats.total_sales_value.toFixed(2)} STX</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Purchases</span>
              <span className="font-semibold text-orange-600">{portfolioStats.total_purchases_value.toFixed(2)} STX</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
              <span className="text-gray-900 dark:text-white font-semibold">Net Profit</span>
              <span className={`font-bold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                {isProfitable ? '+' : ''}{portfolioStats.profit_loss.toFixed(2)} STX
              </span>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Best Performance</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Best Sale</span>
              <span className="font-semibold text-green-600">{portfolioStats.best_sale?.toFixed(2) || '0.00'} STX</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Updated At</span>
              <span className="text-gray-600 dark:text-gray-400 text-sm">
                {new Date(portfolioStats.updated_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface TradingStatisticsProps {
  userId: string;
}

export const TradingStatistics: React.FC<TradingStatisticsProps> = ({ userId }) => {
  const { stats, activity, topTrades, loading, refetchStats } = useTradingStats(userId);
  const [period, setPeriod] = React.useState<'all_time' | '30d' | '7d' | '24h'>('all_time');

  React.useEffect(() => {
    refetchStats(period);
  }, [period, refetchStats]);

  if (loading) {
    return <div className="animate-pulse">Loading trading stats...</div>;
  }

  if (!stats) {
    return <div className="text-gray-500">No trading data available</div>;
  }

  // Chart data
  const activityChartData = {
    labels: activity.map(a => new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Sales Volume',
        data: activity.map(a => a.sales_volume),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Purchase Volume',
        data: activity.map(a => a.purchases_volume),
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">📈 Trading Statistics</h3>
        
        {/* Period Selector */}
        <div className="flex gap-2">
          {['24h', '7d', '30d', 'all_time'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p as any)}
              className={`px-4 py-2 rounded-lg transition ${
                period === p
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {p === 'all_time' ? 'All Time' : p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Volume</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_volume.toFixed(2)} STX</div>
        </div>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Trades</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_trades}</div>
        </div>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Sale Price</div>
          <div className="text-2xl font-bold text-green-600">{stats.avg_sale_price.toFixed(2)} STX</div>
        </div>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Best Sale</div>
          <div className="text-2xl font-bold text-green-600">{stats.best_sale.toFixed(2)} STX</div>
        </div>
      </div>

      {/* Activity Chart */}
      {activity.length > 0 && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trading Activity</h4>
          <Line
            data={activityChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      )}

      {/* Top Trades */}
      {topTrades && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-green-600 mb-4">💰 Top Sales</h4>
            <div className="space-y-3">
              {topTrades.top_sales.slice(0, 5).map((trade, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">{trade.nft_name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">to {trade.counterparty}</div>
                  </div>
                  <div className="text-green-600 font-bold">{trade.amount.toFixed(2)} STX</div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-orange-600 mb-4">🛒 Top Purchases</h4>
            <div className="space-y-3">
              {topTrades.top_purchases.slice(0, 5).map((trade, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">{trade.nft_name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">from {trade.counterparty}</div>
                  </div>
                  <div className="text-orange-600 font-bold">{trade.amount.toFixed(2)} STX</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface AchievementsBadgesProps {
  userId: string;
}

export const AchievementsBadges: React.FC<AchievementsBadgesProps> = ({ userId }) => {
  const { achievements, progress, stats, loading, checkForNewAchievements } = useAchievements(userId);
  const [checking, setChecking] = React.useState(false);

  const handleCheckAchievements = async () => {
    setChecking(true);
    const newAchievements = await checkForNewAchievements();
    setChecking(false);

    if (newAchievements.length > 0) {
      alert(`🎉 Congratulations! You unlocked ${newAchievements.length} new achievement(s)!`);
    } else {
      alert('No new achievements unlocked');
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading achievements...</div>;
  }

  const tierColors = {
    bronze: 'from-orange-700 to-yellow-700',
    silver: 'from-gray-400 to-gray-600',
    gold: 'from-yellow-400 to-yellow-600',
    platinum: 'from-cyan-400 to-blue-600',
    legendary: 'from-purple-600 to-pink-600',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">🏅 Achievements</h3>
        <button
          onClick={handleCheckAchievements}
          disabled={checking}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
        >
          {checking ? '⏳ Checking...' : '🔍 Check for New'}
        </button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg p-4 text-white">
            <div className="text-sm opacity-90 mb-1">Unlocked</div>
            <div className="text-3xl font-bold">{stats.total_unlocked}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-4 text-white">
            <div className="text-sm opacity-90 mb-1">Total Points</div>
            <div className="text-3xl font-bold">{stats.total_points}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg p-4 text-white">
            <div className="text-sm opacity-90 mb-1">Completion</div>
            <div className="text-3xl font-bold">{stats.completion_percentage.toFixed(0)}%</div>
          </div>
        </div>
      )}

      {/* Unlocked Achievements */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Unlocked Achievements</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map(ua => {
            const achievement = ua.achievement;
            if (!achievement) return null;

            return (
              <div
                key={ua.id}
                className={`bg-gradient-to-br ${tierColors[achievement.tier]} rounded-lg p-4 text-white shadow-lg`}
              >
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <div className="font-bold text-lg mb-1">{achievement.name}</div>
                <div className="text-sm opacity-90 mb-2">{achievement.description}</div>
                <div className="flex justify-between items-center text-sm">
                  <span className="bg-white/20 px-2 py-1 rounded">{achievement.tier.toUpperCase()}</span>
                  <span>{achievement.points} pts</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">In Progress</h4>
        <div className="space-y-3">
          {progress
            .filter(p => !p.unlocked && p.percentage > 0)
            .slice(0, 5)
            .map((p, idx) => (
              <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">Achievement #{idx + 1}</span>
                  <span className="text-gray-600 dark:text-gray-400">{p.current_value} / {p.required_value}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${p.percentage}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
