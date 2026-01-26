<<<<<<< HEAD
import { useState, useEffect } from 'react';
=======
import React, { useState } from 'react';
>>>>>>> 2caf294 (Initial commit with API documentation and features)
import { motion, AnimatePresence } from 'framer-motion';

interface LuckyDrawWheelProps {
  userId: string;
<<<<<<< HEAD
}

interface Prize {
  type: string;
  label: string;
=======
  onWheelSpin?: (prize: any) => void;
  onPrizeClaimed?: (prizeValue: number) => void;
}

interface Prize {
  id: string;
  label: string;
  icon: string;
>>>>>>> 2caf294 (Initial commit with API documentation and features)
  color: string;
  probability: number;
}

<<<<<<< HEAD
const prizes: Prize[] = [
  { type: 'XP_100', label: '100 XP', color: '#60a5fa', probability: 30 },
  { type: 'XP_250', label: '250 XP', color: '#34d399', probability: 25 },
  { type: 'XP_500', label: '500 XP', color: '#fbbf24', probability: 15 },
  { type: 'XP_1000', label: '1000 XP', color: '#f87171', probability: 8 },
  { type: 'BADGE_RARE', label: 'Rare Badge', color: '#a78bfa', probability: 10 },
  { type: 'BADGE_EPIC', label: 'Epic Badge', color: '#fb923c', probability: 7 },
  { type: 'DISCOUNT_10', label: '10% Discount', color: '#22d3ee', probability: 4 },
  { type: 'FEATURE_BOOST', label: 'Feature Boost', color: '#ec4899', probability: 1 },
];

const LuckyDrawWheel = ({ userId }: LuckyDrawWheelProps) => {
  const [canDraw, setCanDraw] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<Prize | null>(null);
  const [rotation, setRotation] = useState(0);
  const [showPrizeModal, setShowPrizeModal] = useState(false);

  useEffect(() => {
    checkDrawEligibility();
  }, [userId]);

  const checkDrawEligibility = async () => {
    try {
      const response = await fetch(`/api/gamification/rewards/lucky-draw/can-draw/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setCanDraw(data.canDraw);
      }
    } catch (err) {
      console.error('Failed to check draw eligibility:', err);
    }
  };

  const handleSpin = async () => {
    if (!canDraw || spinning) return;

    try {
      setSpinning(true);
      
      // Call API to spin
=======
const SAMPLE_PRIZES: Prize[] = [
  { id: 'xp_100', label: '100 XP', icon: '⭐', color: '#3B82F6', probability: 0.30 },
  { id: 'xp_250', label: '250 XP', icon: '✨', color: '#8B5CF6', probability: 0.25 },
  { id: 'xp_500', label: '500 XP', icon: '💎', color: '#EC4899', probability: 0.15 },
  { id: 'xp_1000', label: '1000 XP', icon: '👑', color: '#F59E0B', probability: 0.08 },
  { id: 'badge_rare', label: 'Rare Badge', icon: '🎖️', color: '#EC4899', probability: 0.10 },
  { id: 'badge_epic', label: 'Epic Badge', icon: '🏆', color: '#EF4444', probability: 0.07 },
  { id: 'nft_discount', label: '10% Discount', icon: '🎁', color: '#10B981', probability: 0.04 },
  { id: 'feature_boost', label: 'Feature Boost', icon: '🚀', color: '#06B6D4', probability: 0.01 }
];

export const LuckyDrawWheel: React.FC<LuckyDrawWheelProps> = ({
  userId,
  onWheelSpin,
  onPrizeClaimed
}) => {
  const [spinning, setSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<any>(null);
  const [canSpin, setCanSpin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleSpin = async () => {
    if (spinning || !canSpin || loading) return;

    try {
      setLoading(true);
      setError(null);

      // Check if user can spin
      const checkResponse = await fetch(`/api/gamification/rewards/lucky-draw/can-draw/${userId}`);
      const checkData = await checkResponse.json();

      if (!checkData.canDraw) {
        setError('You can only spin once per day!');
        return;
      }

      // Initiate spin
      setSpinning(true);
      const newRotation = rotation + 360 * 3 + Math.random() * 360;
      setRotation(newRotation);

      // Simulate spin duration
      await new Promise(resolve => setTimeout(resolve, 4000));

      // Call API to get prize
>>>>>>> 2caf294 (Initial commit with API documentation and features)
      const response = await fetch('/api/gamification/rewards/lucky-draw/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

<<<<<<< HEAD
      if (response.ok) {
        const data = await response.json();
        const prizeIndex = prizes.findIndex(p => p.type === data.prize);
        
        // Calculate rotation
        const segmentAngle = 360 / prizes.length;
        const targetRotation = 360 * 3 + (prizeIndex * segmentAngle); // 3 full rotations + target
        
        setRotation(targetRotation);
        
        // Wait for spin animation
        setTimeout(() => {
          setWonPrize(prizes[prizeIndex]);
          setShowPrizeModal(true);
          setSpinning(false);
          setCanDraw(false);
        }, 4000);
      } else {
        setSpinning(false);
        alert('You can only spin once per day!');
      }
    } catch (err) {
      setSpinning(false);
      console.error('Failed to spin:', err);
=======
      if (!response.ok) throw new Error('Failed to spin');

      const data = await response.json();
      const prize = SAMPLE_PRIZES.find(p => p.id === data.prizeType);

      if (prize) {
        setWonPrize({ ...data, ...prize });
        onWheelSpin?.(data);
        setCanSpin(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to spin wheel');
    } finally {
      setSpinning(false);
      setLoading(false);
>>>>>>> 2caf294 (Initial commit with API documentation and features)
    }
  };

  const handleClaimPrize = async () => {
<<<<<<< HEAD
    setShowPrizeModal(false);
    // Optionally call API to claim prize
  };

  return (
    <div className="text-center">
      {/* Wheel */}
      <div className="relative w-64 h-64 mx-auto mb-6">
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ duration: 4, ease: "easeOut" }}
          className="w-full h-full rounded-full shadow-2xl relative overflow-hidden"
          style={{
            background: `conic-gradient(
              ${prizes.map((prize, i) => {
                const start = (i / prizes.length) * 360;
                const end = ((i + 1) / prizes.length) * 360;
                return `${prize.color} ${start}deg ${end}deg`;
              }).join(', ')}
            )`
          }}
        >
          {/* Prize Labels */}
          {prizes.map((prize, index) => {
            const angle = (index / prizes.length) * 360 + (360 / prizes.length / 2);
            const radius = 80;
            const x = radius * Math.cos((angle - 90) * Math.PI / 180);
            const y = radius * Math.sin((angle - 90) * Math.PI / 180);
            
            return (
              <div
                key={index}
                className="absolute text-white font-bold text-xs"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: `translate(-50%, -50%) rotate(${angle}deg)`
                }}
              >
                {prize.label}
              </div>
            );
          })}
        </motion.div>
        
        {/* Center Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center border-4 border-yellow-500">
            <span className="text-2xl">🎰</span>
          </div>
        </div>

        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
          <div className="text-4xl">📌</div>
        </div>
      </div>

      {/* Spin Button */}
      <button
        onClick={handleSpin}
        disabled={!canDraw || spinning}
        className={`px-8 py-3 rounded-lg font-bold text-white shadow-lg transform transition-all ${
          canDraw && !spinning
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 cursor-pointer'
            : 'bg-gray-400 cursor-not-allowed opacity-50'
        }`}
      >
        {spinning ? '🎰 Spinning...' : canDraw ? '🎯 Spin the Wheel!' : '❌ Come Back Tomorrow'}
      </button>

      {/* Prize Modal */}
      <AnimatePresence>
        {showPrizeModal && wonPrize && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowPrizeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.5, rotate: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 shadow-2xl"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="text-8xl text-center mb-4"
              >
                🎉
              </motion.div>
              <h2 className="text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">
                Congratulations!
              </h2>
              <div 
                className="text-2xl font-bold text-center p-6 rounded-lg mb-6"
                style={{ backgroundColor: wonPrize.color, color: 'white' }}
              >
                {wonPrize.label}
              </div>
              <button
                onClick={handleClaimPrize}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
              >
                ✅ Claim Prize
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LuckyDrawWheel;
=======
    if (!wonPrize) return;

    try {
      const response = await fetch('/api/gamification/rewards/lucky-draw/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, drawId: wonPrize.id })
      });

      if (!response.ok) throw new Error('Failed to claim prize');

      onPrizeClaimed?.(wonPrize.prizeValue || 0);
      setWonPrize(null);
    } catch (err) {
      setError('Failed to claim prize');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg"
    >
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          🎰 Lucky Draw
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {canSpin ? 'Spin the wheel to win amazing prizes!' : 'Come back tomorrow for another spin!'}
        </p>

        {/* Wheel Container */}
        <div className="relative w-64 h-64 mx-auto mb-8">
          {/* Pointer */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 text-3xl">
            📌
          </div>

          {/* Wheel */}
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: spinning ? 4 : 0, ease: 'easeOut' }}
            className="w-full h-full rounded-full relative"
            style={{
              background: `conic-gradient(
                ${SAMPLE_PRIZES.map(p => `${p.color} 0deg ${(p.probability * 360).toFixed(1)}deg`).join(', ')}
              )`,
              boxShadow: '0 0 30px rgba(0,0,0,0.2)'
            }}
          >
            {/* Prize segments */}
            {SAMPLE_PRIZES.map((prize, idx) => {
              const startAngle = SAMPLE_PRIZES.slice(0, idx).reduce((sum, p) => sum + p.probability * 360, 0);
              const midAngle = startAngle + (prize.probability * 360) / 2;
              const radius = 100;
              const x = Math.cos((midAngle - 90) * (Math.PI / 180)) * radius;
              const y = Math.sin((midAngle - 90) * (Math.PI / 180)) * radius;

              return (
                <div
                  key={prize.id}
                  className="absolute w-full h-full flex items-center justify-center"
                  style={{
                    transform: `rotate(${midAngle}deg)`,
                    pointerEvents: 'none'
                  }}
                >
                  <div
                    style={{
                      transform: `translateY(-${radius}px)`,
                      textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                    }}
                  >
                    <div className="text-2xl">{prize.icon}</div>
                  </div>
                </div>
              );
            })}

            {/* Center circle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-lg border-4 border-yellow-400">
                {spinning ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="text-2xl"
                  >
                    ⚡
                  </motion.div>
                ) : (
                  <span className="text-2xl">🎯</span>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Prize Won Modal */}
        <AnimatePresence>
          {wonPrize && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-sm text-center shadow-2xl"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1], y: [0, -20, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  {wonPrize.icon}
                </motion.div>

                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  You Won!
                </h4>
                <p className="text-3xl font-bold mb-2" style={{ color: wonPrize.color }}>
                  {wonPrize.label}
                </p>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClaimPrize}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-3 rounded-lg mt-6 hover:shadow-lg"
                >
                  Claim Prize
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Spin Button */}
        <motion.button
          whileHover={{ scale: canSpin && !spinning ? 1.05 : 1 }}
          whileTap={{ scale: canSpin && !spinning ? 0.95 : 1 }}
          onClick={handleSpin}
          disabled={spinning || !canSpin || loading}
          className={`relative px-8 py-4 font-bold rounded-lg text-white transition-all ${
            canSpin
              ? 'bg-gradient-to-r from-pink-500 to-red-500 hover:shadow-lg cursor-pointer'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {spinning ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="inline-block"
            >
              ⚡
            </motion.span>
          ) : canSpin ? (
            'SPIN NOW! 🎲'
          ) : (
            'Come Back Tomorrow'
          )}
        </motion.button>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg text-sm"
          >
            {error}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
>>>>>>> 2caf294 (Initial commit with API documentation and features)
