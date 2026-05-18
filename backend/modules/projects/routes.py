from flask import Blueprint, request, jsonify
from . import store

projects_bp = Blueprint("projects", __name__)

@projects_bp.route("/", methods=["GET"])
def list_projects():
    return jsonify(store.get_all_projects())

@projects_bp.route("/", methods=["POST"])
def create_project():
    body = request.get_json()
    name = body.get("name", "").strip()
    client = body.get("client", "").strip()
    description = body.get("description", "").strip()

    if not name or not client:
        return jsonify({"error": "name and client are required"}), 400

    project = store.create_project(name, client, description)
    return jsonify(project), 201

@projects_bp.route("/<project_id>", methods=["GET"])
def get_project(project_id):
    project = store.get_project(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404
    return jsonify(project)

@projects_bp.route("/<project_id>/tasks", methods=["POST"])
def add_task(project_id):
    body = request.get_json()
    title = body.get("title", "").strip()
    status = body.get("status", "in_progress")
    notes = body.get("notes", "")

    if not title:
        return jsonify({"error": "title is required"}), 400
    if status not in ["done", "in_progress", "blocked"]:
        return jsonify({"error": "status must be done, in_progress, or blocked"}), 400

    task = store.add_task(project_id, title, status, notes)
    if not task:
        return jsonify({"error": "Project not found"}), 404
    return jsonify(task), 201

@projects_bp.route("/<project_id>", methods=["DELETE"])
def delete_project(project_id):
    store.delete_project(project_id)
    return jsonify({"message": "deleted"}), 200
