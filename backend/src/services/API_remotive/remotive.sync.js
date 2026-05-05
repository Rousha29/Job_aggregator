import { fetchRemotiveJobs } from "./remotiveService.js";
import { mapRemotiveJob } from "./remotive.mapper.js";
import pool from "../../config/db.js";

export async function syncRemotive() {
      try {
            const rawJobs = await fetchRemotiveJobs();

            let synced = 0;
            let skipped = 0;
            let result_query = "";

            for (const rawJob of rawJobs) {
                  const job = mapRemotiveJob(rawJob);

                  // Rejeter les offres sans nom d'entreprise valide
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
                                    job.externalId, 'remotive', job.title, job.description, job.company,
                                    job.location, job.contract_type, job.salary_min, job.salary_max,
                                    job.remote, job.level, job.source_url
                              ]
                        );
                        result_query = await pool.query(`SELECT * FROM offers WHERE external_id = $1 AND source = 'remotive'`, [job.externalId]);
                        console.log("Résultat de la requête d'insertion/mise à jour:", result_query.rows[0]);

                        synced++;
                  } catch (err) {
                        console.error(`Erreur insertion Remotive ${job.externalId}:`, err.message);
                  }
            }

            console.log(`Remotive sync: ${synced} inserted, ${skipped} skipped`);
            return { synced, skipped };
      } catch (error) {
            console.error("Remotive sync error:", error.message);
            throw error;
      }
}