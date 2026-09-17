import { useCallback, useEffect, useState } from "react";
import { fetchProjects } from "../api.js";
import { PLACEHOLDER_GRADIENTS, PORTFOLIO } from "../content.js";
import Reveal from "./Reveal.jsx";

function gradientFor(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return PLACEHOLDER_GRADIENTS[hash % PLACEHOLDER_GRADIENTS.length];
}

function ProjectCard({ project, index }) {
  const firstLink = project.links?.[0]?.url;
  return (
    <article className="project">
      <div
        className="project-media"
        style={project.image ? undefined : { background: gradientFor(project.id) }}
      >
        {project.image ? (
          <img
            src={project.image}
            alt=""
            loading="lazy"
            width="1200"
            height="900"
          />
        ) : (
          <span className="project-fallback" aria-hidden="true">
            {project.title.charAt(0)}
          </span>
        )}
        <span className="project-index">{String(index + 1).padStart(2, "0")}</span>
        {firstLink && (
          <span className="project-caption" aria-hidden="true">
            <span>Ansehen →</span>
          </span>
        )}
      </div>
      <div className="project-body">
        <h3 className="project-title">
          {firstLink ? (
            <a href={firstLink} target="_blank" rel="noopener noreferrer">
              {project.title}
            </a>
          ) : (
            project.title
          )}
        </h3>
        {project.subtitle && <p className="project-subtitle">{project.subtitle}</p>}
        {project.description && (
          <p className="project-description">{project.description}</p>
        )}
        {project.tags?.length > 0 && (
          <div className="tags">
            {project.tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}
        {project.links?.length > 0 && (
          <div className="links">
            {project.links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label || link.url} ↗
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function Skeletons() {
  return (
    <div className="projects" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <div className="project skeleton" key={i}>
          <div className="skeleton-media" />
          <div className="skeleton-line w60" />
          <div className="skeleton-line w40" />
        </div>
      ))}
    </div>
  );
}

export default function Portfolio() {
  const [projects, setProjects] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    setProjects(null);
    try {
      setProjects(await fetchProjects());
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section className="section" id="portfolio">
      <div className="container">
        <Reveal className="section-head">
          <p className="kicker">{PORTFOLIO.eyebrow}</p>
          <h2 className="section-title">{PORTFOLIO.heading}</h2>
          <p className="section-lead">{PORTFOLIO.intro}</p>
        </Reveal>

        {!projects && !error && <Skeletons />}
        {error && (
          <div className="error-status" role="alert">
            <p>Projekte konnten nicht geladen werden.</p>
            <button type="button" onClick={load}>
              Erneut versuchen
            </button>
          </div>
        )}
        {projects?.length === 0 && (
          <Reveal>
            <p className="status-empty">{PORTFOLIO.empty}</p>
          </Reveal>
        )}
        {projects && projects.length > 0 && (
          <div className="projects">
            {projects.map((project, i) => (
              <Reveal key={project.id} delay={(i % 2) * 110}>
                <ProjectCard project={project} index={i} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}