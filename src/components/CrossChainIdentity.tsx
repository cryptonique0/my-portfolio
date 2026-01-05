"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface ChainProfile {
  name: string;
  icon: string;
  network: string;
  address: string;
  status: "active" | "pending" | "not-deployed";
  contractAddress: string;
  profileLink: string;
  features: string[];
  gasEstimate: string;
}

interface CrossChainIdentityProps {
  handle: string;
  profiles?: ChainProfile[];
}

/**
 * Cross-Chain Identity Panel
 * Shows same professional identity across Base (EVM) and Stacks (Bitcoin L2)
 */
export function CrossChainIdentity({ handle, profiles }: CrossChainIdentityProps) {
  const defaultProfiles: ChainProfile[] = [
    {
      name: "Base Mainnet",
      icon: "🔵",
      network: "EVM L2 (Optimistic Rollup)",
      address: "0x742d...9c4f",
      status: "active",
      contractAddress: "0x1234...5678",
      profileLink: "https://basescan.org/address/0x742d...9c4f",
      features: [
        "Fast finality (~2 min)",
        "Low gas ($0.01-0.05)",
        "EVM compatible",
      ],
      gasEstimate: "~50K",
    },
    {
      name: "Stacks Mainnet",
      icon: "🧡",
      network: "Bitcoin L2 (UTXO)",
      address: "SP1234...5678",
      status: "active",
      contractAddress: "SP1234...5678",
      profileLink: "https://explorer.stacks.co/address/SP1234...5678",
      features: [
        "Bitcoin finality",
        "Cheapest settlement",
        "Clarity language",
      ],
      gasEstimate: "~2000 μSTX",
    },
  ];

  const displayProfiles = profiles || defaultProfiles;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">🌐 Cross-Chain Identity</h2>
        <p className="text-gray-400 text-sm">
          Same professional profile, multiple blockchains, one reputation
        </p>
      </div>

      {/* Chain Comparison Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid md:grid-cols-2 gap-6"
      >
        {displayProfiles.map((profile, idx) => (
          <motion.div
            key={profile.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900/50 to-purple-900/50 border border-white/10 p-6 hover:border-white/20 transition-all"
          >
            {/* Chain Badge */}
            <div className="absolute top-4 right-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  profile.status === "active"
                    ? "bg-green-500/20 text-green-300 border border-green-500/30"
                    : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                }`}
              >
                {profile.status === "active" ? "✓ Active" : "⏳ Pending"}
              </motion.div>
            </div>

            {/* Chain Icon & Name */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{profile.icon}</span>
              <div>
                <h3 className="text-xl font-bold text-white">{profile.name}</h3>
                <p className="text-sm text-gray-400">{profile.network}</p>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-3 mb-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Wallet Address</p>
                <code className="text-sm bg-black/30 px-3 py-2 rounded border border-white/10 text-purple-300 block">
                  {profile.address}
                </code>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Contract Address</p>
                <code className="text-sm bg-black/30 px-3 py-2 rounded border border-white/10 text-cyan-300 block">
                  {profile.contractAddress}
                </code>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2 mb-4">
              <p className="text-xs text-gray-500 font-semibold">Key Features</p>
              <ul className="space-y-1">
                {profile.features.map((feature) => (
                  <li key={feature} className="text-sm text-gray-300 flex items-center gap-2">
                    <span className="text-purple-400">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Gas Estimate */}
            <div className="p-3 rounded-lg bg-white/5 border border-white/10 mb-4">
              <p className="text-xs text-gray-400">Est. Gas per Tx</p>
              <p className="text-lg font-bold text-white">{profile.gasEstimate}</p>
            </div>

            {/* View on Explorer */}
            <a
              href={profile.profileLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all"
            >
              View on Explorer ↗
            </a>
          </motion.div>
        ))}
      </motion.div>

      {/* Unified Identity Explanation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">
          🔐 One Identity, Two Networks
        </h3>
        <div className="space-y-3 text-sm text-gray-300">
          <p>
            Your professional identity is replicated across Base and Stacks with the same handle
            <code className="bg-black/30 px-2 py-1 rounded text-purple-300 mx-1">@{handle}</code>.
          </p>
          <p>
            Credentials verified on one chain are instantly recognized across both networks through
            a shared reputation ledger, giving you maximum credibility.
          </p>
          <p className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            <span>
              <strong>Base</strong> for speed and affordability
            </span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-orange-400">✓</span>
            <span>
              <strong>Stacks</strong> for Bitcoin-backed security and ultimate finality
            </span>
          </p>
        </div>
      </motion.div>

      {/* EVM vs Bitcoin L2 Comparison Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl bg-slate-900/50 border border-white/10 p-6 overflow-x-auto"
      >
        <h3 className="text-lg font-semibold text-white mb-4">
          ⚙️ Technical Comparison
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-2 px-2 text-gray-300 font-semibold">Aspect</th>
              <th className="text-left py-2 px-2 text-blue-300 font-semibold">Base (EVM)</th>
              <th className="text-left py-2 px-2 text-orange-300 font-semibold">Stacks (UTXO)</th>
            </tr>
          </thead>
          <tbody className="space-y-1">
            {[
              {
                aspect: "VM Model",
                base: "EVM (Account-based)",
                stacks: "UTXO + Clarity",
              },
              {
                aspect: "Finality",
                base: "~2 minutes",
                stacks: "Bitcoin finality (~10 min)",
              },
              {
                aspect: "Gas Cost",
                base: "$0.01–0.05 USD",
                stacks: "~2000 μSTX (~$0.10)",
              },
              {
                aspect: "Settlement",
                base: "Rollup batches",
                stacks: "Bitcoin anchors",
              },
              {
                aspect: "Smart Contract Lang",
                base: "Solidity",
                stacks: "Clarity (non-Turing)",
              },
              {
                aspect: "Security Model",
                base: "EVM security + Optimism",
                stacks: "Bitcoin consensus",
              },
            ].map((row) => (
              <tr key={row.aspect} className="border-b border-white/5 hover:bg-white/5">
                <td className="py-3 px-2 text-gray-300 font-semibold">{row.aspect}</td>
                <td className="py-3 px-2 text-blue-200">{row.base}</td>
                <td className="py-3 px-2 text-orange-200">{row.stacks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Why Multi-Chain Matters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid md:grid-cols-2 gap-4"
      >
        <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 p-4">
          <h4 className="text-sm font-bold text-blue-300 mb-2">Base Advantage</h4>
          <p className="text-xs text-gray-300">
            High throughput, low cost, EVM familiar ecosystem. Perfect for frequent updates and
            rapid credential issuance.
          </p>
        </div>
        <div className="rounded-lg bg-orange-500/10 border border-orange-500/30 p-4">
          <h4 className="text-sm font-bold text-orange-300 mb-2">Stacks Advantage</h4>
          <p className="text-xs text-gray-300">
            Bitcoin security, trustless settlement, DeFi composability. Unmatched credibility for
            institutional adoption.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
