import { useEffect, useState } from "react";
import {
  apiAvailable,
  createProject,
  deleteProject,
  deploy,
  fetchProjects,
  updateProject,
} from "./api.js";

const EMPTY = {
  title: "",
  subtitle: "",
  description: "",
  image: "",
  tags: "",
  links: [{ label: "", url: "" }],
};

function ProjectForm({ onSubmit, initial, onCancel }) {
  const [form, setForm] = useState(
    initial
      ? {
          ...initial,
          tags: (initial.tags || []).join(", "),
          links:
            initial.links && initial.links.length
              ? initial.links
              : [{ label: "", url: "" }],
        }
      : EMPTY
  );
  const [error, setError] = useState(null);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function setLink(i, field, value) {
    setForm((f) => {
      const links = f.links.map((l, idx) =>
        idx === i ? { ...l, [field]: value } : l
      );
      return { ...f, links };
    });
  }

  function addLink() {
    setForm((f) => ({ ...f, links: [...f.links, { label: "", url: "" }] }));
  }

  function removeLink(i) {
    setForm((f) => ({ ...f, links: f.links.filter((_, idx) => idx !== i) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h3>{initial ? "Projekt bearbeiten" : "Neues Projekt"}</h3>

      <label>
        Titel *
        <input
          required
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="z. B. Mein Untis"
        />
      </label>

      <label>
        Untertitel
        <input
          value={form.subtitle}
          onChange={(e) => set("subtitle", e.target.value)}
          placeholder="Kurze Einordnung"
        />
      </label>

      <label>
        Beschreibung
        <textarea
          rows={5}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Was macht das Projekt, was ist besonders daran?"
        />
      </label>

      <label>
        Tags (kommagetrennt)
        <input
          value={form.tags}
          onChange={(e) => set("tags", e.target.value)}
          placeholder="React, Flutter, Raspberry Pi"
        />
      </label>

      <label>
        Bild-URL (optional)
        <input
          value={form.image}
          onChange={(e) => set("image", e.target.value)}
          placeholder="https://…"
        />
      </label>

      <fieldset>
        <legend>Links</legend>
        {form.links.map((link, i) => (
          <div className="link-row" key={i}>
            <input
              value={link.label}
              onChange={(e) => setLink(i, "label", e.target.value)}
              placeholder="Beschriftung (z. B. Repo)"
            />
            <input
              value={link.url}
              onChange={(e) => setLink(i, "url", e.target.value)}
              placeholder="URL"
            />
            <button
              type="button"
              className="danger small"
              onClick={() => removeLink(i)}
              disabled={form.links.length <= 1}
            >
              Entfernen
            </button>
          </div>
        ))}
        <button type="button" onClick={addLink}>
          Link hinzufügen
        </button>
      </fieldset>

      {error && <p className="error">{error}</p>}

      <div className="form-actions">
        <button type="submit">{initial ? "Speichern" : "Anlegen"}</button>
        {initial && (
          <button type="button" className="danger" onClick={onCancel}>
            Abbrechen
          </button>
        )}
      </div>
    </form>
  );
}

export default function Admin() {
  const [projects, setProjects] = useState(null);
  const [apiOk, setApiOk] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deploying, setDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState(null);

  useEffect(() => {
    let alive = true;
    apiAvailable().then((ok) => {
      if (!alive) return;
      setApiOk(ok);
      if (ok) refresh();
    });
    return () => {
      alive = false;
    };
  }, []);

  async function refresh() {
    setProjects(await fetchProjects());
  }

  async function handleCreate(form) {
    await createProject(form);
    setEditing(null);
    await refresh();
  }

  async function handleUpdate(form) {
    await updateProject(editing.id, form);
    setEditing(null);
    await refresh();
  }

  async function handleDelete(project) {
    if (!confirm(`„${project.title}" wirklich löschen?`)) return;
    await deleteProject(project.id);
    await refresh();
  }

  async function handleDeploy() {
    setDeploying(true);
    setDeployResult(null);
    try {
      const res = await deploy();
      setDeployResult(res);
    } catch (err) {
      setDeployResult({ ok: false, error: err.message });
    } finally {
      setDeploying(false);
    }
  }

  if (!apiOk) {
    return (
      <div className="page">
        <header className="admin-header">
          <h1>Admin</h1>
        </header>
        <div className="card">
          <p>
            Das Adminpanel ist nur auf dem Raspberry Pi verfügbar. Öffne es über{" "}
            <code>http://192.168.178.42:8002/#/admin</code> – auf GitHub Pages
            gibt es kein Backend.
          </p>
          <a href="#/">← Zurück zur Startseite</a>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="admin-header">
        <h1>Adminpanel</h1>
        <p>
          <a href="#/">← Zurück zur Startseite</a>
        </p>
        <p className="tagline">
          Projekte verwalten – sie erscheinen auf der Landingpage. Mit
          „Veröffentlichen" werden die Änderungen auf GitHub Pages veröffentlicht.
        </p>
      </header>

      <section>
        <div className="row">
          <h2>Vorhandene Projekte ({projects ? projects.length : "…"})</h2>
          <button
            onClick={handleDeploy}
            disabled={deploying}
            title="Committet projects.json und pusht – aktualisiert die Website auf GitHub Pages"
          >
            {deploying ? "Veröffentliche…" : "Veröffentlichen"}
          </button>
        </div>
        {deployResult && (
          <pre className={`deploy-result ${deployResult.ok ? "ok" : "fail"}`}>
            {deployResult.ok
              ? deployResult.output
              : `Fehler: ${deployResult.error}`}
          </pre>
        )}

        {projects && projects.length === 0 && !editing && (
          <div className="card">Noch keine Projekte – lege das erste an.</div>
        )}

        {projects &&
          projects.map((project) =>
            editing && editing.id === project.id ? (
              <ProjectForm
                key={project.id}
                initial={project}
                onSubmit={handleUpdate}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <div className="card project-row" key={project.id}>
                <div>
                  <h3>{project.title}</h3>
                  {project.subtitle && (
                    <p className="subtitle">{project.subtitle}</p>
                  )}
                </div>
                <div className="row">
                  <button onClick={() => setEditing(project)}>Bearbeiten</button>
                  <button
                    className="danger"
                    onClick={() => handleDelete(project)}
                  >
                    Löschen
                  </button>
                </div>
              </div>
            )
          )}
      </section>

      {!editing && (
        <section>
          <ProjectForm onSubmit={handleCreate} />
        </section>
      )}
    </div>
  );
}