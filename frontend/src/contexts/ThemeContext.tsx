import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark'; // The actual theme being applied
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // Always set to dark theme
    setTheme('dark');
    setActualTheme('dark');
    
    // Apply dark theme to document
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  }, []);

  const handleSetTheme = (newTheme: Theme) => {
    // Only allow dark theme
    setTheme('dark');
    setActualTheme('dark');
    localStorage.setItem('theme', 'dark');
    
    // Ensure dark theme is applied
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, actualTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
