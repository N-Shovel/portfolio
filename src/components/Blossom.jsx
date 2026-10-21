// Small five-petal sakura flower, used as an icon in place of dots and bullets.
export default function Blossom({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="12" cy="6.6" rx="3.7" ry="5.1" transform={`rotate(${a} 12 12)`} />
      ))}
      <circle cx="12" cy="12" r="2.1" className="fill-bg/80" />
    </svg>
  );
}
