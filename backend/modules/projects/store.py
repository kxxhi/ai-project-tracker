import json
import os
import uuid
from datetime import datetime

DATA_FILE = os.path.join(os.path.dirname(__file__), "../../data.json")

def _load():
    if not os.path.exists(DATA_FILE):
        return {"projects": []}
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def _save(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)

def get_all_projects():
    return _load()["projects"]

def get_project(project_id):
    projects = _load()["projects"]
    return next((p for p in projects if p["id"] == project_id), None)

def create_project(name, client, description):
    data = _load()
    project = {
        "id": str(uuid.uuid4()),
        "name": name,
        "client": client,
        "description": description,
        "tasks": [],
        "created_at": datetime.utcnow().isoformat()
    }
    data["projects"].append(project)
    _save(data)
    return project

def add_task(project_id, title, status, notes=""):
    data = _load()
    for project in data["projects"]:
        if project["id"] == project_id:
            task = {
                "id": str(uuid.uuid4()),
                "title": title,
                "status": status,  # "done" | "in_progress" | "blocked"
                "notes": notes
            }
            project["tasks"].append(task)
            _save(data)
            return task
    return None

def delete_project(project_id):
    data = _load()
    data["projects"] = [p for p in data["projects"] if p["id"] != project_id]
    _save(data)
