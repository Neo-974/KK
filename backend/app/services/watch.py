"""Veille automatisée : lecture des flux RSS et création de notifications."""

import logging

import feedparser

from ..extensions import db
from ..models import Notification, WatchSource

logger = logging.getLogger(__name__)


def matches_keywords(entry_title, entry_summary, keywords):
    if not keywords:
        return True
    text = f"{entry_title} {entry_summary}".lower()
    return any(keyword.lower() in text for keyword in keywords)


def fetch_source(source):
    """Lit un flux RSS et crée les notifications manquantes. Retourne le nombre de nouveautés."""
    feed = feedparser.parse(source.url)
    if feed.bozo and not feed.entries:
        logger.warning("Flux illisible pour %s : %s", source.name, source.url)
        return 0

    new_count = 0
    for entry in feed.entries[:20]:
        url = entry.get("link")
        title = entry.get("title", "(sans titre)")
        summary = entry.get("summary", "")

        if not url:
            continue
        if not matches_keywords(title, summary, source.keywords):
            continue
        if Notification.query.filter_by(source_id=source.id, url=url).first():
            continue

        db.session.add(
            Notification(
                source_id=source.id,
                title=title[:200],
                url=url,
                content=summary[:2000],
            )
        )
        new_count += 1

    db.session.commit()
    return new_count


def fetch_all_sources():
    """Lit tous les flux de toutes les sources. Retourne le total de nouvelles notifications."""
    total = 0
    for source in WatchSource.query.all():
        try:
            total += fetch_source(source)
        except Exception:
            logger.exception("Erreur lors de la veille sur %s", source.name)
    return total
