import { fetchJobs } from './welovedevService.js';
import pool from '../config/db.js';
import sanitizeHtml from 'sanitize-html';

const delay = (ms) => new Promise(r => setTimeout(r, ms));

const sanitizeText = (str) => sanitizeHtml(str ?? '', { allowedTags: [], allowedAttributes: {} });
const sanitizeDescription = (str) => sanitizeHtml(str ?? '', {
  allowedTags: ['p', 'br', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i'],
  allowedAttributes: {},
});

const mapContractType = (type) => {
  const map = {
    'permanent': 'CDI',
    'internship': 'stage',
    'alternance': 'alternance',
    'contract': 'CDD',
    'freelance': 'freelance',
  };
  return map[type] ?? type;
};

const normalizeOffer = (raw) => ({
  external_id:   raw.id,
  title:         sanitizeText(raw.title ?? 'Sans titre'),
  description:   sanitizeDescription(raw.descriptionPreview),
  company:       sanitizeText(raw.smallCompany?.companyName ?? raw.companyId ?? 'Inconnu'),
  location:      sanitizeText(raw.formattedPlaces?.[0] ?? 'Non précisé'),
  contract_type: raw.contractTypes?.[0] ? mapContractType(raw.contractTypes[0]) : null,
  salary_min:    raw.details?.salary?.min ?? null,
  salary_max:    raw.details?.salary?.max ?? null,
  remote:        raw.details?.remotePolicy?.frequency === 'remote',
  published_at:  raw.createdAt ? new Date(raw.createdAt / 1000) : new Date(),
});

export const ingestJobs = async () => {
  const data = await fetchJobs();
  const offers = data.values ?? [];

  for (const raw of offers) {
    const o = normalizeOffer(raw);
    await pool.query(
      `INSERT INTO offers (external_id, title, description, company, location, contract_type, salary_min, salary_max, remote, fetched_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
       ON CONFLICT (external_id) DO UPDATE SET
         title=$2, description=$3, company=$4, location=$5, contract_type=$6,
         salary_min=$7, salary_max=$8, remote=$9`,
      [o.external_id, o.title, o.description, o.company, o.location,
       o.contract_type, o.salary_min, o.salary_max, o.remote]
    );
    await delay(1000);
  }

  return { ingested: offers.length };
};