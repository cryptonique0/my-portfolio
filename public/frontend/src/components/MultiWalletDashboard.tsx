import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

interface WalletMetrics {
  address: string;
  name: string;
  totalAllocated: bigint;
  totalClaimed: bigint;
  totalPending: bigint;
  numCampaigns: number;
  numChains: number;
  claimPercentage: number;
}

interface Watchlist {
  wallet: string;
  metrics: WalletMetrics;
}

/**
 * MultiWalletDashboard Component
 * Monitor multiple wallets with real-time metrics
 */
const MultiWalletDashboard: React.FC = () => {
  const [watchlist, setWatchlist] = useState<Watchlist[]>([]);
  const [newWallet, setNewWallet] = useState("");
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<"allocated" | "claimed" | "name">(
    "allocated"
  );
  const [filterChain, setFilterChain] = useState<number | null>(null);

  // Load watchlist on mount
  useEffect(() => {
    loadWatchlist();
    const interval = setInterval(loadWatchlist, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadWatchlist = async () => {
    try {
      setLoading(true);
      // Fetch from backend
      const response = await fetch("/api/wallets/watchlist");
      const data = await response.json();
      setWatchlist(data);
    } catch (error) {
      console.error("Error loading watchlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const addWallet = async () => {
    if (!ethers.isAddress(newWallet)) {
      alert("Invalid wallet address");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/wallets/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: newWallet })
      });

      if (response.ok) {
        setNewWallet("");
        await loadWatchlist();
      }
    } catch (error) {
      console.error("Error adding wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeWallet = async (wallet: string) => {
    try {
      setLoading(true);
      await fetch("/api/wallets/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet })
      });
      await loadWatchlist();
    } catch (error) {
      console.error("Error removing wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSortedWatchlist = () => {
    const sorted = [...watchlist].sort((a, b) => {
      const metricsA = a.metrics;
      const metricsB = b.metrics;

      switch (sortBy) {
        case "allocated":
          return Number(metricsB.totalAllocated - metricsA.totalAllocated);
        case "claimed":
          return Number(metricsB.totalClaimed - metricsA.totalClaimed);
        case "name":
          return metricsA.name.localeCompare(metricsB.name);
        default:
          return 0;
      }
    });

    return sorted;
  };

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Multi-Wallet Tracker
          </h1>
          <p className="text-gray-600">Monitor multiple wallets across chains</p>
        </div>

        {/* Add Wallet Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add Wallet to Watchlist</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter wallet address or ENS name"
              value={newWallet}
              onChange={(e) => setNewWallet(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addWallet}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Add Wallet"}
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex justify-between items-center">
          <div className="flex gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Sort by:
              </label>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "allocated" | "claimed" | "name")
                }
                className="mt-1 px-3 py-1 border border-gray-300 rounded-lg"
              >
                <option value="allocated">Total Allocated</option>
                <option value="claimed">Total Claimed</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Total Wallets: {watchlist.length}
          </div>
        </div>

        {/* Watchlist Grid */}
        {loading && watchlist.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading wallets...</p>
          </div>
        ) : watchlist.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600">No wallets in watchlist yet</p>
            <p className="text-sm text-gray-500">Add a wallet to get started</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {getSortedWatchlist().map((item) => (
              <WalletCard
                key={item.wallet}
                wallet={item.wallet}
                metrics={item.metrics}
                onRemove={removeWallet}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * WalletCard Component
 * Individual wallet metrics display
 */
interface WalletCardProps {
  wallet: string;
  metrics: WalletMetrics;
  onRemove: (wallet: string) => void;
}

const WalletCard: React.FC<WalletCardProps> = ({ wallet, metrics, onRemove }) => {
  const [expanded, setExpanded] = useState(false);

  const allocatedFormatted = ethers.formatEther(metrics.totalAllocated);
  const claimedFormatted = ethers.formatEther(metrics.totalClaimed);
  const pendingFormatted = ethers.formatEther(metrics.totalPending);

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-lg">{metrics.name || "Unnamed"}</h3>
            <p className="text-sm text-blue-100 font-mono text-xs">
              {wallet.slice(0, 10)}...{wallet.slice(-8)}
            </p>
          </div>
          <button
            onClick={() => onRemove(wallet)}
            className="text-red-300 hover:text-red-100"
            title="Remove from watchlist"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="p-4">
        {/* Claim Progress */}
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">
              Claim Progress
            </span>
            <span className="text-sm font-bold text-blue-600">
              {metrics.claimPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${metrics.claimPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded p-2">
            <p className="text-xs text-gray-600">Allocated</p>
            <p className="font-semibold text-gray-900">
              {parseFloat(allocatedFormatted).toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <p className="text-xs text-gray-600">Claimed</p>
            <p className="font-semibold text-green-600">
              {parseFloat(claimedFormatted).toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <p className="text-xs text-gray-600">Pending</p>
            <p className="font-semibold text-orange-600">
              {parseFloat(pendingFormatted).toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <p className="text-xs text-gray-600">Campaigns</p>
            <p className="font-semibold text-gray-900">{metrics.numCampaigns}</p>
          </div>
        </div>

        {/* Chains Badge */}
        <div className="mb-4">
          <p className="text-xs text-gray-600 mb-2">Networks</p>
          <div className="flex gap-2 flex-wrap">
            {[...Array(metrics.numChains)].map((_, i) => (
              <span
                key={i}
                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
              >
                Chain {i + 1}
              </span>
            ))}
          </div>
        </div>

        {/* Expand Button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {expanded ? "Show Less" : "View Details"}
        </button>

        {/* Expanded Details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-2">Full Address</p>
            <p className="font-mono text-xs bg-gray-100 p-2 rounded break-all mb-4">
              {wallet}
            </p>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Allocated:</span>
                <span className="font-semibold">{allocatedFormatted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Claimed:</span>
                <span className="font-semibold text-green-600">
                  {claimedFormatted}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pending:</span>
                <span className="font-semibold text-orange-600">
                  {pendingFormatted}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiWalletDashboard;
