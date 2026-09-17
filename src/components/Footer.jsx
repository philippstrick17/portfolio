import { CONTACT, NAV } from "../content.js";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <a className="footer-cta" href="#contact">
            Lass uns etwas schaffen<span aria-hidden="true"> →</span>
          </a>
          <a className="footer-toplink" href="#top">
            Nach oben ↑
          </a>
        </div>
        <div className="footer-inner">
          <p className="footer-wordmark">Philipp Strick</p>
          <nav className="footer-links" aria-label="Footer">
            {NAV.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
          <div className="footer-social">
            {CONTACT.channels.map((channel) => (
              <a key={channel.kind} href={channel.href}>
                {channel.value}
              </a>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {year} Philipp Strick · Fotograf & Videograf</span>
          <span>Fotografie · Videografie · Postproduktion</span>
        </div>
      </div>
    </footer>
  );
}