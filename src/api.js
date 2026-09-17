const API_BASE = window.location.origin;

async function request(url, options = {}) {
  const res = await fetch(API_BASE + url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

export async function apiAvailable() {
  try {
    const res = await fetch(`${API_BASE}/api/projects`);
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchProjects() {
  if (await apiAvailable()) {
    return request("/api/projects");
  }
  const res = await fetch(`${import.meta.env.BASE_URL}projects.json`);
  if (!res.ok) throw new Error("Projekte konnten nicht geladen werden");
  return res.json();
}

export const createProject = (p) =>
  request("/api/projects", { method: "POST", body: JSON.stringify(p) });

export const updateProject = (id, p) =>
  request(`/api/projects/${id}`, { method: "PUT", body: JSON.stringify(p) });

export const deleteProject = (id) =>
  request(`/api/projects/${id}`, { method: "DELETE" });

export const deploy = () =>
  request("/api/deploy", { method: "POST", body: JSON.stringify({}) });