export default function Hero({ config }) {
  const HERO = config.HERO;
  return (
    <section className="hero" id="top">
      <div className="hero-media">
        <img
          src={HERO.image}
          alt={HERO.imageAlt}
          fetchpriority="high"
          width="2048"
          height="1280"
        />
      </div>
      <div className="hero-overlay" />
      <div className="container hero-content">
        <p className="kicker kicker-light">{HERO.eyebrow}</p>
        <h1 className="hero-title">{HERO.title}</h1>
        <p className="hero-subtitle">{HERO.subtitle}</p>
        <div className="hero-actions">
          <a className="btn btn-light" href={HERO.ctaPrimary.href}>
            {HERO.ctaPrimary.label}
            <span aria-hidden="true">→</span>
          </a>
          <a className="btn btn-ghost" href={HERO.ctaSecondary.href}>
            {HERO.ctaSecondary.label}
          </a>
        </div>
      </div>
      <div className="hero-foot">
        <span className="hero-scroll" aria-hidden="true">
          Scrollen
        </span>
        <span className="hero-corner" aria-hidden="true">
          Porträt · Event · Film
        </span>
      </div>
    </section>
  );
}
