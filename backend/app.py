from dotenv import load_dotenv
load_dotenv()
from flask import Flask
from flask_cors import CORS
from modules.projects.routes import projects_bp
from modules.report.routes import report_bp

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.register_blueprint(projects_bp, url_prefix="/api/projects")
    app.register_blueprint(report_bp, url_prefix="/api/report")

    @app.route("/api/health")
    def health():
        return {"status": "ok"}

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
