# Tickets sécurité — GitHub Projects

19 tickets prêts à créer dans GitHub Projects. Chaque ticket a un format standardisé pour être copié directement.

## Configuration recommandée du board

**Milestones** (à créer dans GitHub Issues) :
- `M1 — Fondations sécurité` (sprint 1)
- `M2 — Auth & comptes` (sprint 2)
- `M3 — Sessions & RBAC` (sprint 3)
- `M4 — Injections` (sprint 4)
- `M5 — DoS & abus` (sprint 5)
- `M6 — Hardening final` (sprint 6)

**Labels à créer** :
- `security` (rouge) — tous les tickets sécurité
- `priority:P0` (rouge foncé) — bloquant, critique
- `priority:P1` (orange) — important, à faire avant la défense
- `priority:P2` (jaune) — souhaitable
- `area:auth`, `area:rbac`, `area:injection`, `area:dos`, `area:secrets`, `area:headers`, `area:ci`
- `type:backend`, `type:frontend`, `type:infra`

**Colonnes du board** : `Backlog → Ready → In Progress → Review → Done`

**Champs custom à ajouter** (Project field types) :
- `Estimate` (number, en heures)
- `Threat Model ID` (text, ex: M1, M3)
- `Sprint` (single select, S1-S6)

---

## SEC-001 — Mise en place du `.env` et de la gestion des secrets

**Labels** : `security` `priority:P0` `area:secrets` `type:infra`
**Milestone** : M1 — Fondations sécurité
**Sprint** : S1
**Estimate** : 2h
**Threat Model** : M3
**Assigné** : John
**Dépendances** : aucune

### Description
Mettre en place la gestion des secrets pour le projet : variables d'environnement, fichier exemple, gitignore, et hook de détection de secrets. C'est la fondation qui doit être faite avant tout autre code, sinon des secrets risquent d'être commités par erreur.

### Critères d'acceptation
- [ ] `.env.example` créé à la racine avec toutes les variables documentées (sans valeurs réelles)
- [ ] `.env.production.example` créé pour le déploiement bonus
- [ ] `.gitignore` contient `.env`, `.env.local`, `.env.*.local` (mais pas `.env.example`)
- [ ] `JWT_SECRET` généré avec `openssl rand -base64 32` et placé dans le `.env` local
- [ ] Hook pre-commit `gitleaks` installé et fonctionnel (test : tenter de commiter un faux secret → bloqué)
- [ ] Documentation dans `SECURITY.md §2` à jour avec la liste des variables
- [ ] Aucune URL ni secret en dur dans le code (vérifié via grep)

### Variables minimum à inclure
```
NODE_ENV
APP_PUBLIC_URL
JWT_SECRET
DATABASE_URL
WLD_API_KEY
MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS
CORS_ORIGIN
```

### Notes
Référence : `SECURITY.md §2`. Bloquant pour SEC-008 (JWT) et SEC-015 (ingestion WLD).

---

## SEC-002 — Middleware de validation centralisé (Zod)

**Labels** : `security` `priority:P0` `area:injection` `type:backend`
**Milestone** : M1 — Fondations sécurité
**Sprint** : S1
**Estimate** : 3h
**Threat Model** : M1, M2
**Dépendances** : aucune

### Description
Mettre en place un middleware de validation centralisé basé sur Zod. Toutes les routes doivent valider leurs inputs (body, query, params) via ce middleware. Empêche les injections de champs non prévus (typiquement `role: 'admin'` à l'inscription).

### Critères d'acceptation
- [ ] `zod` installé en dépendance
- [ ] Middleware `validate(schema, source)` créé dans `src/middlewares/validate.ts`
- [ ] `source` accepte `'body'`, `'query'`, `'params'`
- [ ] En cas d'échec : retour 400 avec message d'erreur clair (sans leak de la structure interne)
- [ ] Dossier `src/schemas/` créé avec convention 1 fichier par ressource
- [ ] Test unitaire : un body avec champ non listé → champ ignoré silencieusement
- [ ] Test unitaire : un body invalide (mauvais type) → 400

### Exemple d'usage attendu
```typescript
// schemas/auth.ts
export const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8)).max(128),
});

// routes/auth.ts
router.post('/register', validate(registerSchema), authController.register);
```

### Notes
Référence : `SECURITY.md §6`. Base pour SEC-005, SEC-008, SEC-013.

---

## SEC-003 — Middleware d'erreur centralisé

**Labels** : `security` `priority:P0` `area:headers` `type:backend`
**Milestone** : M1 — Fondations sécurité
**Sprint** : S1
**Estimate** : 2h
**Threat Model** : Information disclosure (STRIDE-I)
**Dépendances** : aucune

### Description
Créer un middleware d'erreur centralisé qui catche toutes les erreurs de l'app, log côté serveur, et renvoie une réponse propre au client. **Aucune stack trace ne doit fuiter en production.**

### Critères d'acceptation
- [ ] Classe `AppError` créée (avec `statusCode`, `message`, `code` optionnel)
- [ ] Middleware d'erreur enregistré en dernier dans la chaîne Express
- [ ] Si `err instanceof AppError` → renvoie `{ error: err.message }` avec le bon status
- [ ] Sinon → log l'erreur complète côté serveur, renvoie 500 avec `{ error: 'Internal server error' }`
- [ ] Vérification que `NODE_ENV === 'production'` masque la stack trace
- [ ] Logger configuré (pino ou winston) avec niveau ajustable
- [ ] Test : déclencher une erreur non gérée → réponse 500 sans stack trace
- [ ] Test : throw `new AppError(404, 'Not found')` → réponse `{ error: 'Not found' }` avec status 404

### Notes
Référence : `SECURITY.md §9`. Base pour toutes les routes (gestion homogène des erreurs).

---

## SEC-004 — Hashing des mots de passe (argon2id)

**Labels** : `security` `priority:P0` `area:auth` `type:backend`
**Milestone** : M2 — Auth & comptes
**Sprint** : S2
**Estimate** : 2h
**Threat Model** : M4
**Dépendances** : SEC-001

### Description
Mettre en place le hashing sécurisé des mots de passe. Choix par défaut : argon2id (recommandation OWASP 2024). Si l'équipe préfère bcrypt, c'est acceptable mais à trancher en réunion avant de commencer.

### Critères d'acceptation
- [ ] Décision argon2id vs bcrypt validée en réunion d'équipe
- [ ] Lib installée (`argon2` ou `bcrypt`)
- [ ] Module `src/services/password.ts` exposant `hashPassword()` et `verifyPassword()`
- [ ] Paramètres argon2id : `memoryCost: 19456`, `timeCost: 2`, `parallelism: 1`
- [ ] OU paramètres bcrypt : `saltRounds: 12`
- [ ] Test : hash != mot de passe d'origine
- [ ] Test : `verifyPassword(password, hash)` retourne true
- [ ] Test : `verifyPassword(wrong, hash)` retourne false
- [ ] Le hash prend ~100ms (volontairement lent)

### Notes
Référence : `SECURITY.md §3`. Bloquant pour SEC-005 et SEC-006.

---

## SEC-005 — Endpoint inscription sécurisé

**Labels** : `security` `priority:P0` `area:auth` `type:backend`
**Milestone** : M2 — Auth & comptes
**Sprint** : S2
**Estimate** : 4h
**Threat Model** : M1, M4
**Dépendances** : SEC-002, SEC-004

### Description
Créer l'endpoint `POST /api/auth/register` avec validation stricte, vérification HaveIBeenPwned, et création utilisateur avec rôle forcé à `user`. **Empêche un utilisateur de se créer admin lui-même.**

### Critères d'acceptation
- [ ] Route `POST /api/auth/register` créée
- [ ] Validation Zod : email valide, mot de passe 12+ chars
- [ ] Whitelist explicite des champs : seuls `email` et `password` sont acceptés
- [ ] Vérification HaveIBeenPwned (k-anonymity SHA-1, 5 premiers chars envoyés)
- [ ] Si mot de passe compromis → 400 avec message clair
- [ ] User créé avec `role: 'user'` **forcé côté serveur** (jamais lu depuis le body)
- [ ] Email vérifié unique en base (contrainte + check applicatif)
- [ ] Réponse : 201 avec `{ id, email }` (jamais le passwordHash)
- [ ] **Test critique** : `POST /register { email, password, role: 'admin' }` → user créé est `user` pas `admin`
- [ ] Test : email déjà utilisé → 409
- [ ] Test : mot de passe trop court → 400
- [ ] Test : mot de passe HIBP-leaked → 400

### Notes
Référence : `SECURITY.md §3`. Le test "role: 'admin' dans le body" est CRITIQUE et doit être en CI.

---

## SEC-006 — Endpoint connexion + rate limiting

**Labels** : `security` `priority:P0` `area:auth` `area:dos` `type:backend`
**Milestone** : M2 — Auth & comptes
**Sprint** : S2
**Estimate** : 3h
**Threat Model** : M4
**Dépendances** : SEC-004, SEC-008

### Description
Créer l'endpoint `POST /api/auth/login` avec rate limiting strict pour bloquer les attaques brute-force. Réponse uniforme entre "email inexistant" et "mauvais mot de passe" pour empêcher l'énumération.

### Critères d'acceptation
- [ ] `express-rate-limit` installé
- [ ] Route `POST /api/auth/login` créée
- [ ] Validation Zod (email + password)
- [ ] Rate limit : 5 tentatives / 15min / IP
- [ ] Rate limit : 5 tentatives / 15min / email (si possible avec un keyGenerator custom)
- [ ] Erreur uniforme : `{ error: 'Invalid credentials' }` que ce soit email inexistant ou mauvais MDP
- [ ] Délai constant de réponse (utiliser `verifyPassword` même si l'email n'existe pas, avec un hash factice)
- [ ] Si succès : JWT généré et envoyé en cookie httpOnly (cf. SEC-008)
- [ ] Test : 6 connexions consécutives → 6e renvoie 429
- [ ] Test : email inexistant et mauvais MDP renvoient le même message et le même code
- [ ] Test : succès avec bons identifiants → cookie présent

### Notes
Référence : `SECURITY.md §3, §7`. Dépend de SEC-008 pour la génération du JWT.

---

## SEC-007 — Vérification email avec token unique

**Labels** : `security` `priority:P1` `area:auth` `type:backend`
**Milestone** : M2 — Auth & comptes
**Sprint** : S2
**Estimate** : 5h
**Threat Model** : M6
**Dépendances** : SEC-005

### Description
Implémenter le flux de vérification email avec service abstrait (Mailhog en dev, Resend en prod). Token cryptographiquement aléatoire, expiration 24h, usage unique.

### Critères d'acceptation
- [ ] Interface `EmailService` définie avec méthode `sendVerification(email, token)`
- [ ] Implémentation `MailhogService` pour le dev
- [ ] Mailhog ajouté au `docker-compose.yml`
- [ ] Implémentation `ResendService` pour la prod (peut être un stub si déploiement non confirmé)
- [ ] Choix de l'implémentation via variable d'env `EMAIL_PROVIDER`
- [ ] Token généré : `crypto.randomBytes(32).toString('hex')`
- [ ] Table `email_verifications` (`user_id`, `token`, `created_at`, `expires_at`, `used_at`)
- [ ] Route `POST /api/auth/resend-verification` avec rate limit 1/min/compte
- [ ] Route `GET /api/auth/verify-email?token=...` (token unique, expire à 24h, marqué `used_at` après usage)
- [ ] Mail envoyé après inscription contenant le lien
- [ ] Test : un token utilisé deux fois → 400 le 2e fois
- [ ] Test : un token expiré → 400

### Notes
Référence : `SECURITY.md §3`. Mailhog visible sur `http://localhost:8025`.

---

## SEC-008 — Génération JWT et cookie sécurisé

**Labels** : `security` `priority:P0` `area:auth` `type:backend`
**Milestone** : M3 — Sessions & RBAC
**Sprint** : S3
**Estimate** : 3h
**Threat Model** : M1, M7
**Dépendances** : SEC-001

### Description
Mettre en place la génération et la vérification de JWT, stocké dans un cookie httpOnly. **Vérification complète de la signature obligatoire**, jamais juste la présence d'un champ.

### Critères d'acceptation
- [ ] Lib `jsonwebtoken` installée
- [ ] Module `src/services/jwt.ts` exposant `signToken(payload)` et `verifyToken(token)`
- [ ] Algorithme HS256, secret depuis `process.env.JWT_SECRET`
- [ ] Payload : `{ sub: userId, role, iat, exp }` — rien de plus
- [ ] Durée d'expiration : 1h
- [ ] Helper `setAuthCookie(res, token)` avec drapeaux corrects :
  - `httpOnly: true`
  - `secure: process.env.NODE_ENV === 'production'`
  - `sameSite: 'lax'`
  - `maxAge: 3600 * 1000`
  - `path: '/'`
- [ ] Helper `clearAuthCookie(res)` pour le logout
- [ ] Test : token signé avec un mauvais secret → `verifyToken` rejette
- [ ] Test : token modifié dans le payload → `verifyToken` rejette
- [ ] Test : token expiré → `verifyToken` rejette

### Notes
Référence : `SECURITY.md §4`. Bloquant pour SEC-006 et SEC-009.

---

## SEC-009 — Middleware requireAuth + requireRole (RBAC)

**Labels** : `security` `priority:P0` `area:rbac` `type:backend`
**Milestone** : M3 — Sessions & RBAC
**Sprint** : S3
**Estimate** : 3h
**Threat Model** : M1
**Dépendances** : SEC-008

### Description
Créer les middlewares d'authentification et d'autorisation par rôle. **Toutes les routes admin doivent passer par `requireAuth` ET `requireRole('admin')`** côté serveur, pas seulement masquées côté frontend.

### Critères d'acceptation
- [ ] Middleware `requireAuth` créé : extrait le JWT du cookie, vérifie via `verifyToken`, attache `req.user`
- [ ] Si pas de cookie ou cookie invalide → 401
- [ ] Middleware `requireRole(role)` créé : vérifie `req.user.role === role`
- [ ] Si rôle insuffisant → 403
- [ ] Toutes les routes `/api/admin/*` protégées par les deux middlewares
- [ ] Routes utilisateur authentifiées (favoris, profil) protégées par `requireAuth`
- [ ] **Test critique** : `GET /api/admin/users` sans cookie → 401
- [ ] **Test critique** : `GET /api/admin/users` avec JWT user → 403
- [ ] **Test critique** : `GET /api/admin/users` avec JWT modifié → 401
- [ ] **Test critique** : `GET /api/admin/users` avec JWT admin valide → 200

### Notes
Référence : `SECURITY.md §5`. Les 4 tests critiques DOIVENT être en CI (SEC-019).

---

## SEC-010 — Protection IDOR sur les favoris

**Labels** : `security` `priority:P1` `area:rbac` `type:backend`
**Milestone** : M3 — Sessions & RBAC
**Sprint** : S3
**Estimate** : 2h
**Threat Model** : M5
**Dépendances** : SEC-009

### Description
Concevoir les routes de favoris avec le pattern `/me` pour rendre l'IDOR impossible par construction. **Aucune route ne doit accepter un `userId` en paramètre côté user.**

### Critères d'acceptation
- [ ] Route `GET /api/users/me/favorites` → liste les favoris du JWT
- [ ] Route `POST /api/users/me/favorites` → ajoute un favori (body : `{ offerId }`)
- [ ] Route `DELETE /api/users/me/favorites/:offerId` → supprime un favori
- [ ] **Aucune route `/api/users/:userId/favorites` n'existe**
- [ ] Le `userId` est toujours déduit de `req.user.id` (jamais des params)
- [ ] **Test critique** : Bob créé un favori, Alice fait `GET /me/favorites` → ne voit pas le favori de Bob
- [ ] **Test critique** : Bob essaye de supprimer un favori d'Alice (par ID d'offre) → soit 404 (favori pas chez lui), soit 200 mais ne supprime rien chez Alice
- [ ] Test : un user non authentifié → 401

### Notes
Référence : `SECURITY.md §5`. L'IDOR est éliminé par design, pas par contrôle.

---

## SEC-011 — Protection injection SQL via Prisma

**Labels** : `security` `priority:P0` `area:injection` `type:backend`
**Milestone** : M4 — Injections
**Sprint** : S4
**Estimate** : 2h
**Threat Model** : STRIDE-T
**Dépendances** : aucune (à faire dès que la DB est en place)

### Description
Garantir qu'aucune requête SQL n'est construite par concaténation. Toutes les requêtes passent par Prisma (paramétrées par défaut). Audit du code pour traquer les éventuels `$queryRaw` non sécurisés.

### Critères d'acceptation
- [ ] Prisma installé et configuré
- [ ] Audit du code : aucun `$queryRaw` avec interpolation `${}` directe
- [ ] Si `$queryRaw` nécessaire, utiliser le template tag `Prisma.sql\`...\`` (paramétrage automatique)
- [ ] Règle ESLint custom ou commentaire de revue obligatoire pour tout usage de `$queryRaw`
- [ ] Documentation dans `SECURITY.md §6` mise à jour
- [ ] Test : payload `' OR 1=1 --` dans un input filtre → ne casse pas la requête, retourne 0 résultats

### Notes
Référence : `SECURITY.md §6`. Postgres + Prisma rend l'injection SQL difficile, mais il faut quand même auditer.

---

## SEC-012 — Sanitization XSS du contenu WeLoveDevs

**Labels** : `security` `priority:P0` `area:injection` `type:backend` `type:frontend`
**Milestone** : M4 — Injections
**Sprint** : S4
**Estimate** : 4h
**Threat Model** : M2
**Dépendances** : aucune (à faire dès que l'ingestion existe)

### Description
Le contenu ingéré depuis WeLoveDevs peut contenir du HTML malveillant. Défense en profondeur : sanitization à l'ingestion + interdiction de `dangerouslySetInnerHTML` côté React.

### Critères d'acceptation
- [ ] `sanitize-html` installé côté backend
- [ ] Whitelist stricte définie : `['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a']`
- [ ] Attribut `href` autorisé uniquement avec schemes `http`, `https`, `mailto`
- [ ] Sanitization appliquée à **l'ingestion** (avant insertion en base), pas à l'affichage
- [ ] Règle ESLint `react/no-danger: error` activée côté frontend
- [ ] Aucun `dangerouslySetInnerHTML` dans le code (vérifié grep + ESLint)
- [ ] **Test critique** : ingérer une description avec `<script>alert(1)</script>` → script strippé en base
- [ ] **Test critique** : ingérer `<a href="javascript:alert(1)">link</a>` → href strippé
- [ ] Test : le formatage légitime (gras, listes) est préservé

### Notes
Référence : `SECURITY.md §6`. Menace P0 du Threat Model.

---

## SEC-013 — Validation des filtres avec whitelist

**Labels** : `security` `priority:P1` `area:injection` `type:backend`
**Milestone** : M4 — Injections
**Sprint** : S4
**Estimate** : 2h
**Threat Model** : M1, STRIDE-T
**Dépendances** : SEC-002

### Description
Les filtres dans `GET /api/offers?...` doivent être strictement validés (whitelist des champs et des valeurs). Empêche l'injection de filtres arbitraires et la pollution de la requête.

### Critères d'acceptation
- [ ] Schéma Zod défini pour les query params de `GET /api/offers`
- [ ] Whitelist des champs filtrables : `contractType`, `level`, `language`, `location`, `remote`
- [ ] Whitelist des valeurs pour les enums : `contractType ∈ ['stage', 'alternance', 'CDI', 'CDD']`
- [ ] Validation `level ∈ ['junior', 'mid', 'senior']`
- [ ] Validation des types : `salaryMin: number`, `remote: boolean`
- [ ] Limite et offset numériques avec bornes (cf. SEC-014)
- [ ] Champs non listés ignorés silencieusement
- [ ] Test : `?contractType=hack` → 400
- [ ] Test : `?evil=true` → champ ignoré, requête OK

### Notes
Référence : `SECURITY.md §6`.

---

## SEC-014 — Rate limiting global et limites de payload

**Labels** : `security` `priority:P2` `area:dos` `type:backend`
**Milestone** : M5 — DoS & abus
**Sprint** : S5
**Estimate** : 2h
**Threat Model** : M10
**Dépendances** : SEC-006

### Description
Mettre en place un filet de sécurité global contre les abus : rate limit global, taille de body limitée, pagination obligatoire.

### Critères d'acceptation
- [ ] Rate limit global : 100 req/min/IP appliqué à toutes les routes
- [ ] Rate limit `/api/auth/*` : 10 req/min/IP
- [ ] `express.json({ limit: '100kb' })` configuré
- [ ] Pagination obligatoire sur `GET /api/offers` : `limit` par défaut 20, max 50
- [ ] Erreur 400 si `limit > 50`
- [ ] Erreur 413 (Payload Too Large) si body > 100kb
- [ ] Test : envoyer un body de 200kb → 413
- [ ] Test : `?limit=1000` → 400
- [ ] Test : 101 requêtes en 1 min → la 101e renvoie 429

### Notes
Référence : `SECURITY.md §7`.

---

## SEC-015 — Protection de la synchronisation WeLoveDevs

**Labels** : `security` `priority:P1` `area:dos` `area:rbac` `type:backend`
**Milestone** : M5 — DoS & abus
**Sprint** : S5
**Estimate** : 4h
**Threat Model** : M8
**Dépendances** : SEC-009

### Description
La synchronisation WeLoveDevs consomme un quota partagé (1 req/s/student). Une boucle non protégée peut épuiser le quota et bloquer le partenariat. Route admin uniquement, avec cooldown et queue.

### Critères d'acceptation
- [ ] Route `POST /api/admin/ingest` protégée par `requireAuth` + `requireRole('admin')`
- [ ] Cooldown : pas plus d'un déclenchement toutes les 60 secondes (état en mémoire ou DB)
- [ ] Si une ingestion est déjà en cours → 409 Conflict
- [ ] Queue d'ingestion respectant 1 req/s vers WLD (`p-limit` ou `bottleneck`)
- [ ] Logs : timestamp, nombre d'offres ingérées, durée totale
- [ ] Date de dernière ingestion exposée pour le dashboard admin
- [ ] Test : 2 appels successifs → 2e renvoie 409
- [ ] Test : appel par un user non-admin → 403
- [ ] Test : la queue interne respecte bien le délai 1s entre les appels WLD (mock)

### Notes
Référence : `SECURITY.md §7`. Lié à la feature dashboard admin (cf. wireframes).

---

## SEC-016 — Limites sur la comparaison d'offres

**Labels** : `security` `priority:P2` `area:dos` `type:backend`
**Milestone** : M5 — DoS & abus
**Sprint** : S5
**Estimate** : 1h
**Threat Model** : M10
**Dépendances** : SEC-002

### Description
La feature de comparaison accepte une liste d'IDs. Sans limite, un attaquant peut envoyer 10000 IDs et déclencher une requête lourde. Limite côté serveur à 3 IDs (cohérent avec le wireframe : 2 offres + 1 marge).

### Critères d'acceptation
- [ ] Schéma Zod : `ids` est un array de UUID, max 3 éléments
- [ ] Route `GET /api/offers/compare?ids=1,2,3` valide la liste
- [ ] Si > 3 IDs → 400
- [ ] Si format invalide → 400
- [ ] Test : 4 IDs → 400
- [ ] Test : 3 IDs valides → 200
- [ ] Test : ID malformé → 400

### Notes
Référence : `SECURITY.md §7`. Note : le wireframe parle de 2 offres, le Threat Model dit 3 max. À confirmer en équipe.

---

## SEC-017 — Helmet + headers de sécurité

**Labels** : `security` `priority:P2` `area:headers` `type:backend`
**Milestone** : M6 — Hardening final
**Sprint** : S6
**Estimate** : 2h
**Threat Model** : M7
**Dépendances** : aucune

### Description
Appliquer les headers de sécurité standards via Helmet : protection clickjacking, MIME sniffing, HSTS, etc.

### Critères d'acceptation
- [ ] `helmet` installé
- [ ] `app.use(helmet())` appliqué en début de chaîne
- [ ] CSP configurée (au minimum `default-src 'self'`)
- [ ] `X-Frame-Options: DENY` présent
- [ ] `X-Content-Type-Options: nosniff` présent
- [ ] HSTS conditionnel (uniquement si `NODE_ENV === 'production'`)
- [ ] Test : vérifier les headers dans la réponse via curl ou test Supertest

### Notes
Référence : `SECURITY.md §9`.

---

## SEC-018 — Configuration CORS

**Labels** : `security` `priority:P1` `area:headers` `type:backend`
**Milestone** : M6 — Hardening final
**Sprint** : S6
**Estimate** : 1h
**Threat Model** : M7 (CSRF cross-origin)
**Dépendances** : SEC-001

### Description
Configurer CORS de manière restrictive (jamais `*`), avec support des cookies d'authentification.

### Critères d'acceptation
- [ ] `cors` installé
- [ ] `origin` lu depuis `process.env.CORS_ORIGIN`
- [ ] `credentials: true` activé (nécessaire pour les cookies)
- [ ] `*` interdit même en dev (utiliser `http://localhost:5173`)
- [ ] Documentation des origines autorisées dans `SECURITY.md`
- [ ] Test : requête depuis une origine non listée → bloquée par le navigateur (test manuel)

### Notes
Référence : `SECURITY.md §9`.

---

## SEC-019 — Tests sécurité en CI

**Labels** : `security` `priority:P0` `area:ci` `type:infra`
**Milestone** : M6 — Hardening final
**Sprint** : S6
**Estimate** : 4h
**Threat Model** : couverture globale
**Dépendances** : SEC-005, SEC-009, SEC-010, SEC-012

### Description
Mettre en place les tests de sécurité dans la CI GitHub Actions. Les tests critiques doivent tourner sur chaque PR pour garantir qu'aucune régression sécurité ne passe en `main`.

### Critères d'acceptation
- [ ] Workflow `.github/workflows/ci.yml` créé
- [ ] Job `lint` : ESLint sur backend et frontend
- [ ] Job `test` : Jest + Supertest, exécute au minimum les tests suivants :
  - [ ] `POST /register { role: 'admin' }` → user créé est `user` (M1)
  - [ ] `GET /api/admin/users` sans JWT → 401 (M1)
  - [ ] `GET /api/admin/users` avec JWT user → 403 (M1)
  - [ ] `GET /api/admin/users` avec JWT modifié → 401 (M1)
  - [ ] Bob ne peut pas voir/modifier les favoris d'Alice (M5)
  - [ ] 6e tentative de login en 15min → 429 (M4)
  - [ ] Mot de passe < 12 chars → 400 (M4)
  - [ ] `<script>` injecté dans une description → strippé en base (M2)
- [ ] Job `audit` : `npm audit --audit-level=high` (échoue si vulnérabilité haute)
- [ ] Job `secrets` : `gitleaks detect`
- [ ] CI déclenchée sur `pull_request` et `push: main`
- [ ] Documentation dans le README principal sur comment lire les rapports CI

### Notes
Référence : `SECURITY.md §10`. Sujet exige minimum 2 routes API + 1 fonction de normalisation testées — on dépasse largement.

---

## Récap par sprint

| Sprint | Tickets | Estimation | Priorité dominante |
|---|---|---|---|
| S1 — Fondations | SEC-001, 002, 003 | 7h | P0 |
| S2 — Auth & comptes | SEC-004, 005, 006, 007 | 14h | P0 |
| S3 — Sessions & RBAC | SEC-008, 009, 010 | 8h | P0/P1 |
| S4 — Injections | SEC-011, 012, 013 | 8h | P0/P1 |
| S5 — DoS & abus | SEC-014, 015, 016 | 7h | P1/P2 |
| S6 — Hardening final | SEC-017, 018, 019 | 7h | P0/P1/P2 |

**Total : 51h** sur les 19 tickets. Réaliste pour un membre dédié sécurité sur ~2 semaines (la durée que tu mentionnes dans `organisation.md`).

## Ordre de réalisation recommandé

Chemin critique (à respecter strictement) :
```
SEC-001 → SEC-002 → SEC-003 (fondations parallélisables sur S1)
       ↓
SEC-004 → SEC-005 → SEC-008 → SEC-006 (auth en série)
       ↓                ↓
SEC-007 (parallèle)    SEC-009 → SEC-010
                            ↓
SEC-011, 012, 013 (parallélisables)
       ↓
SEC-014, 015, 016 (parallélisables)
       ↓
SEC-017, 018, 019 (parallélisables, finition)
```

## Astuce GitHub Projects

Pour créer rapidement les tickets :

1. Va dans **Issues** → **New issue**
2. Copie-colle le bloc d'un ticket à partir du titre `## SEC-XXX`
3. Ajoute les labels listés dans la section **Labels**
4. Assigne le milestone
5. Lie au Project (bouton "Projects" à droite de l'issue)
6. Renseigne les champs custom (Estimate, Sprint)

Pour aller plus vite : **GitHub CLI** permet de scripter la création :
```bash
gh issue create --title "SEC-001 — ..." --body-file ticket-001.md --label "security,priority:P0,area:secrets" --milestone "M1 — Fondations sécurité"
```