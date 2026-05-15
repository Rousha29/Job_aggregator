# Sécurité

## Signaler une vulnérabilité
Contacter l'équipe sur Teams si quelqu'un trouve une faille

---

## Gestion des secrets (SEC-001)

### C'est quoi le problème ?
Si des mots de passe ou des clés secrètes sont écrits directement dans le code, n'importe qui ayant accès au dépôt git peut les lire et s'en servir.

### Ce qui a changé
- Plus aucun secret écrit directement dans le code
- Les informations sensibles (`JWT_SECRET`, `DEFAULT_ADMIN_EMAIL`, `DEFAULT_ADMIN_PASSWORD`) sont stockées dans un fichier `.env` sur le serveur, jamais dans git
- Si ces variables sont absentes au démarrage, l'application refuse de se lancer

### Pour les nouveaux développeurs
1. Copier `.env.example` → `backend/.env`
2. Remplir chaque valeur (ne jamais committer ce fichier)
3. Générer un JWT_SECRET sécurisé : `openssl rand -base64 32`

### Outil : Gitleaks
Gitleaks scanne automatiquement les fichiers avant chaque commit et bloque si un secret est détecté par erreur.

**Installation :**
```bash
wget https://github.com/gitleaks/gitleaks/releases/download/v8.18.4/gitleaks_8.18.4_linux_x64.tar.gz
tar -xzf gitleaks_8.18.4_linux_x64.tar.gz
sudo mv gitleaks /usr/local/bin/
rm gitleaks_8.18.4_linux_x64.tar.gz
```
Vérifier l'installation avec `gitleaks version`

---

## Validation des entrées (SEC-002)

### C'est quoi le problème ?
Sans vérification, un utilisateur peut envoyer n'importe quoi au serveur — un champ `role: "admin"` pour se promouvoir, un email mal formé, ou un texte trop long pour planter l'application.

### Ce qui a changé
- Chaque requête est filtrée avant d'atteindre le code métier : les champs inconnus sont supprimés, les formats invalides sont rejetés
- Si les données ne sont pas conformes, le serveur répond `400` et le traitement s'arrête là

### Règles appliquées à l'inscription
- `nom`, `prenom` : texte non vide
- `mail` : format email valide
- `password` : entre 8 et 128 caractères
- `confirmation` : texte

### Outil utilisé
[Zod](https://zod.dev) — librairie qui vérifie et nettoie les données selon un schéma défini.

---

## Gestion des erreurs (SEC-003)

### C'est quoi le problème ?
Quand le serveur plante, il peut afficher des détails techniques dans la réponse — le nom d'une table en base, la structure du code, la clé utilisée. Ces informations sont précieuses pour un attaquant.

### Ce qui a changé
- Les erreurs intentionnelles (ex: "utilisateur introuvable") envoient un message clair au client
- Les erreurs inattendues (pannes, bugs) sont loggées côté serveur mais le client reçoit uniquement "Erreur interne du serveur"
- En production, aucun détail technique ne sort du serveur

---

## Hashage des mots de passe (SEC-004)

### C'est quoi le problème ?
Si la base de données est compromise, un attaquant ne doit pas pouvoir lire les mots de passe. Stocker un mot de passe en clair, c'est comme laisser les clés sur la porte.

### Ce qui a changé
- Les mots de passe sont transformés en une empreinte illisible (hash) avant d'être stockés
- Même l'équipe de développement ne peut pas retrouver le mot de passe d'un utilisateur
- La logique est centralisée dans `backend/src/services/password.js`

### Pourquoi bcrypt
bcrypt est conçu pour être volontairement lent, ce qui rend les attaques par force brute (tester des milliers de mots de passe) très coûteuses en temps.

---

## Vérification des mots de passe compromis (SEC-005)

### C'est quoi le problème ?
Beaucoup d'utilisateurs réutilisent des mots de passe qui ont déjà été volés lors de fuites de données sur d'autres sites. Ces mots de passe sont connus des attaquants.

### Ce qui a changé
- À l'inscription, le mot de passe est vérifié contre la base de données HaveIBeenPwned (HIBP)
- Si le mot de passe a déjà été exposé quelque part, l'inscription est refusée

### Comment ça marche sans exposer le mot de passe
Le mot de passe n'est jamais envoyé à HIBP. Seuls les 5 premiers caractères d'une empreinte sont transmis. HIBP retourne une liste de correspondances, et la comparaison se fait localement — HIBP ne sait jamais quel mot de passe est vérifié.

---

## Limitation des tentatives de connexion (SEC-006)

### C'est quoi le problème ?
Sans limite, un attaquant peut tester des milliers de mots de passe automatiquement jusqu'à trouver le bon (attaque par force brute).

### Ce qui a changé
- La route de connexion est limitée à **5 tentatives par adresse IP toutes les 15 minutes**
- Au-delà, le serveur répond `429` avec un message d'erreur

---

## Token de session dans un cookie sécurisé (SEC-008)

### C'est quoi le problème ?
Après la connexion, le serveur donne un token à l'utilisateur pour prouver son identité. Si ce token est stocké dans le navigateur de façon accessible, un script malveillant peut le voler et usurper l'identité de l'utilisateur.

### Ce qui a changé
- Le token n'est plus visible dans le navigateur
- Il est stocké dans un cookie que JavaScript ne peut pas lire
- Le navigateur l'envoie automatiquement à chaque requête, sans que le code frontend y touche

### Protections appliquées au cookie
- Invisible pour JavaScript — même en cas d'injection de script malveillant
- Transmis uniquement en HTTPS en production
- Expire au bout de 24h

---

## Protection des pages admin (SEC-009)

### C'est quoi le problème ?
Sans vérification côté frontend, n'importe quel utilisateur connecté pourrait accéder aux pages d'administration en tapant directement l'URL dans son navigateur.

### Ce qui a changé
- Les pages `/admin` vérifient si l'utilisateur est connecté et s'il a le rôle admin
- Si non connecté → redirection vers la page de connexion
- Si connecté mais pas admin → redirection vers la page d'accueil

---

## Protection IDOR – Favoris (SEC-010)

### C'est quoi l'IDOR ?
Imagine que l'URL de tes favoris soit `/api/favorites/42`. En changeant `42` par `99`, tu pourrais accéder aux favoris d'un autre utilisateur. C'est ça, l'IDOR : accéder aux données de quelqu'un d'autre en modifiant un identifiant.

### Ce qui a été vérifié
- Dans les routes des favoris, l'identifiant de l'utilisateur est toujours lu depuis son token de connexion, jamais depuis l'URL
- Il est donc impossible d'accéder aux favoris d'un autre utilisateur, même en forgeant la requête

---

## Protection injection SQL (SEC-011)

### C'est quoi une injection SQL ?
Imagine qu'un utilisateur tape son email dans un formulaire. Si le serveur construit sa requête en collant directement ce texte dedans, un utilisateur malveillant peut écrire du code SQL à la place d'un email et manipuler la base de données — lire des données, supprimer des tables, etc.

### Ce qui a été vérifié
Tous les fichiers qui parlent à la base de données ont été audités :
- `authService.js`, `ingestionService.js`, `welovedevService.js`, `users.routes.js`, `admin.routes.js`
- Dans chaque fichier, les valeurs saisies par l'utilisateur sont toujours transmises séparément de la requête, jamais collées dedans

### Pourquoi c'est sécurisé
La base de données reçoit deux choses distinctes : la question (fixe) et les valeurs (séparées). Elle ne peut donc jamais confondre une valeur utilisateur avec une instruction SQL.

### Exemple
```js
// Dangereux — l'utilisateur peut écrire du SQL dans son email
pool.query(`SELECT * FROM users WHERE email = '${email}'`);

// Sécurisé — la valeur est transmise séparément
pool.query('SELECT * FROM users WHERE email = $1', [email]);
```

---

## Limitation globale des requêtes (SEC-014)

### C'est quoi le problème ?
Sans limite, quelqu'un pourrait bombarder le serveur de milliers de requêtes par seconde pour le ralentir ou le faire tomber, ou pour scraper toutes les offres d'un coup.

### Ce qui a changé
- Toutes les routes sont limitées à **100 requêtes par adresse IP par minute**
- Au-delà, le serveur répond `429`

---

## En-têtes de sécurité HTTP (SEC-017)

### C'est quoi le problème ?
Par défaut, un navigateur fait confiance à beaucoup de choses. Un attaquant peut exploiter cette confiance pour afficher le site dans une fausse page, tromper le navigateur sur le type de fichier reçu, ou forcer une connexion non sécurisée.

### Ce qui a changé
- Le serveur envoie maintenant des instructions au navigateur pour restreindre ces comportements
- Ces instructions sont ajoutées automatiquement à chaque réponse

### Exemples de protections ajoutées
- Le site ne peut pas être affiché dans une `<iframe>` sur un autre site (protection contre le clickjacking)
- Le navigateur ne peut pas deviner le type d'un fichier reçu (protection contre le MIME sniffing)
- En production, seules les connexions HTTPS sont acceptées

---

## Restriction des origines autorisées (SEC-018)

### C'est quoi le problème ?
Par défaut, n'importe quel site web pourrait faire des requêtes à notre API depuis le navigateur d'un utilisateur connecté et récupérer ses données.

### Ce qui a changé
- Seul le frontend officiel est autorisé à communiquer avec l'API
- Toute requête venant d'un autre site est bloquée par le navigateur

### Configuration
```env
CORS_ORIGIN=http://localhost:5173
```
