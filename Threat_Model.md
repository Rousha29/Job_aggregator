# Cadrage et modèle de menace

Document de travail pour la réflexion sécurité du projet Job Aggregator.
Fondation de toutes les décisions techniques qui suivront.

---


## 1. Périmètre fonctionnel du projet

Ce qui est DANS le périmètre :
- Inscription avec email + mot de passe
- Vérification de l'email (infrastructure en place, Mailhog en développement)
- Connexion / déconnexion
- Consultation des offres récupérées depuis WeLoveDevs
- Mise en favoris (privés)
- Comparaison d'offres (2 ou 3 maximum)
- Affichage d'offres similaires (fonctionnalité IA)
- Filtrage multi-critères des offres (fonctionnalité données)
- Interface d'administration pour la modération

Ce qui est HORS périmètre (bon pour la sécurité — surface d'attaque réduite) :
- Pas de CV, pas de candidature directe
- Pas de messagerie entre utilisateurs
- Pas de commentaires ni de notes sur les offres
- Pas de contenu produit par les utilisateurs (hors favoris)
- Pas de profil public

Déploiement : prévu en bonus, à la fin. Toute la conception se fait cependant "prête au déploiement" dès le début (voir section "Décisions de conception déjà prises").

---

## 2. Actifs à protéger

### Catégorie A — Actifs utilisateurs

| Actif | Valeur pour nous | Valeur pour un attaquant |
|---|---|---|
| Email vérifié | Identification des utilisateurs | Réutilisation d'identifiants sur d'autres sites, hameçonnage |
| Empreinte du mot de passe | Authentification | Si fuite, tentative de cassage hors-ligne |
| Session / JWT | Maintien de la connexion | Usurpation d'identité |
| Favoris | Personnalisation du service | Profilage des utilisateurs |

### Catégorie B — Actifs système

| Actif | Valeur pour nous | Valeur pour un attaquant |
|---|---|---|
| Clé d'API WeLoveDevs | Accès à la source de données (1 req/s) | Consommer notre quota, violation du partenariat Epitech |
| Secret de signature JWT | Signer les jetons d'authentification | Forger des jetons admin = prise de contrôle totale |
| Identifiants base de données | Accès aux données persistées | Accès direct à toute la base |
| Identifiants service email | Envoi des mails de vérification | Envoi de spam depuis notre infrastructure, mise sur liste noire |

### Catégorie C — Actifs fonctionnels

| Actif | Valeur pour nous | Valeur pour un attaquant |
|---|---|---|
| Intégrité des offres stockées | Confiance des utilisateurs | Injecter des fausses offres, de l'hameçonnage, des liens malveillants |
| Disponibilité du service | Utilisabilité | Nuire à la réputation |
| Données normalisées (le travail d'ingestion + IA) | Notre valeur ajoutée sur WeLoveDevs | Aspiration par un concurrent |
| Interface d'administration | Modération | Prise de contrôle de la modération |

### Catégorie D — Actifs immatériels (allégés)

- Réputation du projet : atteinte en cas de défiguration ou si la plateforme sert à diffuser du spam / de l'hameçonnage
- Bons réflexes de minimisation des données (on ne collecte que l'email et le mot de passe, pas plus)

---

## 3. Profils d'attaquants retenus

### Profil 1 — Le robot automatisé / pirate amateur
- Outils automatisés tournant 24/7 sur internet
- Motivation : volume, opportunisme
- Moyens : scans, SQLi basiques, attaque par force brute, recherche de `.env` exposés
- Probabilité : très élevée si déploiement public

### Profil 2 — L'utilisateur malveillant
- Utilisateur inscrit légitimement qui abuse de la plateforme
- Motivation : accès aux données d'autres utilisateurs, passage en admin, aspiration du contenu
- Moyens : manipulation des requêtes via les outils de développement du navigateur, modification du JWT, appel direct des routes admin, IDOR
- Probabilité : élevée — le jury testera ce profil lors des démonstrations

### Profil 3 — L'aspirateur de contenu / concurrent
- Robot ou développeur qui veut aspirer le contenu normalisé
- Motivation : récupérer les offres, analyser les recommandations de l'IA
- Moyens : faux comptes, rotation d'adresses IP, aspiration massive de l'API
- Probabilité : moyenne

### Profil 4 — L'équipe elle-même (erreur humaine)
- Membre de l'équipe qui commet une erreur
- Motivation : aucune, involontaire
- Moyens : `git push` d'un `.env`, secret dans un journal, mot de passe sur une capture d'écran partagée
- Probabilité : très élevée — cause numéro un des fuites sur GitHub

### Profil 5 — L'attaquant ciblé / opportuniste
- Individu ou groupe qui cherche des fuites de données à exploiter ou à revendre
- Motivation : voler la base d'utilisateurs pour la revendre, exploiter des vulnérabilités pour obtenir un accès durable
- Moyens : exploitation de vulnérabilités spécifiques, injection SQL / NoSQL avancée, accès direct à la base, exploitation de dépendances vulnérables
- Probabilité : faible sur un projet académique sans exposition publique réelle, mais menace réelle dès que le site est en ligne avec de vraies données utilisateur

---

## 4. Matrice STRIDE — menaces applicables

### S — Spoofing (usurpation)
- Vol de JWT via une faille XSS, un wifi non chiffré, un appareil partagé
- Forge de JWT si le secret de signature fuit
- Attaque par force brute sur le mot de passe
- Création massive de faux comptes

### T — Tampering (altération)
- Modification du JWT pour passer d'un rôle `user` à un rôle `admin`
- SQL injection sur les filtres ou la recherche
- XSS persistante via les descriptions d'offres récupérées depuis WeLoveDevs
- IDOR sur les favoris (modification en ciblant un identifiant qui n'est pas le sien)

### R — Repudiation (répudiation)
- Action d'administration non tracée (suppression d'une offre, changement de rôle)
- Traité en priorité basse, bonus du sujet

### I — Information disclosure (fuite d'information)
- Secrets dans les journaux, les erreurs, le code
- Trace d'erreur renvoyée au client
- Point d'entrée qui renvoie trop de champs (par exemple l'empreinte du mot de passe avec l'utilisateur)
- Clé d'API dans un commit
- IDOR : lire les favoris d'un autre utilisateur

### D — Denial of Service (déni de service)
- Attaque par force brute saturant `/login` (aggravée par l'empreinte lente à calculer)
- Charge utile énorme non limitée
- Déclenchement en boucle de la synchronisation WeLoveDevs → épuisement du quota 1 req/s
- Comparaison abusive (`ids=1,2,3,...,10000`)

### E — Elevation of privilege (élévation de privilèges)
- Utilisateur qui appelle une route admin non protégée côté serveur
- Inscription qui accepte un champ `role` en entrée
- Interface d'administration seulement cachée côté client, pas protégée côté serveur
- JWT dont seule la présence du champ `role` est vérifiée (pas la signature)

---

## 5. Priorisation des menaces

| ID | Menace | Impact | Probabilité | Priorité |
|---|---|---|---|---|
| M1 | Élévation de privilèges utilisateur → admin | Critique | Élevée | **P0** |
| M2 | XSS persistante via les descriptions WeLoveDevs | Critique | Moyenne | **P0** |
| M3 | Fuite de secrets (Git, journaux, environnement) | Critique | Élevée | **P0** |
| M4 | Compromission de compte (force brute, réutilisation d'identifiants volés) | Élevé | Élevée | **P0** |
| M5 | IDOR sur les favoris | Élevé | Moyenne | **P1** |
| M6 | Abus du flux de vérification email | Moyen | Moyenne | **P1** |
| M7 | Vol de JWT via stockage faible | Élevé | Moyenne | **P1** |
| M8 | DoS sur la synchronisation WeLoveDevs | Moyen | Moyenne | **P1** |
| M9 | Aspiration massive de la base normalisée | Faible | Moyenne | **P2** |
| M10 | DoS applicatif (charge utile volumineuse, comparaison abusive) | Moyen | Moyenne | **P2** |
| M11 | Répudiation d'action admin | Faible | Faible | **P3** |

Légende :
- **P0** = à traiter et démontrer en priorité
- **P1** = à traiter, à mentionner dans la documentation
- **P2** = à traiter a minima, à citer si questions
- **P3** = à mentionner comme "hors périmètre assumé"

---

## 6. Décisions de conception déjà prises

Ces décisions découlent directement de l'analyse des menaces ci-dessus et serviront de base au travail d'implémentation des six axes de sécurité.

### Authentification et comptes
- Politique de mot de passe : longueur minimum 12 caractères, pas de règle de complexité obligatoire (recommandation NIST 2020)
- Vérification contre les fuites connues via HaveIBeenPwned (API avec anonymat en k)
- Calcul d'empreinte avec argon2 ou bcrypt (choix à confirmer lors de l'implémentation)
- Vérification email : infrastructure prête (jeton à usage unique, expiration 24h, généré cryptographiquement), Mailhog en développement, Resend en production si déploiement

### Sessions et jetons
- JWT signé avec un secret fort (minimum 256 bits), stocké en variable d'environnement
- JWT dans un cookie `httpOnly` + `Secure` conditionnel + `SameSite` (détails lors de l'implémentation)
- Durée de vie courte à définir lors de l'implémentation

### Routes et autorisation
- Favoris : `GET/POST/DELETE /api/users/me/favorites` (le `me` est déduit du JWT, IDOR impossible par conception)
- Comparaison : 3 offres maximum, limite vérifiée côté serveur
- Offres similaires : `GET /api/offers/:id/similar?limit=N`, limite vérifiée côté serveur
- Synchronisation WeLoveDevs : route protégée par le rôle admin + limitation de débit

### Données récupérées (WeLoveDevs)
- Défense en profondeur : nettoyage à la récupération (`sanitize-html` avec liste blanche de balises) + React par défaut à l'affichage (pas d'utilisation de `dangerouslySetInnerHTML`)

### Filtres
- Liste blanche des champs filtrables côté serveur
- Validation du type de chaque paramètre
- Jamais de filtre SQL construit par concaténation

### Discipline "prêt au déploiement"
Même si le déploiement est en bonus :
- Aucune URL codée en dur (`process.env.APP_PUBLIC_URL` partout)
- Aucun secret codé en dur (tout en `.env` + `.gitignore`)
- Drapeaux de cookies conditionnels (`Secure: process.env.NODE_ENV === 'production'`)
- Politique CORS configurable par variable d'environnement
- Interface `EmailService` abstraite (implémentation Mailhog en dev, Resend en prod)
- `.env.example` et `.env.production.example` documentent tous les secrets

---

## 7. Définitions clés (compléments du récap des concepts)

### IDOR — Insecure Direct Object Reference
Vulnérabilité où l'identifiant d'une ressource apparaît directement dans l'URL ou dans la requête, et où le serveur ne vérifie pas si le demandeur a le droit d'y accéder.
Exemple : `GET /api/invoices/1001` — sans contrôle, Bob peut lire la facture d'Alice.
Défense : conception d'URL avec `me` quand pertinent, ET vérification d'autorisation systématique sur chaque ressource.
Classée numéro un mondial (OWASP Top 10 "Broken Access Control" 2021).

### DoS — Denial of Service
Attaque visant à rendre le service indisponible.
- **DoS volumétrique** : saturation de la bande passante → hors périmètre (infrastructure)
- **DoS applicatif** : exploitation d'un point d'entrée coûteux → de notre responsabilité
- **DDoS** : DoS distribué depuis un réseau de machines compromises → hors périmètre total
Défense : limitation de débit, validation de taille, pagination obligatoire, authentification sur les points d'entrée coûteux.

### Déploiement — "si vous déployez"
- Périmètre minimum : tourne uniquement en local (`docker compose up` chez le jury). Pas besoin de HTTPS, de domaine, etc.
- Périmètre bonus : accessible en ligne via URL publique. Exige HTTPS (proxy inverse + Let's Encrypt), un domaine, un service d'email réel.
- Décision : on code "prêt au déploiement" dès le début, on déploie éventuellement à la fin sans refonte.

---

## 8. Synthèse

On a identifié 4 catégories d'actifs, 5 profils d'attaquants, et cartographié 11 menaces via STRIDE. 4 sont prioritaires (P0) et structurent nos choix techniques : l'élévation de privilèges, la XSS persistante via le contenu WeLoveDevs, la fuite de secrets, et la compromission de compte.

Le périmètre produit (pas de contenu utilisateur libre, pas de CV, pas de messagerie) réduit volontairement la surface d'attaque. Chaque choix d'implémentation adresse une menace identifiée ici — on ne fait pas de sécurité rituelle, on fait de la sécurité justifiée.

---

## 9. Questions ouvertes à clarifier avec l'équipe

- Confirmer avec l'équipe que Mailhog en développement est accepté, ou si on démarre directement avec un service SaaS en bac à sable
- Confirmer si un membre prend en charge le déploiement bonus en fin de projet
- Confirmer le choix argon2 vs bcrypt (impact faible, à trancher lors de l'implémentation)