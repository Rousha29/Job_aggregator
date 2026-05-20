import ratelimit from 'express-rate-limit';
import { validate } from '../middlewares/validate.js';
import { registerSchema, loginSchema } from '../schemas/auth.js';
import express from 'express';
import { register, login } from '../controllers/auth.controller.js';

const router = express.Router();

const limiter = ratelimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: 'Trop de tentatives de connexion, veuillez réessayer plus tard.' }
});

router.post('/register', validate(registerSchema), register);
router.post('/login', limiter, validate(loginSchema), login);
export default router;