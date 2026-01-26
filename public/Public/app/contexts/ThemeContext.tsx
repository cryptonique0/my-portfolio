'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeName = 'classic' | 'ocean' | 'forest' | 'sunset' | 'midnight' | 'royal';

// Helper function to convert hex to RGB
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

export interface Theme {
  name: ThemeName;
  displayName: string;
  colors: {
    // Background gradients
    primaryBg: string;
    secondaryBg: string;
    accentBg: string;
    
    // Board colors
    lightSquare: string;
    darkSquare: string;
    
    // Accent colors
    primary: string;
    secondary: string;
    accent: string;
    
    // UI colors
    cardBg: string;
    cardBorder: string;
    textPrimary: string;
    textSecondary: string;
    success: string;
    error: string;
    warning: string;
  };
}

export const themes: Record<ThemeName, Theme> = {
  classic: {
    name: 'classic',
    displayName: 'Classic Chess',
    colors: {
      primaryBg: '#1a1a2e',
      secondaryBg: '#16213e',
      accentBg: '#0f3460',
      lightSquare: '#f0d9b5',
      darkSquare: '#b58863',
      primary: '#667eea',
      secondary: '#764ba2',
      accent: '#f093fb',
      cardBg: 'rgba(255, 255, 255, 0.05)',
      cardBorder: 'rgba(255, 255, 255, 0.1)',
      textPrimary: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.6)',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
    }
  },
  ocean: {
    name: 'ocean',
    displayName: 'Ocean Blue',
    colors: {
      primaryBg: '#0a2342',
      secondaryBg: '#2c5f77',
      accentBg: '#1a4d6d',
      lightSquare: '#bae8e8',
      darkSquare: '#2c7873',
      primary: '#3b82f6',
      secondary: '#06b6d4',
      accent: '#0ea5e9',
      cardBg: 'rgba(59, 130, 246, 0.1)',
      cardBorder: 'rgba(59, 130, 246, 0.3)',
      textPrimary: '#e0f2fe',
      textSecondary: 'rgba(224, 242, 254, 0.7)',
      success: '#14b8a6',
      error: '#f43f5e',
      warning: '#f59e0b',
    }
  },
  forest: {
    name: 'forest',
    displayName: 'Forest Green',
    colors: {
      primaryBg: '#0d1f0d',
      secondaryBg: '#1a3d1a',
      accentBg: '#265c26',
      lightSquare: '#d4e8d4',
      darkSquare: '#4a7c59',
      primary: '#10b981',
      secondary: '#059669',
      accent: '#34d399',
      cardBg: 'rgba(16, 185, 129, 0.1)',
      cardBorder: 'rgba(16, 185, 129, 0.3)',
      textPrimary: '#ecfdf5',
      textSecondary: 'rgba(236, 253, 245, 0.7)',
      success: '#22c55e',
      error: '#f87171',
      warning: '#fbbf24',
    }
  },
  sunset: {
    name: 'sunset',
    displayName: 'Sunset Orange',
    colors: {
      primaryBg: '#2d1b1b',
      secondaryBg: '#4a2c2c',
      accentBg: '#6b3d3d',
      lightSquare: '#ffe5d4',
      darkSquare: '#d4816b',
      primary: '#f97316',
      secondary: '#ea580c',
      accent: '#fb923c',
      cardBg: 'rgba(249, 115, 22, 0.1)',
      cardBorder: 'rgba(249, 115, 22, 0.3)',
      textPrimary: '#fff7ed',
      textSecondary: 'rgba(255, 247, 237, 0.7)',
      success: '#84cc16',
      error: '#ef4444',
      warning: '#eab308',
    }
  },
  midnight: {
    name: 'midnight',
    displayName: 'Midnight Purple',
    colors: {
      primaryBg: '#0f0a1e',
      secondaryBg: '#1e1433',
      accentBg: '#2d1f4a',
      lightSquare: '#e9d5ff',
      darkSquare: '#7c3aed',
      primary: '#a855f7',
      secondary: '#9333ea',
      accent: '#c084fc',
      cardBg: 'rgba(168, 85, 247, 0.1)',
      cardBorder: 'rgba(168, 85, 247, 0.3)',
      textPrimary: '#faf5ff',
      textSecondary: 'rgba(250, 245, 255, 0.7)',
      success: '#a78bfa',
      error: '#f472b6',
      warning: '#fbbf24',
    }
  },
  royal: {
    name: 'royal',
    displayName: 'Royal Gold',
    colors: {
      primaryBg: '#1a1308',
      secondaryBg: '#2d2210',
      accentBg: '#3d3018',
      lightSquare: '#fef3c7',
      darkSquare: '#b8860b',
      primary: '#eab308',
      secondary: '#ca8a04',
      accent: '#fbbf24',
      cardBg: 'rgba(234, 179, 8, 0.1)',
      cardBorder: 'rgba(234, 179, 8, 0.3)',
      textPrimary: '#fefce8',
      textSecondary: 'rgba(254, 252, 232, 0.7)',
      success: '#84cc16',
      error: '#dc2626',
      warning: '#f59e0b',
    }
  }
};

interface ThemeContextType {
  currentTheme: Theme;
  themeName: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>('classic');
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes.classic);

  useEffect(() => {
    // Load theme from localStorage
    const saved = localStorage.getItem('chessTheme') as ThemeName;
    if (saved && themes[saved]) {
      setThemeName(saved);
      setCurrentTheme(themes[saved]);
    }
  }, []);

  useEffect(() => {
    // Apply CSS variables
    const root = document.documentElement;
    const theme = currentTheme.colors;
    
    // Set hex colors
    root.style.setProperty('--primary-bg', theme.primaryBg);
    root.style.setProperty('--secondary-bg', theme.secondaryBg);
    root.style.setProperty('--accent-bg', theme.accentBg);
    root.style.setProperty('--light-square', theme.lightSquare);
    root.style.setProperty('--dark-square', theme.darkSquare);
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--secondary', theme.secondary);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--card-bg', theme.cardBg);
    root.style.setProperty('--card-border', theme.cardBorder);
    root.style.setProperty('--text-primary', theme.textPrimary);
    root.style.setProperty('--text-secondary', theme.textSecondary);
    root.style.setProperty('--success', theme.success);
    root.style.setProperty('--error', theme.error);
    root.style.setProperty('--warning', theme.warning);
    
    // Set RGB versions for use in rgba()
    root.style.setProperty('--primary-rgb', hexToRgb(theme.primary));
    root.style.setProperty('--secondary-rgb', hexToRgb(theme.secondary));
    root.style.setProperty('--accent-rgb', hexToRgb(theme.accent));
    root.style.setProperty('--text-primary-rgb', hexToRgb(theme.textPrimary));
    root.style.setProperty('--text-secondary-rgb', hexToRgb(theme.textSecondary));
    root.style.setProperty('--success-rgb', hexToRgb(theme.success));
    root.style.setProperty('--error-rgb', hexToRgb(theme.error));
    root.style.setProperty('--warning-rgb', hexToRgb(theme.warning));
  }, [currentTheme]);

  const setTheme = (name: ThemeName) => {
    setThemeName(name);
    setCurrentTheme(themes[name]);
    localStorage.setItem('chessTheme', name);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, themeName, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  try {
    const context = useContext(ThemeContext);
    if (!context) {
      // Return default theme during SSR or if used outside provider
      return {
        currentTheme: themes.classic,
        themeName: 'classic' as ThemeName,
        setTheme: () => {}
      };
    }
    return context;
  } catch {
    // If React or useContext fails during SSR, return default theme
    return {
      currentTheme: themes.classic,
      themeName: 'classic' as ThemeName,
      setTheme: () => {}
    };
  }
}
