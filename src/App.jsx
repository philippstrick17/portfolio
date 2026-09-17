import { useMemo } from "react";

const projects = [
  {
    title: "Mein Untis",
    subtitle: "Persönlicher Stundenplan",
    description:
      "Eigener Stundenplan auf Basis von WebUntis ohne offizielle App – eine Raspberry-Pi/Flask-Version im Heimnetz und eine native Capacitor-App für Android/iOS mit eigenem Cloudflare-Worker-Proxy.",
    tags: ["Flask", "Python", "WebUntis", "React-lite", "Capacitor", "Cloudflare Workers"],
    links: [
      { label: "Web-App", url: "https://philippstrick17.github.io/mein-untis-app/" },
      { label: "Repo", url: "https://github.com/philippstrick17/mein-untis-app" },
    ],
  },
  {
    title: "FokusApp",
    subtitle: "Fokus für den Alltag",
    description:
      "App, die Menschen mit ADHS hilft, konzentriert zu bleiben – mit klaren Strukturen, Zeiträumen und Fokus-Unterstützung.",
    tags: ["App", "ADHS", "Fokus", "Produktivität"],
    links: [{ label: "Repo", url: "https://github.com/philippstrick17/FokusApp-V2" }],
  },
  {
    title: "inFokus Website",
    subtitle: "Webauftritt",
    description:
      "Die Website für das inFokus-Projekt – in zwei Generationen entwickelt und auf GitHub Pages gehostet.",
    tags: ["Web", "GitHub Pages", "Design"],
    links: [
      { label: "Website", url: "https://philippstrick17.github.io/infokuspage/" },
      { label: "Repo", url: "https://github.com/philippstrick17/infokuspage" },
    ],
  },
  {
    title: "Dieses Portfolio",
    subtitle: "Website über mich",
    description:
      "Diese Seite selbst: entwickelt mit React und Vite, läuft lokal auf dem Raspberry Pi und wird per GitHub Actions auf GitHub Pages veröffentlicht.",
    tags: ["React", "Vite", "GitHub Actions", "Raspberry Pi"],
    links: [{ label: "Repo", url: "https://github.com/philippstrick17/portfolio" }],
  },
];

function ProjectCard({ project }) {
  return (
    <article className="card">
      <h3>{project.title}</h3>
      <p className="subtitle">{project.subtitle}</p>
      <p>{project.description}</p>
      <div className="tags">
        {project.tags.map((tag) => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>
      <div className="links">
        {project.links.map((link) => (
          <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">
            {link.label} ↗
          </a>
        ))}
      </div>
    </article>
  );
}

export default function App() {
  const year = useMemo(() => new Date().getFullYear(), []);

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
          <div className="grid">
            {projects.map((project) => (
              <ProjectCard key={project.title} project={project} />
            ))}
          </div>
        </section>
      </main>

      <footer>
        <p>© {year} Philipp Strick · Portfolio · <a href="https://github.com/philippstrick17">GitHub</a></p>
      </footer>
    </div>
  );
}