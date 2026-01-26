import React, { useEffect, useState } from 'react';
import { fetchMarketplaceStats, MarketplaceStats, formatVolume, formatCurrency } from '../services/analytics';

/**
 * Stat card component
 */
const StatCard: React.FC<{
  label: string;
  value: string | number;
  unit?: string;
  icon: string;
  trend?: number;
  className?: string;
}> = ({ label, value, unit, icon, trend, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {value}
          </p>
          {unit && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{unit}</p>
          )}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
      {trend !== undefined && (
        <div className={`mt-4 text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last week
        </div>
      )}
    </div>
  );
};

/**
 * Marketplace Analytics Dashboard
 */
export const MarketplaceAnalytics: React.FC = () => {
  const [stats, setStats] = useState<MarketplaceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchMarketplaceStats();
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load marketplace statistics');
        console.error('Error loading stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
    
    // Refresh stats every 5 minutes
    const interval = setInterval(loadStats, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin">
          <svg className="w-8 h-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">{error || 'Failed to load statistics'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Marketplace Analytics</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Last updated: {new Date(stats.lastUpdated).toLocaleString()}
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Volume"
          value={formatVolume(stats.totalVolume)}
          unit="ETH"
          icon="📊"
          trend={12.5}
        />
        
        <StatCard
          label="Total Sales"
          value={stats.totalSales.toLocaleString()}
          unit="transactions"
          icon="💰"
          trend={8.3}
        />
        
        <StatCard
          label="Active Listings"
          value={stats.activeListing.toLocaleString()}
          unit="NFTs"
          icon="📦"
          trend={-2.1}
        />
        
        <StatCard
          label="Unique Creators"
          value={stats.uniqueCreators.toLocaleString()}
          unit="creators"
          icon="👨‍🎨"
          trend={5.7}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Unique Collectors"
          value={stats.uniqueCollectors.toLocaleString()}
          unit="collectors"
          icon="👥"
        />
        
        <StatCard
          label="Floor Price"
          value={formatCurrency(stats.floorPrice)}
          unit="minimum"
          icon="📈"
        />
        
        <StatCard
          label="Average Price"
          value={formatCurrency(stats.averagePrice)}
          unit="per sale"
          icon="💎"
        />
      </div>

      {/* Marketplace Health Summary */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Marketplace Health</h3>
        
        <div className="space-y-4">
          {/* Health Indicator */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Liquidity Score
              </span>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                92/100
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Activity Level
              </span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                78/100
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '78%' }}></div>
            </div>
          </div>

          {/* Creator Activity */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Creator Activity
              </span>
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                85/100
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Avg. Sale Price</span>
            <span className="font-bold text-gray-900 dark:text-white">
              {formatCurrency(stats.averagePrice)}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Floor Price</span>
            <span className="font-bold text-gray-900 dark:text-white">
              {formatCurrency(stats.floorPrice)}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Listings/Creators</span>
            <span className="font-bold text-gray-900 dark:text-white">
              {(stats.activeListing / stats.uniqueCreators).toFixed(1)} avg
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Sales/Creator</span>
            <span className="font-bold text-gray-900 dark:text-white">
              {(stats.totalSales / stats.uniqueCreators).toFixed(1)} avg
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceAnalytics;
