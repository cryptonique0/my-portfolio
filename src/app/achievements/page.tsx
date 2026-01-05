"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { AchievementGallery, AchievementBadge } from "@/components/AchievementBadges";
import { AchievementType } from "@/lib/features";

export default function AchievementsPage() {
  const { isConnected, address } = useAccount();
  const [unlockedAchievements, setUnlockedAchievements] = useState<AchievementType[]>([]);
  const [nftTokenIds, setNftTokenIds] = useState<Record<AchievementType, number>>(
    {} as Record<AchievementType, number>
  );

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
        <h1 className="text-4xl font-bold">Achievements</h1>
        <p className="text-slate-400 max-w-md">Connect your wallet to view and unlock achievement badges.</p>
        <WalletConnectButton />
      </div>
    );
  }

  const handleMintNFT = (achievementType: AchievementType) => {
    // TODO: Call smart contract function to mint NFT
    console.log("Minting NFT for:", achievementType);
  };

  const stats = {
    total: Object.keys(AchievementType).length || 10,
    unlocked: unlockedAchievements.length,
    nfts: Object.keys(nftTokenIds).length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Achievements</h1>
        <p className="text-slate-400">Unlock badges as you build your on-chain resume. Mint them as NFTs to prove ownership.</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="text-3xl font-bold text-indigo-400">{stats.unlocked}</div>
          <div className="text-sm text-slate-400">Unlocked Badges</div>
        </div>
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="text-3xl font-bold text-purple-400">{stats.nfts}</div>
          <div className="text-sm text-slate-400">NFT Minted</div>
        </div>
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="text-3xl font-bold text-pink-400">{stats.total}</div>
          <div className="text-sm text-slate-400">Total Available</div>
        </div>
      </div>

      {/* Achievement Gallery */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <h2 className="text-2xl font-bold">Badge Collection</h2>
        <AchievementGallery
          unlockedAchievements={unlockedAchievements}
          nftTokenIds={nftTokenIds}
          columns={4}
        />
        <p className="text-sm text-slate-400">
          Hover over a badge to see details. Unlocked badges with a checkmark can be minted as NFTs.
        </p>
      </div>

      {/* Achievement Categories */}
      <div className="space-y-4">
        {[
          {
            category: "Profile",
            icon: "👤",
            achievements: [
              { name: "First Profile", description: "Create your first profile" },
              { name: "Verified Profile", description: "Add verified credentials" },
            ],
          },
          {
            category: "Credentials",
            icon: "📜",
            achievements: [
              { name: "Credential Master", description: "Add 5+ credentials" },
              { name: "Verified Expert", description: "Get 3+ credentials verified" },
            ],
          },
          {
            category: "Community",
            icon: "👥",
            achievements: [
              { name: "Network Builder", description: "Viewed by 10+ people" },
              { name: "Influencer", description: "Viewed by 100+ people" },
            ],
          },
          {
            category: "Reputation",
            icon: "⭐",
            achievements: [
              { name: "Rising Star", description: "Reach reputation level 2" },
              { name: "Elite Professional", description: "Reach reputation level 5" },
            ],
          },
        ].map((section) => (
          <div key={section.category} className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{section.icon}</span>
              <h3 className="text-xl font-bold">{section.category} Achievements</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {section.achievements.map((ach) => (
                <div key={ach.name} className="p-4 rounded-lg bg-white/5 border border-white/20 space-y-3">
                  <div>
                    <h4 className="font-semibold">{ach.name}</h4>
                    <p className="text-sm text-slate-400">{ach.description}</p>
                  </div>
                  <button className="w-full px-3 py-2 rounded-lg border border-white/20 hover:border-indigo-500/50 text-sm transition text-slate-300 hover:text-white">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* How to Unlock */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-6 space-y-4">
        <h3 className="text-xl font-bold">How to Unlock Achievements</h3>
        <ul className="space-y-2 text-sm text-slate-300">
          <li className="flex gap-3">
            <span className="text-indigo-400">✓</span>
            <span>Create a verified profile with your handle and IPFS resume</span>
          </li>
          <li className="flex gap-3">
            <span className="text-indigo-400">✓</span>
            <span>Add verified credentials from educational institutions or employers</span>
          </li>
          <li className="flex gap-3">
            <span className="text-indigo-400">✓</span>
            <span>Build your reputation score by maintaining and updating your profile</span>
          </li>
          <li className="flex gap-3">
            <span className="text-indigo-400">✓</span>
            <span>Share your profile to increase visibility and unlock community badges</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
