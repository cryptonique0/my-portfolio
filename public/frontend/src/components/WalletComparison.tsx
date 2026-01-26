import React, { useState } from "react";
import { ethers } from "ethers";

interface ComparisonMetrics {
  wallet1: WalletComparisonData;
  wallet2: WalletComparisonData;
  percentDifference: {
    allocated: number;
    claimed: number;
    pending: number;
    campaigns: number;
  };
}

interface WalletComparisonData {
  address: string;
  name: string;
  totalAllocated: bigint;
  totalClaimed: bigint;
  totalPending: bigint;
  numCampaigns: number;
  numChains: number;
  claimPercentage: number;
}

/**
 * WalletComparison Component
 * Side-by-side comparison of two wallets
 */
const WalletComparison: React.FC = () => {
  const [wallet1, setWallet1] = useState("");
  const [wallet2, setWallet2] = useState("");
  const [comparison, setComparison] = useState<ComparisonMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const compareWallets = async () => {
    if (!ethers.isAddress(wallet1) || !ethers.isAddress(wallet2)) {
      setError("Invalid wallet address");
      return;
    }

    if (wallet1.toLowerCase() === wallet2.toLowerCase()) {
      setError("Cannot compare wallet with itself");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/wallets/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet1, wallet2 })
      });

      if (!response.ok) {
        throw new Error("Failed to compare wallets");
      }

      const data = await response.json();
      setComparison(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const swapWallets = () => {
    const temp = wallet1;
    setWallet1(wallet2);
    setWallet2(temp);
    setComparison(null);
  };

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Wallet Comparison
          </h1>
          <p className="text-gray-600">
            Compare metrics between two wallets side-by-side
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Select Wallets to Compare</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Wallet 1 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Wallet
              </label>
              <input
                type="text"
                placeholder="Enter wallet address"
                value={wallet1}
                onChange={(e) => setWallet1(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Wallet 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Second Wallet
              </label>
              <input
                type="text"
                placeholder="Enter wallet address"
                value={wallet2}
                onChange={(e) => setWallet2(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={compareWallets}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Comparing..." : "Compare"}
            </button>
            <button
              onClick={swapWallets}
              disabled={loading}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 disabled:opacity-50"
            >
              ⇄ Swap
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Comparison Results */}
        {comparison && (
          <div className="space-y-6">
            {/* Main Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <WalletComparisonCard
                data={comparison.wallet1}
                comparison={comparison.percentDifference}
                isFirst={true}
              />
              <WalletComparisonCard
                data={comparison.wallet2}
                comparison={comparison.percentDifference}
                isFirst={false}
              />
            </div>

            {/* Detailed Comparison */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-6">Detailed Comparison</h3>

              <div className="space-y-4">
                <ComparisonRow
                  label="Total Allocated"
                  value1={ethers.formatEther(comparison.wallet1.totalAllocated)}
                  value2={ethers.formatEther(comparison.wallet2.totalAllocated)}
                  percentDiff={comparison.percentDifference.allocated}
                />
                <ComparisonRow
                  label="Total Claimed"
                  value1={ethers.formatEther(comparison.wallet1.totalClaimed)}
                  value2={ethers.formatEther(comparison.wallet2.totalClaimed)}
                  percentDiff={comparison.percentDifference.claimed}
                />
                <ComparisonRow
                  label="Pending Claims"
                  value1={ethers.formatEther(comparison.wallet1.totalPending)}
                  value2={ethers.formatEther(comparison.wallet2.totalPending)}
                  percentDiff={comparison.percentDifference.pending}
                />
                <ComparisonRow
                  label="Campaigns"
                  value1={comparison.wallet1.numCampaigns.toString()}
                  value2={comparison.wallet2.numCampaigns.toString()}
                  percentDiff={comparison.percentDifference.campaigns}
                  isNumeric={true}
                />
              </div>
            </div>

            {/* Winner Indicators */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-md p-6 border border-green-200">
              <h3 className="text-lg font-semibold mb-4">Key Insights</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InsightCard
                  label="Higher Allocation"
                  winner={
                    comparison.wallet1.totalAllocated >
                    comparison.wallet2.totalAllocated
                      ? comparison.wallet1.name
                      : comparison.wallet2.name
                  }
                  value={ethers.formatEther(
                    comparison.wallet1.totalAllocated >
                      comparison.wallet2.totalAllocated
                      ? comparison.wallet1.totalAllocated
                      : comparison.wallet2.totalAllocated
                  )}
                />
                <InsightCard
                  label="More Claims"
                  winner={
                    comparison.wallet1.totalClaimed >
                    comparison.wallet2.totalClaimed
                      ? comparison.wallet1.name
                      : comparison.wallet2.name
                  }
                  value={ethers.formatEther(
                    comparison.wallet1.totalClaimed >
                      comparison.wallet2.totalClaimed
                      ? comparison.wallet1.totalClaimed
                      : comparison.wallet2.totalClaimed
                  )}
                />
                <InsightCard
                  label="More Campaigns"
                  winner={
                    comparison.wallet1.numCampaigns >
                    comparison.wallet2.numCampaigns
                      ? comparison.wallet1.name
                      : comparison.wallet2.name
                  }
                  value={
                    (comparison.wallet1.numCampaigns >
                    comparison.wallet2.numCampaigns
                      ? comparison.wallet1.numCampaigns
                      : comparison.wallet2.numCampaigns
                    ).toString()
                  }
                />
              </div>
            </div>
          </div>
        )}

        {!comparison && !loading && wallet1 && wallet2 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <p className="text-blue-700">Click "Compare" to analyze these wallets</p>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * WalletComparisonCard Component
 */
interface WalletComparisonCardProps {
  data: WalletComparisonData;
  comparison: {
    allocated: number;
    claimed: number;
    pending: number;
    campaigns: number;
  };
  isFirst: boolean;
}

const WalletComparisonCard: React.FC<WalletComparisonCardProps> = ({
  data,
  comparison,
  isFirst
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500">
      <h3 className="text-xl font-semibold mb-4">{data.name || "Unnamed"}</h3>
      <p className="text-sm text-gray-600 font-mono mb-4">
        {data.address.slice(0, 10)}...{data.address.slice(-8)}
      </p>

      {/* Claim Percentage */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Claim Progress</span>
          <span className="text-lg font-bold text-blue-600">
            {data.claimPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full"
            style={{ width: `${data.claimPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatBox label="Allocated" value={ethers.formatEther(data.totalAllocated)} />
        <StatBox label="Claimed" value={ethers.formatEther(data.totalClaimed)} />
        <StatBox label="Pending" value={ethers.formatEther(data.totalPending)} />
        <StatBox label="Campaigns" value={data.numCampaigns.toString()} />
      </div>
    </div>
  );
};

/**
 * ComparisonRow Component
 */
interface ComparisonRowProps {
  label: string;
  value1: string;
  value2: string;
  percentDiff: number;
  isNumeric?: boolean;
}

const ComparisonRow: React.FC<ComparisonRowProps> = ({
  label,
  value1,
  value2,
  percentDiff,
  isNumeric = false
}) => {
  const val1 = parseFloat(value1);
  const val2 = parseFloat(value2);
  const winner = val1 > val2 ? 1 : val2 > val1 ? 2 : 0;

  return (
    <div className="flex items-center justify-between border-b border-gray-200 pb-4">
      <span className="font-medium text-gray-700 min-w-40">{label}</span>

      <div className="flex gap-8 flex-1 justify-between items-center">
        <div
          className={`text-right px-4 py-2 rounded ${
            winner === 1 ? "bg-green-100" : ""
          }`}
        >
          <p className="font-semibold">
            {isNumeric ? val1.toFixed(0) : val1.toFixed(4)}
          </p>
          {winner === 1 && <p className="text-xs text-green-600">Winner</p>}
        </div>

        <div className="text-center">
          <p className="text-sm font-medium text-gray-600">
            {Math.abs(percentDiff).toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500">
            {percentDiff > 0 ? "First ↑" : percentDiff < 0 ? "Second ↑" : "Equal"}
          </p>
        </div>

        <div
          className={`text-right px-4 py-2 rounded ${
            winner === 2 ? "bg-green-100" : ""
          }`}
        >
          <p className="font-semibold">
            {isNumeric ? val2.toFixed(0) : val2.toFixed(4)}
          </p>
          {winner === 2 && <p className="text-xs text-green-600">Winner</p>}
        </div>
      </div>
    </div>
  );
};

/**
 * StatBox Component
 */
interface StatBoxProps {
  label: string;
  value: string;
}

const StatBox: React.FC<StatBoxProps> = ({ label, value }) => (
  <div className="bg-gray-50 rounded p-3">
    <p className="text-xs text-gray-600 mb-1">{label}</p>
    <p className="font-semibold text-gray-900 text-sm">
      {parseFloat(value).toFixed(2)}
    </p>
  </div>
);

/**
 * InsightCard Component
 */
interface InsightCardProps {
  label: string;
  winner: string;
  value: string;
}

const InsightCard: React.FC<InsightCardProps> = ({ label, winner, value }) => (
  <div className="bg-white rounded-lg p-4 border border-green-200">
    <p className="text-sm text-gray-600 mb-2">{label}</p>
    <p className="font-semibold text-green-600 mb-1">{winner}</p>
    <p className="text-sm text-gray-700">{parseFloat(value).toFixed(2)}</p>
  </div>
);

export default WalletComparison;
