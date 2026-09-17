export default function Footer({ config }) {
  const NAV = config.NAV;
  const CONTACT = config.CONTACT;
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
          <p className="footer-wordmark">{NAV.wordmark}</p>
          <nav className="footer-links" aria-label="Footer">
            {NAV.labels.map((link) => (
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
          <span>© {year} {NAV.wordmark}</span>
          <span>Fotografie · Videografie · Postproduktion</span>
        </div>
      </div>
    </footer>
  );
}
