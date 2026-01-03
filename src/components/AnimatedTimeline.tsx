'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'achievement' | 'credential' | 'milestone';
  verified?: boolean;
  icon?: string;
}

interface AnimatedTimelineProps {
  events: TimelineEvent[];
}

/**
 * Animated Timeline Component
 * Displays professional history with smooth animations
 */
export function AnimatedTimeline({ events }: AnimatedTimelineProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Sort events by date (newest first)
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'from-purple-500 to-pink-500';
      case 'credential':
        return 'from-blue-500 to-cyan-500';
      case 'milestone':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return '🏆';
      case 'credential':
        return '📜';
      case 'milestone':
        return '🎯';
      default:
        return '📌';
    }
  };

  if (sortedEvents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No timeline events yet</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative"
    >
      {/* Timeline Line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/50 via-pink-500/50 to-transparent" />

      {/* Timeline Events */}
      <div className="space-y-8">
        {sortedEvents.map((event, index) => (
          <motion.div
            key={event.id}
            variants={itemVariants}
            className="relative pl-20"
            onMouseEnter={() => setHoveredId(event.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Event Icon */}
            <motion.div
              className={`absolute left-0 w-16 h-16 rounded-full bg-gradient-to-br ${getEventColor(
                event.type
              )} flex items-center justify-center text-3xl shadow-lg`}
              animate={{
                scale: hoveredId === event.id ? 1.2 : 1,
                rotate: hoveredId === event.id ? 10 : 0,
              }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {event.icon || getEventIcon(event.type)}
            </motion.div>

            {/* Event Card */}
            <motion.div
              className="p-6 rounded-xl bg-white/5 border border-purple-500/20 hover:border-purple-500/50 backdrop-blur transition-all"
              animate={{
                y: hoveredId === event.id ? -5 : 0,
              }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {/* Event Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-white">{event.title}</h3>
                    {event.verified && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="px-2 py-1 rounded-full bg-green-500/20 border border-green-500/50 text-green-300 text-xs font-medium"
                      >
                        ✓ Verified
                      </motion.span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">{event.description}</p>
                </div>

                {/* Date Badge */}
                <div className="ml-4 text-right">
                  <div className="px-3 py-1 rounded-lg bg-purple-500/20 border border-purple-500/30">
                    <p className="text-purple-300 text-xs font-medium">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Event Type Badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full bg-gradient-to-r ${getEventColor(
                    event.type
                  )} text-white text-xs font-medium`}
                >
                  {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                </span>
              </div>
            </motion.div>

            {/* Connection Line to Next Event */}
            {index < sortedEvents.length - 1 && (
              <div className="absolute left-8 top-20 w-0.5 h-8 bg-gradient-to-b from-purple-500/30 to-transparent" />
            )}
          </motion.div>
        ))}
      </div>

      {/* Timeline End Marker */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: sortedEvents.length * 0.2 }}
        className="relative pl-20 mt-8"
      >
        <div className="absolute left-0 w-16 h-16 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border-2 border-purple-500/30">
          <span className="text-2xl">🌟</span>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-purple-500/20 backdrop-blur">
          <p className="text-gray-400 text-sm text-center">The journey continues...</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
