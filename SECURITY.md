# Sécurité

## Signaler une vulnérabilité
Contacter l'équipe sur Teams si quelqu'un trouve une faille

## Gestion des secrets (SEC-001)

### Ce qui a changé
- Plus aucun secret hardcodé dans le code source
- `JWT_SECRET`, `DEFAULT_ADMIN_EMAIL`, `DEFAULT_ADMIN_PASSWORD` sont maintenant obligatoires en variables d'environnement — l'application refuse de démarrer s'ils sont absents
- Le fichier `backend/.env` est exclu du tracking git (`.gitignore`)

### Configuration pour les nouveaux développeurs
1. Copier `.env.example` → `backend/.env`
2. Remplir chaque valeur (ne jamais committer ce fichier)
3. Générer un JWT_SECRET sécurisé dans le terminal : `openssl rand -base64 32`

## Outil de détection de secrets : Gitleaks

### Qu'est-ce que c'est ?
Gitleaks est un outil d'analyse statique qui scanne les dépôts git pour détecter les secrets hardcodés (clés API, tokens, mots de passe) avant qu'ils ne soient commités.

### Hook pre-commit
Un hook gitleaks est configuré dans `.git/hooks/pre-commit`. Il scanne automatiquement les fichiers staged avant chaque commit et bloque si un secret est détecté.

### Installation (obligatoire pour contribuer)

Sous linux :
```bash
wget https://github.com/gitleaks/gitleaks/releases/download/v8.18.4/gitleaks_8.18.4_linux_x64.tar.gz
tar -xzf gitleaks_8.18.4_linux_x64.tar.gz
sudo mv gitleaks /usr/local/bin/
rm gitleaks_8.18.4_linux_x64.tar.gz
```

Vérifiez l'installation avec `gitleaks version`

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


