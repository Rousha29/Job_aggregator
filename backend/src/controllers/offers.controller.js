import { fetchJobs } from '../services/welovedevService.js';
import pool from '../config/db.js';

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

export const compareOffers = async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length < 1 || ids.length > 3) {
    return res.status(400).json({ error: 'Entre 1 et 3 offres à comparer' });
  }

  const sanitizedIds = ids.map(id => parseInt(id)).filter(id => !isNaN(id));
  if (sanitizedIds.length !== ids.length) {
    return res.status(400).json({ error: 'Les IDs doivent être des nombres entiers' });
  }

  try {
    const placeholders = sanitizedIds.map((_, i) => `$${i + 1}`).join(', ');
    const result = await pool.query(
      `SELECT id, title, company, location, contract_type, salary_min, salary_max, remote, description FROM offers WHERE id IN (${placeholders})`,
      sanitizedIds
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};