import { fetchJobs } from '../services/welovedevService.js';

export const getJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 20;
    const q = req.query.q || '';
    const data = await fetchJobs(page, size, q);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};