'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

/**
 * Primary Button Component
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  onClick,
  className = '',
  ...props
}: HTMLMotionProps<'button'> & {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  isLoading?: boolean;
}) {
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:shadow-lg hover:shadow-indigo-500/50',
    secondary: 'bg-slate-700 text-white hover:bg-slate-600',
    outline: 'border border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/10',
    ghost: 'text-indigo-300 hover:bg-indigo-500/10',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        rounded-lg font-semibold transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="inline-block"
          >
            ⟳
          </motion.span>
          Loading...
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
}

/**
 * Input Field Component
 */
export function Input({
  label,
  error,
  required = false,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-semibold text-slate-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        required={required}
        className={`
          px-4 py-2 rounded-lg border transition-all
          bg-slate-800 text-white placeholder-slate-500
          ${error
            ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
            : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20'
          }
          focus:outline-none focus:ring-2
        `}
        {...props}
      />
      {error && <span className="text-sm text-red-400">{error}</span>}
    </div>
  );
}

/**
 * Select Component
 */
export function Select({
  label,
  options,
  error,
  required = false,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: Array<{ value: string; label: string }>;
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-semibold text-slate-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        required={required}
        className={`
          px-4 py-2 rounded-lg border transition-all
          bg-slate-800 text-white
          ${error
            ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
            : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20'
          }
          focus:outline-none focus:ring-2
        `}
        {...props}
      >
        <option value="">Select an option</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-sm text-red-400">{error}</span>}
    </div>
  );
}

/**
 * Card Component
 */
export function Card({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        rounded-xl border border-white/10 bg-white/5 backdrop-blur
        p-6 shadow-xl transition-all hover:border-white/20
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Badge Component
 */
export function Badge({
  children,
  variant = 'primary',
  className = '',
}: {
  children: ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}) {
  const variants = {
    primary: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50',
    success: 'bg-green-500/20 text-green-300 border border-green-500/50',
    warning: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50',
    error: 'bg-red-500/20 text-red-300 border border-red-500/50',
    info: 'bg-blue-500/20 text-blue-300 border border-blue-500/50',
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

/**
 * Alert Component
 */
export function Alert({
  children,
  variant = 'info',
  className = '',
}: {
  children: ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
}) {
  const variants = {
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    success: 'bg-green-500/10 border-green-500/30 text-green-300',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
    error: 'bg-red-500/10 border-red-500/30 text-red-300',
  };

  const icons = {
    info: 'ℹ️',
    success: '✓',
    warning: '⚠️',
    error: '✕',
  };

  return (
    <div className={`flex gap-3 p-4 rounded-lg border ${variants[variant]} ${className}`}>
      <span className="text-lg">{icons[variant]}</span>
      <div>{children}</div>
    </div>
  );
}
