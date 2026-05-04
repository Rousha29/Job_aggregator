import { ingestJobs } from '../services/ingestionService.js';

export const importOffers = async (req, res) => {
  try {
    const result = await ingestJobs();
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};