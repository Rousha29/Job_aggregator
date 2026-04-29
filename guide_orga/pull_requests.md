# Guide des Pull Requests (PR) — Projet en groupe


## Qu’est-ce qu’une Pull Request ?

Une Pull Request est une **demande de fusion** entre :

* une branche de travail (ex: `feature/login`)
* et une branche principale (ex: `main` ou `develop`)

Elle permet :

* de **voir les modifications**
* de **discuter du code**
* de **valider avant fusion**

---

## Workflow général

1. Créer une branche
2. Développer dessus
3. Push la branche sur le dépôt distant
4. Ouvrir une Pull Request
5. Faire relire et corriger si besoin
6. Fusionner la PR

---

## Installation


### Créer une branche

Toujours partir de la branche principale à jour :

```bash
git checkout main
git pull
git checkout -b feature/nom-de-la-feature
```

---

### Travailler et commit

Faire des commits propres et clairs :

```bash
git add .
git commit -m "feat: ajout du système de login"
```

---

### Push la branche

```bash
git push origin feature/nom-de-la-feature
```

---

### Créer une Pull Request

1. Aller sur GitHub / GitLab
2. Cliquer sur **"New Pull Request"**
3. Sélectionner :

   * branche source (ta branche)
   * branche cible (`main` ou `develop`)
4. Ajouter :

   * un **titre clair**
   * une **description**

---

### Exemple de PR

**Titre :**

```
feat: ajout de la page de login
```

**Description :**

```
- Création du formulaire de login
- Validation des champs
- Connexion à l'API
```

---

### Review (relecture)

Les autres membres :

* lisent le code
* commentent
* demandent des modifications si nécessaire

Si des changements sont demandés :

```bash
git add .
git commit -m "fix: correction suite review"
git push
```

La PR se met à jour automatiquement.

---

## Fusion (Merge)

Une fois validée :

* Cliquer sur **"Merge Pull Request"**
* Supprimer la branche si elle n’est plus utile

---

## Bonnes pratiques

* 🔹 1 PR = 1 fonctionnalité
* 🔹 Petites PR > grosses PR
* 🔹 Messages de commit clairs
* 🔹 Toujours pull avant de commencer
* 🔹 Tester avant de push
* 🔹 Demander au moins 1 review

---

## À éviter

* ❌ Travailler directement sur `main`
* ❌ Faire des PR énormes
* ❌ Push du code cassé
* ❌ Ignorer les reviews

---

## Astuces

* Utiliser des noms de branches clairs :

  * `feature/...`
  * `fix/...`
  * `hotfix/...`

* Faire souvent :

```bash
git pull
```

---

## Résumé rapide

```bash
git checkout -b feature/ma-feature
# coder
git add .
git commit -m "feat: ma feature"
git push origin feature/ma-feature
# créer PR sur GitHub
```

Si tout le monde suit ce workflow, le projet sera beaucoup plus fluide 🚀
