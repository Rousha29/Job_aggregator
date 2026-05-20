import { fetchJobs } from "./welovedevService.js";
import { mapJob } from "./welovedev.mapper.js";
import pool from "../../config/db.js";

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

export async function syncWeLoveDevs() {
      try {
            let page = 0;
            const size = 50;
            let totalSynced = 0;
            let totalSkipped = 0;
            let hasMore = true;

            console.log("Starting continuous WeLoveDevs sync...");

            while (hasMore) {
                  console.log(`Fetching page ${page}...`);
                  const data = await fetchJobs({ page, size });
                  const rawJobs = data.values ?? [];

                  if (rawJobs.length === 0) {
                        hasMore = false;
                        break;
                  }

                  let pageSynced = 0;
                  let pageSkipped = 0;

                  for (const rawJob of rawJobs) {
                        const job = mapJob(rawJob);

                        if (!job) {
                              pageSkipped++;
                              continue;
                        }

                        try {
                              const insertResult = await pool.query(
                                    `INSERT INTO offers (
                  external_id, source, title, description, company, location,
                  contract_type, salary_min, salary_max, remote, remote_policy, skills,
                  level, source_url, fetched_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
                ON CONFLICT (external_id, source) DO UPDATE SET
                  title=$3, description=$4, company=$5, location=$6,
                  contract_type=$7, salary_min=$8, salary_max=$9,
                  remote=$10, remote_policy=$11, skills=$12, level=$13, source_url=$14, fetched_at=NOW()
                RETURNING id`,
                                    [
                                          job.externalId, 'welovedevs', job.title, job.description, job.company,
                                          job.location, job.contract_type, job.salary_min, job.salary_max,
                                          job.remote, job.remote_policy, JSON.stringify(job.skills),
                                          job.level, job.source_url
                                    ]
                              );
                              const insertedId = insertResult?.rows?.[0]?.id;
                              triggerIndexingForOffer(insertedId);
                              pageSynced++;
                        } catch (err) {
                              console.error(`Erreur insertion WeLoveDevs ${job.externalId}:`, err.message);
                        }

                        // Rate limiting (1 req/s max selon la doc API)
                        await new Promise(r => setTimeout(r, 1100));
                  }

                  totalSynced += pageSynced;
                  totalSkipped += pageSkipped;
                  console.log(`Page ${page} finished: ${pageSynced} synced, ${pageSkipped} skipped`);


                  if (rawJobs.length < size) {
                        hasMore = false;
                  } else {
                        page++;
                        // Petit délai entre les pages pour la sécurité
                        await new Promise(r => setTimeout(r, 1000));
                  }
            }

            console.log(`WeLoveDevs continuous sync finished: ${totalSynced} total synced`);
            return { synced: totalSynced, skipped: totalSkipped };
      } catch (error) {
            console.error("WeLoveDevs sync error:", error.message);
            throw error;
      }
}