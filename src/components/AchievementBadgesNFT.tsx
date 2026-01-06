'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export interface AchievementBadge {
  id: number;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt?: string;
  nftTokenId?: number;
  metadataURI?: string;
  soulbound?: boolean; // Non-transferable badge (credential proofs)
  category?: 'achievement' | 'credential'; // Badge type for UI
}

interface AchievementBadgesProps {
  badges: AchievementBadge[];
  onMintNFT?: (badgeId: number) => Promise<void>;
}

/**
 * Achievement Badges Component with NFT Minting
 * Displays unlockable achievement badges that can be minted as NFTs
 */
export function AchievementBadges({ badges, onMintNFT }: AchievementBadgesProps) {
  const [selectedBadge, setSelectedBadge] = useState<AchievementBadge | null>(null);
  const [isMinting, setIsMinting] = useState(false);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'from-yellow-400 via-orange-500 to-red-500';
      case 'epic':
        return 'from-purple-500 via-pink-500 to-purple-700';
      case 'rare':
        return 'from-blue-400 via-cyan-500 to-blue-600';
      case 'common':
        return 'from-gray-400 via-gray-500 to-gray-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'shadow-yellow-500/50';
      case 'epic':
        return 'shadow-purple-500/50';
      case 'rare':
        return 'shadow-blue-500/50';
      default:
        return 'shadow-gray-500/20';
    }
  };

  const handleMintNFT = async (badgeId: number) => {
    if (!onMintNFT) return;

    setIsMinting(true);
    try {
      await onMintNFT(badgeId);
    } catch (error) {
      console.error('Failed to mint NFT:', error);
    } finally {
      setIsMinting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
      >
        {badges.map((badge) => (
          <motion.div
            key={badge.id}
            variants={badgeVariants}
            whileHover={{ scale: badge.unlocked ? 1.1 : 1.05, rotate: badge.unlocked ? 5 : 0 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => badge.unlocked && setSelectedBadge(badge)}
            className={`relative cursor-pointer ${
              badge.unlocked ? '' : 'opacity-40 grayscale'
            }`}
          >
            {/* Badge Card */}
            <div
              className={`p-4 rounded-xl border-2 ${
                badge.unlocked
                  ? `bg-gradient-to-br ${getRarityColor(badge.rarity)} ${getRarityGlow(
                      badge.rarity
                    )} shadow-lg border-transparent`
                  : 'bg-white/5 border-gray-500/20'
              } backdrop-blur transition-all`}
            >
              {/* Badge Icon */}
              <div className="text-5xl mb-3 text-center">{badge.icon}</div>

              {/* Badge Title */}
              <h3 className="text-white text-sm font-semibold text-center mb-1">
                {badge.title}
              </h3>

              {/* Rarity Badge */}
              <div className="flex justify-center">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    badge.unlocked
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-700/50 text-gray-400'
                  }`}
                >
                  {badge.rarity.toUpperCase()}
                </span>
              </div>

              {/* NFT Badge */}
              {badge.unlocked && badge.nftTokenId !== undefined && (
                <div className="absolute top-2 right-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold"
                    title={badge.soulbound ? "Soulbound NFT" : "NFT Minted"}
                  >
                    {badge.soulbound ? '🔒' : '✓'}
                  </motion.div>
                </div>
              )}

              {/* Soulbound Badge */}
              {badge.unlocked && badge.soulbound && (
                <div className="absolute top-2 left-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-500/80 text-white"
                    title="Permanently bound to this wallet - not transferable"
                  >
                    ✦ SOUL
                  </motion.div>
                </div>
              )}

              {/* Locked Indicator */}
              {!badge.unlocked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-4xl">🔒</div>
                </div>
              )}
            </div>

            {/* Unlocked Date */}
            {badge.unlocked && badge.unlockedAt && (
              <p className="text-xs text-gray-400 text-center mt-2">
                Unlocked{' '}
                {new Date(badge.unlockedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-md w-full p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-purple-900 border border-purple-500/30 shadow-2xl"
            >
            {/* Close Button */}
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
            >
              ×
            </button>

            {/* Badge Icon */}
            <div className="text-8xl text-center mb-6">{selectedBadge.icon}</div>

            {/* Badge Title */}
            <h2 className="text-3xl font-bold text-white text-center mb-2">
              {selectedBadge.title}
            </h2>

            {/* Rarity Badge */}
            <div className="flex justify-center mb-4">
              <span
                className={`px-4 py-1 rounded-full text-sm font-bold bg-gradient-to-r ${getRarityColor(
                  selectedBadge.rarity
                )} text-white shadow-lg`}
              >
                {selectedBadge.rarity.toUpperCase()}
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-center mb-6">{selectedBadge.description}</p>

            {/* Unlocked Date */}
            {selectedBadge.unlockedAt && (
              <p className="text-sm text-purple-300 text-center mb-6">
                Unlocked on {new Date(selectedBadge.unlockedAt).toLocaleDateString()}
              </p>
            )}

            {/* NFT Status */}
            {selectedBadge.nftTokenId !== undefined ? (
              <div className={`p-4 rounded-xl border text-center mb-4 ${
                selectedBadge.soulbound 
                  ? 'bg-purple-500/10 border-purple-500/30' 
                  : 'bg-green-500/10 border-green-500/30'
              }`}>
                <p className={`font-semibold mb-1 ${
                  selectedBadge.soulbound ? 'text-purple-300' : 'text-green-300'
                }`}>
                  {selectedBadge.soulbound ? '🔒 NFT Minted (Soulbound)' : '✓ NFT Minted!'}
                </p>
                <p className={`text-sm ${
                  selectedBadge.soulbound ? 'text-purple-400/70' : 'text-green-400/70'
                }`}>
                  Token ID: #{selectedBadge.nftTokenId}
                </p>
                {selectedBadge.soulbound && (
                  <p className="text-xs text-purple-400/60 mt-2">
                    ✦ Permanently bound to your wallet • Not transferable
                  </p>
                )}
              </div>
            ) : (
              onMintNFT && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMintNFT(selectedBadge.id)}
                  disabled={isMinting}
                  className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                >
                  {isMinting ? 'Minting NFT...' : 'Mint as NFT Badge'}
                </motion.button>
              )
            )}

            {/* View on OpenSea (if NFT is minted) */}
            {selectedBadge.nftTokenId !== undefined && selectedBadge.metadataURI && (
              <a
                href={`https://opensea.io/assets/base/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}/${selectedBadge.nftTokenId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-3 text-center text-purple-300 hover:text-purple-200 text-sm underline"
              >
                View on OpenSea →
              </a>
            )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
