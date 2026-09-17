import Reveal from "./Reveal.jsx";

export default function Services({ config }) {
  const CONTACT = config.CONTACT;
  const SERVICES = config.SERVICES;
  if (!SERVICES || !SERVICES.items) return null;
  return (
    <section className="section section-tint" id="services">
      <div className="container">
        <Reveal className="section-head">
          <p className="kicker">{SERVICES.eyebrow}</p>
          <h2 className="section-title">{SERVICES.heading}</h2>
        </Reveal>
        <div className="services">
          {SERVICES.items.map((service, i) => (
            <Reveal
              as="article"
              key={service.name}
              delay={i * 120}
              className="service"
            >
              <p className="service-index">0{i + 1}</p>
              <h3 className="service-name">{service.name}</h3>
              <p className="service-description">{service.description}</p>
              <ul className="service-points">
                {service.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <a className="service-cta" href={CONTACT.mailto}>
                Unverbindlich anfragen →
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
