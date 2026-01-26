import React from 'react';
import { useThemeStore } from '../store';

/**
 * Reusable Button Component
 */
export const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  className?: string;
}> = ({ children, onClick, variant = 'primary', disabled = false, className = '' }) => {
  const isDarkMode = useThemeStore(state => state.isDarkMode);

  const baseStyles = 'px-4 py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: `bg-blue-600 text-white hover:bg-blue-700 ${isDarkMode ? 'dark:bg-blue-700' : ''}`,
    secondary: `bg-gray-300 text-gray-900 hover:bg-gray-400 ${isDarkMode ? 'dark:bg-gray-600 dark:text-white' : ''}`,
    danger: `bg-red-600 text-white hover:bg-red-700 ${isDarkMode ? 'dark:bg-red-700' : ''}`
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

/**
 * Reusable Card Component
 */
export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const isDarkMode = useThemeStore(state => state.isDarkMode);

  return (
    <div className={`
      rounded-lg border
      ${isDarkMode
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200'
      }
      p-6 shadow-sm
      ${className}
    `}>
      {children}
    </div>
  );
};

/**
 * Reusable Input Component
 */
export const Input: React.FC<{
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}> = ({ type = 'text', placeholder, value, onChange, className = '' }) => {
  const isDarkMode = useThemeStore(state => state.isDarkMode);

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`
        w-full px-4 py-2 rounded-lg border
        ${isDarkMode
          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
        }
        focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
        transition-all duration-200
        ${className}
      `}
    />
  );
};

/**
 * Loading Spinner Component
 */
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeMap = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };

  return (
    <div className={`${sizeMap[size]} border-4 border-blue-600 border-t-transparent rounded-full animate-spin`} />
  );
};

/**
 * Modal Component
 */
export const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  const isDarkMode = useThemeStore(state => state.isDarkMode);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className={`w-full max-w-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>
        {children}
      </Card>
    </div>
  );
};
