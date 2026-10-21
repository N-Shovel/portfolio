import { useEffect, useState } from 'react';
import { startAmbient, stopAmbient } from '../ambient.js';

function toggleTheme() {
  const dark = document.documentElement.classList.toggle('dark');
  try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) {}
}

export default function Nav() {
  const [sound, setSound] = useState(false);
  const toggleSound = () => {
    if (sound) stopAmbient(); else startAmbient();
    setSound(!sound);
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
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-[18px] sm:px-8">
      <a href="#top" className="font-semibold">Nimrod Pala</a>
      <nav aria-label="Main" className="flex items-center gap-4 text-[0.92rem] sm:gap-[22px]">
        <a href="#work" className="text-muted hover:text-fg">Work</a>
        <a href="#about" className="text-muted hover:text-fg max-[380px]:hidden">About</a>
        <a href="#contact" className="text-muted hover:text-fg">Contact</a>
        <button onClick={toggleSound} aria-label={sound ? 'Turn music off' : 'Turn on ambient music'} aria-pressed={sound} title={sound ? 'Music on' : 'Play ambient music'} className={`grid cursor-pointer place-items-center p-1 hover:text-fg ${sound ? 'text-accent' : 'text-muted'}`}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5 6 9H2v6h4l5 4z" />
            {sound ? <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" /> : <path d="m22 9-6 6M16 9l6 6" />}
          </svg>
        </button>
        <button onClick={toggleTheme} aria-label="Toggle dark or light mode" title="Toggle theme (T)" className="grid cursor-pointer place-items-center p-1 text-muted hover:text-fg">
          {/* Sun in light mode, moon in dark mode */}
          <svg className="dark:hidden" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
          <svg className="hidden dark:block" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
        </button>
      </nav>
      </div>
    </header>
  );
}
