import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import pool from '../config/db.js';

const router = express.Router();

// Ajouter une offre en favoris
router.post('/:offerId', authMiddleware, async (req, res) => {
  try {
    const { offerId } = req.params;
    const userId = req.user.id;

    // Vérifier si l'offre existe
    const offerCheck = await pool.query('SELECT id FROM offers WHERE id = $1', [offerId]);
    if (offerCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Offre non trouvée' });
    }

    // Ajouter aux favoris (ON CONFLICT DO NOTHING pour éviter les doublons)
    await pool.query(
      'INSERT INTO favorites (user_id, offer_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [userId, offerId]
    );

    res.json({ success: true, message: 'Offre ajoutée aux favoris' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer une offre des favoris
router.delete('/:offerId', authMiddleware, async (req, res) => {
  try {
    const { offerId } = req.params;
    const userId = req.user.id;

    await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND offer_id = $2',
      [userId, offerId]
    );

    res.json({ success: true, message: 'Offre retirée des favoris' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer les favoris de l'utilisateur
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT o.* FROM offers o
       JOIN favorites f ON o.id = f.offer_id
       WHERE f.user_id = $1
       ORDER BY f.saved_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
