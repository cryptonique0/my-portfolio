"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { AnimatedTimeline } from "@/components/AnimatedTimeline";
import { AchievementGallery } from "@/components/AchievementBadges";
import { WalletConnectButton } from "@/components/WalletConnectButton";

export default function HomePage() {
  const { isConnected } = useAccount();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      className="space-y-12 sm:space-y-16"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <motion.section
        variants={itemVariants}
        className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center"
      >
        <div className="space-y-4 sm:space-y-6">
          <motion.p
            variants={itemVariants}
            className="text-xs sm:text-sm uppercase tracking-[0.2em] text-indigo-300 font-semibold"
          >
            Base + Stacks
          </motion.p>

          <motion.h1
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight"
          >
            Build a verifiable on-chain resume
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg text-slate-300 leading-relaxed"
          >
            Create your profile on Base Mainnet, attach IPFS-hosted content, and prove your achievements with tamper-proof credentials and NFT badges.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row flex-wrap gap-3"
          >
            {isConnected ? (
              <>
                <Link
                  href="/profile/create"
                  className="px-5 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-shadow text-center"
                >
                  Create your profile
                </Link>
                <Link
                  href="/dashboard"
                  className="px-5 py-3 rounded-lg border border-white/20 text-white font-semibold hover:bg-white/10 transition-colors text-center"
                >
                  View dashboard
                </Link>
              </>
            ) : (
              <WalletConnectButton />
            )}
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-400"
          >
            <span>✔ Base Mainnet ready</span>
            <span className="hidden sm:inline">•</span>
            <span>✔ Stacks support</span>
            <span className="hidden sm:inline">•</span>
            <span>✔ IPFS included</span>
          </motion.div>
        </div>

        {/* Badge Section */}
        <motion.div
          variants={itemVariants}
          className="glass-effect rounded-2xl p-6 border border-white/10 shadow-2xl"
        >
          <h3 className="text-xl font-semibold mb-4">Achievement badges</h3>
          <AchievementGallery className="grid-cols-3" columns={3} />
          <div className="mt-6 text-xs sm:text-sm text-slate-300">
            Unlock badges as you add verified credentials. Mint as NFTs on-chain.
          </div>
        </motion.div>
      </motion.section>

      {/* Timeline Section */}
      <motion.section
        variants={itemVariants}
        className="glass-effect rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold">Career timeline</h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              Showcase your professional journey with verified events.
            </p>
          </div>
          <Link
            href="/achievements"
            className="text-indigo-300 hover:text-indigo-200 text-xs sm:text-sm font-semibold whitespace-nowrap"
          >
            View all →
          </Link>
        </div>
        <AnimatedTimeline events={[]} />
      </motion.section>

      {/* Features Section */}
      <motion.section
        variants={itemVariants}
        className="grid md:grid-cols-3 gap-6"
      >
        {[
          {
            title: "Blockchain Verified",
            description: "Credentials stored immutably on-chain with full transparency",
            icon: "🔐",
          },
          {
            title: "NFT Achievements",
            description: "Mint badges as ERC-1155 tokens to showcase your accomplishments",
            icon: "🏆",
          },
          {
            title: "Cross-Chain",
            description: "Build identity across Base and Stacks with unified reputation",
            icon: "⛓️",
          },
        ].map((feature, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            className="glass-effect rounded-xl p-6 border border-white/10 hover:border-white/20 transition-colors"
          >
            <div className="text-3xl sm:text-4xl mb-3">{feature.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-sm text-slate-400">{feature.description}</p>
          </motion.div>
        ))}
      </motion.section>
    </motion.div>
  );
}
