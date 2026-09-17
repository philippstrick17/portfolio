import { CONTACT } from "../content.js";
import Reveal from "./Reveal.jsx";

export default function Contact() {
  return (
    <section className="section contact" id="contact">
      <div className="container contact-grid">
        <Reveal>
          <p className="kicker kicker-light">{CONTACT.eyebrow}</p>
          <h2 className="section-title">{CONTACT.heading}</h2>
          <p className="contact-text">{CONTACT.text}</p>
          <a className="btn btn-accent" href={CONTACT.mailto}>
            {CONTACT.cta}
            <span aria-hidden="true">→</span>
          </a>
        </Reveal>
        <Reveal className="contact-list" delay={140}>
          {CONTACT.channels.map((channel) => (
            <a key={channel.kind} className="contact-row" href={channel.href}>
              <span className="contact-kind">{channel.kind}</span>
              <span className="contact-value">{channel.value}</span>
              <span className="contact-arrow" aria-hidden="true">→</span>
            </a>
          ))}
        </Reveal>
      </div>
    </section>
  );
}