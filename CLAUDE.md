# Instructions pour Claude — projet KK

## Contexte métier

**KK** est un SaaS de communication pour **élus locaux** (les maires de La
Réunion). Il aide à gérer leur présence sur les réseaux sociaux : veille
automatisée, templates de posts, génération de posts par IA, publication
multi-réseaux et tableau de bord.

Public : des maires et leurs équipes de communication, pas des techniciens.
Le ton des textes générés doit rester **chaleureux, en vouvoiement**, adapté à
La Réunion.

Répondre en **français**.

## Architecture

```
backend/      API Python Flask (auth JWT, templates, posts, veille, IA)
frontend/     Interface React + Vite + Tailwind CSS
docker-compose.yml   PostgreSQL + backend
```

- **Backend** : Flask + SQLAlchemy + Flask-JWT-Extended + Flask-Migrate.
  - `app/api/` : les routes (auth, templates, posts, watch, ai).
  - `app/services/` : la logique métier (`ai.py` = génération par l'API Claude,
    `watch.py` = veille RSS).
  - `app/models.py` : modèles (User, SocialAccount, Template, Post,
    WatchSource, Notification).
  - Veille automatique : un scheduler (APScheduler) lit les flux RSS toutes les
    30 min (désactivable avec `DISABLE_SCHEDULER=1`).
- **Frontend** : React 18 + React Router + Axios, build avec Vite, style
  Tailwind. Pages dans `frontend/src/pages/`, appels API dans
  `frontend/src/api/client.js`.

## Lancer le projet

```bash
# Base de données
docker compose up -d db

# Backend  (http://localhost:5000)
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # puis renseigner les valeurs
flask --app app run --debug

# Frontend (http://localhost:5173)
cd frontend
npm install
npm run dev
```

## Conventions

- Code et commentaires en français quand c'est du texte destiné à l'équipe.
- Messages d'erreur renvoyés à l'utilisateur : clairs et en français.
- Ne pas committer de secrets : `.env` est ignoré, tout passe par des
  variables d'environnement (voir `backend/.env.example`).
- Modèle IA par défaut : `claude-opus-4-8` (configurable via `ANTHROPIC_MODEL`).

## Intégration IA (API Claude)

- Toute la logique est dans `backend/app/services/ai.py` et exposée par
  `backend/app/api/ai.py` (endpoint `/api/ai/generate-post`).
- La clé se configure via `ANTHROPIC_API_KEY`. Réglages optionnels :
  `ANTHROPIC_MODEL`, `ANTHROPIC_MAX_TOKENS`, `ANTHROPIC_TIMEOUT`,
  `ANTHROPIC_MAX_RETRIES`.
- En cas de modification de l'appel à l'API, garder une gestion d'erreurs
  claire (exceptions Anthropic → messages en français) et ne pas casser
  l'interface `generate_post()` utilisée par le routeur.

## Interface (frontend)

- **Animations : toujours utiliser `framer-motion`** (déjà installé) plutôt que
  du CSS d'animation manuel — via `motion.*`
  (`import { motion } from "framer-motion"`).
- **Composants UI : privilégier le connecteur MCP `21st`** pour chercher ou
  générer des composants React prêts à l'emploi (boutons, cartes, formulaires…)
  avant d'en coder un à la main.

## Bonnes pratiques de travail

- Développer sur une **branche**, jamais directement sur la principale.
- Pour un simple essai jeté (hors KK), utiliser plutôt le dépôt `sandbox`.
