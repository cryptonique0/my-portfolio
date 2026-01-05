'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QuestionMarkCircleIcon,
  UserCircleIcon,
  DocumentCheckIcon,
  TrophyIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface ReputationSource {
  source: string;
  points: number;
  description: string;
  icon: any;
  color: string;
}

interface ReputationBreakdownProps {
  totalReputation: number;
  profileCompleteness?: number;
  credentialCount?: number;
  badgeCount?: number;
}

export default function ReputationBreakdown({
  totalReputation,
  profileCompleteness = 0,
  credentialCount = 0,
  badgeCount = 0
}: ReputationBreakdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Calculate reputation breakdown
  const basePoints = 50; // For creating profile
  const profilePoints = Math.floor((profileCompleteness / 100) * 50);
  const credentialPoints = credentialCount * 25;
  const badgePoints = badgeCount * 15; // Average per badge

  const sources: ReputationSource[] = [
    {
      source: 'Base Points',
      points: basePoints,
      description: 'Awarded for creating a profile',
      icon: UserCircleIcon,
      color: 'text-blue-400'
    },
    {
      source: 'Profile Completeness',
      points: profilePoints,
      description: `${profileCompleteness}% complete (up to 50 points)`,
      icon: SparklesIcon,
      color: 'text-purple-400'
    },
    {
      source: 'Verified Credentials',
      points: credentialPoints,
      description: `${credentialCount} credential(s) × 25 points`,
      icon: DocumentCheckIcon,
      color: 'text-green-400'
    },
    {
      source: 'Achievement Badges',
      points: badgePoints,
      description: `${badgeCount} badge(s) earned`,
      icon: TrophyIcon,
      color: 'text-yellow-400'
    }
  ];

  const calculatedTotal = sources.reduce((sum, s) => sum + s.points, 0);

  return (
    <div className="relative inline-block">
      {/* Tooltip Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="inline-flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors"
      >
        <span className="text-2xl font-bold">{totalReputation}</span>
        <QuestionMarkCircleIcon className="h-5 w-5" />
      </button>

      {/* Tooltip Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-80 mt-2 left-1/2 transform -translate-x-1/2"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                <h3 className="text-white font-bold text-lg">Reputation Breakdown</h3>
                <p className="text-blue-100 text-sm">How your score is calculated</p>
              </div>

              {/* Breakdown Items */}
              <div className="p-4 space-y-3">
                {sources.map((source, index) => (
                  <motion.div
                    key={source.source}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start space-x-3 p-3 bg-gray-700/50 rounded-lg"
                  >
                    <source.icon className={`h-6 w-6 ${source.color} flex-shrink-0 mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white text-sm">
                          {source.source}
                        </span>
                        <span className={`font-bold ${source.color}`}>
                          +{source.points}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        {source.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t border-gray-700 p-4 bg-gray-900/50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Total Reputation</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {calculatedTotal}
                  </span>
                </div>
                {calculatedTotal !== totalReputation && (
                  <p className="text-xs text-yellow-400 mt-2">
                    ⚠️ Actual: {totalReputation} (includes bonus points)
                  </p>
                )}
              </div>

              {/* How to Earn More */}
              <div className="border-t border-gray-700 p-4 bg-gradient-to-br from-blue-900/20 to-purple-900/20">
                <h4 className="font-semibold text-white text-sm mb-2">
                  💡 How to Earn More
                </h4>
                <ul className="text-xs text-gray-300 space-y-1">
                  {profileCompleteness < 100 && (
                    <li>• Complete your profile to earn up to 50 more points</li>
                  )}
                  <li>• Add verified credentials (+25 points each)</li>
                  <li>• Earn achievement badges (+15-50 points)</li>
                  <li>• Participate in community events</li>
                </ul>
              </div>
            </div>

            {/* Arrow */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gray-800 border-l border-t border-gray-700 rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Compact version for inline use
export function ReputationBadge({
  totalReputation,
  showBreakdown = true,
  ...breakdownProps
}: ReputationBreakdownProps & { showBreakdown?: boolean }) {
  if (!showBreakdown) {
    return (
      <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
        <SparklesIcon className="h-4 w-4 text-white mr-2" />
        <span className="text-white font-bold">{totalReputation}</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
      <SparklesIcon className="h-4 w-4 text-white mr-2" />
      <ReputationBreakdown totalReputation={totalReputation} {...breakdownProps} />
    </div>
  );
}
