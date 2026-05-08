import { fetchJobs } from './welovedevService.js';
import pool from '../config/db.js';

const delay = (ms) => new Promise(r => setTimeout(r, ms));

const normalizeOffer = (raw) => ({
  external_id:   raw.id,
  title:         raw.title ?? 'Sans titre',
  description:   raw.description ?? '',
  company:       raw.companyId ?? 'Inconnu',
  location:      raw.details?.places ? Object.keys(raw.details.places)[0] : 'Non précisé',
  contract_type: raw.contractTypes?.[0] ?? null,
  published_at:  raw.createdAt ? new Date(raw.createdAt) : new Date(),
});

export const ingestJobs = async () => {
  const data = await fetchJobs();
  const offers = data.values ?? [];

  for (const raw of offers) {
    const o = normalizeOffer(raw);
    await pool.query(
      `INSERT INTO offers (external_id, title, description, company, location, contract_type, fetched_at)
       VALUES ($1,$2,$3,$4,$5,$6,NOW())
       ON CONFLICT (external_id) DO UPDATE SET
         title=$2, description=$3, company=$4, location=$5, contract_type=$6`,
      [o.external_id, o.title, o.description, o.company, o.location, o.contract_type]
    );
    await delay(1000);
  }

  return { ingested: offers.length };
};