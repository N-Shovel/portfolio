import { useEffect, useState } from 'react';
import { startAmbient, stopAmbient } from '../ambient.js';
import Blossom from './Blossom.jsx';

const isDark = () => document.documentElement.classList.contains('dark');

export default function Nav() {
  const [sound, setSound] = useState(false);
  const [dark, setDark] = useState(isDark);

  const toggleSound = () => {
    if (sound) stopAmbient(); else startAmbient();
    setSound(!sound);
  };

  // The background scene watches the <html> class and redraws as day or night.
  const toggleTheme = () => {
    const next = !isDark();
    document.documentElement.classList.toggle('dark', next);
    setDark(next);
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch (e) {}
  };

  // T toggles the theme, except while typing.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key.toLowerCase() === 't' && !e.ctrlKey && !e.metaKey && !e.target.closest('input, textarea')) toggleTheme();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-line/60 bg-bg/60 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8">
        <a href="#top" className="flex items-center gap-2 font-semibold whitespace-nowrap"><Blossom className="size-4 text-accent" />Nimrod Pala</a>
        <nav aria-label="Main" className="flex items-center gap-3 text-[0.92rem] sm:gap-[22px]">
          <a href="#work" className="text-muted hover:text-fg max-[370px]:hidden">Work</a>
          <a href="#about" className="text-muted hover:text-fg max-[480px]:hidden">About</a>
          <a href="#contact" className="text-muted hover:text-fg">Contact</a>
          <button onClick={toggleSound} aria-label="Ambient music, generated live in your browser" aria-pressed={sound} title={sound ? 'Ambient music on (generated live in your browser)' : 'Ambient music, generated live in your browser'} className={`grid cursor-pointer place-items-center p-1 hover:text-fg ${sound ? 'text-accent' : 'text-muted'}`}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5 6 9H2v6h4l5 4z" />
              {sound ? <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" /> : <path d="m22 9-6 6M16 9l6 6" />}
            </svg>
          </button>
          {/* Day / night switch: the knob slides under the sun or the moon */}
          <button
            onClick={toggleTheme}
            role="switch"
            aria-checked={dark}
            aria-label="Dark mode"
            title={dark ? 'Switch to day (T)' : 'Switch to night (T)'}
            className="relative flex h-8 w-[60px] shrink-0 cursor-pointer items-center justify-between rounded-full border border-line bg-surface/70 px-1"
          >
            <span className="absolute top-1/2 left-1 size-6 -translate-y-1/2 rounded-full bg-accent shadow-sm transition-transform duration-300 dark:translate-x-[28px]" />
            <svg className="relative size-6 p-1 text-bg dark:text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
            <svg className="relative size-6 p-1 text-muted dark:text-bg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
          </button>
        </nav>
      </div>
    </header>
  );
}
