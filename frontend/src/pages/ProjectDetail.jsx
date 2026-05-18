import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProject, addTask, generateReport } from "../api/client";

const STATUS_STYLES = {
  done: "bg-green-100 text-green-700",
  in_progress: "bg-blue-100 text-blue-700",
  blocked: "bg-red-100 text-red-700",
};
const STATUS_LABELS = { done: "Done", in_progress: "In Progress", blocked: "Blocked" };

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const reportRef = useRef(null);

  const [project, setProject] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: "", status: "in_progress", notes: "" });
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [report, setReport] = useState("");
  const [tone, setTone] = useState("professional");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { fetchProject(); }, [id]);

  async function fetchProject() {
    try {
      const res = await getProject(id);
      setProject(res.data);
    } catch {
      setError("Project not found.");
    }
  }

  async function handleAddTask(e) {
    e.preventDefault();
    if (!taskForm.title) return;
    await addTask(id, taskForm);
    setTaskForm({ title: "", status: "in_progress", notes: "" });
    setShowTaskForm(false);
    fetchProject();
  }

  async function handleGenerateReport() {
    setGenerating(true);
    setError("");
    setReport("");
    try {
      const res = await generateReport(id, tone);
      setReport(res.data.report);
      setTimeout(() => reportRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to generate report. Check your API key.");
    }
    setGenerating(false);
  }

  function handleCopy() {
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!project) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">{error || "Loading..."}</div>;

  const done = project.tasks.filter(t => t.status === "done");
  const inProgress = project.tasks.filter(t => t.status === "in_progress");
  const blocked = project.tasks.filter(t => t.status === "blocked");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <button onClick={() => navigate("/")} className="text-sm text-gray-400 hover:text-gray-600 mb-2 flex items-center gap-1">
          ← All Projects
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
            <p className="text-sm text-gray-500">Client: {project.client}</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={tone}
              onChange={e => setTone(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="professional">Professional tone</option>
              <option value="casual">Casual tone</option>
            </select>
            <button
              onClick={handleGenerateReport}
              disabled={generating || project.tasks.length === 0}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition flex items-center gap-2"
            >
              {generating ? (
                <><span className="animate-spin">⟳</span> Generating...</>
              ) : (
                <>✨ Generate Report</>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {error && <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>}

        {/* Tasks section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Tasks <span className="text-gray-400 font-normal text-sm">({project.tasks.length})</span></h2>
            <button
              onClick={() => setShowTaskForm(!showTaskForm)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              + Add Task
            </button>
          </div>

          {showTaskForm && (
            <form onSubmit={handleAddTask} className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                placeholder="Task title *"
                value={taskForm.title}
                onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                required autoFocus
              />
              <div className="flex gap-2">
                {["done", "in_progress", "blocked"].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setTaskForm({ ...taskForm, status: s })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${taskForm.status === s ? STATUS_STYLES[s] + " border-transparent" : "border-gray-200 text-gray-500 hover:bg-gray-100"}`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                placeholder="Notes (optional)"
                value={taskForm.notes}
                onChange={e => setTaskForm({ ...taskForm, notes: e.target.value })}
              />
              <div className="flex gap-2">
                <button type="submit" className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700">Add</button>
                <button type="button" onClick={() => setShowTaskForm(false)} className="border border-gray-200 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          )}

          {project.tasks.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No tasks yet. Add some tasks to generate a report.</p>
          ) : (
            <div className="space-y-2">
              {project.tasks.map(task => (
                <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full mt-0.5 whitespace-nowrap ${STATUS_STYLES[task.status]}`}>
                    {STATUS_LABELS[task.status]}
                  </span>
                  <div>
                    <p className="text-sm text-gray-800">{task.title}</p>
                    {task.notes && <p className="text-xs text-gray-400 mt-0.5">{task.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary bar */}
          {project.tasks.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4 text-xs text-gray-500">
              <span className="text-green-600 font-medium">{done.length} done</span>
              <span className="text-blue-600 font-medium">{inProgress.length} in progress</span>
              {blocked.length > 0 && <span className="text-red-600 font-medium">{blocked.length} blocked</span>}
            </div>
          )}
        </div>

        {/* AI Report section */}
        {report && (
          <div ref={reportRef} className="bg-white rounded-xl border border-indigo-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-gray-900">AI-Generated Status Report</h2>
                <p className="text-xs text-gray-400 mt-0.5">Ready to paste into your client email</p>
              </div>
              <button
                onClick={handleCopy}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${copied ? "bg-green-50 border-green-200 text-green-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                {copied ? "✓ Copied!" : "Copy"}
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-mono">
              {report}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleGenerateReport}
                className="text-xs text-indigo-500 hover:text-indigo-700"
              >
                ↻ Regenerate
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
