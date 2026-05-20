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

const sendSyncError = (res, err) => {
      const status = Number.isInteger(err?.status) ? err.status : 500;
      res.status(status).json({ error: err.message });
};

const SYNC_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes entre deux syncs manuelles
let syncRunning = false;
let lastSyncAt = null;

// Ingest endpoint (WeLoveDevs)
app.post('/api/ingest', async (req, res) => {
      if (syncRunning) {
            return res.status(429).json({ error: 'Une synchronisation est déjà en cours.' });
      }

      if (lastSyncAt && Date.now() - lastSyncAt < SYNC_COOLDOWN_MS) {
            const remainingSec = Math.ceil((SYNC_COOLDOWN_MS - (Date.now() - lastSyncAt)) / 1000);
            return res.status(429).json({ error: `Cooldown actif. Réessayez dans ${remainingSec}s.` });
      }

      syncRunning = true;
      lastSyncAt = Date.now();
      try {
            const result = await syncWeLoveDevs();
            res.json({ success: true, ...result });
      } catch (err) {
            sendSyncError(res, err);
      } finally {
            syncRunning = false;
      }
});

// Ingest local JSON endpoint
app.post('/api/ingest/local', async (req, res) => {
      try {
            const result = await syncLocalJSON(req.body);
            res.json({ success: true, ...result });
      } catch (err) {
            sendSyncError(res, err);
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
