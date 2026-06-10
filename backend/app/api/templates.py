from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from ..extensions import db
from ..models import Template

templates_bp = Blueprint("templates", __name__)

VALID_CATEGORIES = {"event", "proximity", "crisis"}
VALID_COLORS = {"blue", "green", "orange"}


@templates_bp.route("", methods=["GET"])
@jwt_required()
def list_templates():
    user_id = int(get_jwt_identity())
    templates = Template.query.filter_by(user_id=user_id).order_by(Template.created_at.desc()).all()
    return jsonify([t.to_dict() for t in templates])


@templates_bp.route("", methods=["POST"])
@jwt_required()
def create_template():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    title = (data.get("title") or "").strip()
    content = (data.get("content") or "").strip()
    if not title or not content:
        return jsonify({"error": "Titre et contenu requis"}), 400

    category = data.get("category", "event")
    color = data.get("color", "blue")
    if category not in VALID_CATEGORIES:
        return jsonify({"error": f"Catégorie invalide : {category}"}), 400
    if color not in VALID_COLORS:
        return jsonify({"error": f"Couleur invalide : {color}"}), 400

    template = Template(user_id=user_id, title=title, content=content, category=category, color=color)
    db.session.add(template)
    db.session.commit()
    return jsonify(template.to_dict()), 201


@templates_bp.route("/<int:template_id>", methods=["PUT"])
@jwt_required()
def update_template(template_id):
    user_id = int(get_jwt_identity())
    template = Template.query.filter_by(id=template_id, user_id=user_id).first()
    if not template:
        return jsonify({"error": "Template introuvable"}), 404

    data = request.get_json() or {}
    if "title" in data:
        template.title = data["title"].strip()
    if "content" in data:
        template.content = data["content"].strip()
    if "category" in data and data["category"] in VALID_CATEGORIES:
        template.category = data["category"]
    if "color" in data and data["color"] in VALID_COLORS:
        template.color = data["color"]

    db.session.commit()
    return jsonify(template.to_dict())


@templates_bp.route("/<int:template_id>", methods=["DELETE"])
@jwt_required()
def delete_template(template_id):
    user_id = int(get_jwt_identity())
    template = Template.query.filter_by(id=template_id, user_id=user_id).first()
    if not template:
        return jsonify({"error": "Template introuvable"}), 404

    db.session.delete(template)
    db.session.commit()
    return "", 204
