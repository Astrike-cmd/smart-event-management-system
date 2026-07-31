import useTheme from '../hooks/useTheme';

function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className="btn btn-theme-toggle d-inline-flex align-items-center"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
    >
      <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
    </button>
  );
}

export default ThemeToggle;
