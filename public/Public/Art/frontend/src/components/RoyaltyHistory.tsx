import React, { useEffect, useState } from 'react';
import { fetchRoyaltyHistory, RoyaltyChartData, formatRoyalty } from '../services/royalties';

interface RoyaltyHistoryProps {
  creatorAddress: string;
  nftId?: string;
  limit?: number;
}

/**
 * Royalty History Component - Shows detailed royalty transaction history
 */
export const RoyaltyHistory: React.FC<RoyaltyHistoryProps> = ({
  creatorAddress,
  nftId: _nftId,
  limit = 20
}) => {
  const [history, setHistory] = useState<RoyaltyChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchRoyaltyHistory(creatorAddress, 90);
        setHistory(data.slice(0, limit));
      } catch (err: any) {
        setError(err.message || 'Failed to load royalty history');
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [creatorAddress, limit]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 dark:text-red-400 text-sm">
        {error}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No royalty history available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((record, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex-1">
            <div className="font-medium text-gray-900 dark:text-white">
              {new Date(record.timestamp).toLocaleDateString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {record.salesCount} {record.salesCount === 1 ? 'sale' : 'sales'} • {record.averageRoyaltyPercentage}% avg
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-green-600 dark:text-green-400">
              {formatRoyalty(record.royaltyAmount)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoyaltyHistory;
