'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'achievement' | 'credential' | 'milestone' | 'education' | 'experience' | 'project';
  verified?: boolean;
  verifier?: string;
  verificationDate?: string;
  icon?: string;
  category?: string;
  issuer?: string;
  expiryDate?: string;
  proofUrl?: string;
}

interface AnimatedTimelineProps {
  events: TimelineEvent[];
  groupByCategory?: boolean;
  highlightVerified?: boolean;
}

interface TimelineGroup {
  category: string;
  events: TimelineEvent[];
}

/**
 * Enhanced Animated Timeline Component
 * Features:
 * - Vertical timeline layout with smooth animations
 * - Framer Motion animations on scroll
 * - Group items by category
 * - Highlight verified credentials visually
 * - Fully responsive and accessible
 */
export function AnimatedTimeline({ 
  events, 
  groupByCategory = true,
  highlightVerified = true 
}: AnimatedTimelineProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['credential']));

  // Group events by category if requested
  const getGroupedEvents = (): TimelineGroup[] => {
    if (!groupByCategory) {
      return [{ category: 'all', events: sortedEvents }];
    }

    const groups = new Map<string, TimelineEvent[]>();
    sortedEvents.forEach(event => {
      const cat = event.category || event.type;
      if (!groups.has(cat)) {
        groups.set(cat, []);
      }
      groups.get(cat)!.push(event);
    });

    return Array.from(groups.entries()).map(([category, groupEvents]) => ({
      category,
      events: groupEvents
    }));
  };

  // Sort events by date (newest first)
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50, y: 20 },
    visible: { 
      opacity: 1, 
      x: 0, 
      y: 0,
      transition: { 
        duration: 0.5,
        ease: 'easeOut'
      } 
    },
  };

  const hoverVariants = {
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'from-purple-500 to-pink-500';
      case 'credential':
        return 'from-blue-500 to-cyan-500';
      case 'milestone':
        return 'from-green-500 to-emerald-500';
      case 'education':
        return 'from-indigo-500 to-blue-500';
      case 'experience':
        return 'from-orange-500 to-red-500';
      case 'project':
        return 'from-violet-500 to-purple-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getCategoryLabel = (category: string) => {
    return category
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const groupedEvents = getGroupedEvents();

  return (
    <div className="w-full py-8">
      {groupByCategory && groupedEvents.length > 1 ? (
        // Grouped timeline
        <div className="space-y-8">
          {groupedEvents.map((group) => (
            <div key={group.category} className="mb-8">
              {/* Category Header */}
              <motion.button
                onClick={() => toggleCategory(group.category)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg mb-4 bg-gradient-to-r ${getEventColor(group.category)} transition-all duration-200 hover:shadow-lg`}
                whileHover={{ scale: 1.01 }}
              >
                <h3 className="text-lg font-bold text-white">
                  {getCategoryLabel(group.category)}
                </h3>
                <span className="text-white text-sm font-semibold bg-white bg-opacity-20 rounded-full px-3 py-1">
                  {group.events.length}
                </span>
              </motion.button>

              {/* Category Events */}
              {expandedCategories.has(group.category) && (
                <motion.div
                  className="space-y-4 ml-4"
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                >
                  {group.events.map((event, index) => (
                    <TimelineItem
                      key={event.id}
                      event={event}
                      isHovered={hoveredId === event.id}
                      onHover={setHoveredId}
                      highlightVerified={highlightVerified}
                      itemVariants={itemVariants}
                      hoverVariants={hoverVariants}
                    />
                  ))}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      ) : (
        // Flat timeline
        <motion.div
          className="space-y-4"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {sortedEvents.map((event) => (
            <TimelineItem
              key={event.id}
              event={event}
              isHovered={hoveredId === event.id}
              onHover={setHoveredId}
              highlightVerified={highlightVerified}
              itemVariants={itemVariants}
              hoverVariants={hoverVariants}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}

/**
 * Individual Timeline Item Component
 */
interface TimelineItemProps {
  event: TimelineEvent;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  highlightVerified: boolean;
  itemVariants: any;
  hoverVariants: any;
}

function TimelineItem({
  event,
  isHovered,
  onHover,
  highlightVerified,
  itemVariants,
  hoverVariants
}: TimelineItemProps) {
  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      achievement: 'from-purple-500 to-pink-500',
      credential: 'from-blue-500 to-cyan-500',
      milestone: 'from-green-500 to-emerald-500',
      education: 'from-indigo-500 to-blue-500',
      experience: 'from-orange-500 to-red-500',
      project: 'from-violet-500 to-purple-500',
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      onMouseEnter={() => onHover(event.id)}
      onMouseLeave={() => onHover(null)}
      whileHover="hover"
      className="relative flex gap-4 group"
    >
      {/* Timeline Dot */}
      <div className="flex flex-col items-center">
        <motion.div
          className={`w-4 h-4 rounded-full border-4 border-white bg-gradient-to-br ${getEventColor(event.type)} shadow-lg transition-all duration-200 ${
            isHovered ? 'scale-125' : 'scale-100'
          } ${highlightVerified && event.verified ? 'ring-4 ring-green-400' : ''}`}
          animate={isHovered ? { scale: 1.25 } : { scale: 1 }}
        />
        <div className="w-1 h-12 bg-gradient-to-b from-gray-300 to-transparent mt-2" />
      </div>

      {/* Timeline Content */}
      <motion.div
        variants={hoverVariants}
        className={`flex-1 pb-8 px-4 py-3 rounded-lg border border-transparent transition-all duration-200 ${
          isHovered
            ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
              {event.title}
            </h4>
            {event.issuer && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                by {event.issuer}
              </p>
            )}
          </div>

          {/* Verification Badge */}
          {highlightVerified && event.verified && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full text-xs font-semibold"
            >
              <span>✓</span> Verified
            </motion.div>
          )}
        </div>

        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
          {event.description}
        </p>

        <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400">
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
            📅 {formatDate(event.date)}
          </span>
          
          {event.expiryDate && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
              ⏰ Expires: {formatDate(event.expiryDate)}
            </span>
          )}

          {event.type && (
            <span className={`px-2 py-1 bg-gradient-to-r ${getEventColor(event.type)} text-white rounded text-xs font-semibold capitalize`}>
              {event.type}
            </span>
          )}

          {event.verificationDate && (
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
              ✓ {formatDate(event.verificationDate)}
            </span>
          )}
        </div>

        {event.proofUrl && (
          <a
            href={event.proofUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            View Proof →
          </a>
        )}
      </motion.div>
    </motion.div>
  );
}
