export default function Marquee({ items }) {
  const row = items.join("   ·   ");
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        <span>{row}</span>
        <span>{row}</span>
        <span>{row}</span>
        <span>{row}</span>
      </div>
    </div>
  );
}