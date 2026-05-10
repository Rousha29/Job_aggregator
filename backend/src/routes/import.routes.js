import express from 'express';
import { importOffers, importLocalJSON } from '../controllers/import.controller.js';

const router = express.Router();

router.post('/', importOffers);
router.post('/local', importLocalJSON);

export default router;