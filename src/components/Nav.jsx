import { useEffect } from 'react';

function toggleTheme() {
  const dark = document.documentElement.classList.toggle('dark');
  try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) {}
}

export default function Nav() {
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
