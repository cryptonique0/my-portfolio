'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ROIMetric {
  campaignId: string;
  name: string;
  invested: string;
  claimed: string;
  roi: number;
  successScore: number;
  engagementRate: number;
  status: 'active' | 'completed';
}

interface ComparisonData {
  name: string;
  roi: number;
  engagement: number;
  successScore: number;
}

export const ROITracking: React.FC = () => {
  const [campaigns, setCampaigns] = useState<ROIMetric[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<ROIMetric | null>(null);

  useEffect(() => {
    loadROIData();
  }, []);

  const loadROIData = async () => {
    setLoading(true);
    try {
      // Mock campaign data
      const mockCampaigns: ROIMetric[] = [
        {
          campaignId: '1',
          name: 'Early Adopter Airdrop',
          invested: '500000',
          claimed: '425000',
          roi: 145.8,
          successScore: 89,
          engagementRate: 85,
          status: 'completed'
        },
        {
          campaignId: '2',
          name: 'Community Boost',
          invested: '750000',
          claimed: '580000',
          roi: 98.5,
          successScore: 78,
          engagementRate: 77.3,
          status: 'active'
        },
        {
          campaignId: '3',
          name: 'Partner Distribution',
          invested: '1000000',
          claimed: '720000',
          roi: 72.3,
          successScore: 72,
          engagementRate: 72,
          status: 'active'
        },
        {
          campaignId: '4',
          name: 'VIP Allocation',
          invested: '300000',
          claimed: '285000',
          roi: 198.5,
          successScore: 95,
          engagementRate: 95,
          status: 'completed'
        }
      ];

      setCampaigns(mockCampaigns);
      setSelectedCampaign(mockCampaigns[0]);

      // Create comparison data
      const comparison = mockCampaigns.map(c => ({
        name: c.name.split(' ')[0],
        roi: c.roi,
        engagement: c.engagementRate,
        successScore: c.successScore
      }));
      setComparisonData(comparison);
    } catch (error) {
      console.error('Failed to load ROI data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const totalInvested = campaigns.reduce((sum, c) => sum + Number(c.invested), 0);
  const totalClaimed = campaigns.reduce((sum, c) => sum + Number(c.claimed), 0);
  const averageROI = campaigns.reduce((sum, c) => sum + c.roi, 0) / campaigns.length;
  const averageSuccess = campaigns.reduce((sum, c) => sum + c.successScore, 0) / campaigns.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">ROI Tracking</h1>
          <p className="text-gray-400">Campaign success metrics and return on investment analysis</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard
            title="Total Invested"
            value={(totalInvested / 1e6).toFixed(2)}
            unit="M tokens"
            color="from-blue-500 to-blue-600"
          />
          <SummaryCard
            title="Total Claimed"
            value={(totalClaimed / 1e6).toFixed(2)}
            unit="M tokens"
            color="from-green-500 to-green-600"
          />
          <SummaryCard
            title="Average ROI"
            value={averageROI.toFixed(1)}
            unit="%"
            color="from-purple-500 to-purple-600"
          />
          <SummaryCard
            title="Avg Success"
            value={averageSuccess.toFixed(0)}
            unit="/100"
            color="from-amber-500 to-amber-600"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Campaign List */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Campaigns</h2>
            <div className="space-y-2">
              {campaigns.map(campaign => (
                <button
                  key={campaign.campaignId}
                  onClick={() => setSelectedCampaign(campaign)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedCampaign?.campaignId === campaign.campaignId
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  <div className="font-semibold">{campaign.name}</div>
                  <div className="text-xs mt-1 opacity-75">
                    ROI: {campaign.roi.toFixed(1)}%
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Campaign Info */}
          {selectedCampaign && (
            <div className="lg:col-span-2 bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h2 className="text-xl font-bold text-white mb-6">{selectedCampaign.name}</h2>

              <div className="grid grid-cols-2 gap-6">
                {/* Metrics */}
                <div className="space-y-4">
                  <MetricRow
                    label="Status"
                    value={selectedCampaign.status === 'completed' ? '✓ Completed' : '⏱ Active'}
                    valueColor={selectedCampaign.status === 'completed' ? 'text-green-400' : 'text-blue-400'}
                  />
                  <MetricRow
                    label="Invested"
                    value={(Number(selectedCampaign.invested) / 1e6).toFixed(2) + 'M'}
                    valueColor="text-blue-400"
                  />
                  <MetricRow
                    label="Claimed"
                    value={(Number(selectedCampaign.claimed) / 1e6).toFixed(2) + 'M'}
                    valueColor="text-green-400"
                  />
                  <MetricRow
                    label="Success Rate"
                    value={((Number(selectedCampaign.claimed) / Number(selectedCampaign.invested)) * 100).toFixed(1) + '%'}
                    valueColor="text-purple-400"
                  />
                </div>

                <div className="space-y-4">
                  <MetricRow
                    label="ROI"
                    value={selectedCampaign.roi.toFixed(1) + '%'}
                    valueColor="text-amber-400"
                  />
                  <MetricRow
                    label="Success Score"
                    value={selectedCampaign.successScore + '/100'}
                    valueColor="text-pink-400"
                  />
                  <MetricRow
                    label="Engagement"
                    value={selectedCampaign.engagementRate.toFixed(1) + '%'}
                    valueColor="text-cyan-400"
                  />
                  <MetricRow
                    label="Performance"
                    value={selectedCampaign.roi > 100 ? '⭐ Excellent' : '✓ Good'}
                    valueColor={selectedCampaign.roi > 100 ? 'text-green-400' : 'text-blue-400'}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Comparison Chart */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Campaign Comparison</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Legend />
              <Bar dataKey="roi" fill="#3b82f6" name="ROI %" />
              <Bar dataKey="successScore" fill="#10b981" name="Success Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Indicators */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h2 className="text-xl font-bold text-white mb-6">Performance Indicators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ROI Distribution */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">🎯 ROI Distribution</h3>
              <div className="space-y-3">
                {campaigns.map(campaign => (
                  <div key={campaign.campaignId}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-300">{campaign.name}</span>
                      <span className="text-sm font-semibold text-amber-400">{campaign.roi.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full"
                        style={{ width: `${Math.min(100, campaign.roi)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Success Score Distribution */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">✨ Success Scores</h3>
              <div className="space-y-3">
                {campaigns.map(campaign => (
                  <div key={campaign.campaignId}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-300">{campaign.name}</span>
                      <span className="text-sm font-semibold text-pink-400">{campaign.successScore}/100</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-pink-600 h-2 rounded-full"
                        style={{ width: `${campaign.successScore}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SummaryCardProps {
  title: string;
  value: string;
  unit: string;
  color: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, unit, color }) => (
  <div className={`bg-gradient-to-br ${color} rounded-lg p-6 text-white`}>
    <p className="text-sm opacity-75 mb-2">{title}</p>
    <p className="text-3xl font-bold mb-1">{value}</p>
    <p className="text-xs opacity-50">{unit}</p>
  </div>
);

interface MetricRowProps {
  label: string;
  value: string;
  valueColor: string;
}

const MetricRow: React.FC<MetricRowProps> = ({ label, value, valueColor }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-400 text-sm">{label}</span>
    <span className={`font-semibold ${valueColor}`}>{value}</span>
  </div>
);

export default ROITracking;
