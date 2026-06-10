from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from ..extensions import db
from ..models import Post

posts_bp = Blueprint("posts", __name__)

VALID_NETWORKS = {"facebook", "instagram", "tiktok"}
VALID_STATUSES = {"draft", "scheduled", "published"}


def parse_datetime(value):
    if not value:
        return None
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return None


@posts_bp.route("", methods=["GET"])
@jwt_required()
def list_posts():
    user_id = int(get_jwt_identity())
    query = Post.query.filter_by(user_id=user_id)
    status = request.args.get("status")
    if status in VALID_STATUSES:
        query = query.filter_by(status=status)
    posts = query.order_by(Post.scheduled_at.asc().nullslast()).all()
    return jsonify([p.to_dict() for p in posts])


@posts_bp.route("", methods=["POST"])
@jwt_required()
def create_post():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    content = (data.get("content") or "").strip()
    if not content:
        return jsonify({"error": "Contenu requis"}), 400

    networks = [n for n in (data.get("networks") or []) if n in VALID_NETWORKS]
    scheduled_at = parse_datetime(data.get("scheduled_at"))
    status = "scheduled" if scheduled_at else "draft"

    post = Post(
        user_id=user_id,
        template_id=data.get("template_id"),
        content=content,
        scheduled_at=scheduled_at,
        status=status,
        networks=networks,
    )
    db.session.add(post)
    db.session.commit()
    return jsonify(post.to_dict()), 201


@posts_bp.route("/<int:post_id>", methods=["PUT"])
@jwt_required()
def update_post(post_id):
    user_id = int(get_jwt_identity())
    post = Post.query.filter_by(id=post_id, user_id=user_id).first()
    if not post:
        return jsonify({"error": "Post introuvable"}), 404

    data = request.get_json() or {}
    if "content" in data:
        post.content = data["content"].strip()
    if "networks" in data:
        post.networks = [n for n in data["networks"] if n in VALID_NETWORKS]
    if "scheduled_at" in data:
        post.scheduled_at = parse_datetime(data["scheduled_at"])
        if post.scheduled_at and post.status == "draft":
            post.status = "scheduled"

    db.session.commit()
    return jsonify(post.to_dict())


@posts_bp.route("/<int:post_id>", methods=["DELETE"])
@jwt_required()
def delete_post(post_id):
    user_id = int(get_jwt_identity())
    post = Post.query.filter_by(id=post_id, user_id=user_id).first()
    if not post:
        return jsonify({"error": "Post introuvable"}), 404

    db.session.delete(post)
    db.session.commit()
    return "", 204
