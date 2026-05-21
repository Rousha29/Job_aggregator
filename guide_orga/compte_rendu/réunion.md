# Compte Rendu — Job Aggregator

## 4 mai 2026 — Réunion 9h30

### Avancement du week-end

| Membre  | Réalisations |
|---------|-------------|
| Alex    | Recherches sur la 2ème API et documentation |
| Dara    | Création des pages auth (Login / Register) connectées au backend |
| John    | — |
| Rousha  | Docker finalisé pour l'ensemble du projet |

---

## 5 mai 2026 — Réunion 9h30

### Compte rendu de la veille

| Membre  | Réalisations |
|---------|-------------|
| Dara    | Avancement sur le frontend — page Home implémentée |

### Tâches du jour

| Membre  | Tâches |
|---------|--------|
| Dara    | Continuer le développement frontend |
| Rousha  | Implémenter l'API WeLoveDevs (nettoyage, ajout en base de données) |
| John    | Commencer le frontend côté admin |
| Alex    | Voir l'implémentation de la 2ème API |

---

## 6 mai 2026 — Réunion 9h30

### Compte rendu de la veille

| Membre  | Réalisations |
|---------|-------------|
| Dara    | Page Home finalisée avec affichage des cards d'offres et barre de recherche |
| Rousha  | Ingestion des offres WeLoveDevs en base de données opérationnelle |
| John    | Maquettes interface admin réalisées |
| Alex    | Documentation de la 2ème API analysée, intégration en cours |

### Tâches du jour

| Membre  | Tâches |
|---------|--------|
| Dara    | Implémenter la pagination et les filtres sur la page Home |
| Rousha  | Normalisation des données ingérées, gestion des types de contrat |
| John    | Développement des routes backend admin (gestion utilisateurs, offres) |
| Alex    | Commencer l'intégration de la 2ème source de données |

---

## 7 mai 2026 — Réunion 9h30

### Compte rendu de la veille

| Membre  | Réalisations |
|---------|-------------|
| Dara    | Pagination implémentée, composant FilterPanel en cours |
| Rousha  | Normalisation des types de contrat finalisée (CDI, stage, alternance, freelance) |
| John    | Routes admin backend créées : GET /api/admin/users, GET /api/admin/offers |
| Alex    | 2ème API intégrée en local, tests en cours |

### Tâches du jour

| Membre  | Tâches |
|---------|--------|
| Dara    | Finaliser FilterPanel et intégrer la modal "Voir l'offre" |
| Rousha  | Connecter le filtre frontend au backend (filtrage côté DB) |
| John    | Implémenter la page admin frontend (liste utilisateurs et offres) |
| Alex    | Finaliser l'intégration 2ème API et tester les données |

---

## 8 mai 2026 — Réunion 9h30

### Compte rendu de la veille

| Membre  | Réalisations |
|---------|-------------|
| Dara    | Modal OfferModal implémentée, affichage détaillé des offres fonctionnel |
| Rousha  | Filtrage côté base de données opérationnel (contract_type, remote, salaire) |
| John    | Page admin frontend avec liste des utilisateurs et gestion des rôles |
| Alex    | 2ème source de données intégrée et normalisée |

### Tâches du jour

| Membre  | Tâches |
|---------|--------|
| Dara    | Intégrer le burger menu sur toutes les pages, page Profile |
| Rousha  | Automatiser l'ingestion des offres, augmenter le volume de données |
| John    | Implémenter les actions admin (modération offres, gestion utilisateurs) |
| Alex    | Déduplication des offres entre les deux sources |

---

## 9 mai 2026 — Réunion 9h30

### Compte rendu de la veille

| Membre  | Réalisations |
|---------|-------------|
| Dara    | Burger menu intégré sur Home et Profile, page Profile en cours |
| Rousha  | Ingestion automatisée via POST /api/admin/ingest, 200+ offres en base |
| John    | Actions admin implémentées : modération d'offres, gestion des utilisateurs |
| Alex    | Déduplication opérationnelle entre WeLoveDevs et 2ème source |

### Tâches du jour

| Membre  | Tâches |
|---------|--------|
| Dara    | Finaliser page Profile (édition infos, compétences), page Comparer |
| Rousha  | Travailler sur la feature IA (summarization des descriptions d'offres) |
| John    | Finaliser l'interface admin, ajouter les statistiques du dashboard |
| Alex    | Tests end-to-end des deux sources, documentation |

---

## 10 mai 2026 — Réunion 9h30

### Compte rendu de la veille

| Membre  | Réalisations |
|---------|-------------|
| Dara    | Page Profile finalisée, début de la page Comparer |
| Rousha  | Feature IA : résumé automatique des offres via modèle NLP léger |
| John    | Dashboard admin avec statistiques (nb offres, nb users, répartition contrats) |
| Alex    | Documentation complète des deux sources, tests validés |

### Tâches du jour

| Membre  | Tâches |
|---------|--------|
| Dara    | Finaliser page Comparer, accessibilité WCAG 2.1 sur les flux principaux |
| Rousha  | Intégrer le résumé IA dans les cards d'offres, optimiser les performances |
| John    | Audit de sécurité (injection SQL, brute force, JWT), documentation ADR |
| Alex    | CI/CD GitHub Actions : build, lint, tests automatisés |

---

## 11 mai 2026 — Réunion 9h30

### Compte rendu de la veille

| Membre  | Réalisations |
|---------|-------------|
| Dara    | Page Comparer finalisée, audit Lighthouse réalisé sur les 3 flux principaux |
| Rousha  | Résumé IA intégré, temps de traitement < 5s par offre |
| John    | Sécurité renforcée (rate limiting, validation centralisée), documentation ADR rédigée |
| Alex    | Pipeline CI/CD opérationnel sur GitHub Actions (build + lint + tests) |

### Tâches du jour

| Membre  | Tâches |
|---------|--------|
| Dara    | Revue générale du frontend, corrections UI/UX finales |
| Rousha  | Tests d'intégration, vérification de la persistance des données Docker |
| John    | Préparer la démo finale, rédiger le README et la documentation projet |
| Alex    | Finaliser les tests automatisés, vérification du pipeline CI |