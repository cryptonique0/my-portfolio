import React from 'react';
import { useMarketplaceWebSocket } from '../hooks/useWebSocket';
import { formatCurrency, timeAgo } from '../utils/helpers';

export const LiveActivity: React.FC = () => {
  const { isConnected, newListings, recentSales, activeBids } = useMarketplaceWebSocket();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Live Activity</h2>
        <div className="flex items-center gap-2">
          <span
            className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* New Listings */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            New Listings 📝
          </h3>
          <div className="space-y-3">
            {newListings.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No new listings yet</p>
            ) : (
              newListings.map((listing, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {listing.name}
                  </p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                      {formatCurrency(listing.price)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {timeAgo(listing.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Sales */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Recent Sales 💰
          </h3>
          <div className="space-y-3">
            {recentSales.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No sales yet</p>
            ) : (
              recentSales.map((sale, index) => (
                <div
                  key={index}
                  className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {sale.nftName}
                  </p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-green-600 dark:text-green-400">
                      {formatCurrency(sale.price)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {timeAgo(sale.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Bids */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Active Bids 🔨
          </h3>
          <div className="space-y-3">
            {activeBids.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No active bids</p>
            ) : (
              activeBids.map((bid, index) => (
                <div
                  key={index}
                  className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                >
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {bid.nftName}
                  </p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-yellow-600 dark:text-yellow-400">
                      {formatCurrency(bid.amount)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {timeAgo(bid.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
