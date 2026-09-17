import { useEffect, useState } from "react";

const SECTION_IDS = ["about", "portfolio", "contact"];

export default function Nav({ config }) {
  const NAV = config.NAV;
  const HERO = config.HERO;
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    let raf = 0;
    const handle = () => {
      const y = window.scrollY + window.innerHeight * 0.35;
      let current = "";
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (!el) break;
        if (el.offsetTop <= y) current = id;
        else break;
      }
      setScrolled(window.scrollY > 32);
      setActive(current);
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        handle();
      });
    };
    handle();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <header className={`nav ${scrolled ? "is-scrolled" : ""}`}>
      <a className="nav-wordmark" href="#top" aria-label="Zur Startseite">
        {NAV.wordmark}
      </a>
      <nav className="nav-links" aria-label="Hauptnavigation">
        {NAV.labels.map((link) => (
          <a
            key={link.href}
            href={link.href}
            aria-current={active === link.href.slice(1) ? "true" : undefined}
          >
            {link.label}
          </a>
        ))}
        <a className="nav-cta" href={HERO.ctaSecondary.href}>
          {HERO.ctaSecondary.label}
        </a>
      </nav>
    </header>
  );
}
