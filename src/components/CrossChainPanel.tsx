"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface ChainProfile {
  chain: "Base" | "Stacks";
  chainLogo: string;
  status: "active" | "inactive" | "pending";
  handle: string;
  reputation: number;
  credentialCount: number;
  badgeCount: number;
  blockHeight: number;
  explorer: string;
}

interface CrossChainPanelProps {
  handle: string;
  profiles: ChainProfile[];
}

export function CrossChainPanel({ handle, profiles }: CrossChainPanelProps) {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const chainComparison = [
    {
      metric: "Network Type",
      base: "EVM (Ethereum-compatible)",
      stacks: "UTXO (Bitcoin native)",
    },
    {
      metric: "Settlement",
      base: "Base rollup (fast, ~1s finality)",
      stacks: "Bitcoin L2 (ultimate finality)",
    },
    {
      metric: "Avg Gas Cost",
      base: "$0.01-0.05 per tx",
      stacks: "$0.01-0.03 per tx",
    },
    {
      metric: "Finality",
      base: "~3-5 minutes",
      stacks: "Bitcoin block time (~10 min)",
    },
    {
      metric: "DeFi Ecosystem",
      base: "✓ Large (EVM compatible)",
      stacks: "✓ Growing (Bitcoin backed)",
    },
    {
      metric: "Smart Contracts",
      base: "Solidity",
      stacks: "Clarity",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">
          🌐 Cross-Chain Identity: <span className="text-purple-400">@{handle}</span>
        </h2>
        <p className="text-gray-400">
          Same handle, same reputation, multiple chains. Infinite credibility.
        </p>
      </div>

      {/* Chain Profiles Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-2 gap-6"
      >
        {profiles.map((profile, idx) => (
          <motion.div
            key={profile.chain}
            variants={item}
            className={`relative rounded-2xl p-6 border overflow-hidden ${
              profile.chain === "Base"
                ? "bg-blue-500/5 border-blue-500/30"
                : "bg-orange-500/5 border-orange-500/30"
            }`}
          >
            {/* Status Badge */}
            <div className="absolute top-4 right-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  profile.status === "active"
                    ? "bg-green-500/20 text-green-300"
                    : "bg-gray-500/20 text-gray-300"
                }`}
              >
                {profile.status === "active" ? "✓ Active" : "○ Inactive"}
              </span>
            </div>

            {/* Chain Header */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">{profile.chainLogo}</span>
              <div>
                <h3 className="text-xl font-bold text-white">{profile.chain}</h3>
                {profile.chain === "Base" ? (
                  <p className="text-xs text-blue-300">EVM Layer 2</p>
                ) : (
                  <p className="text-xs text-orange-300">Bitcoin Layer 2</p>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-xs text-gray-400">Reputation</p>
                <p className="text-2xl font-bold text-white">
                  {profile.reputation}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-xs text-gray-400">Credentials</p>
                <p className="text-2xl font-bold text-white">
                  {profile.credentialCount}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-xs text-gray-400">Badges</p>
                <p className="text-2xl font-bold text-white">
                  {profile.badgeCount}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-xs text-gray-400">Block Height</p>
                <p className="text-lg font-bold text-white">
                  {profile.blockHeight.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Action Link */}
            <a
              href={profile.explorer}
              target="_blank"
              rel="noopener noreferrer"
              className={`block w-full text-center py-2 rounded-lg font-semibold transition-all ${
                profile.chain === "Base"
                  ? "bg-blue-500/20 text-blue-300 hover:bg-blue-500/40"
                  : "bg-orange-500/20 text-orange-300 hover:bg-orange-500/40"
              }`}
            >
              View on Explorer ↗
            </a>
          </motion.div>
        ))}
      </motion.div>

      {/* Chain Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl overflow-hidden border border-white/10"
      >
        <div className="bg-white/5 p-6">
          <h3 className="text-2xl font-bold mb-6">Base vs Stacks Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">
                    Metric
                  </th>
                  <th className="text-left py-3 px-4 text-blue-300 font-semibold">
                    Base (EVM)
                  </th>
                  <th className="text-left py-3 px-4 text-orange-300 font-semibold">
                    Stacks (Bitcoin)
                  </th>
                </tr>
              </thead>
              <tbody>
                {chainComparison.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-4 text-gray-300 font-medium">
                      {row.metric}
                    </td>
                    <td className="py-3 px-4 text-blue-100">{row.base}</td>
                    <td className="py-3 px-4 text-orange-100">{row.stacks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Why Both Chains Matter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid md:grid-cols-2 gap-6"
      >
        <div className="rounded-2xl p-6 bg-blue-500/10 border border-blue-500/30">
          <h4 className="text-lg font-bold text-blue-300 mb-3">🔵 Base: Speed & Scale</h4>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>• ⚡ Fast finality (~1 second)</li>
            <li>• 💰 Lowest gas costs on EVM</li>
            <li>• 🏢 Enterprise adoption</li>
            <li>• 🔌 Full Ethereum compatibility</li>
            <li>• 📈 Largest L2 ecosystem</li>
          </ul>
        </div>

        <div className="rounded-2xl p-6 bg-orange-500/10 border border-orange-500/30">
          <h4 className="text-lg font-bold text-orange-300 mb-3">🧡 Stacks: Bitcoin Security</h4>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>• ⛓️ Ultimate finality via Bitcoin</li>
            <li>• 🔒 Most secure settlement layer</li>
            <li>• 🌍 Brings smart contracts to Bitcoin</li>
            <li>• 💎 Bitcoin holder appeal</li>
            <li>• 🚀 Next-gen Bitcoin ecosystem</li>
          </ul>
        </div>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl p-6 bg-gradient-to-r from-blue-500/10 to-orange-500/10 border border-blue-500/20 text-center"
      >
        <h3 className="text-xl font-bold mb-2">Ready for Multi-Chain Identity?</h3>
        <p className="text-gray-300 mb-4">
          Create your professional profile once. Own it everywhere. Verify it forever.
        </p>
        <Link
          href="/profile/create"
          className="inline-block px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-orange-600 text-white font-semibold hover:opacity-90 transition-opacity"
        >
          Create Profile on Base
        </Link>
      </motion.div>
    </div>
  );
}
