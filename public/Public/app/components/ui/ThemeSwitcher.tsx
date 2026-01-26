'use client';
import { useState, useEffect } from 'react';
import { useTheme, themes, ThemeName } from '../../contexts/ThemeContext';
import styles from './ThemeSwitcher.module.css';

export default function ThemeSwitcher() {
  const { themeName, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Avoid SSR mismatch
  }

  const handleThemeChange = (name: ThemeName) => {
    setTheme(name);
    setIsOpen(false);
  };

  return (
    <div className={styles.themeSwitcher}>
      <button 
        className={styles.themeButton}
        onClick={() => setIsOpen(!isOpen)}
        title="Change theme"
      >
        🎨 Theme
      </button>

      {isOpen && (
        <div className={styles.themeMenu}>
          <div className={styles.menuHeader}>
            <h3>Choose Theme</h3>
            <button 
              className={styles.closeBtn}
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>
          
          <div className={styles.themeGrid}>
            {Object.entries(themes).map(([key, theme]) => (
              <button
                key={key}
                className={`${styles.themeCard} ${themeName === key ? styles.active : ''}`}
                onClick={() => handleThemeChange(key as ThemeName)}
              >
                <div className={styles.themePreview}>
                  <div 
                    className={styles.previewSquare}
                    style={{ 
                      background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)` 
                    }}
                  />
                  <div className={styles.boardPreview}>
                    <div 
                      className={styles.lightSquare} 
                      style={{ background: theme.colors.lightSquare }}
                    />
                    <div 
                      className={styles.darkSquare}
                      style={{ background: theme.colors.darkSquare }}
                    />
                    <div 
                      className={styles.darkSquare}
                      style={{ background: theme.colors.darkSquare }}
                    />
                    <div 
                      className={styles.lightSquare}
                      style={{ background: theme.colors.lightSquare }}
                    />
                  </div>
                </div>
                <span className={styles.themeName}>{theme.displayName}</span>
                {themeName === key && (
                  <span className={styles.activeIndicator}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && (
        <div 
          className={styles.overlay}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
