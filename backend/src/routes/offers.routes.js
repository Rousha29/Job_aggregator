import express from 'express';
import { getJobs } from '../controllers/welovedev.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/jobs', authMiddleware, getJobs);

export default router;