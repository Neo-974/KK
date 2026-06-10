import os

from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS

from .extensions import db, jwt, migrate


def create_app():
    load_dotenv()

    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URL", "sqlite:///kk_dev.db"
    )
    app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "dev-secret")

    CORS(app)
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    from .api.auth import auth_bp
    from .api.templates import templates_bp
    from .api.posts import posts_bp
    from .api.watch import watch_bp
    from .api.ai import ai_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(templates_bp, url_prefix="/api/templates")
    app.register_blueprint(posts_bp, url_prefix="/api/posts")
    app.register_blueprint(watch_bp, url_prefix="/api/watch")
    app.register_blueprint(ai_bp, url_prefix="/api/ai")

    @app.route("/api/health")
    def health():
        return jsonify({"status": "ok"})

    with app.app_context():
        from . import models  # noqa: F401

        db.create_all()

    start_scheduler(app)

    return app


def start_scheduler(app):
    """Veille automatique : lit les flux RSS toutes les 30 minutes."""
    if os.environ.get("DISABLE_SCHEDULER") == "1":
        return

    from apscheduler.schedulers.background import BackgroundScheduler

    from .services.watch import fetch_all_sources

    def job():
        with app.app_context():
            fetch_all_sources()

    scheduler = BackgroundScheduler(daemon=True)
    scheduler.add_job(job, "interval", minutes=30, id="rss_watch")
    scheduler.start()
