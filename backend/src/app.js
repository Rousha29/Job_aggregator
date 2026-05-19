import express from 'express';
import cors from 'cors';
import testRoutes from './routes/test.routes.js';
import authRoutes from './routes/auth.routes.js';
import importRoutes from './routes/import.routes.js';
import userRoutes from './routes/users.routes.js';
import healthRoutes from './routes/health.routes.js';
import offersRoutes from './routes/offers.routes.js';
import favoritesRoutes from './routes/favorites.routes.js';
import { authMiddleware } from './middlewares/auth.middleware.js';
import adminRoutes from './routes/admin.routes.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

const app = express();

app.use(helmet());

app.use(cookieParser());

app.use(rateLimit({
  windowMs: 60 * 1000, // 1 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));



app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '100kb' }));
app.use('/', healthRoutes);
app.use('/api/test', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/offers', offersRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/offers/import', authMiddleware, importRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res, next) => {
  const error = new Error(`Route introuvable : ${req.method} ${req.url}`);
  error.status = 404;
  next(error);
});

app.use(errorMiddleware);

export default app;


