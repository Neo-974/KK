"""Génération de posts réseaux sociaux avec l'API Claude."""

import os

import anthropic

# Modèle et limites configurables via l'environnement (valeurs par défaut sûres).
MODEL = os.environ.get("ANTHROPIC_MODEL", "claude-opus-4-8")
MAX_TOKENS = int(os.environ.get("ANTHROPIC_MAX_TOKENS", "1024"))
# Timeout et nombre de tentatives (le SDK réessaie automatiquement les erreurs
# réseau, 429 et 5xx avec un back-off exponentiel).
TIMEOUT = float(os.environ.get("ANTHROPIC_TIMEOUT", "30"))
MAX_RETRIES = int(os.environ.get("ANTHROPIC_MAX_RETRIES", "3"))

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

# Client mis en cache pour éviter de le recréer à chaque appel.
_client = None


def get_client():
    """Retourne un client Anthropic partagé, configuré depuis l'environnement.

    Lève RuntimeError si la clé API n'est pas configurée.
    """
    global _client
    if _client is None:
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            raise RuntimeError("ANTHROPIC_API_KEY n'est pas configurée")
        _client = anthropic.Anthropic(
            api_key=api_key,
            timeout=TIMEOUT,
            max_retries=MAX_RETRIES,
        )
    return _client


def _build_prompt(title, content=None, source_name=None, commune=None, tone=None):
    """Construit le message utilisateur à partir d'une info de veille."""
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
    return "\n".join(parts)


def generate_post(title, content=None, source_name=None, commune=None, tone=None):
    """Génère le texte d'un post à partir d'une info de veille.

    Lève RuntimeError avec un message clair en cas de problème (clé invalide,
    quota dépassé, service indisponible, refus de sécurité, réponse vide) — le
    routeur API le transforme en réponse HTTP 503.
    """
    prompt = _build_prompt(title, content, source_name, commune, tone)
    client = get_client()

    try:
        response = client.messages.create(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": prompt}],
        )
    except anthropic.AuthenticationError:
        raise RuntimeError("Clé API Anthropic invalide ou révoquée")
    except anthropic.PermissionDeniedError:
        raise RuntimeError("La clé API Anthropic n'a pas accès à ce modèle")
    except anthropic.RateLimitError:
        raise RuntimeError("Quota Anthropic dépassé, réessayez dans quelques instants")
    except anthropic.APITimeoutError:
        raise RuntimeError("Le service de génération a mis trop de temps à répondre")
    except anthropic.APIConnectionError:
        raise RuntimeError("Impossible de contacter le service de génération")
    except anthropic.APIStatusError as exc:
        raise RuntimeError(f"Erreur du service de génération ({exc.status_code})")

    # Refus de sécurité : le modèle a décliné la requête.
    if response.stop_reason == "refusal":
        raise RuntimeError("La génération a été refusée pour des raisons de sécurité")

    text = next(
        (block.text for block in response.content if block.type == "text"), ""
    ).strip()
    if not text:
        raise RuntimeError("Le service de génération a renvoyé une réponse vide")
    return text
