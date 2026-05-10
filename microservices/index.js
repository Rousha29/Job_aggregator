import express from 'express';
import dotenv from 'dotenv';
import { syncWeLoveDevs } from './services/API_welovedevs/welovedev.sync.js';
import { syncLocalJSON } from './services/API_local/local.sync.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '20mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
      res.json({ status: 'OK', message: 'Microservices is running' });
});

// Ingest endpoint (WeLoveDevs)
app.post('/api/ingest', async (req, res) => {
      try {
            const result = await syncWeLoveDevs();
            res.json({ success: true, ...result });
      } catch (err) {
            res.status(500).json({ error: err.message });
      }
});

// Ingest local JSON endpoint
app.post('/api/ingest/local', async (req, res) => {
      try {
            const result = await syncLocalJSON(req.body);
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
