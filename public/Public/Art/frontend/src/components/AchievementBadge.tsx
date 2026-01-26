<<<<<<< HEAD
import { motion } from 'framer-motion';
import { useState } from 'react';
=======
import React from 'react';
import { motion } from 'framer-motion';
>>>>>>> 2caf294 (Initial commit with API documentation and features)

interface AchievementBadgeProps {
  icon: string;
  title: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
<<<<<<< HEAD
  progress: number;
  requirement: number;
=======
  progress?: number;
  requirement?: number;
>>>>>>> 2caf294 (Initial commit with API documentation and features)
  onClick?: () => void;
}

const rarityColors = {
<<<<<<< HEAD
  common: {
    bg: 'from-gray-400 to-gray-600',
    glow: 'shadow-gray-500/50',
    border: 'border-gray-400'
  },
  uncommon: {
    bg: 'from-green-400 to-green-600',
    glow: 'shadow-green-500/50',
    border: 'border-green-400'
  },
  rare: {
    bg: 'from-blue-400 to-blue-600',
    glow: 'shadow-blue-500/50',
    border: 'border-blue-400'
  },
  epic: {
    bg: 'from-purple-400 to-purple-600',
    glow: 'shadow-purple-500/50',
    border: 'border-purple-400'
  },
  legendary: {
    bg: 'from-yellow-400 to-orange-600',
    glow: 'shadow-yellow-500/50',
    border: 'border-yellow-400'
  }
};

const AchievementBadge = ({
=======
  common: { bg: '#9CA3AF', border: '#6B7280', glow: '#9CA3AF40' },
  uncommon: { bg: '#3B82F6', border: '#1E40AF', glow: '#3B82F640' },
  rare: { bg: '#8B5CF6', border: '#6D28D9', glow: '#8B5CF640' },
  epic: { bg: '#EC4899', border: '#BE185D', glow: '#EC489940' },
  legendary: { bg: '#F59E0B', border: '#B45309', glow: '#F59E0B40' }
};

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
>>>>>>> 2caf294 (Initial commit with API documentation and features)
  icon,
  title,
  description,
  rarity,
  unlocked,
<<<<<<< HEAD
  progress,
  requirement,
  onClick
}: AchievementBadgeProps) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const colors = rarityColors[rarity];
  const progressPercent = Math.min((progress / requirement) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      className={`relative p-4 rounded-lg border-2 ${
        unlocked 
          ? `bg-gradient-to-br ${colors.bg} ${colors.glow} shadow-lg ${colors.border}` 
          : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
      } cursor-pointer transition-all`}
    >
      {/* Achievement Icon */}
      <div className="text-5xl text-center mb-3 relative">
        {unlocked ? (
          <>
            {icon}
            {showCelebration && (
              <motion.div
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: 1.5, rotate: 360 }}
                exit={{ scale: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                ⭐
              </motion.div>
            )}
          </>
        ) : (
          <div className="filter grayscale opacity-50">{icon}</div>
        )}
      </div>

      {/* Title */}
      <h3 className={`text-lg font-bold text-center mb-2 ${
        unlocked ? 'text-white' : 'text-gray-700 dark:text-gray-300'
      }`}>
        {title}
      </h3>

      {/* Description */}
      <p className={`text-sm text-center mb-3 ${
        unlocked ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'
      }`}>
        {description}
      </p>

      {/* Progress Bar (for locked achievements) */}
      {!unlocked && (
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{progress}/{requirement}</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            />
          </div>
        </div>
      )}

      {/* Rarity Badge */}
      <div className={`text-center text-xs font-semibold uppercase ${
        unlocked ? 'text-white' : 'text-gray-500 dark:text-gray-500'
      }`}>
        {rarity}
      </div>

      {/* Lock Icon for Locked Achievements */}
      {!unlocked && (
        <div className="absolute top-2 right-2 text-gray-400 dark:text-gray-600">
          🔒
        </div>
=======
  progress = 0,
  requirement = 1,
  onClick
}) => {
  const rarityColor = rarityColors[rarity];
  const progressPercent = requirement > 0 ? (progress / requirement) * 100 : 0;

  return (
    <motion.div
      whileHover={{ scale: unlocked ? 1.05 : 1 }}
      whileTap={{ scale: unlocked ? 0.95 : 1 }}
      onClick={onClick}
      className={`relative flex flex-col items-center cursor-pointer ${unlocked ? 'cursor-pointer' : ''}`}
    >
      {/* Badge */}
      <div
        className={`relative w-24 h-24 rounded-2xl flex items-center justify-center text-4xl transition-all ${
          unlocked
            ? 'shadow-lg'
            : 'opacity-40 grayscale'
        }`}
        style={{
          backgroundColor: unlocked ? rarityColor.bg : '#D1D5DB',
          border: `3px solid ${unlocked ? rarityColor.border : '#9CA3AF'}`,
          boxShadow: unlocked ? `0 0 20px ${rarityColor.glow}` : 'none'
        }}
      >
        {icon}

        {/* Lock icon if locked */}
        {!unlocked && (
          <div className="absolute -bottom-1 -right-1 bg-gray-700 rounded-full p-1 text-xs text-white">
            🔒
          </div>
        )}
      </div>

      {/* Progress bar */}
      {!unlocked && requirement > 1 && (
        <div className="w-24 h-1 mt-2 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          />
        </div>
      )}

      {/* Celebration animation for unlock */}
      {unlocked && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className="absolute -top-2 -right-2 text-2xl"
        >
          ⭐
        </motion.div>
      )}

      {/* Title */}
      <div className="text-center mt-3">
        <p className={`font-bold text-sm ${unlocked ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
          {title}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 max-w-[100px]">
          {description}
        </p>
      </div>

      {/* Progress text */}
      {!unlocked && requirement > 1 && (
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
          {progress}/{requirement}
        </p>
>>>>>>> 2caf294 (Initial commit with API documentation and features)
      )}
    </motion.div>
  );
};

<<<<<<< HEAD
export default AchievementBadge;
=======
interface AchievementGridProps {
  achievements: any[];
  onBadgeClick?: (achievement: any) => void;
}

export const AchievementGrid: React.FC<AchievementGridProps> = ({
  achievements,
  onBadgeClick
}) => {
  const unlocked = achievements.filter(a => a.unlockedAt);
  const locked = achievements.filter(a => !a.unlockedAt);

  return (
    <div className="space-y-8">
      {/* Unlocked Achievements */}
      {unlocked.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            ✨ Unlocked ({unlocked.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {unlocked.map((achievement) => (
              <AchievementBadge
                key={achievement.achievementId}
                icon={achievement.icon}
                title={achievement.title}
                description={achievement.description}
                rarity={achievement.rarity}
                unlocked={true}
                onClick={() => onBadgeClick?.(achievement)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      {locked.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            🔒 Locked ({locked.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {locked.map((achievement) => (
              <AchievementBadge
                key={achievement.achievementId}
                icon={achievement.icon}
                title={achievement.title}
                description={achievement.description}
                rarity={achievement.rarity}
                unlocked={false}
                progress={achievement.progress}
                requirement={achievement.requirement}
                onClick={() => onBadgeClick?.(achievement)}
              />
            ))}
          </div>
        </div>
      )}

      {achievements.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No achievements yet. Start playing to earn badges!</p>
        </div>
      )}
    </div>
  );
};
>>>>>>> 2caf294 (Initial commit with API documentation and features)
