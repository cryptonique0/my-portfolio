import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? JSON.parse(saved) : false
  })

  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(isDark))
    document.body.style.backgroundColor = isDark ? '#1f2937' : '#ffffff'
    document.body.style.color = isDark ? '#f9fafb' : '#111827'
  }, [isDark])

  const toggleTheme = () => setIsDark(!isDark)

  const theme = {
    background: isDark ? '#1f2937' : '#ffffff',
    color: isDark ? '#f9fafb' : '#111827',
    border: isDark ? '#374151' : '#e5e7eb',
    buttonBg: isDark ? '#374151' : '#f3f4f6',
    buttonColor: isDark ? '#f9fafb' : '#111827',
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  )
}