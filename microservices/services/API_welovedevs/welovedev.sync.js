import { fetchJobs } from "./welovedevService.js";
import { mapJob } from "./welovedev.mapper.js";
import pool from "../../config/db.js";

export async function syncWeLoveDevs() {
      try {
            let page = 0;
            const size = 50; // Max size usually supported
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
                              await pool.query(
                                    `INSERT INTO offers (
                  external_id, source, title, description, company, location,
                  contract_type, salary_min, salary_max, remote,
                  level, source_url, fetched_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
                ON CONFLICT (external_id, source) DO UPDATE SET
                  title=$3, description=$4, company=$5, location=$6,
                  contract_type=$7, salary_min=$8, salary_max=$9,
                  remote=$10, level=$11, source_url=$12, fetched_at=NOW()`,
                                    [
                                          job.externalId, 'welovedevs', job.title, job.description, job.company,
                                          job.location, job.contract_type, job.salary_min, job.salary_max,
                                          job.remote, job.level, job.source_url
                                    ]
                              );
                              pageSynced++;
                        } catch (err) {
                              console.error(`Erreur insertion WeLoveDevs ${job.externalId}:`, err.message);
                        }

                        // Rate limiting (1 req/s max selon la doc API)
                        await new Promise(r => setTimeout(r, 200));
                  }

                  totalSynced += pageSynced;
                  totalSkipped += pageSkipped;
                  console.log(`Page ${page} finished: ${pageSynced} synced, ${pageSkipped} skipped`);

                  // Check if we should continue
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