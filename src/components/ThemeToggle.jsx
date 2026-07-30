import useTheme from '../hooks/useTheme';

function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className="btn btn-theme-toggle d-inline-flex align-items-center gap-2"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
    >
      <i className={`bi ${isDarkMode ? 'bi-sun-fill' : 'bi-moon-stars-fill'}`}></i>
      <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
    </button>
  );
}

export default ThemeToggle;
