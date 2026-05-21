# JobAggregator

Plateforme d'agrégation d'offres d'emploi — projet Epitech "Build it for real".

---

## Sommaire

- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation & démarrage](#installation--démarrage)
- [Configuration des variables d'environnement](#configuration-des-variables-denvironnement)
- [Comment fonctionne le projet](#comment-fonctionne-le-projet)
- [Services exposés](#services-exposés)
- [API — routes principales](#api--routes-principales)
- [Lancer les tests](#lancer-les-tests)
- [Commandes utiles](#commandes-utiles)

---

## Architecture

Le projet est découpé en cinq services Docker indépendants qui communiquent sur un réseau interne (`app-network`) :

```
┌─────────────┐     ┌─────────────┐     ┌──────────────────┐
│   Frontend  │────▶│   Backend   │────▶│   Microservices  │
│ React + Vite│     │ Node/Express│     │  Node (scraping  │
│  :5173      │     │   :4000     │     │   + cron) :5001  │
└─────────────┘     └──────┬──────┘     └────────┬─────────┘
                           │                     │
                    ┌──────▼──────┐       ┌──────▼──────┐
                    │  AI Service │       │  PostgreSQL  │
                    │ Python/Fast │       │  + pgvector  │
                    │  API :8000  │       │    :5432     │
                    └─────────────┘       └─────────────┘
```

| Service         | Technologie              | Rôle                                          |
|-----------------|--------------------------|-----------------------------------------------|
| `frontend`      | React 19 + Vite + TS     | Interface utilisateur                         |
| `backend`       | Node.js + Express 5      | API REST, auth JWT, gestion des offres        |
| `microservices` | Node.js + node-cron      | Synchronisation des offres (WeLoveDevs + cron)|
| `ai-service`    | Python + FastAPI         | Embeddings, indexation et comparaison d'offres|
| `database`      | PostgreSQL 15 + pgvector | Stockage des offres avec support vectoriel    |

---

## Prérequis

- [Docker](https://docs.docker.com/get-docker/) ≥ 24
- [Docker Compose](https://docs.docker.com/compose/) ≥ 2.20
- (Optionnel pour dev local) Node.js ≥ 20, Python ≥ 3.11

---

## Installation & démarrage

### 1. Cloner le dépôt

```bash
git clone <url-du-repo>
cd Job_aggregator
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Ouvrir `.env` et renseigner au minimum :

```
JWT_SECRET=une_chaine_aleatoire_de_32_caracteres_minimum
POSTGRES_PASSWORD=un_mot_de_passe_securise
DEFAULT_ADMIN_EMAIL=admin@jobaggregator.com
DEFAULT_ADMIN_PASSWORD=admin123
```

### 3. Lancer tous les services

```bash
docker compose up --build
```

La première fois, Docker télécharge les images et installe les dépendances — cela peut prendre quelques minutes (le service `ai-service` télécharge notamment le modèle `all-MiniLM-L6-v2`).

Une fois tous les services démarrés, l'application est accessible sur :

| URL                          | Service            |
|------------------------------|--------------------|
| http://localhost:5173        | Interface web      |
| http://localhost:4000/health | API backend        |
| http://localhost:8000/docs   | Swagger AI service |
| http://localhost:5001/health | Microservices      |

### 4. Lancer en mode détaché (background)

```bash
docker compose up --build -d
```

Pour afficher les logs d'un service spécifique :

```bash
docker compose logs -f backend
docker compose logs -f ai-service
```

---

## Configuration des variables d'environnement

Le fichier `.env` à la racine du projet est utilisé par tous les services. Voici le détail des variables :

| Variable                  | Description                                              | Exemple                                         |
|---------------------------|----------------------------------------------------------|-------------------------------------------------|
| `JWT_SECRET`              | Clé secrète pour signer les tokens JWT (min. 32 chars)  | `super_secret_key_32chars_minimum`              |
| `POSTGRES_DB`             | Nom de la base de données                                | `jobdb`                                         |
| `POSTGRES_USER`           | Utilisateur PostgreSQL                                   | `user`                                          |
| `POSTGRES_PASSWORD`       | Mot de passe PostgreSQL                                  | `your_password`                                 |
| `DATABASE_URL`            | URL de connexion à la base                               | `postgresql://user:pass@database:5432/jobdb`    |
| `WELOVEDEVS_API_KEY`      | Clé d'API WeLoveDevs pour la récupération des offres    | `sk-...`                                        |
| `WELOVEDEVS_API_URL`      | URL de l'API WeLoveDevs                                  | `https://epi-api.welovedevs.com/v1`             |
| `AI_SERVICE_URL`          | URL interne de l'AI service (entre conteneurs)           | `http://ai-service:8000`                        |
| `CORS_ORIGIN`             | Origine autorisée pour les requêtes CORS                 | `http://localhost:5173`                         |
| `DEFAULT_ADMIN_EMAIL`     | Email du compte administrateur créé au démarrage        | `admin@jobaggregator.com`                             |
| `DEFAULT_ADMIN_PASSWORD`  | Mot de passe du compte administrateur                    | `admin123`                                     |
| `ENABLE_WELOVEDEVS_CRON`  | Active la synchronisation automatique (cron)             | `true`                                          |
| `WELOVEDEVS_CRON_SCHEDULE`| Expression cron pour la synchronisation                  | `0 * * * *` (toutes les heures)                 |
| `NODE_ENV`                | Environnement d'exécution                                | `development` / `production`                    |


---

## Comment fonctionne le projet

### Flux général

```
Sources externes          Microservices           Base de données
(WeLoveDevs API)  ──────▶ Synchronisation  ──────▶  PostgreSQL
                          + mapping               (offres normalisées)
                               │                        │
                               ▼                        ▼
                          AI Service             AI Service
                          (indexation)    ◀────  (vectorisation
                          pgvector                via embeddings)
                                                        │
                          Backend API  ◀───────────────┘
                          (Express)
                               │
                          Frontend
                          (React)
```

### 1. Ingestion des offres (Microservices)

Le service `microservices` est responsable de récupérer les offres d'emploi depuis des sources externes et de les insérer en base de données.

**Deux modes de synchronisation :**

- **Automatique via cron** : si `ENABLE_WELOVEDEVS_CRON=true`, les offres WeLoveDevs sont synchronisées selon le planning défini dans `WELOVEDEVS_CRON_SCHEDULE` (par défaut toutes les minutes en dev). Un verrou (`syncLock`) empêche deux synchronisations simultanées.
- **Manuelle via API** : `POST /api/ingest` déclenche une synchronisation immédiate. Un cooldown de 10 minutes s'applique en production entre deux appels manuels.
- **Import JSON local** : `POST /api/ingest/local` permet d'importer des offres depuis un payload JSON arbitraire (utile pour les tests ou l'import batch).

Après chaque offre insérée ou mise à jour, le microservice notifie l'AI service pour déclencher son indexation vectorielle.

### 2. Indexation vectorielle (AI Service)

Le service `ai-service` (Python/FastAPI) génère des **embeddings** (représentations vectorielles) pour chaque offre à l'aide du modèle `all-MiniLM-L6-v2` (sentence-transformers). Ces vecteurs sont stockés dans PostgreSQL via l'extension **pgvector**, ce qui permet des recherches sémantiques.

**Endpoints :**
- `POST /index/offer` — indexe une offre spécifique par son UUID
- `POST /compare` — compare deux offres par rapport à un profil idéal défini par l'utilisateur
- `GET /health` — vérification de santé

### 3. API Backend (Node.js/Express)

Le backend expose une API REST sur le port `4000`. Il gère :

- **Authentification** : inscription / connexion par email+mot de passe, tokens JWT en cookie httpOnly, rate limiting sur `/api/auth/login` (5 tentatives / 15 min)
- **Gestion des offres** : liste paginée et filtrée des offres, récupérées depuis la base PostgreSQL
- **Favoris** : sauvegarde d'offres favorites par utilisateur
- **Comparaison IA** : proxy vers l'AI service pour comparer deux offres par rapport à un profil utilisateur
- **Administration** : gestion des utilisateurs et des offres (rôle `admin` requis)
- **Sécurité** : Helmet, CORS strict, validation Zod des entrées, protection HIBP des mots de passe

### 4. Frontend (React + Vite)

L'interface utilisateur est construite avec React 19 et TypeScript. Elle consomme l'API backend via Axios.

**Pages principales :**
- `/` — liste des offres avec filtres
- `/login` & `/register` — authentification
- `/profile` — profil utilisateur et favoris
- `/admin` — dashboard d'administration (accès réservé aux admins)

**État global** géré avec Zustand (auth, UI) et React Query pour le cache des données serveur.

### 5. Base de données (PostgreSQL + pgvector)

PostgreSQL 15 avec l'extension **pgvector** pour stocker les embeddings des offres sous forme de colonnes vectorielles (`vector(384)`). Les scripts d'initialisation se trouvent dans `database/init/`.

---

## Services exposés

| Service        | Port local | URL                          |
|----------------|------------|------------------------------|
| Frontend       | 5173       | http://localhost:5173        |
| Backend API    | 4000       | http://localhost:4000        |
| Microservices  | 5001       | http://localhost:5001        |
| AI Service     | 8000       | http://localhost:8000        |
| PostgreSQL     | 5432       | localhost:5432               |
| Swagger AI     | 8000       | http://localhost:8000/docs   |

---

## API — routes principales

### Authentification (`/api/auth`)

| Méthode | Route                | Description                   |
|---------|----------------------|-------------------------------|
| POST    | `/api/auth/register` | Créer un compte               |
| POST    | `/api/auth/login`    | Connexion (retourne un cookie JWT) |

### Offres (`/api/offers`)

| Méthode | Route              | Auth | Description                            |
|---------|--------------------|------|----------------------------------------|
| GET     | `/api/offers/jobs` | ✅   | Liste paginée et filtrée des offres    |
| POST    | `/api/offers/compare` | ✅ | Comparer deux offres via l'IA          |

### Favoris (`/api/favorites`)

| Méthode | Route              | Auth | Description                 |
|---------|--------------------|------|-----------------------------|
| GET     | `/api/favorites`   | ✅   | Liste des offres favorites  |
| POST    | `/api/favorites`   | ✅   | Ajouter un favori           |
| DELETE  | `/api/favorites/:id` | ✅ | Supprimer un favori         |

### Administration (`/api/admin`)

| Méthode | Route                | Auth Admin | Description              |
|---------|----------------------|------------|--------------------------|
| GET     | `/api/admin/users`   | ✅         | Liste des utilisateurs   |
| DELETE  | `/api/admin/users/:id` | ✅       | Supprimer un utilisateur |

### Microservices (port 5001)

| Méthode | Route               | Description                                      |
|---------|---------------------|--------------------------------------------------|
| POST    | `/api/ingest`       | Déclencher une synchronisation WeLoveDevs        |
| POST    | `/api/ingest/local` | Importer des offres depuis un JSON               |
| GET     | `/health`           | Vérification de santé                            |

---

## Lancer les tests

### Backend (Jest + Supertest)

```bash
cd backend
npm install
npm test
```

### AI Service (pytest)

```bash
cd ai-service
pip install -r requirements.txt
pytest
```

---

## Commandes utiles

```bash
# Stopper tous les services
docker compose down

# Stopper et supprimer les volumes (repart d'une base vide)
docker compose down -v

# Rebuilder un seul service
docker compose up --build backend

# Voir les logs en temps réel
docker compose logs -f

# Accéder à la base de données
docker compose exec database psql -U $POSTGRES_USER -d $POSTGRES_DB

# Déclencher une synchronisation manuelle des offres
curl -X POST http://localhost:5001/api/ingest
```
