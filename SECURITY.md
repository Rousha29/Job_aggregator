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

