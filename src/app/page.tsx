"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { AnimatedTimeline } from "@/components/AnimatedTimeline";
import { AchievementGallery } from "@/components/AchievementBadges";
import { WalletConnectButton } from "@/components/WalletConnectButton";

export default function HomePage() {
  const { isConnected } = useAccount();

  return (
    <div className="space-y-12">
      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.2em] text-indigo-300">Base + Stacks</p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Build a verifiable on-chain resume with credentials, achievements, and reputation.
          </h1>
          <p className="text-lg text-slate-300">
            Create your profile on Base Mainnet, mirror to Stacks, attach IPFS-hosted content, and prove your achievements with tamper-proof credentials.
          </p>
          <div className="flex flex-wrap gap-3">
            {isConnected ? (
              <>
                <Link
                  href="/profile/create"
                  className="px-5 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold shadow-lg shadow-blue-500/30"
                >
                  Create your profile
                </Link>
                <Link
                  href="/dashboard"
                  className="px-5 py-3 rounded-lg border border-white/20 text-white font-semibold hover:bg-white/10"
                >
                  View dashboard
                </Link>
              </>
            ) : (
              <WalletConnectButton />
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span>✔ Base Mainnet contract ready</span>
            <span>✔ Stacks L2 support</span>
            <span>✔ IPFS storage included</span>
          </div>
        </div>
        <div className="glass-effect rounded-2xl p-6 border border-white/10 shadow-2xl">
          <h3 className="text-xl font-semibold mb-4">Achievement badge system</h3>
          <AchievementGallery className="grid-cols-3" columns={3} />
          <div className="mt-6 text-sm text-slate-300">
            Unlock badges as you add verified credentials and contributions. NFT minting optional per badge.
          </div>
        </div>
      </section>

      <section className="glass-effect rounded-2xl p-6 border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-semibold">Career timeline</h2>
            <p className="text-slate-300 text-sm">Animate roles, milestones, and releases pulled from on-chain data.</p>
          </div>
          <Link
            href="/achievements"
            className="text-indigo-300 hover:text-indigo-200 text-sm font-semibold"
          >
            View achievements
          </Link>
        </div>
        <AnimatedTimeline events={[]} />
      </section>
    </div>
  );
}
