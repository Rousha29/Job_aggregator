import Job from "../models/job.model.js";

export async function upsertJob(job) {
  return Job.updateOne(
    {
      externalId: job.externalId,
      source: job.source,
    },
    { $set: job },
    { upsert: true }
  );
}