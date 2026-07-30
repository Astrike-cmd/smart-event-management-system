import { createContext, useEffect, useMemo, useState } from 'react';
import { THEME_KEY, THEMES, getPreferredTheme } from '../utils/theme';

export const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getPreferredTheme);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      isDarkMode: theme === THEMES.DARK,
      toggleTheme: () =>
        setTheme((currentTheme) =>
          currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK
        )
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
