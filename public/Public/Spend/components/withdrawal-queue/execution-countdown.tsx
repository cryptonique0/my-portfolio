'use client';

import { useState, useEffect } from 'react';

interface ExecutionCountdownProps {
  readyAt: number; // Unix timestamp in seconds
  status: 'pending' | 'ready' | 'frozen' | 'executed' | 'cancelled';
  onReady?: () => void;
}

/**
 * Real-time countdown timer for withdrawal execution readiness
 */
export function ExecutionCountdown({
  readyAt,
  status,
  onReady
}: ExecutionCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = Math.max(0, readyAt - now);
      setTimeRemaining(remaining);

      // Calculate percentage for progress bar
      if (remaining === 0 && status !== 'executed' && status !== 'cancelled') {
        onReady?.();
        setPercentage(100);
      } else {
        // Estimate total delay (2 days = 172800 seconds by default)
        const estimatedTotal = 172800; // 2 days
        setPercentage(Math.min(100, 100 - (remaining / estimatedTotal) * 100));
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [readyAt, status, onReady]);

  const formatTime = (seconds: number): string => {
    if (seconds === 0) return 'Ready';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  // Different display based on status
  if (status === 'executed') {
    return (
      <div className="space-y-2">
        <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
        <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 dark:bg-green-900/20">
          <span className="text-xl">✓</span>
          <span className="text-sm font-medium text-green-700 dark:text-green-400">Executed</span>
        </div>
      </div>
    );
  }

  if (status === 'cancelled') {
    return (
      <div className="space-y-2">
        <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 dark:bg-red-900/20">
          <span className="text-xl">✗</span>
          <span className="text-sm font-medium text-red-700 dark:text-red-400">Cancelled</span>
        </div>
      </div>
    );
  }

  if (status === 'frozen') {
    return (
      <div className="space-y-2">
        <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
        <div className="flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 dark:bg-orange-900/20">
          <span className="text-xl">🔒</span>
          <span className="text-sm font-medium text-orange-700 dark:text-orange-400">Frozen for Review</span>
        </div>
      </div>
    );
  }

  // Pending or Ready status
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500 dark:text-gray-400">Time to Execution</p>
        <span className={`text-sm font-semibold ${
          timeRemaining === 0 
            ? 'text-green-600 dark:text-green-400' 
            : 'text-gray-700 dark:text-gray-300'
        }`}>
          {formatTime(timeRemaining)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className={`h-full transition-all duration-500 ${
            timeRemaining === 0
              ? 'bg-green-500'
              : 'bg-blue-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Status indicator */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {timeRemaining === 0
            ? '✅ Ready to execute'
            : `⏳ Waiting for time-lock...`}
        </span>
      </div>
    </div>
  );
}
