import express from 'express';
import { importOffers } from '../controllers/import.controller.js';

const router = express.Router();

router.post('/', importOffers);

export default router;