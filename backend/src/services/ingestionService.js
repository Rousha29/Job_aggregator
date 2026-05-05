import { fetchJobs } from '../API_welovedevs/welovedevService.js';
import pool from '../config/db.js';

const normalizeContractType = (contracts) => {
  if (!contracts) return 'other';
  const keys = Object.keys(contracts).filter(k => contracts[k]);
  if (keys.includes('internship')) return 'stage';
  if (keys.includes('apprenticeship')) return 'alternance';
  if (keys.includes('permanent')) return 'CDI';
  if (keys.includes('temporary')) return 'CDD';
  return 'other';
};

const normalizeLevel = (experience) => {
  if (!experience) return null;
  if (experience <= 2) return 'junior';
  if (experience <= 5) return 'mid';
  return 'senior';
};

const normalizeOffer = (raw) => ({
  external_id:    raw.id ?? raw.objectID,
  title:          raw.title ?? 'Sans titre',
  description:    raw.descriptionPreview ?? '',
  company:        raw.smallCompany?.companyName ?? 'Inconnu',
  location:       raw.formattedPlaces?.[0] ?? 'Non précisé',
  contract_type:  normalizeContractType(raw.details?.contracts),
  salary_min:     raw.details?.salary?.min ?? null,
  salary_max:     raw.details?.salary?.max ?? null,
  remote:         raw.details?.remotePolicy?.frequency === 'fullTime',
  level:          normalizeLevel(raw.details?.requiredExperience),
  source_url:     raw.seoAlias
                    ? `https://welovedevs.com/app/jobs/${raw.seoAlias}`
                    : null,
  published_at:   raw.publishDate
                    ? new Date(raw.publishDate / 1000)
                    : new Date(),
});

export const ingestJobs = async () => {
  const data = await fetchJobs();
  const offers = data.values ?? [];

  let ingested = 0;

  for (const raw of offers) {
    const o = normalizeOffer(raw);

    await pool.query(
      `INSERT INTO offers (
        external_id, title, description, company, location,
        contract_type, salary_min, salary_max, remote,
        level, source_url, fetched_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())
      ON CONFLICT (external_id) DO UPDATE SET
        title=$2, description=$3, company=$4, location=$5,
        contract_type=$6, salary_min=$7, salary_max=$8,
        remote=$9, level=$10, source_url=$11, fetched_at=NOW()`,
      [
        o.external_id, o.title, o.description, o.company, o.location,
        o.contract_type, o.salary_min, o.salary_max, o.remote,
        o.level, o.source_url
      ]
    );

    ingested++;
    await new Promise(r => setTimeout(r, 1000));
  }

  return { ingested };
};