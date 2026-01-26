import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  fetchCreatorRoyalties,
  fetchRoyaltyHistory,
  CreatorRoyalties,
  RoyaltyChartData,
  formatRoyalty,
  getEarningsTrend
} from '../services/royalties';
import { BaseScanLink } from '../components/BaseScanLink';
import axios from 'axios';
import { useNotificationStore } from '../store';

/**
 * Simple line chart component
 */
const SimpleLineChart: React.FC<{
  data: RoyaltyChartData[];
  height?: number;
}> = ({ data, height = 300 }) => {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        No data to display
      </div>
    );
  }

  // Find min and max values
  const values = data.map(d => parseFloat(d.royaltyAmount));
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;

  // Calculate SVG points
  const padding = 40;
  const width = Math.max(data.length * 20, 400);
  const svgHeight = height;
  const chartHeight = svgHeight - padding * 2;
  const chartWidth = width - padding * 2;

  let pathData = '';
  data.forEach((point, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * chartWidth;
    const normalizedValue = (parseFloat(point.royaltyAmount) - minValue) / range;
    const y = svgHeight - padding - normalizedValue * chartHeight;

    if (index === 0) {
      pathData += `M ${x} ${y}`;
    } else {
      pathData += ` L ${x} ${y}`;
    }
  });

  return (
    <div className="overflow-x-auto">
      <svg width={width} height={svgHeight} className="mx-auto">
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => {
          const y = padding + (i / 4) * (svgHeight - padding * 2);
          return (
            <line
              key={`grid-${i}`}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#e5e7eb"
              strokeDasharray="4"
              className="dark:stroke-gray-700"
            />
          );
        })}

        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
        />

        {/* Area under line */}
        <path
          d={`${pathData} L ${padding + chartWidth} ${svgHeight - padding} L ${padding} ${svgHeight - padding} Z`}
          fill="url(#gradient)"
          opacity="0.1"
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Axes */}
        <line x1={padding} y1={padding} x2={padding} y2={svgHeight - padding} stroke="#9ca3af" strokeWidth="2" />
        <line x1={padding} y1={svgHeight - padding} x2={width - padding} y2={svgHeight - padding} stroke="#9ca3af" strokeWidth="2" />
      </svg>
    </div>
  );
};

/**
 * Royalties Dashboard
 */
export const RoyaltiesDashboard: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const [royalties, setRoyalties] = useState<CreatorRoyalties | null>(null);
  const [history, setHistory] = useState<RoyaltyChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trend, setTrend] = useState(0);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutLoading, setPayoutLoading] = useState(false);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    if (!address) {
      setError('No creator address provided');
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [royaltiesData, historyData] = await Promise.all([
          fetchCreatorRoyalties(address),
          fetchRoyaltyHistory(address, 30)
        ]);

        setRoyalties(royaltiesData);
        setHistory(historyData);
        setTrend(getEarningsTrend(historyData));
        // Load payouts for current user
        const token = localStorage.getItem('authToken');
        try {
          const res = await axios.get(`${API_URL}/api/royalties/payouts`, { headers: { Authorization: `Bearer ${token}` } });
          setPayouts(res.data.data || []);
        } catch {
          setPayouts([]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load royalty data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [address]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin">
          <svg className="w-8 h-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>
    );
  }

  if (error || !royalties) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <p className="text-red-800 dark:text-red-200">{error || 'Failed to load royalty data'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Royalty Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track your earnings from secondary sales and royalty distributions
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Royalties */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Royalties</div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
            {formatRoyalty(royalties.totalRoyalties)}
          </div>
          <div className={`text-xs font-medium mt-2 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}% vs last week
          </div>
        </div>

        {/* Total Sales */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Royalty Sales</div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            {royalties.totalRoyaltySales}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            secondary sales
          </div>
        </div>

        {/* Average Royalty % */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Avg Royalty %</div>
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
            {royalties.averageRoyaltyPercentage.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            per transaction
          </div>
        </div>

        {/* Top NFT */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Top Earner</div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-2">
            {royalties.topNFT?.nftName || 'N/A'}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            {royalties.topNFT?.royaltiesEarned && formatRoyalty(royalties.topNFT.royaltiesEarned)}
          </div>
        </div>
      </div>

      {/* Royalty History Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">30-Day Royalty Earnings</h2>
        <SimpleLineChart data={history} height={350} />
      </div>

      {/* Recent Royalties */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Royalty Payments</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-2 text-gray-600 dark:text-gray-400 font-medium">NFT</th>
                <th className="text-left py-3 px-2 text-gray-600 dark:text-gray-400 font-medium">Sale Price</th>
                <th className="text-left py-3 px-2 text-gray-600 dark:text-gray-400 font-medium">Royalty %</th>
                <th className="text-left py-3 px-2 text-gray-600 dark:text-gray-400 font-medium">Royalty Amount</th>
                <th className="text-left py-3 px-2 text-gray-600 dark:text-gray-400 font-medium">Date</th>
                <th className="text-left py-3 px-2 text-gray-600 dark:text-gray-400 font-medium">Tx</th>
              </tr>
            </thead>
            <tbody>
              {royalties.recentRoyalties.map((royalty) => (
                <tr key={royalty.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-3 px-2">
                    <a href={`/nft/${royalty.nftId}`} className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                      NFT #{royalty.nftId}
                    </a>
                  </td>
                  <td className="py-3 px-2 font-medium text-gray-900 dark:text-white">
                    Ξ {royalty.salePrice}
                  </td>
                  <td className="py-3 px-2">
                    <span className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-xs font-bold">
                      {royalty.royaltyPercentage}%
                    </span>
                  </td>
                  <td className="py-3 px-2 font-bold text-green-600 dark:text-green-400">
                    {formatRoyalty(royalty.royaltyAmount)}
                  </td>
                  <td className="py-3 px-2 text-gray-600 dark:text-gray-400 text-xs">
                    {new Date(royalty.timestamp).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-2">
                    <BaseScanLink 
                      type="tx" 
                      hash={royalty.transactionHash} 
                      label="View" 
                      className="text-xs"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Royalty Summary Card */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Royalty Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Average per Sale</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              Ξ {(parseFloat(royalties.totalRoyalties) / (royalties.totalRoyaltySales || 1)).toFixed(3)}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Most Recent Earning</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {royalties.recentRoyalties.length > 0 
                ? new Date(royalties.recentRoyalties[0].timestamp).toLocaleDateString()
                : 'N/A'
              }
            </p>
          </div>

          {royalties.topNFT && (
            <>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Top NFT</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                  {royalties.topNFT.nftName}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sales Count</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {royalties.topNFT.salesCount}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Payout Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Payout Management</h2>

        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="text-sm text-gray-600 dark:text-gray-400">Amount (STX)</label>
            <input value={payoutAmount} onChange={(e) => setPayoutAmount(e.target.value)} placeholder="e.g., 10.0" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
          </div>
          <button
            onClick={async () => {
              if (!payoutAmount) return;
              setPayoutLoading(true);
              const token = localStorage.getItem('authToken');
              try {
                const res = await axios.post(`${API_URL}/api/royalties/payouts`, { amount: Number(payoutAmount) }, { headers: { Authorization: `Bearer ${token}` } });
                setPayouts([res.data.data, ...payouts]);
                setPayoutAmount('');
                addNotification({ type: 'success', title: 'Payout Requested', message: 'Your payout request was created.' });
              } catch {
                addNotification({ type: 'error', title: 'Payout Failed', message: 'Could not create payout request.' });
              } finally {
                setPayoutLoading(false);
              }
            }}
            disabled={payoutLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {payoutLoading ? '...' : 'Request Payout'}
          </button>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Payouts</h3>
          {payouts.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 mt-2">No payouts yet</p>
          ) : (
            <div className="space-y-2 mt-2">
              {payouts.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="text-sm text-gray-900 dark:text-white">
                    <span className="font-semibold">{p.amount} {p.currency}</span>
                    <span className="ml-2">[{p.status}]</span>
                    {p.tx_hash && (
                      <span className="ml-2">
                        <BaseScanLink type="tx" hash={p.tx_hash} label="Tx" className="text-xs" />
                      </span>
                    )}
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{new Date(p.requested_at).toLocaleString()}</span>
                  </div>
                  {p.status === 'pending' && (
                    <button
                      onClick={async () => {
                        const token = localStorage.getItem('authToken');
                        try {
                          await axios.post(`${API_URL}/api/royalties/payouts/${p.id}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });
                          setPayouts(payouts.map((x) => x.id === p.id ? { ...x, status: 'failed', notes: 'Cancelled by user' } : x));
                          addNotification({ type: 'success', title: 'Cancelled', message: 'Payout request cancelled.' });
                        } catch {
                          addNotification({ type: 'error', title: 'Cancel Failed', message: 'Could not cancel payout.' });
                        }
                      }}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoyaltiesDashboard;
