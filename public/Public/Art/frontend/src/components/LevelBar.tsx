<<<<<<< HEAD
=======
import React from 'react';
>>>>>>> 2caf294 (Initial commit with API documentation and features)
import { motion } from 'framer-motion';

interface LevelBarProps {
  currentLevel: number;
  totalXP: number;
  xpInCurrentLevel: number;
  xpForNextLevel: number;
  levelTitle: string;
<<<<<<< HEAD
  levelColor: string;
}

const LevelBar = ({
=======
  levelColor?: string;
  showTitle?: boolean;
}

export const LevelBar: React.FC<LevelBarProps> = ({
>>>>>>> 2caf294 (Initial commit with API documentation and features)
  currentLevel,
  totalXP,
  xpInCurrentLevel,
  xpForNextLevel,
  levelTitle,
<<<<<<< HEAD
  levelColor
}: LevelBarProps) => {
  const progressPercent = (xpInCurrentLevel / xpForNextLevel) * 100;

  return (
    <div className="space-y-4">
      {/* Level Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div 
            className="px-6 py-3 rounded-lg font-bold text-2xl text-white shadow-lg"
            style={{ backgroundColor: levelColor }}
          >
            Lv. {currentLevel}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {levelTitle}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total XP: {totalXP.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>{xpInCurrentLevel.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden"
          >
            <motion.div
              animate={{
                x: ['0%', '100%'],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
            />
          </motion.div>
        </div>
      </div>

      {/* Next Level Info */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        {xpForNextLevel - xpInCurrentLevel} XP needed for Level {currentLevel + 1}
=======
  levelColor = '#3B82F6',
  showTitle = true
}) => {
  const progressPercent = xpForNextLevel > 0 ? (xpInCurrentLevel / xpForNextLevel) * 100 : 0;

  return (
    <div className="space-y-3">
      {showTitle && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-bold text-white"
              style={{ backgroundColor: levelColor }}
            >
              {currentLevel}
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white">{levelTitle}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{totalXP.toLocaleString()} Total XP</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
            Level {currentLevel}
          </span>
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
            {xpInCurrentLevel.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
          </span>
        </div>

        <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{
              backgroundColor: levelColor,
              boxShadow: `0 0 10px ${levelColor}80`
            }}
          />
        </div>

        <div className="text-center">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
            {Math.round(progressPercent)}%
          </span>
        </div>
>>>>>>> 2caf294 (Initial commit with API documentation and features)
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default LevelBar;
=======
interface XPNotificationProps {
  amount: number;
  reason: string;
  position?: 'top-right' | 'top-center' | 'bottom-right';
}

export const XPNotification: React.FC<XPNotificationProps> = ({
  amount,
  reason,
  position = 'top-right'
}) => {
  const positions = {
    'top-right': 'top-8 right-8',
    'top-center': 'top-8 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-8 right-8'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.8 }}
      transition={{ duration: 0.5 }}
      className={`fixed ${positions[position]} z-50 pointer-events-none`}
    >
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 font-semibold">
        <span className="text-2xl">⭐</span>
        <div>
          <p className="text-lg">+{amount} XP</p>
          <p className="text-xs opacity-90">{reason}</p>
        </div>
      </div>
    </motion.div>
  );
};

interface XPActivityProps {
  activities: Array<{
    id: string;
    amount: number;
    reason: string;
    timestamp: Date;
  }>;
}

export const XPActivity: React.FC<XPActivityProps> = ({ activities }) => {
  return (
    <div className="space-y-3">
      <h3 className="font-bold text-gray-900 dark:text-white">Recent XP Activity</h3>
      <div className="space-y-2">
        {activities.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">No recent activity</p>
        ) : (
          activities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {activity.reason}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </p>
              </div>
              <span className="font-bold text-yellow-500">+{activity.amount}</span>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
>>>>>>> 2caf294 (Initial commit with API documentation and features)
