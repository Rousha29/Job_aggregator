import express from 'express';
import cors from 'cors';
import testRoutes from './routes/test.routes.js';
import authRoutes from './routes/auth.routes.js';
import importRoutes from './routes/import.routes.js';
import userRoutes from './routes/users.routes.js';
import healthRoutes from './routes/health.routes.js';
import offersRoutes from './routes/offers.routes.js';
import { authMiddleware } from './middlewares/auth.middleware.js';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/', healthRoutes);
app.use('/api/test', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/offers', offersRoutes);
app.use('/api/offers/import', authMiddleware, importRoutes);

export default app;
