import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('qonnect-theme') as Theme) || 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const resolve = () => {
      if (theme === 'system') {
        return mediaQuery.matches ? 'dark' : 'light';
      }
      return theme;
    };

    const apply = () => {
      const resolved = resolve();
      setResolvedTheme(resolved);
      document.documentElement.classList.toggle('dark', resolved === 'dark');
    };

    apply();
    mediaQuery.addEventListener('change', apply);
    return () => mediaQuery.removeEventListener('change', apply);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('qonnect-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
