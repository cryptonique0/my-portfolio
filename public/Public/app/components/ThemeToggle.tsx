import React, { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);
  }, []);

  const toggleTheme = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    document.documentElement.style.colorScheme = newMode ? 'dark' : 'light';
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center size-10 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">
        {isDark ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
}
