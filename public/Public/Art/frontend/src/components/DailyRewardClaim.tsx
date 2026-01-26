<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface DailyRewardClaimProps {
  userId: string;
}

interface DailyReward {
  userId: string;
  date: string;
  xpAmount: number;
  claimed: boolean;
  streak: number;
}

const DailyRewardClaim = ({ userId }: DailyRewardClaimProps) => {
  const [reward, setReward] = useState<DailyReward | null>(null);
=======
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DailyRewardClaimProps {
  userId: string;
  onClaimed?: (xp: number, streak: number) => void;
}

export const DailyRewardClaim: React.FC<DailyRewardClaimProps> = ({
  userId,
  onClaimed
}) => {
  const [reward, setReward] = useState<any>(null);
>>>>>>> 2caf294 (Initial commit with API documentation and features)
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
<<<<<<< HEAD
    fetchDailyReward();
  }, [userId]);

  const fetchDailyReward = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/gamification/rewards/daily/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setReward(data);
        setClaimed(data.claimed);
      }
    } catch (err) {
      setError('Failed to load daily reward');
      console.error(err);
=======
    fetchReward();
  }, [userId]);

  const fetchReward = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/gamification/rewards/daily/${userId}`);
      const data = await response.json();
      setReward(data);
      setClaimed(data.claimed);
    } catch (err) {
      setError('Failed to fetch reward');
>>>>>>> 2caf294 (Initial commit with API documentation and features)
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
<<<<<<< HEAD
    if (!reward || claimed) return;
=======
    if (!reward) return;
>>>>>>> 2caf294 (Initial commit with API documentation and features)

    try {
      setClaiming(true);
      const response = await fetch('/api/gamification/rewards/daily/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

<<<<<<< HEAD
      if (response.ok) {
        const data = await response.json();
        setClaimed(true);
        setReward(data.reward);
      } else {
        setError('Failed to claim reward');
      }
    } catch (err) {
      setError('Failed to claim reward');
      console.error(err);
=======
      if (!response.ok) throw new Error('Failed to claim reward');

      const data = await response.json();
      setClaimed(true);
      onClaimed?.(data.reward.xpAmount, data.reward.streak);
    } catch (err) {
      setError('Failed to claim reward');
>>>>>>> 2caf294 (Initial commit with API documentation and features)
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
<<<<<<< HEAD
      <div className="text-center py-8">
        <div className="animate-spin text-4xl">⭐</div>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Loading reward...</p>
=======
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
>>>>>>> 2caf294 (Initial commit with API documentation and features)
      </div>
    );
  }

<<<<<<< HEAD
  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 rounded-lg p-4 text-center">
        <p className="text-red-800 dark:text-red-200">{error}</p>
      </div>
    );
  }

  if (!reward) return null;

  const baseXP = 50;
  const streakBonus = reward.streak * 10;
  const totalXP = baseXP + streakBonus;

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-6 border-2 border-yellow-400 dark:border-yellow-600">
      {claimed ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1 }}
            className="text-6xl mb-4"
          >
            ✅
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Reward Claimed!
          </h3>
          <p className="text-xl text-green-600 dark:text-green-400 font-bold">
            +{totalXP} XP
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Come back tomorrow for more!
          </p>
        </motion.div>
      ) : (
        <div className="text-center">
          <div className="text-6xl mb-4">🎁</div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Daily Reward Available!
          </h3>
          
          <div className="space-y-2 mb-6">
            <div className="flex justify-between items-center p-2 bg-white/50 dark:bg-gray-800/50 rounded">
              <span className="text-gray-700 dark:text-gray-300">Base XP:</span>
              <span className="font-bold text-gray-900 dark:text-white">{baseXP} XP</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white/50 dark:bg-gray-800/50 rounded">
              <span className="text-gray-700 dark:text-gray-300">Streak Bonus:</span>
              <span className="font-bold text-orange-600 dark:text-orange-400">
                +{streakBonus} XP
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
              <span className="font-bold text-white">Total:</span>
              <span className="font-bold text-white text-xl">{totalXP} XP</span>
            </div>
          </div>

          {reward.streak > 0 && (
            <div className="mb-4 inline-block bg-red-500 text-white px-4 py-2 rounded-full">
              🔥 {reward.streak} Day Streak!
            </div>
          )}

          <button
            onClick={handleClaim}
            disabled={claiming}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {claiming ? '⏳ Claiming...' : '🎁 Claim Reward'}
          </button>
        </div>
      )}
    </div>
  );
};

export default DailyRewardClaim;
=======
  if (!reward) {
    return null;
  }

  const totalXpAmount = reward.xpAmount || 50;
  const streakBonus = (reward.streak || 0) * 10;
  const totalReward = totalXpAmount + streakBonus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 shadow-lg border-2 border-yellow-200 dark:border-yellow-600"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          🎁 Daily Reward
        </h3>
        {reward.streak > 0 && (
          <div className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            <span>🔥</span>
            <span>{reward.streak} day streak</span>
          </div>
        )}
      </div>

      {/* Reward Display */}
      <AnimatePresence>
        {!claimed ? (
          <motion.div
            key="unclaimed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Base Reward</p>
              <p className="text-3xl font-bold text-yellow-500 mb-4">{totalXpAmount} XP</p>

              {reward.streak > 0 && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Streak Bonus</p>
                  <p className="text-2xl font-bold text-red-500">+{streakBonus} XP</p>
                </div>
              )}

              {reward.streak > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Reward</p>
                  <p className="text-3xl font-bold text-orange-500">{totalReward} XP</p>
                </div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClaim}
              disabled={claiming}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50"
            >
              {claiming ? 'Claiming...' : 'Claim Reward'}
            </motion.button>

            {reward.streak === 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Claim daily to build a streak! 🔥
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="claimed"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="text-5xl mb-3 inline-block"
            >
              ✨
            </motion.div>
            <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Reward Claimed!
            </p>
            <p className="text-orange-500 font-bold text-2xl">+{totalReward} XP</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
              Come back tomorrow to claim your next reward!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg text-sm"
        >
          {error}
        </motion.div>
      )}
    </motion.div>
  );
};
>>>>>>> 2caf294 (Initial commit with API documentation and features)
