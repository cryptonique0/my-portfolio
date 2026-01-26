/**
 * Card Component
 * Flexible container with consistent styling
 */

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  gradient?: boolean;
}

const paddingStyles = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const variantStyles = {
  default: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
  elevated:
    'bg-white dark:bg-slate-800 shadow-lg dark:shadow-2xl border border-slate-100 dark:border-slate-700',
  outlined: 'bg-transparent border-2 border-slate-300 dark:border-slate-600',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      hover = false,
      gradient = false,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`
          ${variantStyles[variant]}
          ${paddingStyles[padding]}
          rounded-xl
          transition-all duration-200
          ${hover ? 'hover:shadow-xl hover:scale-105 cursor-pointer' : ''}
          ${gradient ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * Card Header
 */
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  children,
  className = '',
  ...props
}) => (
  <div
    className={`flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700 ${className}`}
    {...props}
  >
    <div className="flex-1">
      {title && <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>}
      {subtitle && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{subtitle}</p>}
      {children}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

/**
 * Card Body
 */
interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardBody: React.FC<CardBodyProps> = ({ children, className = '', ...props }) => (
  <div className={`py-4 ${className}`} {...props}>
    {children}
  </div>
);

/**
 * Card Footer
 */
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '', ...props }) => (
  <div
    className={`pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 ${className}`}
    {...props}
  >
    {children}
  </div>
);
