import React from 'react';
import { motion } from 'framer-motion';
import { AnimatedChart } from '../components/AnimatedChart';
import { FadeInCard, AnimatedStatCard, AnimatedButton, StaggeredList } from '../components/AnimatedComponents';

export const UIShowcase: React.FC = () => {
  // Sample chart data
  const volumeData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Volume (ETH)',
        data: [12, 19, 15, 25, 22, 30, 28],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true
      }
    ]
  };

  const salesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales',
        data: [65, 78, 90, 81, 96, 105],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(6, 182, 212, 0.8)'
        ]
      }
    ]
  };

  const stats = [
    { icon: '💎', label: 'Total NFTs', value: '12,456', trend: { value: 12.5, isPositive: true } },
    { icon: '🔥', label: 'Active Users', value: '8,234', trend: { value: 8.3, isPositive: true } },
    { icon: '💰', label: 'Total Volume', value: '1,234 ETH', trend: { value: 15.7, isPositive: true } },
    { icon: '📊', label: 'Avg. Price', value: '2.5 ETH', trend: { value: 3.2, isPositive: false } }
  ];

  const recentActivity = [
    { user: '0x1234...5678', action: 'purchased', nft: 'Cool NFT #123', price: '2.5 ETH' },
    { user: '0x8765...4321', action: 'listed', nft: 'Epic Art #456', price: '3.2 ETH' },
    { user: '0xabcd...ef01', action: 'minted', nft: 'Rare Item #789', price: '1.8 ETH' },
    { user: '0x9876...5432', action: 'bid on', nft: 'Super NFT #321', price: '4.1 ETH' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            UI Components Showcase
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Advanced animations, charts, and interactive components
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <AnimatedStatCard
              key={index}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              trend={stat.trend}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <AnimatedChart type="line" title="Weekly Volume" data={volumeData} />
          <AnimatedChart type="bar" title="Monthly Sales" data={salesData} />
        </div>

        {/* Recent Activity */}
        <FadeInCard delay={0.4} className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          <StaggeredList>
            {recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                whileHover={{ x: 4, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                className="flex items-center justify-between py-3 px-4 rounded-lg border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {activity.user.substring(2, 4).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm text-gray-900 dark:text-white">
                      <span className="font-medium">{activity.user}</span> {activity.action}{' '}
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {activity.nft}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date().toLocaleTimeString()} • {activity.price}
                    </div>
                  </div>
                </div>
                <motion.svg
                  whileHover={{ x: 4 }}
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </motion.svg>
              </motion.div>
            ))}
          </StaggeredList>
        </FadeInCard>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex gap-4 mt-8 justify-center"
        >
          <AnimatedButton variant="primary">Create NFT</AnimatedButton>
          <AnimatedButton variant="outline">Explore Market</AnimatedButton>
          <AnimatedButton variant="secondary">View Profile</AnimatedButton>
        </motion.div>
      </div>
    </div>
  );
};
