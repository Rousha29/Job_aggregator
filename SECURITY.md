# Sécurité

## Signaler une vulnérabilité
Contacter l'équipe sur Teams si quelqu'un trouve une faille

---

## Gestion des secrets (SEC-001)

### Ce qui a changé
- Plus aucun secret hardcodé dans le code source
- `JWT_SECRET`, `DEFAULT_ADMIN_EMAIL`, `DEFAULT_ADMIN_PASSWORD` sont maintenant obligatoires en variables d'environnement — l'application refuse de démarrer s'ils sont absents
- Le fichier `backend/.env` est exclu du tracking git (`.gitignore`)

### Configuration pour les nouveaux développeurs
1. Copier `.env.example` → `backend/.env`
2. Remplir chaque valeur (ne jamais committer ce fichier)
3. Générer un JWT_SECRET sécurisé dans le terminal : `openssl rand -base64 32`

### Outil de détection de secrets : Gitleaks
Gitleaks est un outil d'analyse statique qui scanne les dépôts git pour détecter les secrets hardcodés (clés API, tokens, mots de passe) avant qu'ils ne soient commités.

Un hook pre-commit est configuré dans `.git/hooks/pre-commit`. Il scanne automatiquement les fichiers staged avant chaque commit et bloque si un secret est détecté.

**Installation (obligatoire pour contribuer) :**
```bash
wget https://github.com/gitleaks/gitleaks/releases/download/v8.18.4/gitleaks_8.18.4_linux_x64.tar.gz
tar -xzf gitleaks_8.18.4_linux_x64.tar.gz
sudo mv gitleaks /usr/local/bin/
rm gitleaks_8.18.4_linux_x64.tar.gz
```
Vérifier l'installation avec `gitleaks version`

---

## Validation des entrées (SEC-002)

### Ce qui a changé
- Middleware `validate` créé dans `src/middlewares/validate.js` — valide et filtre les données de chaque requête avant qu'elles atteignent le controller
- Schémas Zod créés dans `src/schemas/auth.js` pour les routes register et login
- Tout champ non prévu dans le schéma est supprimé silencieusement (protection contre l'injection de champs comme `role: "admin"`)
- En cas de données invalides : retour `400` avec message d'erreur, le controller n'est jamais appelé

### Règles de validation register
- `nom`, `prenom` : string non vide
- `mail` : format email valide
- `password` : 8 à 128 caractères
- `confirmation` : string

### Outil utilisé
[Zod](https://zod.dev) — librairie de validation et parsing de schémas TypeScript/JavaScript.

---

## Middleware d'erreur centralisé (SEC-003)

### Ce qui a changé
- Classe `AppError` créée dans `src/errors/AppError.js` — permet de créer des erreurs intentionnelles avec un `statusCode`, un `message` et un `code` optionnel
- Middleware `errorMiddleware` mis à jour dans `src/middlewares/error.middleware.js` :
  - Si `err instanceof AppError` → le message est envoyé au client avec le bon status HTTP
  - Sinon → le message complet est loggé côté serveur, le client reçoit uniquement `"Erreur interne du serveur"`
- En production, la stack trace n'est jamais exposée au client

### Pourquoi c'est important
Sans cette distinction, une erreur SQL ou JWT plantée pouvait envoyer des détails techniques au client (nom de table, structure de la base, clé utilisée) — des informations exploitables par un attaquant.

### Utilisation dans le code
```js
import { AppError } from '../errors/AppError.js';

// Erreur intentionnelle — le message part au client
throw new AppError(404, 'Utilisateur introuvable');

// Erreur avec code identifiant
throw new AppError(401, 'Non autorisé', 'INVALID_TOKEN');
```

---

## Hashage des mots de passe (SEC-004)

### Ce qui a changé
- `bcrypt` utilisé pour hasher les mots de passe à l'inscription avec `saltRounds: 12`
- La logique est centralisée dans `backend/src/services/password.js` (`hashPassword`, `verifyPassword`)
- Le mot de passe en clair n'est jamais stocké ni loggé

### Pourquoi bcrypt
bcrypt est conçu pour être lent, ce qui rend les attaques par force brute coûteuses. Le salt intégré garantit que deux mots de passe identiques produisent des hashs différents.

---

## Vérification des mots de passe compromis (SEC-005)

### Ce qui a changé
- À l'inscription, le mot de passe est vérifié contre la base de données HaveIBeenPwned
- Si le mot de passe a déjà été exposé dans une fuite de données, l'inscription est refusée avec un `400`

### Comment ça marche (k-anonymity)
Le mot de passe n'est jamais envoyé à HIBP. Seuls les 5 premiers caractères du hash SHA-1 sont transmis. L'API retourne toutes les correspondances, et la comparaison se fait localement — HIBP ne sait jamais quel mot de passe est vérifié.

---

## Rate limiting sur le login (SEC-006)

### Ce qui a changé
- La route `POST /api/auth/login` est limitée à **5 tentatives par IP toutes les 15 minutes**
- Au-delà : réponse `429` avec message d'erreur explicite

### Pourquoi
Sans cette limite, un attaquant peut tenter des milliers de mots de passe (brute force / credential stuffing) sans obstacle.

---

## JWT dans un cookie httpOnly (SEC-008)

### Ce qui a changé
- Le token JWT n'est plus retourné dans le corps de la réponse ni stocké dans le `localStorage`
- Il est placé dans un **cookie `httpOnly`** par le serveur à la connexion
- Le frontend ne peut pas lire ce cookie en JavaScript — il est envoyé automatiquement par le navigateur

### Attributs du cookie
- `httpOnly: true` — inaccessible depuis JavaScript (protection XSS)
- `secure: true` en production — transmis uniquement en HTTPS
- `sameSite: 'lax'` — protection CSRF de base
- `maxAge: 24h`

---

## Protection des routes admin (SEC-009)

### Ce qui a changé
- Composant `AdminRoute` créé côté frontend (`src/components/AdminRoute.tsx`)
- Les routes `/admin/*` sont enveloppées dans ce composant
- Si l'utilisateur n'est pas connecté → redirection `/login`
- Si l'utilisateur n'est pas admin → redirection `/home`

---

## Protection IDOR – Favoris (SEC-010)

### Ce qu'est l'IDOR
L'IDOR (Insecure Direct Object Reference) est une faille qui permet à un utilisateur d'accéder aux données d'un autre en modifiant un identifiant dans l'URL (ex: `/users/42/favorites` → `/users/99/favorites`).

### Ce qui a été vérifié
- Dans `backend/src/routes/favorites.routes.js`, le `userId` est **toujours lu depuis `req.user.id`** (le JWT décodé par le middleware d'auth)
- Il n'est jamais accepté depuis les paramètres d'URL ni le corps de la requête
- Il est impossible pour un utilisateur de lire ou supprimer les favoris d'un autre, même en forgeant une requête

### Pattern sécurisé utilisé
```js
// Correct — userId depuis le token JWT
const userId = req.user.id;

// Jamais ça — IDOR possible
const userId = req.params.userId;
```

---

## Rate limiting global (SEC-014)

### Ce qui a changé
- Un rate limiter global est appliqué sur toutes les routes : **100 requêtes par IP par minute**
- Configuré dans `app.js` avec `express-rate-limit`

### Pourquoi
Protège l'API contre les abus généraux (scraping intensif, DDoS applicatif, énumération).

---

## En-têtes HTTP sécurisés (SEC-017)

### Ce qui a changé
- `helmet` est activé en premier middleware dans `app.js`
- Il positionne automatiquement une dizaine d'en-têtes HTTP de sécurité

### En-têtes ajoutés (exemples)
- `X-Frame-Options: DENY` — empêche le clickjacking via `<iframe>`
- `X-Content-Type-Options: nosniff` — empêche le MIME sniffing
- `Strict-Transport-Security` — force HTTPS en production
- `Content-Security-Policy` — restreint les sources de scripts/styles

---

## Configuration CORS (SEC-018)

### Ce qui a changé
- CORS configuré avec une liste blanche via la variable d'environnement `CORS_ORIGIN`
- `credentials: true` autorise l'envoi des cookies cross-origin
- Les requêtes provenant d'une origine non autorisée sont bloquées

### Configuration
```env
CORS_ORIGIN=http://localhost:5173
```
