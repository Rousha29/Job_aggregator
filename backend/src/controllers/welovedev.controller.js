import { fetchJobs } from '../services/welovedevService.js';

export const getJobs = async (req, res) => {
  try {
    const { page, size, q } = req.query;
    const data = await fetchJobs(page, size, q);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};