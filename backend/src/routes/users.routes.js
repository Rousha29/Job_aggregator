import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import pool from '../config/db.js';

const router = express.Router();

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email FROM users WHERE id = $1',
      [req.user.id]
    );

    const user = result.rows[0];

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;