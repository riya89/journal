import { useEffect } from 'react';

export default function ThemeToggle({ theme, setTheme }) {
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="fixed top-6 right-6 rounded-full p-3 bg-white/60 dark:bg-darkbg/40 backdrop-blur-lg shadow-md text-2xl"
    >
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}
