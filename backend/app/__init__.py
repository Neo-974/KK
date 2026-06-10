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

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(templates_bp, url_prefix="/api/templates")
    app.register_blueprint(posts_bp, url_prefix="/api/posts")
    app.register_blueprint(watch_bp, url_prefix="/api/watch")

    @app.route("/api/health")
    def health():
        return jsonify({"status": "ok"})

    with app.app_context():
        from . import models  # noqa: F401

        db.create_all()

    return app
