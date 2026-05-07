import express from 'express';
import dotenv from 'dotenv';
import { ingestJobs } from './services/API_welovedevs/welovedev.ingest.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
      res.json({ status: 'OK', message: 'Microservices is running' });
});

// Ingest endpoint
app.post('/api/ingest', async (req, res) => {
      try {
            const result = await ingestJobs();
            res.json({ success: true, ...result });
      } catch (err) {
            res.status(500).json({ error: err.message });
      }
});

// Import et démarrer les cron jobs
import('./cron/jobs.cron.js').catch(err => {
      console.error('Error loading cron jobs:', err);
});

// Démarrer le serveur
app.listen(PORT, () => {
      console.log(`Microservices running on port ${PORT}`);
});
