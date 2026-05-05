import Job from "../models/job.model.js";

export async function upsertJob(job) { // si doublon (même titre + même entreprise), on met à jour au lieu de créer
  return Job.updateOne( 
    { title: job.title, company: job.company },
    { $set: job },
    { upsert: true }
  );
}