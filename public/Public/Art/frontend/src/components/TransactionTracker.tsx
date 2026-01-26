import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../hooks/useBlockchain';

interface TransactionRecord {
  hash: string;
  type: 'mint' | 'bid' | 'buy' | 'sell' | 'list' | 'unlist';
  status: 'pending' | 'confirmed' | 'failed';
  amount?: string;
  gasUsed?: string;
  blockNumber?: number;
  confirmations?: number;
  timestamp: number;
  error?: string;
}

export const TransactionTracker: React.FC = () => {
  const { address, isConnected } = useBlockchain();
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTx, setSelectedTx] = useState<TransactionRecord | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'failed'>('all');

  useEffect(() => {
    if (isConnected && address) {
      fetchTransactions();
      const interval = setInterval(fetchTransactions, 10000); // Refresh every 10s
      return () => clearInterval(interval);
    }
  }, [address, isConnected]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/transactions/user/${address}`);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '✓';
      case 'pending':
        return '⏳';
      case 'failed':
        return '✗';
      default:
        return '•';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'mint':
        return 'bg-purple-100 text-purple-800';
      case 'bid':
        return 'bg-blue-100 text-blue-800';
      case 'buy':
        return 'bg-green-100 text-green-800';
      case 'sell':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'all') return true;
    return tx.status === filter;
  });

  if (!isConnected) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-blue-900 mb-2">Transaction Tracker</h2>
          <p className="text-blue-700">Connect your wallet to view your transaction history</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Transaction Tracker</h1>
        <p className="text-gray-600">Monitor all your on-chain transactions and their status</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Total Transactions</p>
          <p className="text-3xl font-bold">{transactions.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4">
          <p className="text-green-600 text-sm">Confirmed</p>
          <p className="text-3xl font-bold">
            {transactions.filter((tx) => tx.status === 'confirmed').length}
          </p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-4">
          <p className="text-yellow-600 text-sm">Pending</p>
          <p className="text-3xl font-bold">
            {transactions.filter((tx) => tx.status === 'pending').length}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4">
          <p className="text-red-600 text-sm">Failed</p>
          <p className="text-3xl font-bold">
            {transactions.filter((tx) => tx.status === 'failed').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'confirmed', 'failed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-semibold transition capitalize ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {f}
          </button>
        ))}
        <button
          onClick={fetchTransactions}
          disabled={loading}
          className="ml-auto px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-gray-600">
            <p className="text-lg mb-2">No transactions found</p>
            <p className="text-sm">Your {filter !== 'all' ? filter : ''} transactions will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Hash</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Time</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.hash} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <a
                        href={`https://basescan.org/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-mono text-sm"
                      >
                        {tx.hash.substring(0, 10)}...{tx.hash.substring(-8)}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getTypeColor(tx.type)}`}>
                        {tx.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold">
                      {tx.amount ? `${tx.amount} ETH` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(tx.status)}`}>
                        <span>{getStatusIcon(tx.status)}</span>
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(tx.timestamp * 1000).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="text-blue-600 hover:underline text-sm font-semibold"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-gray-50 border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Transaction Details</h2>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600">Transaction Hash</p>
                <a
                  href={`https://basescan.org/tx/${selectedTx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-mono break-all"
                >
                  {selectedTx.hash}
                </a>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-semibold capitalize">{selectedTx.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className={`font-semibold ${getStatusColor(selectedTx.status).split(' ')[0]}`}>
                    {selectedTx.status.charAt(0).toUpperCase() + selectedTx.status.slice(1)}
                  </p>
                </div>
              </div>

              {selectedTx.amount && (
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="font-semibold">{selectedTx.amount} ETH</p>
                </div>
              )}

              {selectedTx.gasUsed && (
                <div>
                  <p className="text-sm text-gray-600">Gas Used</p>
                  <p className="font-semibold">{selectedTx.gasUsed}</p>
                </div>
              )}

              {selectedTx.blockNumber && (
                <div>
                  <p className="text-sm text-gray-600">Block Number</p>
                  <p className="font-semibold">#{selectedTx.blockNumber}</p>
                </div>
              )}

              {selectedTx.confirmations !== undefined && (
                <div>
                  <p className="text-sm text-gray-600">Confirmations</p>
                  <p className="font-semibold">{selectedTx.confirmations}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-semibold">
                  {new Date(selectedTx.timestamp * 1000).toLocaleString()}
                </p>
              </div>

              {selectedTx.error && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-sm text-gray-600 mb-1">Error</p>
                  <p className="text-red-700 text-sm">{selectedTx.error}</p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 border-t px-6 py-4">
              <button
                onClick={() => setSelectedTx(null)}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
