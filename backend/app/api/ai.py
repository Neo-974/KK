from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from ..extensions import db
from ..models import Notification, User, WatchSource
from ..services.ai import generate_post

ai_bp = Blueprint("ai", __name__)


@ai_bp.route("/generate-post", methods=["POST"])
@jwt_required()
def generate_post_endpoint():
    """Génère un texte de post à partir d'une notification de veille ou d'un sujet libre."""
    user = db.session.get(User, int(get_jwt_identity()))
    data = request.get_json() or {}

    notification_id = data.get("notification_id")
    if notification_id:
        notification = (
            Notification.query.join(WatchSource)
            .filter(Notification.id == notification_id, WatchSource.user_id == user.id)
            .first()
        )
        if not notification:
            return jsonify({"error": "Notification introuvable"}), 404
        title = notification.title
        content = notification.content
        source_name = notification.source.name
    else:
        title = (data.get("title") or "").strip()
        content = data.get("content")
        source_name = None
        if not title:
            return jsonify({"error": "Indiquez un sujet (title) ou une notification_id"}), 400

    try:
        text = generate_post(
            title=title,
            content=content,
            source_name=source_name,
            commune=user.commune,
            tone=data.get("tone"),
        )
    except RuntimeError as exc:
        return jsonify({"error": str(exc)}), 503

    return jsonify({"content": text})
