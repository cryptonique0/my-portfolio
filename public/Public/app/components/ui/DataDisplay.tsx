/**
 * Stat Card Component
 * For displaying key metrics and statistics
 */

import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
  trend?: 'up' | 'down' | 'neutral';
}

const colorStyles = {
  blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
  green: 'from-green-500/20 to-green-600/20 border-green-500/30',
  amber: 'from-amber-500/20 to-amber-600/20 border-amber-500/30',
  red: 'from-red-500/20 to-red-600/20 border-red-500/30',
  purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
};

const textColorStyles = {
  blue: 'text-blue-600 dark:text-blue-400',
  green: 'text-green-600 dark:text-green-400',
  amber: 'text-amber-600 dark:text-amber-400',
  red: 'text-red-600 dark:text-red-400',
  purple: 'text-purple-600 dark:text-purple-400',
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  icon,
  color = 'blue',
  trend,
}) => {
  return (
    <div
      className={`
        p-4 rounded-xl
        bg-gradient-to-br ${colorStyles[color]}
        border-2 border-slate-200 dark:border-slate-700
        backdrop-blur-sm
        hover:shadow-lg transition-shadow duration-200
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            {label}
          </p>
          <p className={`text-3xl font-black mt-1 ${textColorStyles[color]}`}>{value}</p>
        </div>
        {icon && <div className={`text-3xl opacity-60 ${textColorStyles[color]}`}>{icon}</div>}
      </div>

      {change && (
        <div className="flex items-center gap-1 pt-2 border-t border-slate-300/20">
          {trend === 'up' && <span className={`text-sm font-bold ${change.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>↑</span>}
          {trend === 'down' && <span className={`text-sm font-bold ${!change.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>↓</span>}
          <span className="text-xs text-slate-600 dark:text-slate-400">
            {Math.abs(change.value)}% {change.isPositive ? 'increase' : 'decrease'}
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Progress Bar Component
 */
interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  color?: 'blue' | 'green' | 'amber' | 'red';
  showPercent?: boolean;
  animated?: boolean;
}

const progressColorStyles = {
  blue: 'bg-gradient-to-r from-blue-500 to-blue-600',
  green: 'bg-gradient-to-r from-green-500 to-green-600',
  amber: 'bg-gradient-to-r from-amber-500 to-amber-600',
  red: 'bg-gradient-to-r from-red-500 to-red-600',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  color = 'blue',
  showPercent = true,
  animated = false,
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div>
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-2">
          {label && <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</span>}
          {showPercent && <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`
            h-full rounded-full
            ${progressColorStyles[color]}
            ${animated ? 'animate-pulse' : ''}
            transition-all duration-500
          `}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

/**
 * Avatar Component
 */
interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'idle';
}

const sizeStyles = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const statusStyles = {
  online: 'bg-green-500',
  offline: 'bg-slate-400',
  idle: 'bg-amber-500',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = '?',
  size = 'md',
  status,
}) => {
  return (
    <div className="relative inline-block">
      <img
        src={src || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`}
        alt={name}
        className={`
          ${sizeStyles[size]}
          rounded-full object-cover
          border-2 border-white dark:border-slate-800
          shadow-md
        `}
      />
      {status && (
        <div
          className={`
            absolute bottom-0 right-0
            w-3 h-3 rounded-full
            border-2 border-white dark:border-slate-800
            ${statusStyles[status]}
          `}
        ></div>
      )}
    </div>
  );
};

/**
 * Rating Component
 */
interface RatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (value: number) => void;
}

const starSizeStyles = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export const Rating: React.FC<RatingProps> = ({
  value,
  max = 5,
  size = 'md',
  interactive = false,
  onChange,
}) => {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);
  const displayValue = hoverValue ?? value;

  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => {
        const isActive = i < displayValue;
        return (
          <button
            key={i}
            className={`
              ${starSizeStyles[size]}
              transition-all duration-200
              ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
              ${isActive ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}
            `}
            onClick={() => interactive && onChange?.(i + 1)}
            onMouseEnter={() => interactive && setHoverValue(i + 1)}
            onMouseLeave={() => setHoverValue(null)}
            disabled={!interactive}
          >
            ★
          </button>
        );
      })}
    </div>
  );
};

/**
 * Tag Cloud Component
 */
interface TagCloudProps {
  tags: string[];
  onTagClick?: (tag: string) => void;
}

export const TagCloud: React.FC<TagCloudProps> = ({ tags, onTagClick }) => {
  const colors = ['primary', 'secondary', 'accent', 'success'] as const;

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, idx) => (
        <button
          key={tag}
          onClick={() => onTagClick?.(tag)}
          className={`
            px-3 py-1 rounded-full
            text-sm font-semibold
            transition-all duration-200
            hover:scale-110 hover:shadow-lg
            ${
              {
                primary: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
                secondary: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300',
                accent: 'bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300',
                success: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300',
              }[colors[idx % colors.length]]
            }
          `}
        >
          #{tag}
        </button>
      ))}
    </div>
  );
};
