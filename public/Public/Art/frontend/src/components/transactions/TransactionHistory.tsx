import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';

interface Transaction {
  id: string;
  nftName: string;
  nftImage: string;
  type: 'purchase' | 'sale' | 'mint' | 'transfer' | 'listing' | 'delisting' | 'bid' | 'bid_accepted';
  price: number;
  currency: string;
  from?: string;
  to?: string;
  timestamp: string;
  transactionHash?: string;
  status: 'pending' | 'completed' | 'failed';
}

interface Analytics {
  totalTransactions: number;
  totalPurchases: number;
  totalSales: number;
  totalSpent: number;
  totalEarned: number;
  netProfit: number;
  realizedGains: number;
  roi: number;
  avgPurchasePrice: number;
  avgSalePrice: number;
  mostProfitableSale: Transaction | null;
  biggestLoss: Transaction | null;
  topNFTs: Array<{ nftId: string; nftName: string; profit: number; transactions: number }>;
}

interface PriceHistoryPoint {
  date: string;
  avgPrice: number;
  volume: number;
  transactions: number;
  minPrice: number;
  maxPrice: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'log' | 'analytics' | 'charts' | 'tax'>('log');
  
  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'price'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const limit = 50;

  useEffect(() => {
    fetchData();
  }, [page, typeFilter, dateRange, sortBy, sortOrder]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      // Calculate date range
      let startDate: string | undefined;
      const now = new Date();
      if (dateRange === '7d') {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      } else if (dateRange === '30d') {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      } else if (dateRange === '90d') {
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      }

      // Fetch transactions
      const historyRes = await axios.get(`${API_URL}/api/transactions/history`, {
        params: {
          type: typeFilter === 'all' ? undefined : typeFilter,
          startDate,
          limit,
          offset: (page - 1) * limit,
          sortBy,
          sortOrder
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTransactions(historyRes.data.data);
      setHasMore(historyRes.data.pagination.hasMore);

      // Fetch analytics
      const analyticsRes = await axios.get(`${API_URL}/api/transactions/analytics`, {
        params: { startDate },
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(analyticsRes.data.data);

      // Fetch price history
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365;
      const historyPriceRes = await axios.get(`${API_URL}/api/transactions/price-history`, {
        params: { days, groupBy: days <= 30 ? 'day' : 'week' },
        headers: { Authorization: `Bearer ${token}` }
      });
      setPriceHistory(historyPriceRes.data.data);
      
    } catch (error) {
      console.error('Failed to fetch transaction data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_URL}/api/transactions/export/csv`, {
        params: {
          type: typeFilter === 'all' ? undefined : typeFilter,
        },
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('Failed to export transactions');
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      purchase: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      sale: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      mint: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      transfer: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      listing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      bid: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'completed') return '✅';
    if (status === 'pending') return '⏳';
    return '❌';
  };

  // Chart data
  const chartData = {
    labels: priceHistory.map(p => new Date(p.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Average Price',
        data: priceHistory.map(p => p.avgPrice),
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        tension: 0.4
      },
      {
        label: 'Volume',
        data: priceHistory.map(p => p.volume),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          color: document.documentElement.classList.contains('dark') ? '#fff' : '#000'
        }
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: document.documentElement.classList.contains('dark') ? '#fff' : '#000'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: document.documentElement.classList.contains('dark') ? '#fff' : '#000'
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: document.documentElement.classList.contains('dark') ? '#fff' : '#000'
        }
      }
    }
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          📜 Transaction History
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Complete record of all your NFT transactions with analytics and insights
        </p>
      </div>

      {/* Quick Stats */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {analytics.totalTransactions}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">Net Profit</div>
            <div className={`text-3xl font-bold mt-2 ${analytics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analytics.netProfit >= 0 ? '+' : ''}{analytics.netProfit.toFixed(2)} STX
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">ROI</div>
            <div className={`text-3xl font-bold mt-2 ${analytics.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analytics.roi >= 0 ? '+' : ''}{analytics.roi.toFixed(2)}%
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Volume</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {(analytics.totalSpent + analytics.totalEarned).toFixed(2)} STX
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-8 px-6">
            {[
              { id: 'log', label: 'Transaction Log', icon: '📜' },
              { id: 'analytics', label: 'Analytics', icon: '📊' },
              { id: 'charts', label: 'Price Charts', icon: '💵' },
              { id: 'tax', label: 'Tax Report', icon: '🧾' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-4">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="purchase">Purchases</option>
              <option value="sale">Sales</option>
              <option value="mint">Mints</option>
              <option value="transfer">Transfers</option>
              <option value="listing">Listings</option>
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Time</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split('-');
                setSortBy(by as any);
                setSortOrder(order as any);
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="timestamp-desc">Newest First</option>
              <option value="timestamp-asc">Oldest First</option>
              <option value="price-desc">Highest Price</option>
              <option value="price-asc">Lowest Price</option>
            </select>

            <button
              onClick={handleExportCSV}
              className="ml-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              📥 Export CSV
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'log' && (
            <div className="space-y-4">
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📭</div>
                  <p className="text-gray-600 dark:text-gray-400">No transactions found</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">NFT</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Price</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Hash</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {new Date(tx.timestamp).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {tx.nftImage && (
                                  <img src={tx.nftImage} alt={tx.nftName} className="w-8 h-8 rounded object-cover" />
                                )}
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{tx.nftName}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(tx.type)}`}>
                                {tx.type}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                              {tx.price} {tx.currency}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              <span title={tx.status}>{getStatusIcon(tx.status)}</span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              {tx.transactionHash ? (
                                <a
                                  href={`https://explorer.stacks.co/txid/${tx.transactionHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-600 dark:text-purple-400 hover:underline"
                                >
                                  {tx.transactionHash.slice(0, 8)}...
                                </a>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex justify-between items-center mt-6">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Page {page}</span>
                    <button
                      onClick={() => setPage(p => p + 1)}
                      disabled={!hasMore}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'analytics' && analytics && (
            <div className="space-y-6">
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <div className="text-sm opacity-90">Total Spent</div>
                  <div className="text-3xl font-bold mt-2">{analytics.totalSpent.toFixed(2)} STX</div>
                  <div className="text-sm opacity-75 mt-1">{analytics.totalPurchases} purchases</div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
                  <div className="text-sm opacity-90">Total Earned</div>
                  <div className="text-3xl font-bold mt-2">{analytics.totalEarned.toFixed(2)} STX</div>
                  <div className="text-sm opacity-75 mt-1">{analytics.totalSales} sales</div>
                </div>
                <div className={`bg-gradient-to-br ${analytics.realizedGains >= 0 ? 'from-purple-500 to-purple-600' : 'from-red-500 to-red-600'} rounded-lg p-6 text-white`}>
                  <div className="text-sm opacity-90">Realized Gains</div>
                  <div className="text-3xl font-bold mt-2">
                    {analytics.realizedGains >= 0 ? '+' : ''}{analytics.realizedGains.toFixed(2)} STX
                  </div>
                  <div className="text-sm opacity-75 mt-1">ROI: {analytics.roi.toFixed(2)}%</div>
                </div>
              </div>

              {/* Best Performances */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analytics.mostProfitableSale && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3">
                      🏆 Most Profitable Sale
                    </h3>
                    <div className="flex items-center gap-3">
                      {analytics.mostProfitableSale.nftImage && (
                        <img src={analytics.mostProfitableSale.nftImage} alt="" className="w-16 h-16 rounded-lg object-cover" />
                      )}
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{analytics.mostProfitableSale.nftName}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Sold for {analytics.mostProfitableSale.price} STX
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Top NFTs by Profit */}
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-3">
                    📈 Top NFTs by Profit
                  </h3>
                  <div className="space-y-2">
                    {analytics.topNFTs.slice(0, 5).map((nft, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-sm text-gray-900 dark:text-white">{nft.nftName}</span>
                        <span className={`text-sm font-semibold ${nft.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {nft.profit >= 0 ? '+' : ''}{nft.profit.toFixed(2)} STX
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'charts' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Price & Volume History
                </h3>
                <div className="h-96">
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tax' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  🧾 Tax Reporting
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
                  Generate comprehensive tax reports for your NFT transactions. Consult with a tax professional for specific guidance.
                </p>
                <button
                  onClick={async () => {
                    const year = new Date().getFullYear();
                    try {
                      const token = localStorage.getItem('authToken');
                      const res = await axios.get(`${API_URL}/api/transactions/tax-report/${year}`, {
                        headers: { Authorization: `Bearer ${token}` }
                      });
                      alert(JSON.stringify(res.data.data, null, 2));
                    } catch (error) {
                      alert('Failed to generate tax report');
                    }
                  }}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Generate {new Date().getFullYear()} Tax Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
