import { fetchJobs } from './welovedevService.js';
import pool from '../config/db.js';

const normalizeOffer = (raw) => ({
  source_id:     raw.id,
  title:         raw.title ?? 'Sans titre',
  description:   raw.description ?? '',
  company:       raw.company?.name ?? 'Inconnu',
  location:      raw.location?.city ?? raw.location ?? 'Non précisé',
  contract_type: raw.contractType ?? null,
  salary:        raw.salary ?? null,
  published_at:  raw.publishedAt ? new Date(raw.publishedAt) : new Date(),
});

export const ingestJobs = async () => {
  const data = await fetchJobs();
  const offers = data.jobs ?? data.data ?? [];

  for (const raw of offers) {
    const o = normalizeOffer(raw);
    await pool.query(
      `INSERT INTO offers (source_id, title, description, company, location, contract_type, salary, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (source_id) DO UPDATE SET
         title=$2, description=$3, company=$4, location=$5,
         contract_type=$6, salary=$7, published_at=$8`,
      [o.source_id, o.title, o.description, o.company,
       o.location, o.contract_type, o.salary, o.published_at]
    );
    await new Promise(r => setTimeout(r, 1000));
  }

  return { ingested: offers.length };
};