import React from 'react'
import { useTheme } from '../contexts/ThemeContext'

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: '8px 16px',
        borderRadius: 4,
        background: 'transparent',
        border: '1px solid #e5e7eb',
        cursor: 'pointer',
        fontSize: 14,
      }}
      aria-label="Toggle theme"
    >
      {isDark ? '☀️ Light' : '🌙 Dark'}
    </button>
  )
}