# L'API WE LOVES DEV

---

## 1. PRESENTATION

---

### 1.1 We Loves Dev, c'est quoi ?

WeLoveDevs est un site qui permet de publier des offres d'emploi spécialisées **pour les développeurs**.
Il met en relation les développeurs en recherche d'emploi et les entreprises qui publient leurs offres.

---

### 1.2 Ce que l'on peut trouver sur le site

Le site propose des offres d'emploi enrichies avec des **tags de compétences** qui permettent aux recruteurs d'exprimer leurs besoins rapidement, et aux candidats de filtrer leurs recherches efficacement.

---

## 2. L'API

---

### 2.1 Accès à l'API

L'API est accessible à l'adresse suivante :

```
GET https://epi-api.welovedevs.com/v1
Header: X-API-Key: <clé>
```

Elle retourne un objet JSON avec deux champs :

| Champ | Type | Description |
|---|---|---|
| `totalCount` | `number` | Nombre total d'offres disponibles sur le site |
| `values` | `array` | Liste des offres retournées |

À la date du **22/04/2026**, l'API recense **1 896 offres** actives.

---

### 2.2 Structure d'une offre

Chaque objet dans `values` représente une offre d'emploi. Voici l'ensemble des champs disponibles :

#### Identification

| Champ | Type | Description |
|---|---|---|
| `id` / `objectID` | `string` | Identifiant unique de l'offre |
| `reference` | `string` | Référence courte lisible (ex: `NZXRT3SA`) |
| `helmetHandle` | `string` | Identifiant interne pour les métadonnées |
| `seoAlias` | `string` | Slug SEO de l'URL de l'offre |
| `type` | `string` | Type de publication — toujours `company_job` |
| `status` | `string` | Statut de l'offre — toujours `JOB_PUBLISHED` |

#### Dates

| Champ | Type | Description |
|---|---|---|
| `createdAt` | `number` | Timestamp de création (microsecondes) |
| `publishDate` | `number` | Timestamp de publication (microsecondes) |
| `lastUpdate` | `number` | Timestamp de dernière mise à jour (microsecondes) |

#### Contenu de l'offre

| Champ | Type | Description |
|---|---|---|
| `title` | `string` | Intitulé du poste |
| `descriptionPreview` | `string` | Aperçu textuel de la description complète |
| `contractTypes` | `array<string>` | Types de contrat proposés (ex: `permanent`) |
| `premium` | `boolean \| string \| number` | Indique si l'offre est mise en avant (valeur variable selon le format) |
| `ranking` | `number` | Score de classement de l'offre |
| `application30Days` | `boolean` | Si `true`, des candidatures ont été reçues dans les 30 derniers jours |

#### Métier

| Champ | Type | Description |
|---|---|---|
| `profession.algoliaKeyword` | `string` | Catégorie métier pour la recherche (ex: `fullstack`, `backend`, `lead developer`) |
| `profession.langContent.fr.displayName` | `string` | Libellé affiché en français |
| `profession.langContent.en.displayName` | `string` | Libellé affiché en anglais |

#### Détails du poste (`details`)

| Champ | Type | Description |
|---|---|---|
| `details.contracts` | `object` | Types de contrat sous forme de clés booléennes |
| `details.locale` | `string` | Langue de l'offre (ex: `fr`) |
| `details.professionId` | `string` | Identifiant interne de la profession |
| `details.requiredExperience` | `number` | Années d'expérience requises |
| `details.remotePolicy.frequency` | `string` | Politique de télétravail : `hybrid`, `fullTime`, ou absent si présentiel |
| `details.remotePolicy.daysPerWeek` | `number` | Nombre de jours de télétravail par semaine (si hybride) |
| `details.salary.min` | `number` | Salaire minimum en k€/an |
| `details.salary.max` | `number` | Salaire maximum en k€/an |
| `details.salary.currency` | `string` | Devise (€) |
| `details.salary.recurrence` | `string` | Périodicité — toujours `year` |
| `details.places` | `object` | Localisation avec coordonnées GPS et précision |

#### Compétences

| Champ | Type | Description |
|---|---|---|
| `skillsList` | `array` | Liste de compétences avec `name` et `value` (poids de 0 à 100) |

Le champ `value` indique le niveau d'importance de la compétence dans l'offre :
- **100** : compétence indispensable
- **70** : compétence importante
- **50** : compétence souhaitée
- **30** : compétence appréciée

#### Entreprise (`smallCompany`)

| Champ | Type | Description |
|---|---|---|
| `smallCompany.companyName` | `string` | Nom de l'entreprise |
| `smallCompany.id` | `string` | Identifiant unique de l'entreprise |
| `smallCompany.seoAlias` | `string` | Slug SEO de la page entreprise |
| `smallCompany.companyType` | `number` | Code numérique du type d'entreprise |
| `smallCompany.companyTypeExplicit` | `string` | Type d'entreprise lisible (voir tableau ci-dessous) |
| `smallCompany.sectors` | `array<string>` | Secteurs d'activité de l'entreprise |

Types d'entreprise disponibles :

| Valeur | Libellé |
|---|---|
| `startup` | Startup |
| `software_publisher` | Éditeur de logiciels |
| `service_company` | ESN / Société de services |
| `web_agency` | Agence web |
| `consultiung_company` | Cabinet de conseil |

#### Géolocalisation

| Champ | Type | Description |
|---|---|---|
| `_geoloc` | `array` | Coordonnées GPS (`lat`, `lng`) |
| `formattedPlaces` | `array<string>` | Localisation en texte lisible (ex: `Paris, France`) |

#### Analytics

| Champ | Type | Description |
|---|---|---|
| `analytics.visitsCount` | `number` | Nombre total de vues de l'offre |
| `analytics.applyBtnClicks` | `number` | Nombre de clics sur le bouton "Postuler" |
| `analytics.applications` | `number` | Candidatures reçues directement via le site |
| `analytics.atsApplications` | `number` | Candidatures reçues via un ATS externe |
| `analytics.totalApplications` | `number` | Total des candidatures (site + ATS) |
| `analytics.ctr` | `number` | Taux de clic (clics / vues × 100) |
| `analytics.cta` | `number` | Taux de conversion (candidatures / vues × 100) |
| `analytics.remoteApplications` | `number` | Candidatures issues d'une source externe |
| `analytics.updatedAt` | `number` | Timestamp de la dernière mise à jour des stats |

---

## 3. ANALYSE DES DONNÉES

*Basée sur un échantillon de 10 offres extraites le 22/04/2026.*

---

### 3.1 Compétences les plus demandées

| Compétence | Occurrences |
|---|---|
| Docker | 5 |
| React | 5 |
| Javascript | 4 |
| NodeJS | 4 |
| PostgreSQL | 4 |
| Typescript | 4 |
| Java | 2 |
| Spring | 2 |
| Angular | 2 |
| Python | 2 |

Les compétences **Docker**, **React** et **Javascript/Typescript** sont les plus transversales. Le stack **Java/Spring** reste présent sur les profils backend et fullstack senior.

---

### 3.2 Rémunération

| Indicateur | Valeur |
|---|---|
| Salaire minimum moyen | 45,6 k€/an |
| Salaire maximum moyen | 60,5 k€/an |
| Fourchette globale | 32 k€ — 90 k€/an |

Les offres les mieux rémunérées (75–90 k€) concernent des postes **Senior** ou **Principal Engineer** en full remote, avec 8+ ans d'expérience requis.

---

### 3.3 Politique de télétravail

| Modalité | Offres |
|---|---|
| Hybride | 8 (80%) |
| Full remote | 2 (20%) |
| Présentiel | 0 |

Le télétravail hybride est la norme, avec généralement **2 à 3 jours par semaine** à distance.

---

### 3.4 Répartition géographique

| Ville | Offres |
|---|---|
| Villeneuve-d'Ascq | 3 |
| Paris | 2 |
| France (national) | 1 |
| Marseille | 1 |
| Roubaix | 1 |
| Rennes | 1 |
| Lille | 1 |

La région **Nord** (Lille, Roubaix, Villeneuve-d'Ascq) est fortement représentée dans cet échantillon.

---

### 3.5 Types d'entreprises

| Type | Offres |
|---|---|
| ESN / Société de services | 3 |
| Cabinet de conseil | 3 |
| Éditeur de logiciels | 2 |
| Agence web | 1 |
| Startup | 1 |

---

### 3.6 Expérience requise

| Expérience | Offres |
|---|---|
| 2 ans | 3 |
| 3 ans | 4 |
| 6 ans | 1 |
| 8 ans | 2 |

La majorité des offres cible des profils avec **2 à 3 ans d'expérience**. Les postes senior (6–8 ans) sont moins nombreux mais mieux rémunérés.

---

### 3.7 Analytics — Engagement des offres

| Offre | Vues | Candidatures | CTR |
|---|---|---|---|
| Fullstack Software Engineer SaaS (Symfony & React) | 21 520 | 88 | 0,53% |
| Développeur Full Stack Java | 13 385 | 261 | 2,50% |
| Développeur Fullstack (Jetdev) | 7 485 | 407 | 5,17% |

L'offre **Développeur Fullstack de Jetdev** a le meilleur taux de conversion malgré un volume de vues inférieur, ce qui indique une forte adéquation entre l'offre et les candidats. À l'inverse, l'offre Symfony/React génère beaucoup de trafic mais peu de candidatures.

---

## 4. CONCLUSIONS

- **Le profil fullstack** est le plus recherché (70% des offres de l'échantillon), suivi du backend.
- **Docker, React et Typescript** forment le socle technologique commun des offres.
- **Le CDI** est le seul type de contrat présent dans cet échantillon.
- **Le télétravail hybride** (2–3 jours/semaine) est devenu le standard du marché.
- Les **salaires médians** (45–60 k€) sont cohérents avec le marché dev français pour des profils 2–5 ans d'expérience.
