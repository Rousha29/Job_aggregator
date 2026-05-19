import express from 'express';
import { getJobs } from '../controllers/welovedev.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { offersQuerySchema } from '../schemas/offers.js';

const router = express.Router();

router.get('/jobs', authMiddleware, validate(offersQuerySchema, 'query'), getJobs);

export default router;