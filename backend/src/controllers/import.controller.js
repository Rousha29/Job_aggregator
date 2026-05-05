import { ingestJobs } from '../services/API_welovedevs/welovedev.ingest.js';

export const importOffers = async (req, res) => {
  try {
    const result = await ingestJobs();
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};