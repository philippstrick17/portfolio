import json
import os
import subprocess
import time
import uuid

from flask import Flask, jsonify, request, send_from_directory

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.join(BASE_DIR, "dist")
PUBLIC_DIR = os.path.join(BASE_DIR, "public")
IMAGES_DIR = os.path.join(PUBLIC_DIR, "images")
PROJECTS_FILE = os.path.join(PUBLIC_DIR, "projects.json")
SITE_FILE = os.path.join(PUBLIC_DIR, "site.json")
PORT = 8002
MAX_UPLOAD = 30 * 1024 * 1024
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "gif", "avif"}

app = Flask(__name__, static_folder=DIST_DIR, static_url_path="")
app.config["MAX_CONTENT_LENGTH"] = MAX_UPLOAD


def load_projects():
    if not os.path.exists(PROJECTS_FILE):
        return []
    with open(PROJECTS_FILE, encoding="utf-8") as f:
        return json.load(f)


def save_projects(projects):
    os.makedirs(PUBLIC_DIR, exist_ok=True)
    with open(PROJECTS_FILE, "w", encoding="utf-8") as f:
        json.dump(projects, f, ensure_ascii=False, indent=2)


def load_site():
    if not os.path.exists(SITE_FILE):
        return {}
    with open(SITE_FILE, encoding="utf-8") as f:
        return json.load(f)


def save_site(site):
    os.makedirs(PUBLIC_DIR, exist_ok=True)
    with open(SITE_FILE, "w", encoding="utf-8") as f:
        json.dump(site, f, ensure_ascii=False, indent=2)


def clean_text(value):
    if isinstance(value, str):
        return value.strip()
    if isinstance(value, list):
        return [clean_text(v) for v in value]
    if isinstance(value, dict):
        return {k: clean_text(v) for k, v in value.items()}
    return value


@app.get("/api/site")
def get_site():
    return jsonify(load_site())


@app.put("/api/site")
def update_site():
    data = request.get_json(force=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Ungültige Konfiguration"}), 400
    current = load_site() or {}
    merged = deep_merge(current, data)
    save_site(merged)
    return jsonify(merged)


def deep_merge(base, over):
    out = dict(base) if isinstance(base, dict) else {}
    for key, value in (over or {}).items():
        if isinstance(value, dict) and isinstance(out.get(key), dict):
            out[key] = deep_merge(out[key], value)
        else:
            out[key] = value
    return out


@app.post("/api/upload")
def upload_image():
    file = request.files.get("file")
    if not file or not file.filename:
        return jsonify({"error": "Kein Bild gesendet"}), 400
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        return jsonify({"error": "Nur JPG, PNG, WebP, GIF oder AVIF"}), 400
    os.makedirs(IMAGES_DIR, exist_ok=True)
    name = f"{uuid.uuid4().hex}.{ext}"
    file.save(os.path.join(IMAGES_DIR, name))
    return jsonify({"url": f"images/{name}"}), 201


def parse_project(payload, existing=None):
    base = existing or {}
    project = {
        "id": base.get("id") or uuid.uuid4().hex[:12],
        "title": (payload.get("title") or "").strip(),
        "subtitle": (payload.get("subtitle") or "").strip(),
        "description": (payload.get("description") or "").strip(),
        "image": (payload.get("image") or "").strip() or None,
        "tags": [t.strip() for t in (payload.get("tags") or "").split(",") if t.strip()],
        "links": [
            {"label": (l.get("label") or "").strip(), "url": (l.get("url") or "").strip()}
            for l in (payload.get("links") or [])
            if isinstance(l, dict) and l.get("url")
        ],
        "createdAt": base.get("createdAt") or time.strftime("%Y-%m-%dT%H:%M:%S"),
        "updatedAt": time.strftime("%Y-%m-%dT%H:%M:%S"),
    }
    if not project["title"]:
        raise ValueError("Titel ist erforderlich")
    return project


@app.get("/api/projects")
def list_projects():
    return jsonify(load_projects())


@app.post("/api/projects")
def create_project():
    try:
        projects = load_projects()
        project = parse_project(request.get_json(force=True))
        projects.append(project)
        save_projects(projects)
        return jsonify(project), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@app.put("/api/projects/<project_id>")
def update_project(project_id):
    projects = load_projects()
    for p in projects:
        if p["id"] == project_id:
            try:
                updated = parse_project(request.get_json(force=True), existing=p)
                projects[projects.index(p)] = updated
                save_projects(projects)
                return jsonify(updated)
            except ValueError as e:
                return jsonify({"error": str(e)}), 400
    return jsonify({"error": "Projekt nicht gefunden"}), 404


@app.delete("/api/projects/<project_id>")
def delete_project(project_id):
    projects = load_projects()
    remaining = [p for p in projects if p["id"] != project_id]
    if len(remaining) == len(projects):
        return jsonify({"error": "Projekt nicht gefunden"}), 404
    save_projects(remaining)
    return jsonify({"ok": True})


@app.post("/api/deploy")
def deploy():
    status = subprocess.run(
        ["git", "-C", BASE_DIR, "status", "--porcelain", "public/"],
        capture_output=True,
        text=True,
    )
    if not status.stdout.strip():
        return jsonify({"ok": True, "output": "Keine Änderungen zu veröffentlichen."})
    try:
        subprocess.run(
            ["git", "-C", BASE_DIR, "add", "public/"],
            check=True,
            capture_output=True,
        )
        commit = subprocess.run(
            ["git", "-C", BASE_DIR, "commit", "-m", "admin: Projekte & Website-Update"],
            capture_output=True,
            text=True,
        )
        push = subprocess.run(
            ["git", "-C", BASE_DIR, "push"],
            check=True,
            capture_output=True,
            text=True,
        )
        output = ((commit.stderr or "").strip() + "\n" + (push.stdout or "").strip()).strip()
        return jsonify({"ok": True, "output": output or "Veröffentlicht."})
    except subprocess.CalledProcessError as e:
        detail = e.stderr.decode() if isinstance(e.stderr, bytes) else str(e.stderr or e)
        return jsonify({"ok": False, "error": detail.strip()}), 500


@app.get("/images/<path:filename>")
def uploaded_images(filename):
    return send_from_directory(IMAGES_DIR, filename)


@app.route("/")
def index():
    return send_from_directory(DIST_DIR, "index.html")


@app.route("/<path:path>")
def static_files(path):
    if path.startswith("api/"):
        return jsonify({"error": "Not found"}), 404
    candidate = os.path.join(DIST_DIR, path)
    if os.path.exists(candidate) and os.path.isfile(candidate):
        return send_from_directory(DIST_DIR, path)
    return send_from_directory(DIST_DIR, "index.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT)