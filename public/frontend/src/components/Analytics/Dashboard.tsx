'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface DashboardMetrics {
  totalAllocated: string;
  totalClaimed: string;
  claimRate: number;
  activeUsers: number;
  claimsLast24h: number;
  successScore: number;
}

interface ChartData {
  date: string;
  claims: number;
  volume: number;
  users: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export const AnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    loadMetrics();
  }, [timeRange]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      setMetrics({
        totalAllocated: '1000000',
        totalClaimed: '750000',
        claimRate: 75,
        activeUsers: 2500,
        claimsLast24h: 450,
        successScore: 82
      });

      // Mock chart data
      const data: ChartData[] = Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }),
        claims: Math.floor(Math.random() * 500) + 200,
        volume: Math.floor(Math.random() * 100000) + 50000,
        users: Math.floor(Math.random() * 300) + 100
      }));
      setChartData(data);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!metrics) {
    return <div className="text-red-600">Failed to load analytics dashboard</div>;
  }

  const claimPercentage = metrics.claimRate;
  const pendingPercentage = 100 - metrics.claimRate;

  const pieData = [
    { name: 'Claimed', value: claimPercentage },
    { name: 'Pending', value: pendingPercentage }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">Real-time airdrop metrics and performance tracking</p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6 flex gap-2">
          {(['24h', '7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Claimed"
            value={`${(Number(metrics.totalClaimed) / 1e6).toFixed(2)}M`}
            subtitle="Tokens"
            trend="+12.5%"
            trendUp
            color="from-blue-500 to-blue-600"
          />
          <MetricCard
            title="Claim Rate"
            value={`${metrics.claimRate.toFixed(1)}%`}
            subtitle="Success Rate"
            trend="+5.2%"
            trendUp
            color="from-green-500 to-green-600"
          />
          <MetricCard
            title="Active Users"
            value={metrics.activeUsers.toLocaleString()}
            subtitle="Last 24h"
            trend="+18.3%"
            trendUp
            color="from-purple-500 to-purple-600"
          />
          <MetricCard
            title="Success Score"
            value={`${metrics.successScore}/100`}
            subtitle="Campaign Health"
            trend="+2.1%"
            trendUp
            color="from-amber-500 to-amber-600"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Claims Over Time */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Claims Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                  labelStyle={{ color: '#f1f5f9' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="claims"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Claim Distribution */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Claim Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                  labelStyle={{ color: '#f1f5f9' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Volume Chart */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Trading Volume</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Legend />
              <Bar dataKey="volume" fill="#10b981" />
              <Bar dataKey="users" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            label="Avg Claim Size"
            value={(Number(metrics.totalClaimed) / metrics.activeUsers).toFixed(2)}
            unit="tokens"
          />
          <StatCard
            label="Claims/Day"
            value={Math.round(metrics.claimsLast24h).toString()}
            unit="transactions"
          />
          <StatCard
            label="Total Allocated"
            value={(Number(metrics.totalAllocated) / 1e6).toFixed(2)}
            unit="M tokens"
          />
        </div>
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  trend: string;
  trendUp: boolean;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  trendUp,
  color
}) => (
  <div className={`bg-gradient-to-br ${color} rounded-lg p-6 text-white`}>
    <div className="mb-2">
      <p className="text-sm text-gray-100 opacity-75">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-xs text-gray-100 opacity-50 mt-1">{subtitle}</p>
    </div>
    <div className="flex items-center gap-1 text-sm">
      <span className={trendUp ? 'text-green-300' : 'text-red-300'}>
        {trendUp ? '↑' : '↓'}
      </span>
      <span className={trendUp ? 'text-green-300' : 'text-red-300'}>{trend}</span>
    </div>
  </div>
);

interface StatCardProps {
  label: string;
  value: string;
  unit: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, unit }) => (
  <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
    <p className="text-gray-400 text-sm mb-2">{label}</p>
    <p className="text-2xl font-bold text-white mb-1">{value}</p>
    <p className="text-gray-500 text-xs">{unit}</p>
  </div>
);

export default AnalyticsDashboard;
