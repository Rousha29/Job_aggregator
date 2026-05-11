import { fetchJobs } from '../services/welovedevService.js';

export const getJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 10;
    const data = await fetchJobs(page, size);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};