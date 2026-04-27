# Structure du projet — Job Aggregator

## Arborescence complète

```
job-aggregator/
│
├── docker-compose.yml               # Orchestration des 5 services
├── .env                             # Variables d'environnement globales
├── .env.example                     # Template à copier
├── .gitignore
├── README.md
│
│
├── frontend/                        # Service 1 — React + Vite (:3000)
│   ├── Dockerfile
│   ├── vite.config.js
│   ├── package.json
│   ├── index.html
│   │
│   ├── public/
│   │   └── favicon.ico
│   │
│   └── src/
│       ├── main.jsx                 # Point d'entrée React
│       ├── App.jsx                  # Router principal
│       │
│       ├── assets/                  # Images, fonts, icônes statiques
│       │
│       ├── components/
│       │   │
│       │   ├── layout/
│       │   │   ├── Navbar.jsx
│       │   │   ├── Sidebar.jsx
│       │   │   └── Footer.jsx
│       │   │
│       │   ├── offers/              # ── Feature : Filtrage ──
│       │   │   ├── OfferCard.jsx        # Carte d'une offre + score de compatibilité
│       │   │   ├── OfferList.jsx        # Liste paginée des offres filtrées
│       │   │   ├── OfferFilters.jsx     # Panneau de filtres (stack, contrat, niveau...)
│       │   │   ├── OfferFilterTags.jsx  # Tags actifs avec croix pour retirer un filtre
│       │   │   ├── OfferDetail.jsx      # Page détail d'une offre + résumé IA
│       │   │   └── OfferCompare.jsx     # ── Feature : Comparaison côte à côte ──
│       │   │
│       │   ├── dashboard/           # ── Feature : Graphiques de comparaison ──
│       │   │   ├── StatsCard.jsx        # Carte métrique (KPI chiffré)
│       │   │   ├── SkillsChart.jsx      # Top 10 technologies demandées (BarChart)
│       │   │   ├── ContractChart.jsx    # Répartition des types de contrat (PieChart)
│       │   │   ├── SalaryChart.jsx      # Fourchettes salariales par niveau (BarChart)
│       │   │   ├── RemoteChart.jsx      # % remote par technologie (BarChart)
│       │   │   └── MarketTrendChart.jsx # Évolution des offres dans le temps (LineChart)
│       │   │
│       │   ├── suggestions/         # ── Feature IA : Suggestions personnalisées ──
│       │   │   ├── SuggestionList.jsx   # Liste des offres recommandées par le modèle
│       │   │   ├── SuggestionCard.jsx   # Carte offre + raison de la suggestion
│       │   │   └── SuggestionBadge.jsx  # Badge "Recommandé pour vous" sur OfferCard
│       │   │
│       │   └── ui/
│       │       ├── Button.jsx
│       │       ├── Badge.jsx
│       │       ├── Loader.jsx
│       │       ├── Modal.jsx
│       │       └── ScoreBar.jsx     # Barre de progression pour le score de compatibilité
│       │
│       ├── pages/
│       │   ├── Home.jsx             # Landing / redirect
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Dashboard.jsx        # Graphiques marché + suggestions IA
│       │   ├── Offers.jsx           # Liste + filtres avancés
│       │   ├── OfferDetailPage.jsx  # Détail + résumé IA + score
│       │   ├── Compare.jsx          # Comparaison multi-offres (graphique radar)
│       │   └── Profile.jsx          # Profil + skills → alimente les suggestions
│       │
│       ├── hooks/
│       │   ├── useOffers.js         # React Query — fetch offres filtrées
│       │   ├── useFilters.js        # Gestion des filtres actifs (URL params sync)
│       │   ├── useSuggestions.js    # React Query — fetch suggestions IA
│       │   ├── useCompare.js        # Logique de sélection pour comparaison
│       │   ├── useAuth.js           # Gestion token JWT
│       │   └── useProfile.js        # Profil + skills utilisateur
│       │
│       ├── store/                   # État global (Zustand)
│       │   ├── authStore.js         # Utilisateur connecté
│       │   ├── compareStore.js      # Offres sélectionnées pour comparaison (max 4)
│       │   └── filterStore.js       # Filtres actifs (stack, contrat, niveau, remote...)
│       │
│       ├── services/                # Appels API vers le backend
│       │   ├── api.js               # Instance Axios configurée (baseURL, interceptors JWT)
│       │   ├── offersService.js     # getOffers(filters), getOfferById, getScore
│       │   ├── suggestionsService.js# getSuggestions(userId) → appel backend → IA
│       │   ├── authService.js
│       │   ├── statsService.js      # getStats() → données pour les graphiques
│       │   └── compareService.js    # getCompareData(offerIds[]) → données radar
│       │
│       └── utils/
│           ├── formatSalary.js
│           ├── scoreColor.js        # Couleur selon % de compatibilité (vert/orange/rouge)
│           ├── buildChartData.js    # Transforme les stats API en format Recharts
│           └── constants.js         # CONTRACT_TYPES, LEVELS, SKILLS_LIST...
│
│
├── backend/                         # Service 2 — Node.js + Express (:4000)
│   ├── Dockerfile
│   ├── package.json
│   ├── .env
│   │
│   └── src/
│       ├── index.js
│       ├── app.js
│       │
│       ├── config/
│       │   ├── db.js
│       │   └── env.js
│       │
│       ├── routes/
│       │   ├── auth.routes.js       # POST /auth/register, /auth/login
│       │   ├── offers.routes.js     # GET /offers, GET /offers/:id, GET /offers/:id/score
│       │   ├── users.routes.js      # GET /users/me, PUT /users/me/skills
│       │   ├── stats.routes.js      # GET /offers/stats
│       │   ├── suggestions.routes.js# GET /suggestions — ── Feature IA ──
│       │   └── import.routes.js     # POST /offers/import
│       │
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── offers.controller.js
│       │   ├── users.controller.js
│       │   ├── stats.controller.js
│       │   ├── suggestions.controller.js
│       │   └── import.controller.js
│       │
│       ├── services/
│       │   ├── authService.js
│       │   ├── offersService.js         # Requêtes filtrées + pagination
│       │   ├── filterService.js         # Construction dynamique de la requête SQL
│       │   ├── ingestionService.js      # Queue + throttling 1 req/sec
│       │   ├── normalizeService.js      # normalizeOffer()
│       │   ├── aiService.js             # Appels HTTP vers ai-service (résumé + suggestions)
│       │   ├── suggestionsService.js    # Orchestre profil → IA → offres suggérées
│       │   └── statsService.js          # Agrégats SQL pour les graphiques
│       │
│       ├── middlewares/
│       │   ├── auth.middleware.js
│       │   ├── role.middleware.js
│       │   └── errorHandler.js
│       │
│       ├── models/
│       │   ├── user.model.js
│       │   ├── offer.model.js
│       │   ├── skill.model.js
│       │   └── application.model.js
│       │
│       └── utils/
│           ├── logger.js
│           ├── paginate.js
│           └── scoreOffer.js
│
│
├── ai-service/                      # Service 3 — Python + FastAPI (:8000)
│   ├── Dockerfile
│   ├── Dockerfile.cpu               # Variante CPU only (sans GPU)
│   ├── requirements.txt             # Dépendances communes
│   ├── requirements.local.txt       # llama-cpp-python, transformers
│   ├── requirements.api.txt         # openai, mistralai (fallback)
│   ├── .env
│   │
│   ├── local_models/                # Modèles .gguf — montés en volume Docker
│   │   ├── .gitkeep                 # Dossier versionné mais modèles non versionnés
│   │   └── README.md                # Instructions téléchargement modèles
│   │
│   └── app/
│       ├── main.py                  # Point d'entrée FastAPI
│       ├── config.py                # Lecture .env → instancie le bon backend LLM
│       │
│       ├── routers/
│       │   ├── health.py            # GET /health — état du modèle chargé
│       │   ├── summarize.py         # POST /summarize — résumé d'une offre
│       │   ├── suggest.py           # POST /suggest — ── Feature IA : Suggestions ──
│       │   └── match.py             # POST /match — score sémantique profil/offre
│       │
│       ├── backends/                # Adaptateurs LLM — switchables via .env
│       │   ├── base.py              # Classe abstraite BaseLLMBackend
│       │   ├── ollama_backend.py    # Appel HTTP Ollama (:11434) — recommandé dev
│       │   ├── llamacpp_backend.py  # Inférence directe fichier .gguf — offline total
│       │   ├── huggingface_backend.py # Modèle HuggingFace en mémoire
│       │   └── openai_backend.py    # Fallback API OpenAI / Mistral / Groq
│       │
│       ├── services/
│       │   ├── summarize_service.py     # prompt → LLM → résumé JSON
│       │   ├── suggest_service.py       # profil + offres → LLM → liste suggérée
│       │   └── match_service.py         # score sémantique entre profil et offre
│       │
│       ├── prompts/
│       │   ├── system_fr.txt            # Prompt système commun (rôle, ton, format)
│       │   ├── summarize_fr.txt         # Template résumé d'offre
│       │   ├── suggest_fr.txt           # Template suggestions personnalisées
│       │   └── match_fr.txt             # Template scoring compatibilité
│       │
│       ├── models/                  # Schémas Pydantic
│       │   ├── summarize_model.py   # SummarizeRequest / SummarizeResponse
│       │   ├── suggest_model.py     # SuggestRequest / SuggestResponse
│       │   └── match_model.py       # MatchRequest / MatchResponse
│       │
│       └── utils/
│           ├── prompt_builder.py    # Injecte les variables dans les templates
│           ├── response_parser.py   # Extrait le JSON de la réponse du modèle
│           └── logger.py
│
│
├── database/                        # Service 4 — PostgreSQL (:5432)
│   ├── init/
│   │   ├── 01_schema.sql            # CREATE TABLE dans l'ordre des FK
│   │   ├── 02_seeds.sql             # Rôles + skills de base
│   │   └── 03_indexes.sql           # INDEX sur les colonnes de filtrage
│   └── migrations/
│       └── .gitkeep
│
│
└── docs/
    ├── benchmark.md
    ├── structure.md                 # Ce fichier
    ├── api.md
    └── adr/
        ├── ADR-001-backend.md
        ├── ADR-002-database.md
        ├── ADR-003-frontend.md
        ├── ADR-004-ai-service.md
        └── ADR-005-ingestion.md
```

---

## Features et responsabilités

### Feature 1 — Filtrage des offres

**Objectif :** Permettre à Damien de filtrer par stack, type de contrat, niveau, remote, durée et salaire sans jongler entre plusieurs plateformes.

**Fichiers impliqués :**

| Couche | Fichier | Rôle |
|---|---|---|
| UI | `OfferFilters.jsx` | Panneau de filtres avec multi-sélection |
| UI | `OfferFilterTags.jsx` | Tags actifs — retirer un filtre en un clic |
| State | `filterStore.js` | Filtres actifs synchronisés dans l'URL |
| Hook | `useFilters.js` | Sync filtres ↔ URL params (partage de recherche) |
| Hook | `useOffers.js` | React Query avec les filtres comme clé de cache |
| Backend | `filterService.js` | Construit la requête SQL `WHERE` dynamiquement |
| Backend | `offersService.js` | Exécute la requête paginée |

**Flux :**
```
OfferFilters.jsx (user sélectionne Python + stage + junior)
  └─▶ filterStore.js (mise à jour état global)
        └─▶ useOffers.js (React Query re-fetch)
              └─▶ GET /api/offers?stack=Python&contract=stage&level=junior
                    └─▶ filterService.js (construit le WHERE SQL)
                          └─▶ offersService.js (requête paginée)
                                └─▶ PostgreSQL → résultats
```

**Filtres disponibles :**

| Filtre | Type | Champ SQL |
|---|---|---|
| Stack technologique | Multi-sélection | `offer_skills.skill_id` |
| Type de contrat | Sélection unique | `offers.contract_type` |
| Niveau | Sélection unique | `offers.level` |
| Remote | Toggle | `offers.remote` |
| Durée (mois) | Slider min/max | `offers.duration_months` |
| Salaire | Slider min/max | `offers.salary_min / salary_max` |

---

### Feature 2 — Graphiques de comparaison marché

**Objectif :** Donner à Damien une vision globale du marché — quelles technos sont demandées, quels salaires pour un junior, combien d'offres sont remote.

**Fichiers impliqués :**

| Couche | Fichier | Rôle |
|---|---|---|
| UI | `SkillsChart.jsx` | BarChart horizontal — top 10 technologies |
| UI | `ContractChart.jsx` | PieChart — répartition stage / alternance / CDI |
| UI | `SalaryChart.jsx` | BarChart groupé — salaire min/max par niveau |
| UI | `RemoteChart.jsx` | BarChart — % remote par techno principale |
| UI | `MarketTrendChart.jsx` | LineChart — volume d'offres sur les 30 derniers jours |
| Service | `buildChartData.js` | Transforme les données API en format Recharts |
| Backend | `statsService.js` | Requêtes SQL d'agrégation (GROUP BY, COUNT, AVG) |
| Backend | `GET /api/offers/stats` | Endpoint dédié aux données dashboard |

**Flux :**
```
Dashboard.jsx (montage du composant)
  └─▶ statsService.js (React Query, cache 5 min)
        └─▶ GET /api/offers/stats
              └─▶ statsService.js (backend)
                    └─▶ PostgreSQL (GROUP BY contract_type, level, skill...)
                          └─▶ buildChartData.js (format Recharts)
                                └─▶ SkillsChart, SalaryChart, ContractChart...
```

**Données retournées par `/api/offers/stats` :**
```json
{
  "top_skills": [
    { "skill": "Python", "count": 142 },
    { "skill": "JavaScript", "count": 118 }
  ],
  "by_contract": [
    { "type": "stage", "count": 87 },
    { "type": "CDI", "count": 210 }
  ],
  "salary_by_level": [
    { "level": "junior", "avg_min": 28000, "avg_max": 35000 }
  ],
  "remote_by_skill": [
    { "skill": "Python", "remote_pct": 68 }
  ],
  "trend_30d": [
    { "date": "2025-04-01", "count": 12 }
  ]
}
```

---

### Feature 3 — Suggestions personnalisées (IA)

**Objectif :** Proposer automatiquement à Damien les offres les plus adaptées à son profil, sans qu'il ait à configurer manuellement chaque filtre.

**Fonctionnement :** Le modèle local reçoit le profil utilisateur (niveau, stack, type de contrat recherché) + une liste d'offres candidates (pré-filtrées en base). Il retourne les 5 meilleures offres avec une raison de recommandation pour chacune.

**Fichiers impliqués :**

| Couche | Fichier | Rôle |
|---|---|---|
| UI | `SuggestionList.jsx` | Affiche les 5 offres recommandées |
| UI | `SuggestionCard.jsx` | Offre + raison de la suggestion en français |
| UI | `SuggestionBadge.jsx` | Badge "Recommandé pour vous" sur `OfferCard` |
| Hook | `useSuggestions.js` | React Query — rafraîchi si le profil change |
| Service | `suggestionsService.js` (front) | `GET /api/suggestions` |
| Backend | `suggestions.controller.js` | Récupère profil + offres candidates |
| Backend | `suggestionsService.js` | Prépare le payload → appelle ai-service |
| Backend | `aiService.js` | `POST http://ai-service:8000/suggest` |
| IA | `suggest.py` (router) | Reçoit la requête |
| IA | `suggest_service.py` | Construit le prompt → LLM → parse JSON |
| IA | `suggest_fr.txt` | Template du prompt de suggestion |

**Flux :**
```
Dashboard.jsx (montage)
  └─▶ useSuggestions.js
        └─▶ GET /api/suggestions
              └─▶ suggestions.controller.js
                    ├─▶ SELECT profil + user_skills WHERE user_id = ?
                    ├─▶ SELECT top 20 offres pré-filtrées par skills communes
                    └─▶ suggestionsService.js
                          └─▶ POST http://ai-service:8000/suggest
                                └─▶ suggest_service.py
                                      ├─▶ build_prompt(profil, offres)
                                      ├─▶ LLM local (Ollama / llama.cpp)
                                      └─▶ parse_json_response()
                                            └─▶ [{ offer_id, reason }] × 5
```

**Payload envoyé au service IA :**
```json
{
  "user_profile": {
    "level": "junior",
    "contract_type": "stage",
    "duration_min": 1,
    "duration_max": 3,
    "skills": ["Python", "JavaScript"]
  },
  "candidate_offers": [
    {
      "id": "uuid-1",
      "title": "Stage développeur Python",
      "company": "Startup XYZ",
      "summary": "Développement d'un pipeline de données...",
      "skills": ["Python", "SQL"],
      "level": "junior",
      "remote": true,
      "duration_months": 2
    }
  ]
}
```

**Réponse du service IA :**
```json
{
  "suggestions": [
    {
      "offer_id": "uuid-1",
      "score": 92,
      "reason": "Correspond exactement à ta stack Python et à ta recherche de stage 2 mois en remote."
    }
  ]
}
```

**Prompt `suggest_fr.txt` :**
```
Tu es un assistant de recherche d'emploi pour développeurs juniors.

Profil du candidat :
- Niveau : {level}
- Contrat recherché : {contract_type}
- Durée souhaitée : {duration_min} à {duration_max} mois
- Stack maîtrisée : {skills}

Voici {offer_count} offres candidates :
{offers_json}

Sélectionne les 5 offres les plus adaptées à ce profil.
Réponds UNIQUEMENT en JSON avec ce format, sans texte autour :
{
  "suggestions": [
    {
      "offer_id": "...",
      "score": 0-100,
      "reason": "Explication courte en français (1 phrase)"
    }
  ]
}
```

---

## Docker Compose complet (5 services)

```yaml
services:

  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    depends_on: [backend]
    environment:
      - VITE_API_URL=http://localhost:4000

  backend:
    build: ./backend
    ports: ["4000:4000"]
    depends_on:
      database:
        condition: service_healthy
      ai-service:
        condition: service_healthy
    environment:
      - DATABASE_URL=postgresql://user:pass@database:5432/jobdb
      - JWT_SECRET=${JWT_SECRET}
      - AI_SERVICE_URL=http://ai-service:8000
      - WELOVDEVS_API_URL=${WELOVDEVS_API_URL}
      - RATE_LIMIT_DELAY_MS=1000

  ai-service:
    build: ./ai-service
    ports: ["8000:8000"]
    volumes:
      - ./ai-service/local_models:/app/local_models  # Modèles .gguf
    depends_on:
      ollama:
        condition: service_healthy
    environment:
      - AI_BACKEND=ollama                            # ollama | llamacpp | openai
      - OLLAMA_URL=http://ollama:11434
      - OLLAMA_MODEL=mistral
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 10s
      timeout: 5s
      retries: 5

  ollama:
    image: ollama/ollama:latest
    ports: ["11434:11434"]
    volumes:
      - ollama_data:/root/.ollama                    # Modèles persistés
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:11434/api/tags"]
      interval: 10s
      timeout: 5s
      retries: 10

  database:
    image: postgres:15
    ports: ["5432:5432"]
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d
    environment:
      - POSTGRES_DB=jobdb
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d jobdb"]
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  pgdata:
  ollama_data:
```

---

## Variables d'environnement

```env
# ── Backend ──────────────────────────────────────────
JWT_SECRET=your_jwt_secret_here
DATABASE_URL=postgresql://user:pass@localhost:5432/jobdb
AI_SERVICE_URL=http://ai-service:8000
WELOVDEVS_API_URL=https://api.welovedevs.com
RATE_LIMIT_DELAY_MS=1000

# ── AI Service ───────────────────────────────────────
# Sélection du backend LLM : ollama | llamacpp | huggingface | openai
AI_BACKEND=ollama

# Mode Ollama (recommandé en développement)
OLLAMA_URL=http://ollama:11434
OLLAMA_MODEL=mistral

# Mode llama.cpp (offline total — fichier .gguf requis)
MODEL_PATH=./local_models/mistral-7b-instruct.Q4_K_M.gguf

# Mode HuggingFace
HF_MODEL=mistralai/Mistral-7B-Instruct-v0.2
HF_TOKEN=hf_...

# Mode OpenAI (fallback)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# ── Frontend ─────────────────────────────────────────
VITE_API_URL=http://localhost:4000
```

---

## Backends LLM disponibles

| Critère | Ollama | llama.cpp | HuggingFace | OpenAI |
|---|---|---|---|---|
| Setup | Très facile | Moyen | Facile | Très facile |
| Offline complet | Oui (après pull) | Oui | Oui (après DL) | Non |
| RAM (Mistral 7B Q4) | ~5 Go | ~5 Go | ~14 Go | — |
| GPU optionnel | Oui | Oui | Oui (CUDA) | — |
| Idéal pour | Dev local | Prod sans internet | Fine-tuning | Prototypage |

---

## Flux de données — récapitulatif

### Filtrage des offres

```
OfferFilters.jsx → filterStore.js → useOffers.js
  └─▶ GET /api/offers?stack=Python&contract=stage&level=junior
        └─▶ filterService.js (WHERE dynamique) → PostgreSQL
```

### Graphiques marché

```
Dashboard.jsx → statsService.js
  └─▶ GET /api/offers/stats
        └─▶ statsService.js (GROUP BY SQL) → PostgreSQL
              └─▶ buildChartData.js → Recharts
```

### Suggestions IA

```
Dashboard.jsx → useSuggestions.js
  └─▶ GET /api/suggestions
        └─▶ suggestionsService.js (backend)
              ├─▶ profil utilisateur (PostgreSQL)
              ├─▶ top 20 offres candidates (PostgreSQL)
              └─▶ POST http://ai-service:8000/suggest
                    └─▶ suggest_service.py → LLM local → JSON
```

### Ingestion + résumé IA

```
POST /api/offers/import
  └─▶ ingestionService.js (queue + throttle 1 req/sec)
        └─▶ WeLoveDevs API → normalizeService.js
              └─▶ POST http://ai-service:8000/summarize
                    └─▶ summarize_service.py → LLM local → summary stocké en base
```

---

## Conventions de nommage

| Élément | Convention | Exemple |
|---|---|---|
| Fichiers React | PascalCase | `SuggestionCard.jsx` |
| Hooks React | camelCase + `use` | `useSuggestions.js` |
| Services backend | camelCase + `Service` | `suggestionsService.js` |
| Routes backend | kebab-case dans l'URL | `/api/suggestions` |
| Tables SQL | snake_case pluriel | `offer_skills` |
| Variables d'env | SCREAMING_SNAKE_CASE | `AI_BACKEND` |
| Branches Git | kebab-case préfixé | `feat/ia-suggestions` |

---

## Scripts disponibles

```bash
# Démarrer tous les services (première fois — télécharge les images)
docker-compose up --build

# Télécharger le modèle Ollama (à faire une seule fois)
docker exec ollama ollama pull mistral

# Démarrer en arrière-plan
docker-compose up -d

# Logs d'un service spécifique
docker-compose logs -f ai-service

# Réinitialiser la base de données
docker-compose down -v && docker-compose up -d database

# Développement local sans Docker
cd frontend   && npm install && npm run dev
cd backend    && npm install && npm run dev
cd ai-service && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000
```