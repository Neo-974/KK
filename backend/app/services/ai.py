"""Génération de posts réseaux sociaux avec l'API Claude."""

import os

import anthropic

MODEL = "claude-opus-4-8"

SYSTEM_PROMPT = """Tu es l'assistant de communication d'un maire de La Réunion.
Tu rédiges des posts pour les réseaux sociaux (Facebook, Instagram, TikTok) à partir
d'informations locales (alertes de la Préfecture, articles de presse, événements communaux).

Règles :
- Ton chaleureux et proche des habitants, vouvoiement.
- Texte court (3 à 6 phrases maximum), adapté aux réseaux sociaux.
- Émojis pertinents mais sobres (2 à 4 maximum).
- Termine par 2 à 3 hashtags pertinents (ex : #LaReunion, #MaCommune).
- Pour les alertes (cyclone, fortes pluies, route coupée) : ton sérieux,
  consignes de sécurité claires, pas d'émojis festifs.
- Ne jamais inventer de faits : utilise uniquement les informations fournies.
- Réponds uniquement avec le texte du post, sans commentaire ni préambule."""


def get_client():
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY n'est pas configurée")
    return anthropic.Anthropic(api_key=api_key)


def generate_post(title, content=None, source_name=None, commune=None, tone=None):
    """Génère le texte d'un post à partir d'une info de veille."""
    parts = [f"Information détectée : {title}"]
    if content:
        parts.append(f"Détails : {content}")
    if source_name:
        parts.append(f"Source : {source_name}")
    if commune:
        parts.append(f"Commune du maire : {commune}")
    if tone:
        parts.append(f"Ton souhaité : {tone}")
    parts.append("Rédige un post pour les réseaux sociaux à partir de cette information.")

    client = get_client()
    response = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": "\n".join(parts)}],
    )
    return next(block.text for block in response.content if block.type == "text")
