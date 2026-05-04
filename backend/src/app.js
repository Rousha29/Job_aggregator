    import express from 'express';
    import cors from 'cors';
    import testRoutes from './routes/test.routes.js';
    import authRoutes from './routes/auth.routes.js';
    import importRoutes from './routes/import.routes.js';
    import userRoutes from './routes/users.routes.js';
    import { authMiddleware } from './middlewares/auth.middleware.js';
    
    const app = express();

    app.use(cors());
    app.use(express.json());
    app.use('/api/users', userRoutes);
    app.use('/api/test', testRoutes);
    app.use('/api/auth', authRoutes); 
    app.use('/api/offers/import', importRoutes);
    app.use('/api/offers/import', authMiddleware, importRoutes);
    export default app;