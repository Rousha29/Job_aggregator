import { fetchJobs } from "./welovedevService.js";
import { mapJob } from "./welovedev.mapper.js";
import pool from "../../config/db.js";

export async function syncWeLoveDevs() {
      try {
            const data = await fetchJobs();
            const rawJobs = data.values ?? [];

            let synced = 0;
            let skipped = 0;

            for (const rawJob of rawJobs) {
                  const job = mapJob(rawJob);

                  // Rejeter les offres sans données valides (notamment sans entreprise)
                  if (!job) {
                        skipped++;
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
                        synced++;
                  } catch (err) {
                        console.error(`Erreur insertion WeLoveDevs ${job.externalId}:`, err.message);
                  }

                  // Rate limiting (1 req/s max selon la doc API)
                  await new Promise(r => setTimeout(r, 1000));
            }

            console.log(`WeLoveDevs sync: ${synced} inserted, ${skipped} skipped`);
            return { synced, skipped };
      } catch (error) {
            console.error("WeLoveDevs sync error:", error.message);
            throw error;
      }
}