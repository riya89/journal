import { useEffect, useState } from 'react';

export default function Header({ theme, setTheme }) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const fmt = () => {
      const d = new Date();
      let h = d.getHours();
      const m = String(d.getMinutes()).padStart(2, '0');
      const ampm = h >= 12 ? 'pm' : 'am';
      h = h % 12 || 12;
      setTime(`${h}:${m} ${ampm}`);
    };
    fmt();
    const t = setInterval(fmt, 60000);
    return () => clearInterval(t);
  }, []);

  // dark toggle attaches 'dark' class to <html> (fixes #4)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <header className="max-w-5xl w-full mx-auto px-6 pt-6 pb-3">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center">
        <div className="text-xl opacity-90">{time || '11:11 am'}</div>
        <h1 className="text-4xl font-bold text-center">My Journal</h1>
        <div className="justify-self-end flex items-center gap-3 relative">
          <select className="bg-transparent border-2 border-leaf2 dark:border-sage text-inherit rounded-xl px-3 py-1 cursor-pointer">
            <option>November</option>
          </select>
          <div className="w-9 h-9 rounded-full border-2 border-leaf2 dark:border-sage grid place-items-center shadow-soft bg-white/60 dark:bg-white/10">
            ⚙️
          </div>
          <button
            onClick={() => {
              const next = theme === 'dark' ? 'light' : 'dark';
              setTheme(next);
              localStorage.setItem('theme', next);
            }}
            className="w-9 h-9 rounded-full border-2 border-leaf2 dark:border-sage grid place-items-center shadow-soft bg-white/60 dark:bg-white/10"
            title="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </header>
  );
}
