import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  isDark: boolean;
  isHighContrast: boolean;
  toggleTheme: () => void;
  toggleHighContrast: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('aicte_theme') === 'dark';
  });

  const [isHighContrast, setIsHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('aicte_high_contrast') === 'true';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('aicte_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('aicte_theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const root = document.documentElement;
    if (isHighContrast) {
      root.classList.add('high-contrast');
      localStorage.setItem('aicte_high_contrast', 'true');
    } else {
      root.classList.remove('high-contrast');
      localStorage.setItem('aicte_high_contrast', 'false');
    }
  }, [isHighContrast]);

  const toggleTheme = () => setIsDark(prev => !prev);
  const toggleHighContrast = () => setIsHighContrast(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, isHighContrast, toggleTheme, toggleHighContrast }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
