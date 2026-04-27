# Benchmark technique — Job Aggregator

## 1. Objectif

Ce benchmark vise à analyser les plateformes existantes ainsi que les choix techniques possibles afin de :

- Comprendre les limites du marché
- Identifier les besoins utilisateurs non couverts
- Comparer différentes solutions techniques
- Justifier les choix d'architecture du projet

L'objectif est de construire une solution cohérente, performante et adaptée à une plateforme d'aide à la décision basée sur la donnée.

---

## 2. Analyse des solutions existantes

### 2.1 LinkedIn Jobs

#### Limites
- Difficulté à comparer les offres entre elles
- Peu de visualisation globale du marché
- Données peu exploitables (salaires absents, stack non structurée)

#### Impact technique
Manque d'exploitation de la donnée : les informations sont affichées mais non analysées.

#### Décision produit
- Intégrer un système de comparaison d'offres côte à côte
- Développer un dashboard analytique basé sur les données normalisées

---

### 2.2 Indeed

#### Limites
- Données hétérogènes selon les employeurs
- Résultats peu pertinents (mauvais ranking)
- Filtres imprécis (pas de filtre par technologie)

#### Impact technique
Les données non structurées rendent l'analyse impossible sans normalisation préalable.

#### Décision produit
- Mettre en place une normalisation des données à l'ingestion (`normalizeOffer()`)
- Implémenter des filtres avancés sur tous les champs structurés

---

### 2.3 Welcome to the Jungle

#### Limites
- Peu d'outils d'analyse pour le candidat
- Difficulté à comparer plusieurs offres
- Contenu éditorial volumineux qui noie l'information utile

#### Impact technique
L'UX est soignée mais non orientée prise de décision. L'information clé est enfouie dans du contenu marketing.

#### Décision produit
- Interface épurée, centrée sur la donnée utile
- Résumé IA automatique pour chaque offre longue

---

### 2.4 WeLoveDevs

#### Limites
- Données brutes peu structurées
- Rate limit strict : 1 requête/seconde

#### Impact technique
L'ingestion naïve est impossible. Un système de queue et de throttling est obligatoire pour respecter les contraintes de l'API.

#### Décision produit
- Ingestion asynchrone avec queue
- Stockage en base avant transformation
- Mise en cache pour réduire les appels

---

## 3. Problèmes techniques identifiés

| Problème | Source | Impact |
|---|---|---|
| Données non structurées | Indeed, WeLoveDevs | Impossible d'analyser sans normalisation |
| Absence de comparaison | LinkedIn, WTTJ | Pas d'aide à la décision |
| Absence d'analyse marché | Toutes | Pas de vision globale pour le candidat |
| Rate limiting API | WeLoveDevs | Ingestion lente, risque de blocage |
| Dépendance API externe | WeLoveDevs | Fragilité si l'API change ou tombe |

---

## 4. Benchmark des choix techniques

### 4.1 Backend — Node.js vs Python vs NestJS

| Critère | Node.js + Express | Python + FastAPI | NestJS |
|---|---|---|---|
| Performance I/O | Excellent (event loop) | Bon (async) | Excellent |
| Simplicité API REST | Très bonne | Bonne | Bonne (structurée) |
| Async natif | Oui | Oui (mais plus verbeux) | Oui |
| Écosystème web | Très large | Large | Large |
| Structure projet | Libre | Libre | Opinionée |
| Courbe d'apprentissage | Faible | Faible | Moyenne |

#### ADR — Choix : Node.js + Express

**Pourquoi :** Besoin d'une API REST rapide, gestion d'appels vers une API externe, traitement asynchrone (queue d'ingestion). Node.js est nativement non-bloquant, ce qui correspond parfaitement au pattern producteur/consommateur de notre ingestion.

**Comment :** Express pour le routing REST, middleware JWT pour l'authentification, service dédié `ingestionService` avec throttling.

**Trade-off :** Moins structuré qu'un framework comme NestJS, ce qui demande plus de rigueur dans l'organisation du code.

**Alternative rejetée :** NestJS aurait apporté plus de structure mais sa courbe d'apprentissage et sa verbosité auraient ralenti le développement. FastAPI (Python) a été écarté pour éviter de dupliquer le backend Python déjà dédié au service IA.

---

### 4.2 Base de données — PostgreSQL vs MongoDB

| Critère | PostgreSQL | MongoDB |
|---|---|---|
| Structure des données | Forte (schéma fixe) | Flexible (schéma libre) |
| Requêtes analytiques | Excellentes (SQL, JOIN, agrégats) | Limitées |
| Cohérence | Forte (ACID) | Éventuelle (configurable) |
| Relations entre entités | Natives (FK, JOIN) | Manuelles (embed ou lookup) |
| Outillage analytics | Mature (pg_stat, index) | Limité |

#### ADR — Choix : PostgreSQL

**Pourquoi :** Le dashboard analytique nécessite des requêtes complexes (agrégats, GROUP BY, JOIN entre offres et compétences). La cohérence des données est critique pour le scoring profil/offre. Les relations entre `USERS`, `OFFERS` et `SKILLS` sont naturellement relationnelles.

**Comment :** PostgreSQL hébergé dans un conteneur Docker, ORM Prisma ou Sequelize pour les requêtes, indexation sur les colonnes de filtrage fréquent (`contract_type`, `level`, `remote`).

**Trade-off :** Moins flexible qu'un NoSQL si la structure des offres évolue fortement. Les migrations de schéma sont plus contraignantes.

**Alternative rejetée :** MongoDB aurait offert plus de flexibilité pour stocker des offres au format JSON hétérogène, mais l'absence de JOIN natif aurait rendu le dashboard analytique très coûteux à implémenter.

---

### 4.3 Frontend — React vs Vue vs Next.js

| Critère | React + Vite | Vue 3 | Next.js |
|---|---|---|---|
| Écosystème | Très large | Large | Très large |
| Flexibilité | Très forte | Bonne | Bonne |
| Gestion d'état complexe | Excellente (Redux, Zustand) | Bonne (Pinia) | Excellente |
| Rendu SSR | Non (SPA) | Non (SPA) | Oui (natif) |
| Courbe d'apprentissage | Moyenne | Plus simple | Élevée |
| Build tool | Vite (rapide) | Vite | Webpack/Turbopack |

#### ADR — Choix : React + Vite

**Pourquoi :** Le dashboard dynamique avec filtres, comparaison et visualisations nécessite une gestion d'état complexe. L'écosystème React offre les bibliothèques nécessaires (Recharts pour les graphes, React Query pour le cache serveur).

**Comment :** React avec Vite pour les performances de build, React Query pour la gestion des appels API, Zustand pour l'état global (profil utilisateur, sélection d'offres à comparer).

**Trade-off :** Complexité plus élevée que Vue pour les développeurs débutants. Pas de SSR natif (non nécessaire pour une app authentifiée).

**Alternative rejetée :** Next.js a été écarté car le SSR n'apporte pas de valeur sur une application authentifiée (pas de SEO à optimiser). Vue aurait été plus simple à prendre en main mais son écosystème de composants de dashboard est moins mature.

---

### 4.4 Service IA — Conteneur Python séparé vs Intégration Node.js

| Critère | Conteneur Python séparé | Intégré au backend Node.js |
|---|---|---|
| Isolation des dépendances | Excellente | Aucune |
| Bibliothèques ML disponibles | Toutes (LangChain, HuggingFace) | Limitées |
| Latence réseau interne | Faible (réseau Docker) | Nulle |
| Complexité Docker Compose | +1 service | Inchangée |
| Scalabilité indépendante | Oui | Non |

#### ADR — Choix : Conteneur Python séparé

**Pourquoi :** Les bibliothèques d'IA (OpenAI SDK, LangChain, transformers) sont natives Python. Isoler ce service permet de le faire évoluer indépendamment du backend métier et d'éviter de polluer l'environnement Node.js avec des dépendances Python.

**Comment :** Service FastAPI exposé sur le port `:8000`, appelé en HTTP interne par le backend Node.js. Expose deux endpoints : `POST /summarize` (résumé d'offre) et `POST /match` (score de compatibilité profil/offre).

**Trade-off :** Un service supplémentaire à maintenir dans Docker Compose. Latence réseau interne (négligeable sur un réseau Docker bridge).

**Alternative rejetée :** Appel direct à l'API OpenAI depuis Node.js aurait été plus simple mais couplait la logique IA au backend métier et rendait impossible l'utilisation de modèles locaux ou de fine-tuning ultérieur.

---

### 4.5 Rate Limiting & Ingestion — Queue vs Appel direct

| Critère | Ingestion avec queue + throttling | Appel direct à l'API |
|---|---|---|
| Respect du rate limit (1 req/s) | Oui | Non |
| Fraîcheur des données | Différée | Immédiate |
| Résilience aux erreurs | Haute (retry) | Faible |
| Complexité backend | Moyenne | Faible |

#### ADR — Choix : Queue + throttling + cache

**Pourquoi :** WeLoveDevs limite à 1 requête/seconde. Un appel direct en réponse à chaque requête utilisateur provoquerait des erreurs 429. La queue découple l'ingestion de la consultation.

**Comment :** Route `POST /api/offers/import` qui enfile les jobs dans une queue. Worker asynchrone qui consomme la queue avec un délai de 1 seconde entre chaque appel. Les offres ingérées sont stockées en base et servies depuis PostgreSQL (pas depuis l'API externe).

**Trade-off :** Les données ne sont pas temps réel. Un job d'ingestion planifié (cron toutes les X heures) maintient la fraîcheur acceptable.

**Alternative rejetée :** Proxy direct avec cache Redis aurait réduit les appels mais n'aurait pas résolu le problème de fond : un pic de trafic aurait quand même atteint la limite.

---

## 5. Architecture technique

### 5.1 Schéma des services

```
┌─────────────────────────────────────────────────────┐
│                  docker-compose                      │
│                                                     │
│  ┌──────────────┐      ┌───────────────────────┐   │
│  │   Frontend   │─────▶│       Backend         │   │
│  │ React + Vite │ REST │   Node.js + Express   │   │
│  │   :3000      │ JWT  │       :4000           │   │
│  └──────────────┘      └──────┬────────┬───────┘   │
│                               │        │            │
│                    SQL        │        │  HTTP      │
│                               ▼        ▼            │
│                    ┌──────────────┐  ┌──────────┐  │
│                    │  PostgreSQL  │  │ Service  │  │
│                    │    :5432     │  │    IA    │  │
│                    └──────────────┘  │  Python  │  │
│                                      │  :8000   │  │
│                                      └──────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
                              │
                    HTTP (throttled)
                              │
                    ┌─────────────────┐
                    │  WeLoveDevs API │
                    │  (1 req/sec)    │
                    └─────────────────┘
```

### 5.2 Responsabilités par service

| Service | Rôle | Technologies |
|---|---|---|
| **Frontend** | Interface utilisateur, dashboard, comparaison | React, Vite, React Query, Recharts |
| **Backend** | API REST, auth JWT, ingestion, scoring | Node.js, Express, Prisma |
| **PostgreSQL** | Persistance des données | PostgreSQL 15 |
| **Service IA** | Résumés d'offres, score de compatibilité | Python, FastAPI, OpenAI SDK |

---

## 6. Schéma de base de données

### Tables principales

```sql
-- Rôles utilisateurs
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE  -- 'student', 'admin'
);

-- Utilisateurs
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(255),
  role_id UUID NOT NULL REFERENCES roles(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Compétences (référentiel)
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE  -- 'Python', 'JavaScript', 'Lua'
);

-- Compétences maîtrisées par l'utilisateur
CREATE TABLE user_skills (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, skill_id)
);

-- Offres d'emploi ingérées et normalisées
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  contract_type VARCHAR(50),     -- 'stage', 'alternance', 'CDI', 'CDD'
  salary_min INTEGER,
  salary_max INTEGER,
  remote BOOLEAN DEFAULT false,
  duration_months INTEGER,       -- null si non applicable
  level VARCHAR(50),             -- 'junior', 'mid', 'senior'
  description TEXT,
  summary_ai TEXT,               -- résumé généré par le service IA
  source_url TEXT,
  fetched_at TIMESTAMP DEFAULT NOW()
);

-- Compétences requises par une offre
CREATE TABLE offer_skills (
  offer_id UUID REFERENCES offers(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (offer_id, skill_id)
);

-- Candidatures (historique des offres consultées / postulées)
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  offer_id UUID REFERENCES offers(id) ON DELETE CASCADE,
  applied_at TIMESTAMP DEFAULT NOW()
);
```

### Contraintes d'intégrité

- Toute offre doit avoir un `contract_type` valide (contrainte CHECK ou enum)
- `salary_min` ≤ `salary_max` (contrainte CHECK)
- Un utilisateur ne peut postuler qu'une fois à la même offre (PK composite sur `applications`)
- Suppression en cascade : si un utilisateur est supprimé, ses candidatures et skills sont supprimés

---

## 7. Décisions produit

### 7.1 Normalisation des données

**Pourquoi :** Les données brutes de WeLoveDevs et d'autres sources sont hétérogènes (formats de salaire variés, niveaux exprimés différemment, technologies mal orthographiées).

**Comment :** Fonction `normalizeOffer()` exécutée à l'ingestion avant insertion en base. Normalise les champs `contract_type`, `level`, `salary_*` et extrait les compétences depuis la description pour peupler `offer_skills`.

**Trade-off :** Risque de perte d'information si la normalisation est trop agressive. Nécessite une maintenance du référentiel de skills.

---

### 7.2 Filtrage avancé

**Pourquoi :** Les plateformes existantes ne permettent pas de filtrer par technologie précise, niveau junior, ou durée de stage.

**Comment :** Filtres combinables exposés via `GET /api/offers?stack=Python&contract=stage&duration_max=3&remote=true&level=junior`. Requête SQL dynamique construite côté backend.

**Filtres disponibles :**
- Stack technologique (multi-sélection)
- Type de contrat (stage, alternance, CDI, CDD)
- Durée (min/max en mois)
- Remote (oui/non/hybride)
- Salaire (min/max)
- Niveau (junior, mid, senior)

---

### 7.3 Score de compatibilité profil/offre

**Pourquoi :** Impossible sur les plateformes existantes. Les candidats ne savent pas quelle offre correspond le mieux à leur profil sans lire chaque description.

**Comment :** Score calculé côté backend en comparant `user_skills` et `offer_skills`. Formule : `(skills communes / skills requises) × 100`. Exposé via `GET /api/offers/:id/score`.

**Trade-off :** Score simple, non pondéré. Une version avancée pourrait pondérer par l'importance de chaque skill.

---

### 7.4 Comparaison d'offres

**Pourquoi :** Aucune plateforme existante ne permet de comparer deux offres côte à côte avec les mêmes critères structurés.

**Comment :** Sélection de 2 à 4 offres via l'UI, affichage en colonnes comparatives (salaire, remote, durée, stack, score de compatibilité).

---

### 7.5 Résumés IA (`summarizeOffer`)

**Pourquoi :** Les descriptions d'offres sont souvent longues et répétitives, ce qui nuit à l'efficacité de lecture.

**Comment :** Appel à `POST /summarize` sur le service Python lors de l'ingestion. Le résumé est stocké dans `offers.summary_ai` et servi statiquement ensuite (pas de génération à la volée).

**Trade-off :** Le résumé est généré une seule fois à l'ingestion. Si l'offre est modifiée à la source, le résumé n'est pas régénéré automatiquement.

---

### 7.6 Dashboard analytique

**Pourquoi :** Aucune plateforme n'offre une vision globale du marché (technos les plus demandées, répartition remote/présentiel, fourchettes salariales par niveau).

**Comment :** Endpoint `GET /api/offers/stats` retourne des agrégats PostgreSQL. Affiché via Recharts côté frontend.

**Métriques exposées :**
- Top 10 des technologies les plus demandées
- Répartition des types de contrat
- Fourchette salariale médiane par niveau
- Pourcentage d'offres remote par technologie

---

## 8. Stack technique récapitulatif

| Couche | Technologie | Justification |
|---|---|---|
| Frontend | React + Vite | Dashboard dynamique, gestion d'état complexe |
| Backend | Node.js + Express | I/O async, API REST, ingestion throttlée |
| Base de données | PostgreSQL | Requêtes analytiques, cohérence relationnelle |
| Service IA | Python + FastAPI | Bibliothèques ML natives, isolation |
| Auth | JWT + bcrypt | Standard REST, stateless |
| Infra | Docker Compose | Reproductibilité, isolation des services |
| Cache/Queue | In-memory (phase 1) | Simplicité initiale, extensible vers Redis |

---

## 9. Positionnement et différenciation

> **Job Aggregator est une plateforme d'aide à la décision basée sur la data, pensée pour les profils juniors.**

### Ce que les autres font

Les plateformes existantes (LinkedIn, Indeed, WTTJ, WeLoveDevs) permettent de **consulter** des offres. Elles n'aident pas à les **analyser** ni à **décider**.

### Ce que nous apportons

| Feature | LinkedIn | Indeed | WTTJ | WeLoveDevs | Job Aggregator |
|---|---|---|---|---|---|
| Filtres par technologie | ✗ | ✗ | Partiel | ✗ | ✓ |
| Comparaison d'offres | ✗ | ✗ | ✗ | ✗ | ✓ |
| Score de compatibilité | ✗ | ✗ | ✗ | ✗ | ✓ |
| Résumés IA | ✗ | ✗ | ✗ | ✗ | ✓ |
| Dashboard marché | ✗ | Partiel | ✗ | ✗ | ✓ |
| Filtres junior / stage | ✗ | Partiel | Partiel | ✗ | ✓ |

---

## 10. Conclusion

Les plateformes existantes permettent de **trouver** des offres, mais pas de les **analyser**. Aucune ne répond aux besoins spécifiques des profils juniors qui cherchent à comprendre le marché avant de postuler.

Notre projet apporte une réponse structurée à ce manque :

- **Normalisation** des données pour les rendre exploitables
- **Filtres avancés** adaptés aux contraintes des juniors (niveau, durée, stack)
- **Score de compatibilité** pour guider la décision sans lire chaque offre
- **Résumés IA** pour gagner du temps sur les descriptions longues
- **Dashboard analytique** pour comprendre le marché d'un coup d'œil
- **Comparaison** côte à côte pour choisir en connaissance de cause

Chaque choix technique est justifié par un besoin produit identifié et documenté sous forme d'ADR avec ses alternatives rejetées et ses trade-offs explicites.