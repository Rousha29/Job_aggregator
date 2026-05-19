import express from 'express';
import { importOffers, importLocalJSON } from '../controllers/import.controller.js';
import { requireAdmin } from '../middlewares/role.middleware.js';

const router = express.Router();

router.post('/', requireAdmin, importOffers);
router.post('/local', requireAdmin, importLocalJSON);

export default router;