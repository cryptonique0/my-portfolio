import React from 'react';
import { useTransactionSummary } from '../../hooks/useAdmin';

export const TransactionMonitor: React.FC = () => {
  const [hours, setHours] = React.useState(24);
  const { summary, loading } = useTransactionSummary(hours);

  if (loading || !summary) {
    return <div className="p-4">Loading transaction data...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">💰 Transaction Monitoring</h2>
        <select
          value={hours}
          onChange={(e) => setHours(Number(e.target.value))}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value={1}>Last hour</option>
          <option value={24}>Last 24 hours</option>
          <option value={168}>Last week</option>
          <option value={720}>Last month</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
          <p className="text-2xl font-bold">{summary.total?.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-600 mb-1">Total Volume</p>
          <p className="text-2xl font-bold">${(summary.totalVolume / 1000000).toFixed(2)}M</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-600 mb-1">Avg per Tx</p>
          <p className="text-2xl font-bold">
            ${summary.total > 0 ? (summary.totalVolume / summary.total).toFixed(2) : '0'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-bold mb-3">By Type</h3>
          <div className="space-y-2">
            {Object.entries(summary.byType || {}).map(([type, count]: [string, any]) => (
              <div key={type} className="flex justify-between text-sm">
                <span className="text-gray-600">{type}</span>
                <span className="font-medium">{count} ({((count / summary.total) * 100).toFixed(1)}%)</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-bold mb-3">By Status</h3>
          <div className="space-y-2">
            {Object.entries(summary.byStatus || {}).map(([status, count]: [string, any]) => (
              <div key={status} className="flex justify-between text-sm">
                <span className="text-gray-600">{status}</span>
                <span className="font-medium">{count} ({((count / summary.total) * 100).toFixed(1)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionMonitor;
