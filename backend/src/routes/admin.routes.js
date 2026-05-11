import express from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireAdmin } from '../middlewares/role.middleware.js';

const router = express.Router();

// Stats dashboard
router.get('/stats', authMiddleware, requireAdmin, async (req, res) => {
      try {
            const offersCount = await pool.query('SELECT COUNT(*) FROM offers');
            const usersCount = await pool.query('SELECT COUNT(*) FROM users');
            const lastIngestion = await pool.query(
                  'SELECT MAX(fetched_at) as last_ingestion FROM offers'
            );

            res.json({
                  offers: parseInt(offersCount.rows[0].count),
                  users: parseInt(usersCount.rows[0].count),
                  last_ingestion: lastIngestion.rows[0].last_ingestion,
            });
      } catch (err) {
            res.status(500).json({ error: err.message });
      }
});

// Liste des offres
router.get('/offers', authMiddleware, requireAdmin, async (req, res) => {
      try {
            const result = await pool.query(
                  `SELECT id, title, company, contract_type, fetched_at, is_visible, source
       FROM offers ORDER BY fetched_at DESC`
            );
            res.json(result.rows);
      } catch (err) {
            res.status(500).json({ error: err.message });
      }
});

// Masquer/afficher une offre
router.patch('/offers/:id/visibility', authMiddleware, requireAdmin, async (req, res) => {
      try {
            const { is_visible } = req.body;
            await pool.query(
                  'UPDATE offers SET is_visible = $1 WHERE id = $2',
                  [is_visible, req.params.id]
            );
            res.json({ success: true });
      } catch (err) {
            res.status(500).json({ error: err.message });
      }
});

// Modifier une offre
router.patch('/offers/:id', authMiddleware, requireAdmin, async (req, res) => {
      try {
            const {
                  title = null,
                  company = null,
                  contract_type = null,
                  is_visible = null,
            } = req.body;

            const result = await pool.query(
                  `UPDATE offers
       SET title = COALESCE($1, title),
           company = COALESCE($2, company),
           contract_type = COALESCE($3, contract_type),
           is_visible = COALESCE($4, is_visible)
       WHERE id = $5`,
                  [title, company, contract_type, is_visible, req.params.id]
            );

            if (result.rowCount === 0) {
                  return res.status(404).json({ error: 'Offer not found' });
            }

            res.json({ success: true });
      } catch (err) {
            res.status(500).json({ error: err.message });
      }
});

// Supprimer une offre
router.delete('/offers/:id', authMiddleware, requireAdmin, async (req, res) => {
      try {
            await pool.query('DELETE FROM offers WHERE id = $1', [req.params.id]);
            res.json({ success: true });
      } catch (err) {
            res.status(500).json({ error: err.message });
      }
});

// Liste des utilisateurs
router.get('/users', authMiddleware, requireAdmin, async (req, res) => {
      try {
            const result = await pool.query(
                  `SELECT u.id, u.email, u.full_name, u.created_at, r.name as role
       FROM users u JOIN roles r ON u.role_id = r.id
       ORDER BY u.created_at DESC`
            );
            res.json(result.rows);
      } catch (err) {
            res.status(500).json({ error: err.message });
      }
});

// Changer le rôle d'un utilisateur
router.patch('/users/:id/role', authMiddleware, requireAdmin, async (req, res) => {
      try {
            const { role } = req.body;
            const roleResult = await pool.query(
                  'SELECT id FROM roles WHERE name = $1', [role]
            );
            if (roleResult.rows.length === 0) {
                  return res.status(400).json({ error: 'Role not found' });
            }
            await pool.query(
                  'UPDATE users SET role_id = $1 WHERE id = $2',
                  [roleResult.rows[0].id, req.params.id]
            );
            res.json({ success: true });
      } catch (err) {
            res.status(500).json({ error: err.message });
      }
});

// Supprimer un utilisateur
router.delete('/users/:id', authMiddleware, requireAdmin, async (req, res) => {
      try {
            await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
            res.json({ success: true });
      } catch (err) {
            res.status(500).json({ error: err.message });
      }
});

export default router;