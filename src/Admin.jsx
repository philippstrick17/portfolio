import { useEffect, useRef, useState } from "react";

import {
  apiAvailable,
  createProject,
  deleteProject,
  deploy,
  fetchProjects,
  saveSiteConfig,
  fetchSiteConfig,
  updateProject,
  uploadImage,
} from "./api.js";

const EMPTY_PROJECT = {
  title: "",
  subtitle: "",
  description: "",
  image: "",
  tags: "",
  links: [{ label: "", url: "" }],
};

function merge(base, over) {
  const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
  if (!isObj(base) || !isObj(over)) return over === undefined ? base : over;
  const out = { ...base };
  for (const key of Object.keys(over)) {
    out[key] = merge(base[key], over[key]);
  }
  return out;
}

const FILE_INPUTS = ["image", "imageAlt", "alt", "imageAlt"];

function ImagePicker({ value, onChange, alt, onAltChange, label }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      setError(err.message || "Upload fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="image-field">
      <label className="image-field-label">{label}</label>
      {value ? (
        <div className="image-field-preview">
          <img src={value} alt="" width="640" height="480" />
          <div className="image-field-actions">
            <button type="button" onClick={() => onChange("")}>
              Entfernen
            </button>
            <label className="btn-file">
              Ersetzen
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                onChange={handleFile}
                disabled={busy}
              />
            </label>
          </div>
        </div>
      ) : (
        <div className="image-field-empty">
          <label className="btn-file">
            {busy ? "Lädt hoch…" : "Bild hochladen"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
              onChange={handleFile}
              disabled={busy}
            />
          </label>
        </div>
      )}
      <input
        className="image-field-url"
        type="url"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="…oder Bild-URL einfügen"
      />
      {alt !== undefined ? (
        <input
          className="image-field-bilder"
          type="text"
          value={alt || ""}
          onChange={(e) => onAltChange?.(e.target.value)}
          placeholder="Bild-Alt-Text (Barrierefreiheit)"
        />
      ) : null}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

function ChannelsEditor({ channels, onChange }) {
  function set(i, field, value) {
    onChange(
      channels.map((c, idx) => (idx === i ? { ...c, [field]: value } : c))
    );
  }
  return (
    <fieldset className="form-block">
      <legend>Kontakt-Kanäle</legend>
      {channels.map((channel, i) => (
        <div className="link-row" key={i}>
          <input
            value={channel.kind}
            onChange={(e) => set(i, "kind", e.target.value)}
            placeholder="Art (z. B. E-Mail)"
          />
          <input
            value={channel.value}
            onChange={(e) => set(i, "value", e.target.value)}
            placeholder="Anzeige-Wert"
          />
          <input
            value={channel.href}
            onChange={(e) => set(i, "href", e.target.value)}
            placeholder="Link"
          />
          <button
            type="button"
            className="danger small"
            onClick={() => onChange(channels.filter((_, idx) => idx !== i))}
            disabled={channels.length <= 1}
          >
            –
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...channels, { kind: "", value: "", href: "" }])}
      >
        Kanal hinzufügen
      </button>
    </fieldset>
  );
}

function MarkdownList({ values, onChange, placeholder }) {
  return (
    <textarea
      className="text-area-lines"
      rows={Math.max(3, values.length + 1)}
      value={values.join("\n")}
      onChange={(e) =>
        onChange(
          e.target.value
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
        )
      }
      placeholder={placeholder}
    />
  );
}

function StatsEditor({ stats, onChange }) {
  function set(i, field, value) {
    onChange(
      stats.map((s, idx) => (idx === i ? { ...s, [field]: value } : s))
    );
  }
  return (
    <fieldset className="form-block">
      <legend>Zahlen / Statistiken</legend>
      {stats.map((stat, i) => (
        <div className="link-row" key={i}>
          <input
            value={stat.value}
            onChange={(e) => set(i, "value", e.target.value)}
            placeholder="Wert (z. B. 50+)"
          />
          <input
            value={stat.label}
            onChange={(e) => set(i, "label", e.target.value)}
            placeholder="Label"
          />
          <button
            type="button"
            className="danger small"
            onClick={() => onChange(stats.filter((_, idx) => idx !== i))}
            disabled={stats.length <= 1}
          >
            –
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...stats, { value: "", label: "" }])}
      >
        Zahl hinzufügen
      </button>
    </fieldset>
  );
}

function TextAreaLines({ value, onChange, placeholder }) {
  return (
    <textarea
      rows={Math.max(3, value.length + 1)}
      value={value}
      onChange={(e) => onChange(e.target.value.split("\n"))}
      placeholder={placeholder}
    />
  );
}

function ProjectForm({ initial, onSubmit, onCancel, siteOk }) {
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
      : EMPTY_PROJECT
  );
  const [error, setError] = useState(null);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }
  function setLink(i, field, value) {
    setForm((f) => ({
      ...f,
      links: f.links.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)),
    }));
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
    <form className="form card" onSubmit={handleSubmit}>
      <h3>{initial ? "Projekt bearbeiten" : "Neues Projekt"}</h3>

      <label>
        Titel *
        <input
          required
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="z. B. Imagefilm Schuster"
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
          placeholder="Was macht das Projekt, was ist besonders?"
        />
      </label>

      <ImagePicker
        label="Projektbild"
        value={form.image}
        onChange={(url) => set("image", url)}
      />

      <label>
        Tags (kommagetrennt)
        <input
          value={form.tags}
          onChange={(e) => set("tags", e.target.value)}
          placeholder="Porträt, Porträt, Event"
        />
      </label>

      <fieldset>
        <legend>Links</legend>
        {form.links.map((link, i) => (
          <div className="link-row" key={i}>
            <input
              value={link.label}
              onChange={(e) => setLink(i, "label", e.target.value)}
              placeholder="Beschriftung"
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
              –
            </button>
          </div>
        ))}
        <button type="button" onClick={addLink}>
          Link hinzufügen
        </button>
      </fieldset>

      {error && <p className="error">{error}</p>}
      <div className="form-actions">
        <button type="submit" className="primary">
          {initial ? "Speichern" : "Anlegen"}
        </button>
        {initial && (
          <button type="button" onClick={onCancel}>
            Abbrechen
          </button>
        )}
      </div>
    </form>
  );
}

function SiteForm({ config, onChange }) {
  const [f, setF] = useState(config);

  if (config && f !== config && JSON.stringify(f) !== JSON.stringify(config)) {
    setF(config);
  }

  const all = (key) => ({
    value: f.ALL[key],
    set: (v) => onChange({ ...f, ALL: { ...f.ALL, [key]: v } }),
  });
  const HERO = f.HERO || {};
  const ABOUT = f.ABOUT || {};
  const SERVICES = f.SERVICES || {};
  const CONTACT = f.CONTACT || {};
  const PORTFOLIO = f.PORTFOLIO || {};

  function upHero(key, v) {
    onChange({ ...f, HERO: { ...HERO, [key]: v } });
  }
  function upAbout(key, v) {
    onChange({ ...f, ABOUT: { ...ABOUT, [key]: v } });
  }
  function upContact(key, v) {
    onChange({ ...f, CONTACT: { ...CONTACT, [key]: v } });
  }

  return (
    <form
      className="form card"
      onSubmit={(e) => e.preventDefault()}
    >
      <h3>Website bearbeiten</h3>
      <p className="card-note">
        Alle Texte und Bilder der Startseite (Hero, Über mich, Leistungen,
        Projekte-Bereich und Kontakt). Klicke unten auf „Veröffentlichen“, um die
        Website für alle sichtbar zu aktualisieren (Flask-Server + GitHub
        Pages).
      </p>

      <fieldset className="form-block">
        <legend>Hero (Startbereich)</legend>
        <label>
          Eyebrow / Kicker
          <input
            value={HERO.eyebrow || ""}
            onChange={(e) => upHero("eyebrow", e.target.value)}
          />
        </label>
        <label>
          Titel
          <input
            value={HERO.title || ""}
            onChange={(e) => upHero("title", e.target.value)}
          />
        </label>
        <label>
          Untertitel
          <textarea
            rows={3}
            value={HERO.subtitle || ""}
            onChange={(e) => upHero("subtitle", e.target.value)}
          />
        </label>
        <ImagePicker
          label="Hero-Bild"
          value={HERO.image}
          alt={HERO.imageAlt}
          onChange={(v) => upHero("image", v)}
          onAltChange={(v) => upHero("imageAlt", v)}
        />
        <div className="link-row">
          <input
            value={HERO.ctaPrimary?.label || ""}
            onChange={(e) =>
              upHero("ctaPrimary", {
                ...HERO.ctaPrimary,
                label: e.target.value,
              })
            }
            placeholder="CTA 1 Label"
          />
          <input
            value={HERO.ctaPrimary?.href || ""}
            onChange={(e) =>
              upHero("ctaPrimary", {
                ...HERO.ctaPrimary,
                href: e.target.value,
              })
            }
            placeholder="CTA 1 Link"
          />
        </div>
        <div className="link-row">
          <input
            value={HERO.ctaSecondary?.label || ""}
            onChange={(e) =>
              upHero("ctaSecondary", {
                ...HERO.ctaSecondary,
                label: e.target.value,
              })
            }
            placeholder="CTA 2 Label"
          />
          <input
            value={HERO.ctaSecondary?.href || ""}
            onChange={(e) =>
              upHero("ctaSecondary", {
                ...HERO.ctaSecondary,
                href: e.target.value,
              })
            }
            placeholder="CTA 2 Link"
          />
        </div>
      </fieldset>

      <fieldset className="form-block">
        <legend>Über mich (About)</legend>
        <label>
          Heading
          <input
            value={ABOUT.heading || ""}
            onChange={(e) => upAbout("heading", e.target.value)}
          />
        </label>
        <MarkdownList
          values={ABOUT.paragraphs || []}
          onChange={(v) => upAbout("paragraphs", v)}
          placeholder={"Absatz 1\n\nAbsatz 2"}
        />
        <ImagePicker
          label="Porträt-Bild"
          value={ABOUT.image}
          alt={ABOUT.imageAlt}
          onChange={(v) => upAbout("image", v)}
          onAltChange={(v) => upAbout("imageAlt", v)}
        />
        <StatsEditor
          stats={ABOUT.stats || []}
          onChange={(v) => upAbout("stats", v)}
        />
      </fieldset>

      <fieldset className="form-block">
        <legend>Leistungen (Services)</legend>
        <label>
          Kicker
          <input
            value={SERVICES.eyebrow || ""}
            onChange={(e) =>
              onChange({ ...f, SERVICES: { ...SERVICES, eyebrow: e.target.value } })
            }
          />
        </label>
        <label>
          Heading
          <input
            value={SERVICES.heading || ""}
            onChange={(e) =>
              onChange({ ...f, SERVICES: { ...SERVICES, heading: e.target.value } })
            }
          />
        </label>
        {SERVICES.items?.map((service, i) => (
          <div className="form-block-inner" key={i}>
            <label>
              Leistung {i + 1} – Name
              <input
                value={service.name || ""}
                onChange={(e) =>
                  onChange({
                    ...f,
                    SERVICES: {
                      ...SERVICES,
                      items: SERVICES.items.map((s, idx) =>
                        idx === i ? { ...s, name: e.target.value } : s
                      ),
                    },
                  })
                }
              />
            </label>
            <label>
              Beschreibung
              <textarea
                rows={2}
                value={service.description || ""}
                onChange={(e) =>
                  onChange({
                    ...f,
                    SERVICES: {
                      ...SERVICES,
                      items: SERVICES.items.map((s, idx) =>
                        idx === i ? { ...s, description: e.target.value } : s
                      ),
                    },
                  })
                }
              />
            </label>
            <MarkdownList
              values={service.points || []}
              onChange={(v) =>
                onChange({
                  ...f,
                  SERVICES: {
                    ...SERVICES,
                    items: SERVICES.items.map((s, idx) =>
                      idx === i ? { ...s, points: v } : s
                    ),
                  },
                })
              }
              placeholder={"Punkt 1\nPunkt 2\nPunkt 3"}
            />
          </div>
        ))}
      </fieldset>

      <fieldset className="form-block">
        <legend>Projekte-Bereich (Portfolio)</legend>
        <label>
          Kicker
          <input
            value={PORTFOLIO.eyebrow || ""}
            onChange={(e) =>
              onChange({ ...f, PORTFOLIO: { ...PORTFOLIO, eyebrow: e.target.value } })
            }
          />
        </label>
        <label>
          Heading
          <input
            value={PORTFOLIO.heading || ""}
            onChange={(e) =>
              onChange({ ...f, PORTFOLIO: { ...PORTFOLIO, heading: e.target.value } })
            }
          />
        </label>
        <label>
          Intro
          <textarea
            rows={2}
            value={PORTFOLIO.intro || ""}
            onChange={(e) =>
              onChange({ ...f, PORTFOLIO: { ...PORTFOLIO, intro: e.target.value } })
            }
          />
        </label>
        <label>
          Leertext
          <textarea
            rows={2}
            value={PORTFOLIO.empty || ""}
            onChange={(e) =>
              onChange({ ...f, PORTFOLIO: { ...PORTFOLIO, empty: e.target.value } })
            }
          />
        </label>
      </fieldset>

      <fieldset className="form-block">
        <legend>Kontakt</legend>
        <label>
          Heading
          <input
            value={CONTACT.heading || ""}
            onChange={(e) => upContact("heading", e.target.value)}
          />
        </label>
        <label>
          Text
          <textarea
            rows={3}
            value={CONTACT.text || ""}
            onChange={(e) => upContact("text", e.target.value)}
          />
        </label>
        <label>
          CTA-Label
          <input
            value={CONTACT.cta || ""}
            onChange={(e) => upContact("cta", e.target.value)}
          />
        </label>
        <ChannelsEditor
          channels={CONTACT.channels || []}
          onChange={(v) => upContact("channels", v)}
        />
      </fieldset>
    </form>
  );
}

export default function Admin() {
  const [projects, setProjects] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deploying, setDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState(null);
  const [apiOk, setApiOk] = useState(false);
  const [tab, setTab] = useState("projects");
  const [site, setSite] = useState(null);
  const [siteError, setSiteError] = useState(nullvene);
  const [siteSaving, setSiteSaving] = useState(falseergy);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    let alive = true;
    apiAvailable().then((ok) => {
      if (!alive) return;
      setApiOk(ok);
      if (ok) {
        refresh();
        refreshSite();
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  async function refresh() {
    setProjects(await fetchProjects());
  }
  async function refreshSite() {
    try {
      setSite(await fetchSiteConfig());
    } catch (err) {
      setSiteError(err.message);
    }
  }

  async function saveSite() {
    setSiteSaving(true);
    setSiteError(null);
    try {
      const saved = await saveSiteConfig(site);
      setSavedAt(new Date().toLocaleTimeString("de-DE"));
    } catch (err) {
      setSiteError(err.message);
    } finally {
      setSiteSaving(false);
    }
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
          Bearbeite Projekte und den kompletten Seiteninhalt – vom Handy oder
          vom PC. Mit „Veröffentlichen" werden alle Änderungen auf GitHub Pages
          veröffentlicht.
        </p>
      </header>

      <div className="admin-tabs" role="tablist" aria-label="Admin-Bereiche">
        <button
          className={tab === "projects" ? "tab-active" : ""}
          onClick={() => setTab("projects")}
          role="tab"
          aria-selected={tab === "projects"}
        >
          Projekte
        </button>
        <button
          className={tab === "site" ? "tab-active" : ""}
          onClick={() => setTab("site")}
          role="tab"
          aria-selected={tab === "site"}
        >
          Website
        </button>
      </div>

      {!editing && !site ? (
        <section className="admin-panel">
          <div className="row">
            <h2>
              Vorhandene Projekte ({projects ? projects.length : "…"})
            </h2>
            <button
              onClick={handleDeploy}
              disabled={deploying}
              title="Committet projects.json und site.json, pusht – aktualisiert GitHub Pages"
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

          {tab === "projects" && (
            <>
              {projects && projects.length === 0 && !editing && (
                <div className="card">
                  Noch keine Projekte – lege das erste an.
                </div>
              )}
              {projects &&
                projects.map((project) => (
                  <div className="card project-row" key={project.id}>
                    <div>
                      <h3>{project.title}</h3>
                      {project.subtitle && (
                        <p className="subtitle">{project.subtitle}</p>
                      )}
                    </div>
                    <div className="row">
                      <button onClick={() => setEditing(project)}>
                        <span aria-hidden="true">✎</span> Bearbeiten
                      </button>
                      <button
                        className="danger"
                        onClick={() => handleDelete(project)}
                      >
                        Löschen
                      </button>
                    </div>
                  </div>
                ))}

              {!editing && (
                <section>
                  <ProjectForm
                    onSubmit={handleCreate}
                    siteOk={apiOk}
                  />
                </section>
              )}
            </>
          )}

          {tab === "site" && (
            <section>
              {siteError && <p className="error">Fehler: {siteError}</p>}
              {site && (
                <div className="card-serving">
                  <SiteForm config={site} onChange={setSite} />
                  <div className="form-actions sticky-row">
                    <button className="primary" onClick={saveSite} disabled={siteSaving}>
                      {siteSaving ? "Speichert…" : "Website speichern"}
                    </button>
                    <button onClick={handleDeploy} disabled={deploying}>
                      {deploying ? "Veröffentliche…" : "Speichern & Veröffentlichen"}
                    </button>
                    {savedAt && (
                      <span className="saved-hint">
                        Gespeichert um {savedAt}
                      </span>
                    )}
                    {deployResult && (
                      <pre
                        className={`deploy-result ${deployResult.ok ? "ok" : "fail"}`}
                      >
                        {deployResult.ok
                          ? deployResult.output
                          : `Fehler: ${deployResult.error}`}
                      </pre>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}
        </section>
      ) : (
        <section className="admin-panel">
          <ProjectForm
            initial={editing}
            onSubmit={editing ? handleUpdate : handleCreate}
            onCancel={() => setEditing(null)}
          />
        </section>
      )}
      {editing && (
        <ProjectForm
          initial={editing}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}
