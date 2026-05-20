import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../../config/db.js';
import { mapLocalJob } from './local.mapper.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://ai-service:8000';

const triggerIndexingForOffer = (offerId) => {
  if (!offerId) return;
  fetch(`${AI_SERVICE_URL}/index/offer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ offer_id: offerId })
  })
    .then((r) => {
      if (!r.ok) console.error('Indexation failed:', r.status);
    })
    .catch((err) => console.error('Indexation error:', err));
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function syncLocalJSON(data) {
  try {
    // Si data est fourni (depuis le backend), l'utiliser. Sinon, lire le fichier.
    let offres = [];
    if (data && typeof data === 'object') {
      offres = data.offres ?? [];
    } else {
      const filePath = path.join(__dirname, '../../data/offres.json');
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      offres = parsed.offres ?? [];
    }

    let synced = 0;
    let skipped = 0;

    for (const offre of offres) {
      const job = mapLocalJob(offre);

      if (!job) {
        skipped++;
        continue;
      }

      // Validation supplémentaire: avoir au moins une description ou un salaire
      if (!job.description && !job.salary_min && !job.salary_max) {
        console.debug(`Offre ${job.externalId} rejetée: aucune description ni salaire`);
        skipped++;
        continue;
      }

      try {
        const insertResult = await pool.query(
          `INSERT INTO offers (
            external_id, source, title, description, company, location,
            contract_type, salary_min, salary_max, remote,
            level, source_url, fetched_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
          ON CONFLICT (external_id, source) DO UPDATE SET
            title=$3, description=$4, company=$5, location=$6,
            contract_type=$7, salary_min=$8, salary_max=$9,
            remote=$10, level=$11, source_url=$12, fetched_at=NOW()
          RETURNING id`,
          [
            job.externalId, job.source, job.title, job.description, job.company,
            job.location, job.contract_type, job.salary_min, job.salary_max,
            job.remote, job.level, job.source_url
          ]
        );
        const insertedId = insertResult?.rows?.[0]?.id;
        triggerIndexingForOffer(insertedId);
        synced++;
      } catch (err) {
        console.error(`Erreur insertion local JSON ${job.externalId}:`, err.message);
        skipped++;
      }
    }

    console.log(`Local JSON sync: ${synced} inserted, ${skipped} skipped`);
    return { synced, skipped };
  } catch (err) {
    console.error('Local JSON sync error:', err.message);
    throw err;
  }
}