/**
 * Design System Theme
 * Centralized color palette and design tokens for consistent UI
 */

export const THEME = {
  colors: {
    // Primary brand colors
    primary: {
      50: '#f0f4ff',
      100: '#e6ecff',
      200: '#d1deff',
      300: '#a6c8ff',
      400: '#7ca4ff',
      500: '#667eea',
      600: '#5a68d8',
      700: '#4a52c4',
      800: '#3d42a8',
      900: '#2d2d8f',
    },
    // Secondary colors
    secondary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#ede9fe',
      300: '#ddd6fe',
      400: '#c4b5fd',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
    },
    // Accent colors
    accent: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    // Success
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#145231',
    },
    // Warning
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    // Error
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    // Neutral/Grayscale
    neutral: {
      0: '#ffffff',
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712',
    },
    // Dark mode backgrounds
    dark: {
      bg: '#0f172a',
      card: '#1e293b',
      hover: '#334155',
      border: '#475569',
    },
    // Light mode backgrounds
    light: {
      bg: '#ffffff',
      card: '#f8fafc',
      hover: '#f1f5f9',
      border: '#e2e8f0',
    },
    // Chess board colors
    chess: {
      light: '#f0d9b5',
      dark: '#b58863',
      highlight: '#baca44',
      selected: '#7fc97f',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '2.5rem',
    '3xl': '3rem',
    '4xl': '4rem',
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.25rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  fontSizes: {
    xs: { size: '0.75rem', line: '1rem' },
    sm: { size: '0.875rem', line: '1.25rem' },
    base: { size: '1rem', line: '1.5rem' },
    lg: { size: '1.125rem', line: '1.75rem' },
    xl: { size: '1.25rem', line: '1.75rem' },
    '2xl': { size: '1.5rem', line: '2rem' },
    '3xl': { size: '1.875rem', line: '2.25rem' },
    '4xl': { size: '2.25rem', line: '2.5rem' },
    '5xl': { size: '3rem', line: '3rem' },
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
    none: 'none',
  },
  transitions: {
    fast: 'all 0.15s ease-in-out',
    base: 'all 0.2s ease-in-out',
    slow: 'all 0.3s ease-in-out',
  },
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

export type Theme = typeof THEME;
export type ColorKey = keyof typeof THEME.colors;
export type ShadowKey = keyof typeof THEME.shadows;
