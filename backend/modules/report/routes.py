from flask import Blueprint, request, jsonify
import os
from groq import Groq
from dotenv import load_dotenv
from modules.projects.store import get_project

load_dotenv()
report_bp = Blueprint("report", __name__)

def build_prompt(project, tone_style):
    tasks = project["tasks"]
    done = [t for t in tasks if t["status"] == "done"]
    in_progress = [t for t in tasks if t["status"] == "in_progress"]
    blocked = [t for t in tasks if t["status"] == "blocked"]

    def task_lines(task_list):
        return "\n".join(f"  - {t['title']}" for t in task_list) or "  None"

    tone = "warm but professional" if tone_style == "professional" else "friendly and casual"

    return f"""You are a project manager writing a weekly status update email to a client.
Project: {project['name']}
Client: {project['client']}
Description: {project['description']}

COMPLETED:
{task_lines(done)}

IN PROGRESS:
{task_lines(in_progress)}

BLOCKED:
{task_lines(blocked)}

Write a concise client status update in a {tone} tone. Paragraphs only, under 200 words, no subject line."""

@report_bp.route("/<project_id>", methods=["POST"])
def generate_report(project_id):
    project = get_project(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404
    if not project["tasks"]:
        return jsonify({"error": "Add at least one task"}), 400

    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        return jsonify({"error": "GROQ_API_KEY not set"}), 500

    tone = (request.get_json(silent=True) or {}).get("tone", "professional")
    
    client = Groq(api_key=api_key)
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": build_prompt(project, tone)}]
    )

    return jsonify({
        "report": response.choices[0].message.content.strip(),
        "project": project["name"],
        "client": project["client"]
    })