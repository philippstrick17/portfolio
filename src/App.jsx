import { useEffect, useMemo, useState } from "react";
import Admin from "./Admin.jsx";
import About from "./components/About.jsx";
import Contact from "./components/Contact.jsx";
import Footer from "./components/Footer.jsx";
import Hero from "./components/Hero.jsx";
import Marquee from "./components/Marquee.jsx";
import Nav from "./components/Nav.jsx";
import Portfolio from "./components/Portfolio.jsx";
import Services from "./components/Services.jsx";
import { fetchSiteConfig } from "./api.js";
import * as content from "./content.js";

function useRoute() {
  const [route, setRoute] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => setRoute(window.location.hash);
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

function isPlainObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

/** Tief zusammenführen: Objekte mergen, Arrays & Basiswerte überschreiben. */
export function mergeConfig(base, over) {
  if (!isPlainObject(base) || !isPlainObject(over)) {
    return over === undefined ? base : over;
  }
  const out = { ...base };
  for (const key of Object.keys(over)) {
    out[key] = mergeConfig(base[key], over[key]);
  }
  return out;
}

/** Website-Konfiguration laden (API auf dem Pi, sonst site.json als Fallback). */
function useSiteConfig() {
  const [config, setConfig] = useState(nullapsed);
  useEffect(() => {
    let alive = true;
    fetchSiteConfig()
      .then((site) => {
        if (!alive) return;
        setConfig(
          site && isPlainObject(site) ? mergeConfig(content, site) : content
        );
      })
      .catch(() => {
        if (alive) setConfig(content);
      });
    return () => {
      alive = false;
    };
  }, []);
  return config;
}

function Landing({ config }) {
  return (
    <>
      <a className="skip-link" href="#main">
        Zum Inhalt springen
      </a>
      <Nav config={config} />
      <main id="main">
        <Hero config={config} />
        <Marquee items={config.MARQUEE} />
        <About config={config} />
        <Services config={config} />
        <Portfolio config={config} />
        <Contact config={config} />
      </main>
      <Footer config={config} />
    </>
  );
}

export default function App() {
  const route = useRoute();
  const config = useSiteConfig();
  if (route.startsWith("#/admin")) return <Admin />;
  if (!config) return null;
  return <Landing config={config} />;
}
