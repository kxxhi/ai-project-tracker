# AI Project Tracker

A full-stack web application that helps agencies manage client projects and auto-generate professional status update emails using AI.

**Live Demo:** [your-app.onrender.com](https://your-app.onrender.com)

---

## What it does

Managing client communication is one of the biggest time drains for any agency. This tool solves it by letting you:

1. Create projects with client details
2. Add tasks with statuses (done / in progress / blocked)
3. Click one button → AI writes a professional client status email instantly
4. Copy it and send — done in under 60 seconds

Built with **Flask + React**, inspired by the engineering practices at [Better Software](https://bettrhq.com).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, Flask, Flask-CORS |
| Frontend | React 18, React Router, Tailwind CSS |
| AI | Anthropic Claude API (claude-sonnet-4) |
| Data | JSON file store (MVP) |
| Deployment | Render |

---

## Project Structure

```
ai-project-tracker/
├── backend/
│   ├── app.py                  # Flask app factory
│   ├── requirements.txt
│   └── modules/
│       ├── projects/
│       │   ├── routes.py       # REST API endpoints
│       │   └── store.py        # JSON data layer
│       └── report/
│           └── routes.py       # AI report generation
├── frontend/
│   ├── public/
│   └── src/
│       ├── api/client.js       # Axios API calls
│       ├── pages/
│       │   ├── ProjectList.jsx
│       │   └── ProjectDetail.jsx
│       └── App.jsx
└── .env.example
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/` | List all projects |
| POST | `/api/projects/` | Create a project |
| GET | `/api/projects/:id` | Get project with tasks |
| POST | `/api/projects/:id/tasks` | Add a task |
| DELETE | `/api/projects/:id` | Delete a project |
| POST | `/api/report/:id` | Generate AI status report |

---

## Running Locally

### Prerequisites
- Python 3.10+
- Node.js 18+
- Anthropic API key (free at [console.anthropic.com](https://console.anthropic.com))

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp ../.env.example ../.env
# Add your ANTHROPIC_API_KEY to .env

python app.py
# Runs on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

---

## Key Engineering Decisions

**JSON file store instead of a database** — For an MVP demo, a database adds setup complexity with no user-facing benefit. The store module uses a clean interface (`get_project`, `add_task`) so swapping to PostgreSQL is a 30-minute change.

**Modular Flask blueprint structure** — Each feature (projects, report) is a self-contained module with its own routes. Scales cleanly as the app grows.

**Prompt engineering** — The AI prompt is structured to produce consistent, professional output by explicitly defining sections and tone. The prompt is in `modules/report/routes.py` and is easy to iterate on.

**Tone toggle** — Professional vs casual tone is a single parameter change to the prompt. Demonstrates that product decisions (which users need this?) and engineering decisions (how cheaply can I implement it?) are linked.

---

## What I'd build next

- PostgreSQL + SQLAlchemy for persistent multi-user storage
- User authentication (JWT-based, following Better's flask-react-template patterns)
- Slack integration — post the report directly to a channel
- Report history — store and compare past updates per project
- Email sending via SendGrid

---

## Screenshots

_(Add screenshots or a demo GIF here)_

---

## Author

Built by [Your Name] as a portfolio project demonstrating full-stack AI application development.
