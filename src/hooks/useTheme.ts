import { useState, useEffect } from 'react';

function getInitialDark(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }

  const stored = localStorage.getItem('p2s_theme');

  if (stored === 'dark') {
    return true;
  }

  if (stored === 'light') {
    return false;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyThemeClass(isDark: boolean) {
  const root = document.documentElement;
  root.classList.toggle('dark', isDark);
  root.classList.toggle('light', !isDark);
}

export function useTheme() {
  const [isDark, setIsDark] = useState(getInitialDark);

  useEffect(() => {
    applyThemeClass(isDark);
    localStorage.setItem('p2s_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('p2s_theme')) {
        setIsDark(e.matches);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggle = () => setIsDark((prev) => !prev);

  return { isDark, toggle };
}
