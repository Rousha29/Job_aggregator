# Sécurité

## Signaler une vulnérabilité
Contacter l'équipe sur Teams si quelqu'un trouve une faille

---

## Validation des filtres de recherche (SEC-013)

### C'est quoi le problème ?
La route `GET /api/offers/jobs` accepte des paramètres dans l'URL (`page`, `size`, `q`). Sans vérification, quelqu'un pourrait envoyer des valeurs aberrantes — `size=999999` pour déclencher une requête énorme en base, ou une chaîne `q` de plusieurs mégaoctets pour saturer la mémoire.

### Ce qui a changé
- Les paramètres `page`, `size` et `q` sont validés avec un schéma strict avant d'atteindre le service
- `page` : entier ≥ 0, défaut `0`
- `size` : entier entre 1 et 50, défaut `20`
- `q` : texte de 100 caractères maximum, défaut `''`
- Toute valeur hors de ces bornes est rejetée avec un `400` avant toute requête en base

### Pourquoi une whitelist plutôt qu'une simple conversion
Convertir `parseInt(req.query.size)` sans limite ne protège pas : un attaquant peut envoyer `size=1000000` et obtenir un entier valide qui déclenche quand même une requête lourde. La whitelist fixe des bornes strictes indépendamment de ce que l'utilisateur envoie.

### Outil utilisé
[Zod](https://zod.dev) avec `z.coerce.number()` — convertit automatiquement les chaînes de l'URL en nombres puis vérifie les contraintes.
