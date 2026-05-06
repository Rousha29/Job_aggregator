import express from 'express';
import cors from 'cors';
import testRoutes from './routes/test.routes.js';
import authRoutes from './routes/auth.routes.js';
import importRoutes from './routes/import.routes.js';
import userRoutes from './routes/users.routes.js';
import healthRoutes from './routes/health.routes.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

const app = express();

app.use('/', healthRoutes);
app.use(cors());
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/test', testRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/offers/import', importRoutes);

app.use((req, res, next) => {
  const error = new Error(`Route introuvable : ${req.method} ${req.url}`);
  error.status = 404;
  next(error);
});

app.use(errorMiddleware);

export default app;