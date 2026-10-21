import { useEffect, useRef } from 'react';

// Decorative layer behind the page: dot grid, drifting color blobs, film grain and a cursor spotlight.
export default function Background() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    let frame = 0;
    const onMove = (e) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.setProperty('--mx', `${e.clientX}px`);
        el.style.setProperty('--my', `${e.clientY}px`);
      });
    };
    window.addEventListener('pointermove', onMove);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="blob left-[-10%] top-[-15%] size-[45vw] bg-emerald-400 [animation-duration:26s]" />
      <div className="blob right-[-12%] top-[20%] size-[40vw] bg-sky-400 [animation-delay:-8s] [animation-duration:32s]" />
      <div className="blob bottom-[-20%] left-[25%] size-[42vw] bg-violet-500 [animation-delay:-16s] [animation-duration:38s]" />
      <div className="dots absolute inset-0" />
      <div className="spotlight absolute inset-0" />
      <div className="grain absolute inset-0" />
    </div>
  );
}
