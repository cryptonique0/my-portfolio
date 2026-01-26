/**
 * Analytics Dashboard Page
 * Main dashboard page with metrics, charts, and leaderboards
 */

import React, { useState } from 'react';
import {
  useDashboardMetrics,
  useMarketMetrics,
  useVolumeMetrics,
  useChartData,
  useLeaderboard,
  usePopularSearches,
  useExportData,
  useTrendingMetrics,
} from '../hooks/useAnalytics';
import {
  MetricCard,
  StatsSummary,
  TimeRangeSelector,
  VolumeChart,
  TransactionChart,
  Leaderboard,
  SearchPopularity,
  ExportButton,
  ChartContainer,
} from '../components/Analytics';

interface TabConfig {
  id: string;
  label: string;
  icon: string;
}

const TABS: TabConfig[] = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'volume', label: 'Volume', icon: '📈' },
  { id: 'trending', label: 'Trending', icon: '🔥' },
  { id: 'leaderboard', label: 'Leaderboards', icon: '🏆' },
];

const LEADERBOARD_TYPES = [
  { id: 'volume', label: 'Top Traders' },
  { id: 'creators', label: 'Top Creators' },
  { id: 'collectors', label: 'Top Collectors' },
];

const LEADERBOARD_PERIODS = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'all-time', label: 'All Time' },
];

export const AnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('weekly');
  const [leaderboardType, setLeaderboardType] = useState('volume');
  const [leaderboardPeriod, setLeaderboardPeriod] = useState('all-time');

  // Fetch data
  const dashboardMetrics = useDashboardMetrics();
  const marketMetrics = useMarketMetrics();
  const volumeMetrics = useVolumeMetrics(timeRange as any);
  const volumeChartData = useChartData('volume', timeRange as any);
  const transactionChartData = useChartData('transactions', timeRange as any);
  const usersChartData = useChartData('users', timeRange as any);
  const leaderboardData = useLeaderboard(leaderboardType as any, leaderboardPeriod as any, 10);
  const trendingData = useTrendingMetrics(leaderboardPeriod as any);
  const popularSearches = usePopularSearches(10);
  const { exportData, exporting } = useExportData();

  // Loading state
  const isLoading =
    dashboardMetrics.loading ||
    marketMetrics.loading ||
    volumeMetrics.loading ||
    volumeChartData.loading;

  // Prepare metric cards
  const metricCards: any[] = dashboardMetrics.metrics
    ? [
        {
          title: 'Total Volume',
          value: `$${(dashboardMetrics.metrics.totalVolume / 1000000).toFixed(2)}M`,
          change: 12.5,
          icon: '💰',
        },
        {
          title: 'Transactions',
          value: dashboardMetrics.metrics.totalTransactions.toLocaleString(),
          change: 8.3,
          icon: '🔄',
        },
        {
          title: 'NFTs Sold',
          value: dashboardMetrics.metrics.totalNFTsSold.toLocaleString(),
          change: 15.2,
          icon: '🎨',
        },
        {
          title: 'Avg Price',
          value: `$${dashboardMetrics.metrics.averagePrice.toFixed(2)}`,
          change: -2.1,
          icon: '💵',
        },
      ]
    : [];

  const marketMetricCards: any[] = marketMetrics.metrics
    ? [
        {
          title: '24h Volume',
          value: `$${(marketMetrics.metrics.volume24h / 1000).toFixed(1)}K`,
          icon: '📊',
        },
        {
          title: '24h Transactions',
          value: marketMetrics.metrics.transactions24h.toLocaleString(),
          icon: '📈',
        },
        {
          title: 'Listed NFTs',
          value: marketMetrics.metrics.listedNFTs.toLocaleString(),
          icon: '📋',
        },
        {
          title: 'Collections',
          value: marketMetrics.metrics.totalCollections.toLocaleString(),
          icon: '🏛️',
        },
      ]
    : [];

  // Format leaderboard entries
  const leaderboardEntries =
    leaderboardData.leaderboard?.data?.map((entry: any, index: number) => ({
      rank: index + 1,
      name: entry.username || `User ${entry.userId?.slice(0, 8)}`,
      score: entry.score,
      change: Math.floor(Math.random() * 20) - 10,
    })) || [];

  // Format trending entries
  const trendingEntries =
    trendingData.trending?.data?.slice(0, 5).map((entry: any, index: number) => ({
      rank: index + 1,
      name: `Item ${entry.entityId?.slice(0, 8)}`,
      score: entry.trendScore,
      change: entry.changePercent,
    })) || [];

  // Format searches
  const formattedSearches =
    popularSearches.searches?.data?.map((search: any) => ({
      query: search.query,
      count: search.count,
    })) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Real-time marketplace metrics and insights</p>
            </div>
            <ExportButton
              dataType="Report"
              loading={exporting}
              onClick={() => exportData('metrics')}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <StatsSummary metrics={metricCards} loading={isLoading} cols={4} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartContainer
                title="Volume Trend"
                subtitle="Trading volume over time"
                loading={volumeChartData.loading}
                height={350}
              >
                {volumeChartData.chartData && (
                  <div style={{ height: '100%' }}>
                    <VolumeChart data={volumeChartData.chartData} />
                  </div>
                )}
              </ChartContainer>

              <ChartContainer
                title="Transactions Trend"
                subtitle="Transaction count over time"
                loading={transactionChartData.loading}
                height={350}
              >
                {transactionChartData.chartData && (
                  <div style={{ height: '100%' }}>
                    <TransactionChart data={transactionChartData.chartData} />
                  </div>
                )}
              </ChartContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Leaderboard
                title="Top Traders (24h)"
                entries={leaderboardEntries.slice(0, 5)}
                loading={leaderboardData.loading}
              />
              <SearchPopularity
                searches={formattedSearches}
                loading={popularSearches.loading}
              />
            </div>
          </div>
        )}

        {/* Volume Tab */}
        {activeTab === 'volume' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Volume Analytics</h2>
              <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
            </div>

            <StatsSummary metrics={marketMetricCards} loading={isLoading} cols={2} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartContainer
                title="Trading Volume"
                loading={volumeChartData.loading}
                height={400}
              >
                {volumeChartData.chartData && (
                  <div style={{ height: '100%' }}>
                    <VolumeChart data={volumeChartData.chartData} />
                  </div>
                )}
              </ChartContainer>

              <ChartContainer
                title="Active Users"
                loading={usersChartData.loading}
                height={400}
              >
                {usersChartData.chartData && (
                  <div style={{ height: '100%' }}>
                    <VolumeChart data={usersChartData.chartData} />
                  </div>
                )}
              </ChartContainer>
            </div>

            <div className="flex gap-4">
              <ExportButton
                dataType="Transactions"
                loading={exporting}
                onClick={() => exportData('transactions')}
              />
              <ExportButton
                dataType="NFTs"
                loading={exporting}
                onClick={() => exportData('nfts')}
              />
            </div>
          </div>
        )}

        {/* Trending Tab */}
        {activeTab === 'trending' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Trending Items</h2>
              <div className="flex gap-2">
                {LEADERBOARD_PERIODS.map((period) => (
                  <button
                    key={period.id}
                    onClick={() => setLeaderboardPeriod(period.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      leaderboardPeriod === period.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {LEADERBOARD_TYPES.map((type) => (
                <Leaderboard
                  key={type.id}
                  title={type.label}
                  entries={
                    leaderboardType === type.id ? leaderboardEntries : trendingEntries
                  }
                  loading={leaderboardData.loading}
                  onViewMore={() => setLeaderboardType(type.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Leaderboards</h2>
              <TimeRangeSelector
                value={leaderboardPeriod}
                onChange={setLeaderboardPeriod}
                options={LEADERBOARD_PERIODS}
              />
            </div>

            <div className="grid grid-cols-1 gap-6">
              {LEADERBOARD_TYPES.map((type) => (
                <div key={type.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">{type.label}</h3>
                    <ExportButton
                      dataType={type.label}
                      loading={exporting}
                      onClick={() => {}}
                      className="px-3 py-1 text-sm"
                    />
                  </div>

                  <div className="space-y-3">
                    {leaderboardEntries.map((entry: any) => (
                      <div
                        key={entry.rank}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold text-sm">
                            {entry.rank}
                          </div>
                          <span className="font-medium text-gray-900">{entry.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            {entry.score.toLocaleString()}
                          </div>
                          <div
                            className={`text-sm ${
                              entry.change >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {entry.change >= 0 ? '↑' : '↓'} {Math.abs(entry.change)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
