import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProjects, createProject, deleteProject } from "../api/client";

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", client: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => { fetchProjects(); }, []);

  async function fetchProjects() {
    try {
      const res = await getProjects();
      setProjects(res.data);
    } catch {
      setError("Failed to load projects. Is the backend running?");
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.name || !form.client) return;
    setLoading(true);
    try {
      await createProject(form);
      setForm({ name: "", client: "", description: "" });
      setShowForm(false);
      fetchProjects();
    } catch {
      setError("Failed to create project.");
    }
    setLoading(false);
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (!window.confirm("Delete this project?")) return;
    await deleteProject(id);
    fetchProjects();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">AI Project Tracker</h1>
          <p className="text-sm text-gray-500">Auto-generate client status reports with AI</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          + New Project
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {error && <div className="mb-4 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>}

        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">New Project</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Project name *"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Client name *"
                value={form.client}
                onChange={e => setForm({ ...form, client: e.target.value })}
                required
              />
              <textarea
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Brief project description"
                rows={2}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
              <div className="flex gap-2">
                <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                  {loading ? "Creating..." : "Create Project"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {projects.length === 0 && !showForm ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-sm">No projects yet. Create your first one.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map(p => (
              <div
                key={p.id}
                onClick={() => navigate(`/projects/${p.id}`)}
                className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:border-indigo-300 hover:shadow-sm transition group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 group-hover:text-indigo-600 transition">{p.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Client: {p.client}</p>
                    {p.description && <p className="text-sm text-gray-400 mt-1">{p.description}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{p.tasks.length} tasks</span>
                    <button
                      onClick={e => handleDelete(p.id, e)}
                      className="text-gray-300 hover:text-red-500 transition text-lg leading-none"
                    >×</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
