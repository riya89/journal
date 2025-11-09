import { useEffect, useState } from 'react';
import Header from './components/Header';
import Layout from './components/Layout';
import JournalModal from './components/JournalModal';
import FlowerMeadow from './components/FlowerMeadow';

export default function App() {
  const [theme, setTheme] = useState('light');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') setTheme('dark');
  }, []);

  return (
    <div className="min-h-screen relative">
      <Header theme={theme} setTheme={setTheme} />
      <Layout theme={theme} onCardClick={() => setOpen(true)} />
      <FlowerMeadow />
      <JournalModal isOpen={open} onClose={() => setOpen(false)} theme={theme} />
    </div>
  );
}
