'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';

export interface Badge {
  id: number;
  name: string;
  description: string;
  imageURI: string;
  requiredReputation: number;
  currentSupply: number;
  maxSupply: number;
  isActive: boolean;
  isSoulbound?: boolean; // ⭐ NEW: Non-transferable flag
  createdAt: number;
  owned?: boolean;
  quantity?: number;
}

interface BadgeGridProps {
  badges: Badge[];
  isLoading?: boolean;
  showOwned?: boolean;
  userReputation?: number;
}

/**
 * Badge Display Component
 * Shows NFT achievement badges with reputation requirements
 * Features:
 * - Grid display of badges
 * - Locked/unlocked state
 * - Hover effects with details
 * - Mint button for admins
 * - Responsive design
 */
export function BadgeGrid({
  badges,
  isLoading,
  showOwned = true,
  userReputation = 0,
}: BadgeGridProps) {
  const { address } = useAccount();
  const [filteredBadges, setFilteredBadges] = useState<Badge[]>(badges);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  useEffect(() => {
    if (showOwned) {
      setFilteredBadges(badges.filter((b) => b.owned));
    } else {
      setFilteredBadges(badges);
    }
  }, [badges, showOwned]);

  const isUnlocked = (badge: Badge) => {
    return userReputation >= badge.requiredReputation;
  };

  const getStatusColor = (badge: Badge) => {
    if (!badge.isActive) return 'from-gray-400 to-gray-500';
    if (badge.owned) return 'from-purple-500 to-pink-500';
    if (isUnlocked(badge)) return 'from-yellow-400 to-orange-500';
    return 'from-gray-400 to-gray-500';
  };

  const getStatusLabel = (badge: Badge) => {
    if (!badge.isActive) return 'Inactive';
    if (badge.owned) return `${badge.quantity || 1} Owned`;
    if (isUnlocked(badge)) return 'Unlocked';
    return 'Locked';
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

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 },
    },
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (filteredBadges.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          No badges {showOwned ? 'earned' : 'available'} yet
        </p>
      </div>
    );
  }

  return (
    <>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {filteredBadges.map((badge) => (
          <motion.div
            key={badge.id}
            variants={itemVariants}
            onClick={() => setSelectedBadge(badge)}
            className="cursor-pointer"
          >
            <BadgeCard
              badge={badge}
              isUnlocked={isUnlocked(badge)}
              statusColor={getStatusColor(badge)}
              statusLabel={getStatusLabel(badge)}
            />
          </motion.div>
        ))}
      </motion.div>

      {selectedBadge && (
        <BadgeDetailModal
          badge={selectedBadge}
          isUnlocked={isUnlocked(selectedBadge)}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </>
  );
}

/**
 * Individual Badge Card
 */
interface BadgeCardProps {
  badge: Badge;
  isUnlocked: boolean;
  statusColor: string;
  statusLabel: string;
}

function BadgeCard({
  badge,
  isUnlocked,
  statusColor,
  statusLabel,
}: BadgeCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -8 }}
      className={`relative h-64 rounded-lg overflow-hidden shadow-lg transition-all ${
        isUnlocked ? 'cursor-pointer' : 'opacity-75'
      }`}
    >
      {/* Badge Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${statusColor} opacity-20`}
      />

      {/* Badge Image */}
      <div className="relative h-40 bg-gradient-to-b from-transparent to-gray-900 dark:to-black flex items-center justify-center">
        <motion.div
          animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
          className="text-6xl"
        >
          {badge.imageURI ? (
            <img
              src={badge.imageURI}
              alt={badge.name}
              className="w-32 h-32 object-contain"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl">
              ◆
            </div>
          )}
        </motion.div>

        {/* Lock Icon */}
        {!isUnlocked && (
          <div className="absolute top-2 right-2 bg-red-500 rounded-full w-8 h-8 flex items-center justify-center text-white text-sm">
            🔒
          </div>
        )}
      </div>

      {/* Badge Info */}
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate flex-1">
            {badge.name}
          </h3>
          {/* Soulbound Indicator ⭐ NEW */}
          {badge.isSoulbound && (
            <span className="ml-2 px-2 py-0.5 bg-purple-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
              🔗 Soulbound
            </span>
          )}
        </div>

        {/* Status Badge */}
        <motion.div
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${statusColor}`}
        >
          {statusLabel}
        </motion.div>

        {/* Supply Info */}
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {badge.maxSupply > 0
            ? `${badge.currentSupply}/${badge.maxSupply} minted`
            : `${badge.currentSupply} minted`}
        </div>

        {/* Reputation Requirement */}
        {!isUnlocked && (
          <div className="text-xs text-orange-600 dark:text-orange-400">
            Requires {badge.requiredReputation} reputation
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Badge Detail Modal
 */
interface BadgeDetailModalProps {
  badge: Badge;
  isUnlocked: boolean;
  onClose: () => void;
}

function BadgeDetailModal({
  badge,
  isUnlocked,
  onClose,
}: BadgeDetailModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 space-y-4"
      >
        {/* Badge Image */}
        <div className="flex justify-center">
          {badge.imageURI ? (
            <img
              src={badge.imageURI}
              alt={badge.name}
              className="w-48 h-48 object-contain"
            />
          ) : (
            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-7xl">
              ◆
            </div>
          )}
        </div>

        {/* Badge Title */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {badge.name}
            </h2>
            {/* Soulbound Badge ⭐ NEW */}
            {badge.isSoulbound && (
              <span className="px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                🔗 SOULBOUND
              </span>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {badge.description}
          </p>
          {/* Soulbound Explanation ⭐ NEW */}
          {badge.isSoulbound && (
            <div className="mt-3 p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg border border-purple-300 dark:border-purple-700">
              <p className="text-xs text-purple-900 dark:text-purple-200">
                <strong>🔒 Non-Transferable:</strong> This badge is permanently bound to your wallet 
                and cannot be transferred or sold. It serves as a verified credential of your achievements.
              </p>
            </div>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-200 dark:border-gray-700">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
              Required Reputation
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {badge.requiredReputation}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
              Minted
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {badge.maxSupply > 0
                ? `${badge.currentSupply}/${badge.maxSupply}`
                : badge.currentSupply}
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          {isUnlocked ? (
            <>
              <span className="text-green-500">✓</span>
              <span className="text-gray-700 dark:text-gray-300">Unlocked</span>
            </>
          ) : (
            <>
              <span className="text-red-500">✕</span>
              <span className="text-gray-700 dark:text-gray-300">Locked</span>
            </>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}

/**
 * Badge Showcase Component
 * Displays user's badges in profile header
 */
interface BadgeShowcaseProps {
  badges: Badge[];
  maxDisplay?: number;
  size?: 'small' | 'medium' | 'large';
}

export function BadgeShowcase({
  badges,
  maxDisplay = 5,
  size = 'medium',
}: BadgeShowcaseProps) {
  const displayedBadges = badges.slice(0, maxDisplay);
  const remaining = badges.length - maxDisplay;

  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-20 h-20',
  };

  return (
    <div className="flex items-center gap-2">
      {displayedBadges.map((badge) => (
        <motion.div
          key={badge.id}
          whileHover={{ scale: 1.2 }}
          className={`rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg ${sizeClasses[size]}`}
          title={badge.name}
        >
          {badge.imageURI ? (
            <img
              src={badge.imageURI}
              alt={badge.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-lg">◆</span>
          )}
        </motion.div>
      ))}

      {remaining > 0 && (
        <div className={`rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-900 dark:text-white ${sizeClasses[size]}`}>
          +{remaining}
        </div>
      )}
    </div>
  );
}
