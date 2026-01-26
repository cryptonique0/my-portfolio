import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ConversionFunnel from '../components/analytics/ConversionFunnel';
import UserBehaviorAnalysis from '../components/analytics/UserBehaviorAnalysis';
import Heatmap from '../components/analytics/Heatmap';
import CustomEventTracking from '../components/analytics/CustomEventTracking';

const AnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'funnel' | 'behavior' | 'events' | 'heatmap'>('overview');
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Fetch analytics summary when date range changes

  const dashboardData = [
    { date: 'Jan 1', users: 400, nfts: 240, offers: 120, purchases: 24 },
    { date: 'Jan 2', users: 450, nfts: 280, offers: 140, purchases: 28 },
    { date: 'Jan 3', users: 520, nfts: 300, offers: 160, purchases: 35 },
    { date: 'Jan 4', users: 480, nfts: 270, offers: 150, purchases: 30 },
    { date: 'Jan 5', users: 600, nfts: 350, offers: 190, purchases: 42 },
    { date: 'Jan 6', users: 650, nfts: 380, offers: 210, purchases: 48 },
    { date: 'Jan 7', users: 700, nfts: 420, offers: 240, purchases: 55 },
  ];

  const topEvents = [
    { name: 'NFT Viewed', count: 12450, trend: '+15%' },
    { name: 'Collection Created', count: 542, trend: '+8%' },
    { name: 'Offer Made', count: 3421, trend: '+22%' },
    { name: 'Purchase Completed', count: 892, trend: '+35%' },
    { name: 'Wishlist Added', count: 5632, trend: '+12%' },
    { name: 'User Signed Up', count: 234, trend: '+18%' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">📊 Analytics Dashboard</h1>
          <p className="text-gray-600">Track your marketplace performance with comprehensive analytics</p>
        </div>

        {/* Date Range Selector */}
        <div className="bg-white rounded-lg border p-4 mb-6 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <button
            onClick={() => {}}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Apply
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg border mb-6 overflow-x-auto">
          <div className="flex">
            {(['overview', 'funnel', 'behavior', 'events', 'heatmap'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-3 font-medium text-sm md:text-base border-b-2 transition ${
                  activeTab === tab
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'overview' && '📈 Overview'}
                {tab === 'funnel' && '🎯 Funnel'}
                {tab === 'behavior' && '👥 Behavior'}
                {tab === 'events' && '📊 Events'}
                {tab === 'heatmap' && '🔥 Heatmap'}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total Users</p>
                    <p className="text-2xl font-bold">12,450</p>
                    <p className="text-xs text-green-600 mt-1">↑ 12% from last period</p>
                  </div>
                  <div className="text-4xl">👥</div>
                </div>
              </div>

              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">NFTs Created</p>
                    <p className="text-2xl font-bold">5,234</p>
                    <p className="text-xs text-green-600 mt-1">↑ 18% from last period</p>
                  </div>
                  <div className="text-4xl">🎨</div>
                </div>
              </div>

              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total Offers</p>
                    <p className="text-2xl font-bold">8,921</p>
                    <p className="text-xs text-green-600 mt-1">↑ 25% from last period</p>
                  </div>
                  <div className="text-4xl">💬</div>
                </div>
              </div>

              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Transactions</p>
                    <p className="text-2xl font-bold">1,234</p>
                    <p className="text-xs text-green-600 mt-1">↑ 35% from last period</p>
                  </div>
                  <div className="text-4xl">💰</div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-bold mb-4">📈 Activity Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb' }} />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#3b82f6" name="Active Users" />
                  <Line type="monotone" dataKey="nfts" stroke="#8b5cf6" name="NFTs Created" />
                  <Line type="monotone" dataKey="offers" stroke="#ec4899" name="Offers Made" />
                  <Line type="monotone" dataKey="purchases" stroke="#10b981" name="Purchases" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Top Events */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-bold mb-4">🔥 Top Events</h3>
              <div className="space-y-3">
                {topEvents.map((event, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{event.name}</p>
                      <p className="text-xs text-gray-500">{event.count.toLocaleString()} events</p>
                    </div>
                    <span className={`font-bold ${event.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {event.trend}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Funnel Tab */}
        {activeTab === 'funnel' && (
          <ConversionFunnel dateRange={dateRange} />
        )}

        {/* Behavior Tab */}
        {activeTab === 'behavior' && (
          <UserBehaviorAnalysis timeframe="month" />
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <CustomEventTracking eventName="nft_view" dateRange={dateRange} />
            <CustomEventTracking eventName="offer_created" dateRange={dateRange} />
            <CustomEventTracking eventName="purchase" dateRange={dateRange} />
          </div>
        )}

        {/* Heatmap Tab */}
        {activeTab === 'heatmap' && (
          <div className="space-y-6">
            <Heatmap pageUrl="/nft/:id" width={1200} height={800} />
            <Heatmap pageUrl="/marketplace" width={1200} height={800} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
