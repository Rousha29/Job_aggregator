import { fetchJobs } from '../services/welovedevsService.js';

export const importOffers = async (req, res) => {
  try {
    const jobs = await fetchJobs();

    res.json(jobs); // temporaire pour tester
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};