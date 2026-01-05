'use client';

import { motion } from 'framer-motion';

/**
 * Loading Skeleton Component
 * Used for placeholder content while data loads
 */
export function SkeletonLoader({ 
  type = 'card',
  count = 1,
  className = ''
}: {
  type?: 'card' | 'text' | 'avatar' | 'badge';
  count?: number;
  className?: string;
}) {
  const skeletons = {
    card: (
      <div className="space-y-3">
        <div className="h-24 bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg animate-pulse" />
        <div className="h-4 bg-gradient-to-r from-slate-700 to-slate-800 rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-gradient-to-r from-slate-700 to-slate-800 rounded w-1/2 animate-pulse" />
      </div>
    ),
    text: (
      <div className="space-y-2">
        <div className="h-4 bg-gradient-to-r from-slate-700 to-slate-800 rounded w-full animate-pulse" />
        <div className="h-4 bg-gradient-to-r from-slate-700 to-slate-800 rounded w-5/6 animate-pulse" />
      </div>
    ),
    avatar: (
      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-slate-700 to-slate-800 animate-pulse" />
    ),
    badge: (
      <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-slate-700 to-slate-800 animate-pulse w-20 h-8" />
    ),
  };

  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="mb-4"
        >
          {skeletons[type]}
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Loading Spinner
 */
export function LoadingSpinner({ size = 'md', label = 'Loading...' }: { size?: 'sm' | 'md' | 'lg'; label?: string }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <motion.div
        className={`${sizes[size]} border-2 border-slate-600 border-t-indigo-500 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      />
      {label && <p className="text-sm text-slate-400">{label}</p>}
    </div>
  );
}

/**
 * Page Loading State
 */
export function PageLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm z-50"
    >
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-slate-300 font-medium">Building your profile...</p>
      </div>
    </motion.div>
  );
}
