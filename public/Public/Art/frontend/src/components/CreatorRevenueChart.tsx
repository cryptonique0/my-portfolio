import React, { useEffect, useState } from 'react';
import { fetchRoyaltyHistory, RoyaltyChartData, getEarningsTrend } from '../services/royalties';

interface CreatorRevenueChartProps {
  creatorAddress: string;
  days?: number;
  title?: string;
}

/**
 * Creator Revenue Chart Component
 * Shows earnings trend over time with visual indicators
 */
export const CreatorRevenueChart: React.FC<CreatorRevenueChartProps> = ({
  creatorAddress,
  days = 30,
  title = 'Revenue Trend'
}) => {
  const [data, setData] = useState<RoyaltyChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trend, setTrend] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const history = await fetchRoyaltyHistory(creatorAddress, days);
        setData(history);
        setTrend(getEarningsTrend(history));
      } catch (err: any) {
        setError(err.message || 'Failed to load chart data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [creatorAddress, days]);

  if (loading) {
    return (
      <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">{error || 'No data available'}</p>
      </div>
    );
  }

  // Calculate statistics
  const values = data.map(d => parseFloat(d.royaltyAmount));
  const maxValue = Math.max(...values);
  const totalEarnings = values.reduce((a, b) => a + b, 0);
  const avgEarnings = totalEarnings / values.length;

  // Build simple bar chart
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
            Ξ {totalEarnings.toFixed(3)}
          </span>
          <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="h-48 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="h-full flex items-end justify-between gap-1">
          {data.map((point, index) => {
            const height = maxValue > 0 ? (parseFloat(point.royaltyAmount) / maxValue) * 100 : 0;
            const date = new Date(point.timestamp);
            const isRecentDay = index >= data.length - 7; // Last 7 days

            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center gap-1 group"
                title={`${date.toLocaleDateString()}: Ξ ${point.royaltyAmount}`}
              >
                <div
                  className={`w-full rounded-t transition-colors ${
                    isRecentDay
                      ? 'bg-gradient-to-t from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500'
                      : 'bg-gradient-to-t from-gray-400 to-gray-300 hover:from-gray-500 hover:to-gray-400'
                  }`}
                  style={{ height: `${Math.max(height, 4)}%` }}
                >
                  {/* Tooltip on hover */}
                  <div className="invisible group-hover:visible absolute bg-gray-900 dark:bg-gray-950 text-white text-xs rounded py-1 px-2 whitespace-nowrap -translate-x-1/2 left-1/2 -top-8 pointer-events-none z-10">
                    Ξ {point.royaltyAmount}
                    <div className="text-gray-400">{date.toLocaleDateString()}</div>
                  </div>
                </div>
                {index % Math.ceil(data.length / 5) === 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-3">
          <div className="text-blue-600 dark:text-blue-400 text-xs font-medium">Average Daily</div>
          <div className="text-blue-900 dark:text-blue-200 font-bold">Ξ {avgEarnings.toFixed(3)}</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded p-3">
          <div className="text-green-600 dark:text-green-400 text-xs font-medium">Peak Day</div>
          <div className="text-green-900 dark:text-green-200 font-bold">Ξ {Math.max(...values).toFixed(3)}</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-3">
          <div className="text-purple-600 dark:text-purple-400 text-xs font-medium">Total Days</div>
          <div className="text-purple-900 dark:text-purple-200 font-bold">{data.length}</div>
        </div>
      </div>
    </div>
  );
};

export default CreatorRevenueChart;
