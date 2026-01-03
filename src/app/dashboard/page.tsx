"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { AchievementGallery, ReputationLevelDisplay, ReputationProgression } from "@/components/AchievementBadges";
import { ChainSelector } from "@/components/ChainSelector";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { Leaderboard } from "@/components/Leaderboard";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm text-indigo-200">Multi-chain profile</p>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-slate-300 text-sm">
            Connect your wallet, pick a chain, and manage your on-chain resume across Base and Stacks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ChainSelector />
          <WalletConnectButton />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass-effect rounded-2xl p-5 border border-white/10 col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl font-semibold">Reputation</h2>
              <p className="text-slate-400 text-sm">Score auto-updates as credentials and achievements are verified.</p>
            </div>
            <Link href="/achievements" className="text-indigo-300 text-sm font-semibold">Achievements</Link>
          </div>
          <ReputationLevelDisplay score={640} />
          <ReputationProgression currentScore={640} className="mt-4" />
        </div>

        <div className="glass-effect rounded-2xl p-5 border border-white/10">
          <h2 className="text-xl font-semibold mb-4">Profile actions</h2>
          <div className="space-y-3">
            <Link
              href="/profile/create"
              className="block w-full px-4 py-3 rounded-lg bg-indigo-600 text-white text-center font-semibold hover:bg-indigo-500"
            >
              {isConnected ? "Create or update profile" : "Connect wallet to start"}
            </Link>
            <Link
              href="/credentials"
              className="block w-full px-4 py-3 rounded-lg border border-white/20 text-white text-center font-semibold hover:bg-white/5"
            >
              Manage credentials
            </Link>
            <Link
              href="/achievements"
              className="block w-full px-4 py-3 rounded-lg border border-white/20 text-white text-center font-semibold hover:bg-white/5"
            >
              View achievements
            </Link>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-effect rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Badges</h2>
            <span className="text-sm text-slate-400">Sample data</span>
          </div>
          <AchievementGallery className="grid-cols-3" columns={3} />
        </div>
        <div className="glass-effect rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Top profiles (mock)</h2>
            <Link href="/profile/create" className="text-indigo-300 text-sm font-semibold">Join</Link>
          </div>
          <Leaderboard />
        </div>
      </div>
    </div>
  );
}
