import Reveal from "./Reveal.jsx";

export default function About({ config }) {
  const ABOUT = config.ABOUT;
  return (
    <section className="section" id="about">
      <div className="container about">
        <Reveal className="about-media">
          <img
            src={ABOUT.image}
            alt={ABOUT.imageAlt}
            loading="lazy"
            width="1200"
            height="800"
          />
        </Reveal>
        <div className="about-copy">
          <Reveal>
            <p className="kicker">{ABOUT.eyebrow}</p>
            <h2 className="section-title">{ABOUT.heading}</h2>
          </Reveal>
          {ABOUT.paragraphs.map((paragraph, i) => (
            <Reveal key={i} delay={80 + i * 60}>
              <p className="about-text">{paragraph}</p>
            </Reveal>
          ))}
          <Reveal delay={220}>
            <dl className="stats">
              {ABOUT.stats.map((stat) => (
                <div className="stat" key={stat.label}>
                  <dt className="stat-value">{stat.value}</dt>
                  <dd className="stat-label">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
