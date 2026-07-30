export const THEME_KEY = 'smart-event-theme';

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
};

export const getStoredTheme = () => localStorage.getItem(THEME_KEY);

export const getPreferredTheme = () => {
  const storedTheme = getStoredTheme();

  if (storedTheme && Object.values(THEMES).includes(storedTheme)) {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? THEMES.DARK
    : THEMES.LIGHT;
};
