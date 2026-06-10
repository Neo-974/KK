from datetime import datetime, timezone

from werkzeug.security import check_password_hash, generate_password_hash

from .extensions import db


def utcnow():
    return datetime.now(timezone.utc)


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(100))
    commune = db.Column(db.String(100))
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=utcnow)

    templates = db.relationship("Template", backref="user", lazy=True)
    posts = db.relationship("Post", backref="user", lazy=True)
    watch_sources = db.relationship("WatchSource", backref="user", lazy=True)
    social_accounts = db.relationship("SocialAccount", backref="user", lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "commune": self.commune,
            "is_admin": self.is_admin,
        }


class SocialAccount(db.Model):
    __tablename__ = "social_accounts"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    platform = db.Column(db.String(20), nullable=False)  # facebook, instagram, tiktok
    access_token = db.Column(db.Text)
    page_id = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=utcnow)


class Template(db.Model):
    __tablename__ = "templates"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    color = db.Column(db.String(20), default="blue")  # blue, green, orange
    category = db.Column(db.String(20), default="event")  # event, proximity, crisis
    created_at = db.Column(db.DateTime, default=utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "color": self.color,
            "category": self.category,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Post(db.Model):
    __tablename__ = "posts"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    template_id = db.Column(db.Integer, db.ForeignKey("templates.id"))
    content = db.Column(db.Text, nullable=False)
    scheduled_at = db.Column(db.DateTime)
    published_at = db.Column(db.DateTime)
    status = db.Column(db.String(20), default="draft")  # draft, scheduled, published
    networks = db.Column(db.JSON, default=list)  # ["facebook", "instagram", "tiktok"]

    def to_dict(self):
        return {
            "id": self.id,
            "template_id": self.template_id,
            "content": self.content,
            "scheduled_at": self.scheduled_at.isoformat() if self.scheduled_at else None,
            "published_at": self.published_at.isoformat() if self.published_at else None,
            "status": self.status,
            "networks": self.networks or [],
        }


class WatchSource(db.Model):
    __tablename__ = "watch_sources"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    name = db.Column(db.String(100), nullable=False)  # "Préfecture", "Le Quotidien"
    url = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(20), default="rss")  # rss, website
    keywords = db.Column(db.JSON, default=list)

    notifications = db.relationship("Notification", backref="source", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "url": self.url,
            "type": self.type,
            "keywords": self.keywords or [],
        }


class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    source_id = db.Column(db.Integer, db.ForeignKey("watch_sources.id"), nullable=False)
    title = db.Column(db.String(200))
    url = db.Column(db.Text)
    content = db.Column(db.Text)
    detected_at = db.Column(db.DateTime, default=utcnow)
    is_read = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            "id": self.id,
            "source_id": self.source_id,
            "source_name": self.source.name if self.source else None,
            "title": self.title,
            "url": self.url,
            "content": self.content,
            "detected_at": self.detected_at.isoformat() if self.detected_at else None,
            "is_read": self.is_read,
        }
