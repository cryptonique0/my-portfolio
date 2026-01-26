/**
 * Analytics Dashboard Components
 * Reusable components for the analytics dashboard
 */

import React from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

/**
 * MetricCard Component
 * Displays a single metric with value and change
 */
export interface MetricCardProps {
  title: string;
  value: number | string;
  unit?: string;
  change?: number;
  icon?: React.ReactNode;
  loading?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit = '',
  change,
  icon,
  loading = false,
}) => {
  const isPositive = change === undefined || change >= 0;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-gray-900">{value}</span>
            {unit && <span className="text-gray-500 text-sm">{unit}</span>}
          </div>
          {change !== undefined && (
            <p className={`text-sm mt-2 font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '↑' : '↓'} {Math.abs(change).toFixed(2)}% from last period
            </p>
          )}
        </div>
        {icon && <div className="text-2xl opacity-50">{icon}</div>}
      </div>
    </div>
  );
};

/**
 * ChartContainer Component
 * Wrapper for chart components with title and loading state
 */
export interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  loading?: boolean;
  height?: number;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  children,
  loading = false,
  height = 400,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="h-6 bg-gray-200 rounded w-40 mb-2"></div>
        {subtitle && <div className="h-4 bg-gray-100 rounded w-32 mb-4"></div>}
        <div className="bg-gray-100 rounded" style={{ height: `${height}px` }}></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
      </div>
      <div style={{ height: `${height}px`, position: 'relative' }}>{children}</div>
    </div>
  );
};

/**
 * TimeRangeSelector Component
 * Allows user to select time range for data
 */
export interface TimeRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options?: Array<{ label: string; value: string }>;
}

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  value,
  onChange,
  options = [
    { label: '24 Hours', value: '24h' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
  ],
}) => {
  return (
    <div className="flex gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            value === option.value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

/**
 * VolumeChart Component
 * Displays trading volume over time
 */
export interface VolumeChartProps {
  data: any;
  loading?: boolean;
}

export const VolumeChart: React.FC<VolumeChartProps> = ({ data, loading = false }) => {
  if (loading || !data?.labels) {
    return <div className="h-96 bg-gray-100 rounded animate-pulse"></div>;
  }

  return (
    <ChartContainer title="Trading Volume" subtitle="Historical trading volume over time" height={350}>
      <Line
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top' as const,
            },
            title: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function (value: any) {
                  return '$' + (value / 1000).toFixed(0) + 'K';
                },
              },
            },
          },
        }}
      />
    </ChartContainer>
  );
};

/**
 * TransactionChart Component
 * Displays transaction count over time
 */
export interface TransactionChartProps {
  data: any;
  loading?: boolean;
}

export const TransactionChart: React.FC<TransactionChartProps> = ({ data, loading = false }) => {
  if (loading || !data?.labels) {
    return <div className="h-96 bg-gray-100 rounded animate-pulse"></div>;
  }

  return (
    <ChartContainer title="Transaction Count" subtitle="Number of transactions over time" height={350}>
      <Bar
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top' as const,
            },
            title: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        }}
      />
    </ChartContainer>
  );
};

/**
 * Leaderboard Component
 * Displays ranked list of entities
 */
export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  change?: number;
}

export interface LeaderboardProps {
  title: string;
  entries: LeaderboardEntry[];
  loading?: boolean;
  onViewMore?: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ title, entries, loading = false, onViewMore }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded mb-2"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.rank} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold text-sm">
                {entry.rank}
              </div>
              <span className="font-medium text-gray-900">{entry.name}</span>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-900">{entry.score.toLocaleString()}</div>
              {entry.change !== undefined && (
                <div className={`text-sm ${entry.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {entry.change >= 0 ? '↑' : '↓'} {Math.abs(entry.change)}%
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {onViewMore && (
        <button
          onClick={onViewMore}
          className="w-full mt-4 py-2 text-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          View All
        </button>
      )}
    </div>
  );
};

/**
 * StatsSummary Component
 * Displays multiple metrics in a grid
 */
export interface StatsSummaryProps {
  metrics: MetricCardProps[];
  loading?: boolean;
  cols?: number;
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({ metrics, loading = false, cols = 4 }) => {
  const gridClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }[cols] || 'grid-cols-4';

  return (
    <div className={`grid ${gridClass} gap-4`}>
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} loading={loading} />
      ))}
    </div>
  );
};

/**
 * SearchPopularity Component
 * Displays popular searches
 */
export interface SearchPopularityProps {
  searches: Array<{ query: string; count: number }>;
  loading?: boolean;
}

export const SearchPopularity: React.FC<SearchPopularityProps> = ({ searches, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-100 rounded mb-2"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Popular Searches</h3>
      <div className="space-y-2">
        {searches.slice(0, 10).map((search, index) => (
          <div key={index} className="flex items-center justify-between p-2">
            <span className="text-gray-700">{search.query}</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{
                    width: `${((search.count / searches[0].count) * 100)}%`,
                  }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 w-8 text-right">{search.count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * ExportButton Component
 * Button for exporting analytics data
 */
export interface ExportButtonProps {
  dataType: string;
  loading?: boolean;
  onClick: () => void;
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  dataType,
  loading = false,
  onClick,
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium transition-colors flex items-center gap-2 ${className}`}
    >
      {loading ? (
        <>
          <span className="animate-spin">⏳</span>
          Exporting...
        </>
      ) : (
        <>
          <span>📥</span>
          Export {dataType}
        </>
      )}
    </button>
  );
};
