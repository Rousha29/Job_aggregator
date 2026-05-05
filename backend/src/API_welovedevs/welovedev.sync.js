import { fetchWeLoveDevsJobs } from "./welovedev.service.js";
import { mapJob } from "./welovedev.mapper.js";
import { upsertJob } from "./job.repository.js";

export async function syncWeLoveDevs() {
      const rawJobs = await fetchWeLoveDevsJobs();

      for (const job of rawJobs) {
            const clean = mapJob(job);
            await upsertJob(clean);
      }
}