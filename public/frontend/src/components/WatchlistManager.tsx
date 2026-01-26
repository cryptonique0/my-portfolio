import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

interface WatchlistItem {
  wallet: string;
  name: string;
  addedAt: number;
  lastUpdated: number;
  metrics?: {
    totalAllocated: bigint;
    totalClaimed: bigint;
    totalPending: bigint;
    claimPercentage: number;
  };
}

/**
 * WatchlistManager Component
 * Manage and organize wallet watchlists with bulk operations
 */
const WatchlistManager: React.FC = () => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">(
    "all"
  );
  const [selectedWallets, setSelectedWallets] = useState<Set<string>>(new Set());
  const [newWalletName, setNewWalletName] = useState("");
  const [newWalletAddress, setNewWalletAddress] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [sortBy, setSortBy] = useState<"added" | "updated" | "name">("added");

  // Load watchlist on mount
  useEffect(() => {
    loadWatchlist();
    const interval = setInterval(loadWatchlist, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadWatchlist = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/wallets/watchlist/all");
      const data = await response.json();
      setWatchlist(data);
    } catch (error) {
      console.error("Error loading watchlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const addWalletToWatchlist = async () => {
    if (!ethers.isAddress(newWalletAddress)) {
      alert("Invalid wallet address");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/wallets/watchlist/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: newWalletAddress,
          name: newWalletName || ethers.getAddress(newWalletAddress)
        })
      });

      if (response.ok) {
        setNewWalletName("");
        setNewWalletAddress("");
        setShowAddForm(false);
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
      await fetch("/api/wallets/watchlist/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet })
      });
      await loadWatchlist();
      selectedWallets.delete(wallet);
      setSelectedWallets(new Set(selectedWallets));
    } catch (error) {
      console.error("Error removing wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  const bulkRemoveWallets = async () => {
    if (selectedWallets.size === 0) {
      alert("No wallets selected");
      return;
    }

    if (!confirm(`Remove ${selectedWallets.size} wallets from watchlist?`)) {
      return;
    }

    try {
      setLoading(true);
      await fetch("/api/wallets/watchlist/bulk-remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallets: Array.from(selectedWallets) })
      });
      await loadWatchlist();
      setSelectedWallets(new Set());
    } catch (error) {
      console.error("Error removing wallets:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateWalletName = async (wallet: string, newName: string) => {
    try {
      await fetch("/api/wallets/watchlist/update-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet, name: newName })
      });
      await loadWatchlist();
    } catch (error) {
      console.error("Error updating wallet name:", error);
    }
  };

  const toggleWalletSelection = (wallet: string) => {
    const newSelected = new Set(selectedWallets);
    if (newSelected.has(wallet)) {
      newSelected.delete(wallet);
    } else {
      newSelected.add(wallet);
    }
    setSelectedWallets(newSelected);
  };

  const toggleAllSelection = () => {
    if (selectedWallets.size === getFilteredWatchlist().length) {
      setSelectedWallets(new Set());
    } else {
      const all = new Set(
        getFilteredWatchlist().map((item) => item.wallet)
      );
      setSelectedWallets(all);
    }
  };

  const getFilteredWatchlist = () => {
    let filtered = watchlist;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.wallet.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "added":
          return b.addedAt - a.addedAt;
        case "updated":
          return b.lastUpdated - a.lastUpdated;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return sorted;
  };

  const stats = {
    total: watchlist.length,
    selected: selectedWallets.size
  };

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Watchlist Manager
          </h1>
          <p className="text-gray-600">Organize and manage your wallet watchlist</p>
        </div>

        {/* Add Wallet Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Add New Wallet</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wallet Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Main Wallet"
                  value={newWalletName}
                  onChange={(e) => setNewWalletName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wallet Address
                </label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={newWalletAddress}
                  onChange={(e) => setNewWalletAddress(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={addWalletToWatchlist}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Adding..." : "Add Wallet"}
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewWalletName("");
                    setNewWalletAddress("");
                  }}
                  className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Search and Filters */}
            <div className="flex gap-4 flex-1">
              <input
                type="text"
                placeholder="Search wallets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "added" | "updated" | "name")
                }
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="added">Newest Added</option>
                <option value="updated">Recently Updated</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {stats.selected > 0 && (
                <button
                  onClick={bulkRemoveWallets}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Remove {stats.selected}
                </button>
              )}
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + Add Wallet
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 text-sm text-gray-600">
            {stats.selected > 0 ? (
              <p>
                {stats.selected} of {stats.total} wallets selected
              </p>
            ) : (
              <p>Total wallets: {stats.total}</p>
            )}
          </div>
        </div>

        {/* Watchlist Table */}
        {loading && watchlist.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading watchlist...</p>
          </div>
        ) : getFilteredWatchlist().length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600">No wallets in watchlist</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Your First Wallet
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedWallets.size ===
                          getFilteredWatchlist().length &&
                          getFilteredWatchlist().length > 0
                        }
                        onChange={toggleAllSelection}
                        className="w-4 h-4"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Added
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredWatchlist().map((item) => (
                    <WatchlistRow
                      key={item.wallet}
                      item={item}
                      isSelected={selectedWallets.has(item.wallet)}
                      onToggleSelect={() => toggleWalletSelection(item.wallet)}
                      onRemove={() => removeWallet(item.wallet)}
                      onUpdateName={(newName) =>
                        updateWalletName(item.wallet, newName)
                      }
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * WatchlistRow Component
 */
interface WatchlistRowProps {
  item: WatchlistItem;
  isSelected: boolean;
  onToggleSelect: () => void;
  onRemove: () => void;
  onUpdateName: (name: string) => void;
}

const WatchlistRow: React.FC<WatchlistRowProps> = ({
  item,
  isSelected,
  onToggleSelect,
  onRemove,
  onUpdateName
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);

  const handleSaveName = () => {
    if (editName.trim()) {
      onUpdateName(editName);
      setIsEditing(false);
    }
  };

  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp * 1000) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <tr className="border-b hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="w-4 h-4"
        />
      </td>

      <td className="px-6 py-4">
        {isEditing ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleSaveName();
              }}
              className="px-2 py-1 border border-gray-300 rounded flex-1"
              autoFocus
            />
            <button
              onClick={handleSaveName}
              className="text-green-600 hover:text-green-700"
            >
              ✓
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-red-600 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        ) : (
          <div
            className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
            onClick={() => setIsEditing(true)}
          >
            {item.name}
          </div>
        )}
      </td>

      <td className="px-6 py-4">
        <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
          {item.wallet.slice(0, 10)}...{item.wallet.slice(-8)}
        </code>
      </td>

      <td className="px-6 py-4">
        <span className="text-sm text-gray-600">{timeAgo(item.addedAt)}</span>
      </td>

      <td className="px-6 py-4">
        <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Active
        </span>
      </td>

      <td className="px-6 py-4">
        <button
          onClick={onRemove}
          className="text-red-600 hover:text-red-700 text-sm font-medium"
        >
          Remove
        </button>
      </td>
    </tr>
  );
};

export default WatchlistManager;
