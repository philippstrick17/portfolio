import { useEffect, useMemo, useState } from "react";
import { fetchProjects } from "./api.js";
import Admin from "./Admin.jsx";

function useRoute() {
  const [route, setRoute] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => setRoute(window.location.hash);
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

function ProjectCard({ project }) {
  return (
    <article className="card">
      {project.image && (
        <div className="card-img">
          <img src={project.image} alt="" loading="lazy" />
        </div>
      )}
      <h3>{project.title}</h3>
      {project.subtitle && <p className="subtitle">{project.subtitle}</p>}
      <p className="description">{project.description}</p>
      {project.tags && project.tags.length > 0 && (
        <div className="tags">
          {project.tags.map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      )}
      {project.links && project.links.length > 0 && (
        <div className="links">
          {project.links.map((link) => (
            <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">
              {link.label || link.url} ↗
            </a>
          ))}
        </div>
      )}
    </article>
  );
}

function Landing() {
  const [projects, setProjects] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    fetchProjects()
      .then((data) => alive && setProjects(data))
      .catch((err) => alive && setError(err.message));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="page">
      <header className="hero">
        <h1>Philipp Strick</h1>
        <p className="tagline">
          Ich baue kleine, eigene Lösungen für den Alltag – von Apps über Websites bis zu
          Automatisierungen auf dem Raspberry Pi.
        </p>
      </header>

      <main>
        <section>
          <h2>Über mich</h2>
          <div className="card">
            <p>
              Hallo, ich bin Philipp. Ich entwickle nebenbei eigene Projekte, die mir und
              anderen den Alltag erleichtern. Meine Tools: Python/Flask für Backends und
              Automatisierung, React für moderne Web-Oberflächen und ein Raspberry Pi als
              Dauerläufer im Heimnetz.
            </p>
          </div>
        </section>

        <section>
          <h2>Projekte</h2>
          {error && <div className="card error">Fehler: {error}</div>}
          {!projects && !error && <div className="card">Lade Projekte…</div>}
          {projects && projects.length === 0 && (
            <div className="card">Noch keine Projekte veröffentlicht.</div>
          )}
          {projects && projects.length > 0 && (
            <div className="grid">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer>
        <p>
          © {new Date().getFullYear()} Philipp Strick · Portfolio ·{" "}
          <a href="https://github.com/philippstrick17">GitHub</a> ·{" "}
          <a href="#/admin">Admin</a>
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  const route = useRoute();
  return route.startsWith("#/admin") ? <Admin /> : <Landing />;
}