import { fetchJobs } from '../services/welovedevService.js';

const toArray = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

export const getJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 20;
    const q = req.query.q || '';

    // Axios envoie contractTypes[] comme clé
    const contractTypes = toArray(
      req.query['contractTypes[]'] || req.query.contractTypes
    );
    const remote = toArray(
      req.query['remote[]'] || req.query.remote
    );
    const salaryMin = req.query.salaryMin ? parseInt(req.query.salaryMin) : null;

    console.log('Filters received:', { contractTypes, remote, salaryMin });

    const data = await fetchJobs(page, size, q, contractTypes, remote, salaryMin);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};