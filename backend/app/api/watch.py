from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from ..extensions import db
from ..models import Notification, WatchSource
from ..services.watch import fetch_all_sources

watch_bp = Blueprint("watch", __name__)


@watch_bp.route("/fetch", methods=["POST"])
@jwt_required()
def fetch_now():
    """Lance manuellement la lecture de tous les flux RSS."""
    new_count = fetch_all_sources()
    return jsonify({"new_notifications": new_count})


@watch_bp.route("/sources", methods=["GET"])
@jwt_required()
def list_sources():
    user_id = int(get_jwt_identity())
    sources = WatchSource.query.filter_by(user_id=user_id).all()
    return jsonify([s.to_dict() for s in sources])


@watch_bp.route("/sources", methods=["POST"])
@jwt_required()
def create_source():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    name = (data.get("name") or "").strip()
    url = (data.get("url") or "").strip()
    if not name or not url:
        return jsonify({"error": "Nom et URL requis"}), 400

    source = WatchSource(
        user_id=user_id,
        name=name,
        url=url,
        type=data.get("type", "rss"),
        keywords=data.get("keywords") or [],
    )
    db.session.add(source)
    db.session.commit()
    return jsonify(source.to_dict()), 201


@watch_bp.route("/sources/<int:source_id>", methods=["DELETE"])
@jwt_required()
def delete_source(source_id):
    user_id = int(get_jwt_identity())
    source = WatchSource.query.filter_by(id=source_id, user_id=user_id).first()
    if not source:
        return jsonify({"error": "Source introuvable"}), 404

    Notification.query.filter_by(source_id=source.id).delete()
    db.session.delete(source)
    db.session.commit()
    return "", 204


@watch_bp.route("/notifications", methods=["GET"])
@jwt_required()
def list_notifications():
    user_id = int(get_jwt_identity())
    notifications = (
        Notification.query.join(WatchSource)
        .filter(WatchSource.user_id == user_id)
        .order_by(Notification.detected_at.desc())
        .limit(50)
        .all()
    )
    return jsonify([n.to_dict() for n in notifications])


@watch_bp.route("/notifications/<int:notification_id>/read", methods=["POST"])
@jwt_required()
def mark_read(notification_id):
    user_id = int(get_jwt_identity())
    notification = (
        Notification.query.join(WatchSource)
        .filter(Notification.id == notification_id, WatchSource.user_id == user_id)
        .first()
    )
    if not notification:
        return jsonify({"error": "Notification introuvable"}), 404

    notification.is_read = True
    db.session.commit()
    return jsonify(notification.to_dict())
