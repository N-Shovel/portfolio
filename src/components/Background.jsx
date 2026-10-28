import { useEffect, useRef } from 'react';
import { createSakuraScene } from '../scene/sakura.js';

// The intro text in page coordinates, with the bottom of the sticky nav: the sun or moon stays clear of it.
function introBox() {
  const intro = document.getElementById('intro')?.getBoundingClientRect();
  if (!intro) return null;
  const skyTop = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0;
  return { top: intro.top + window.scrollY, bottom: intro.bottom + window.scrollY, skyTop };
}

// Fixed backdrop: a sakura tree beside the sea with falling petals (drawn in scene/sakura.js).
export default function Background() {
  const baseRef = useRef(null);
  const fxRef = useRef(null);

  useEffect(() => {
    const scene = createSakuraScene(baseRef.current, fxRef.current, { clearOf: introBox });
    return () => scene.destroy();
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-lvh">
      <canvas ref={baseRef} className="absolute inset-0 size-full" />
      <canvas ref={fxRef} className="absolute inset-0 size-full" />
    </div>
  );
}
