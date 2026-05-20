import express from 'express';
import { getJobs } from '../controllers/welovedev.controller.js';
import { compareOffers } from '../controllers/offers.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { offersQuerySchema } from '../schemas/offers.js';

const router = express.Router();

router.get('/jobs', validate(offersQuerySchema, 'query'), getJobs);
router.post('/compare', authMiddleware, compareOffers);

export default router;
