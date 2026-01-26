/**
 * Badge Component
 * For labels, status indicators, and tags
 */

import React from 'react';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  dot?: boolean;
  outline?: boolean;
}

const variantStyles: Record<BadgeVariant, Record<string, string>> = {
  primary: {
    filled: 'bg-blue-600 text-white',
    outline: 'border border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-500',
  },
  success: {
    filled: 'bg-green-600 text-white',
    outline: 'border border-green-600 text-green-600 dark:text-green-400 dark:border-green-500',
  },
  warning: {
    filled: 'bg-amber-600 text-white',
    outline: 'border border-amber-600 text-amber-600 dark:text-amber-400 dark:border-amber-500',
  },
  error: {
    filled: 'bg-red-600 text-white',
    outline: 'border border-red-600 text-red-600 dark:text-red-400 dark:border-red-500',
  },
  info: {
    filled: 'bg-cyan-600 text-white',
    outline: 'border border-cyan-600 text-cyan-600 dark:text-cyan-400 dark:border-cyan-500',
  },
  neutral: {
    filled: 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white',
    outline: 'border border-slate-300 text-slate-700 dark:text-slate-300 dark:border-slate-600',
  },
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs font-semibold rounded',
  md: 'px-3 py-1 text-sm font-semibold rounded-md',
  lg: 'px-4 py-1.5 text-base font-semibold rounded-lg',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  dot = false,
  outline = false,
  children,
  className = '',
  ...props
}) => {
  const style = outline ? variantStyles[variant].outline : variantStyles[variant].filled;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        ${sizeStyles[size]}
        ${style}
        rounded-full
        font-medium
        transition-all duration-200
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${outline ? 'bg-current' : 'bg-white'}`}
        ></span>
      )}
      {icon && <span className="inline-flex">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
