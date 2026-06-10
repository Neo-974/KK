# KK — SaaS de communication pour élus locaux

Outil pour aider les maires (La Réunion) à gérer leur communication sur les réseaux sociaux :
veille automatisée, templates de posts, publication multi-réseaux, tableau de bord.

## Structure du projet

```
backend/      API Python Flask (auth, templates, posts, veille)
frontend/     Interface React + Tailwind CSS (Vite)
automation/   Scripts de veille et workflows N8N
```

## Démarrage rapide (développement local)

### Prérequis
- Python 3.11+
- Node.js 18+
- Docker (optionnel, pour PostgreSQL)

### 1. Base de données

```bash
docker compose up -d db
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows : venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
flask --app app run --debug
```

L'API tourne sur http://localhost:5000

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

L'interface tourne sur http://localhost:5173

## Versions

- **v0.1** (actuelle) : socle technique — backend, frontend, base de données, authentification
- **v0.2** : veille automatisée (RSS Préfecture, médias locaux)
- **v0.3** : templates et calendrier de posts
- **v0.4** : publication Facebook / Instagram
- **v1.0** : analytics + déploiement production
