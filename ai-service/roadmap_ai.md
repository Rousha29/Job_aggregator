git pu# AI Service — Roadmap et implémentation

## 1. Ce qu'on veut accomplir

Deux features IA concrètes :
- **Comparaison de 2 offres** : analyser deux offres et expliquer laquelle correspond 
  le mieux au profil de l'utilisateur et pourquoi
- **Suggestions personnalisées** : recommander des offres adaptées au profil 
  de l'utilisateur (stack, niveau, type de contrat)

---

## 2. Notre approche : RAG simplifié avec embeddings

### C'est quoi le RAG ?
RAG = Retrieval Augmented Generation. Au lieu de demander à un LLM de tout 
inventer, on lui donne des données réelles (nos offres) et il génère une 
réponse basée dessus. C'est plus fiable, plus rapide, et ça ne nécessite 
pas de fine-tuning.

### Le flux complet

Profil utilisateur
│
▼
Embedding du profil → vecteur numérique
│
▼
Recherche des offres les plus proches (similarité cosinus)
│
▼
Top N offres sélectionnées
│
▼
LLM local génère explication / comparaison / suggestion
│
▼
Résultat envoyé au frontend

---

## 3. Les outils choisis

### Modèle d'embedding : `sentence-transformers`
- **Librairie** : `sentence-transformers` (Python)
- **Modèle** : `all-MiniLM-L6-v2`
  - Taille : ~90 MB (bien en dessous de la limite 500 MB)
  - Vitesse : < 1 seconde par offre 
  - Pas de fine-tuning nécessaire 
  - Fonctionne entièrement en local, sans appel API externe 
- **Rôle** : transformer du texte en vecteur numérique de 384 dimensions

### Stockage des vecteurs : `pgvector`
- Extension PostgreSQL qui ajoute un type de colonne `vector`
- Permet de faire des recherches par similarité directement en SQL
- On reste dans la même base de données, pas besoin d'un service séparé

### LLM pour la génération : `Ollama + Mistral 7B`
- Tourne en local dans Docker
- Modèle Mistral 7B quantifié (Q4) : ~4 GB RAM
- Génère les explications en français

---

## 4. Étapes à suivre

### Étape 1 — Activer pgvector dans PostgreSQL

### Étape 2 — Mettre à jour `ai-service/requirements.txt`

### Étape 3 — Créer le service d'embedding

### Étape 4 — Créer le service de connexion à la base

### Étape 5 — Créer le service de suggestions

### Étape 6 — Créer le service de comparaison

### Étape 7 — Créer le service d'indexation

### Étape 8 — Créer les routes FastAPI

### Étape 9 — Mettre à jour `ai-service/app/main.py`

### Étape 10 — Mettre à jour le `docker-compose.yml`

### Étape 11 — Appeler l'indexation après l'ingestion

---

## 5. Résumé des endpoints IA

| Route | Méthode | Description |
|---|---|---|
| `/health` | GET | État du service |
| `/suggest` | POST | Suggestions personnalisées |
| `/compare` | POST | Comparaison de 2 offres |
| `/index` | POST | Indexation des offres sans embedding |

---

## 6. Ordre d'implémentation recommandé

| Étape | Priorité |
|---|---|
| pgvector dans PostgreSQL | 🔴 Premier |
| `requirements.txt` mis à jour | 🔴 Premier |
| `embedding_service.py` | 🔴 Premier |
| `indexing_service.py` + route `/index` | 🟠 Deuxième |
| `suggestion_service.py` + route `/suggest` | 🟠 Deuxième |
| `comparison_service.py` + route `/compare` | 🟡 Troisième |
| Intégration frontend | 🟡 Troisième |