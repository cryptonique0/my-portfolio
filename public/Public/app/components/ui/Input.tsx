/**
 * Input Component
 * Text, email, password inputs with consistent styling
 */

import React from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-3 py-2 text-base',
  lg: 'px-4 py-3 text-lg',
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      size = 'md',
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            {label}
            {props.required && <span className="text-red-600 ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 text-slate-500 dark:text-slate-400">{icon}</div>
          )}
          <input
            ref={ref}
            className={`
              w-full
              ${sizeStyles[size]}
              ${iconPosition === 'left' && icon ? 'pl-10' : ''}
              ${iconPosition === 'right' && icon ? 'pr-10' : ''}
              bg-white dark:bg-slate-800
              border-2
              ${error ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-500'}
              rounded-lg
              transition-all duration-200
              focus:outline-none
              focus:ring-2
              ${error ? 'focus:ring-red-500' : 'focus:ring-blue-500'}
              focus:ring-offset-2
              dark:focus:ring-offset-slate-900
              text-slate-900 dark:text-white
              placeholder-slate-500 dark:placeholder-slate-400
              disabled:opacity-50 disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          />
          {icon && iconPosition === 'right' && (
            <div className="absolute right-3 text-slate-500 dark:text-slate-400">{icon}</div>
          )}
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>}
        {helperText && !error && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

/**
 * Textarea Component
 */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, fullWidth = false, className = '', ...props }, ref) => {
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            {label}
            {props.required && <span className="text-red-600 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full
            px-3 py-2
            bg-white dark:bg-slate-800
            border-2
            ${error ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-500'}
            rounded-lg
            transition-all duration-200
            focus:outline-none
            focus:ring-2
            ${error ? 'focus:ring-red-500' : 'focus:ring-blue-500'}
            focus:ring-offset-2
            dark:focus:ring-offset-slate-900
            text-slate-900 dark:text-white
            placeholder-slate-500 dark:placeholder-slate-400
            disabled:opacity-50 disabled:cursor-not-allowed
            resize-vertical min-h-24
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>}
        {helperText && !error && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

/**
 * Select Component
 */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  options?: Array<{ label: string; value: string | number }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, fullWidth = false, options = [], className = '', ...props }, ref) => {
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            {label}
            {props.required && <span className="text-red-600 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={`
            w-full
            px-3 py-2
            bg-white dark:bg-slate-800
            border-2
            ${error ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-500'}
            rounded-lg
            transition-all duration-200
            focus:outline-none
            focus:ring-2
            ${error ? 'focus:ring-red-500' : 'focus:ring-blue-500'}
            focus:ring-offset-2
            dark:focus:ring-offset-slate-900
            text-slate-900 dark:text-white
            disabled:opacity-50 disabled:cursor-not-allowed
            appearance-none
            ${className}
          `}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>}
        {helperText && !error && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
