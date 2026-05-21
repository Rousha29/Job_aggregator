import express from 'express';
import dotenv from 'dotenv';
import { syncWeLoveDevs } from './services/API_welovedevs/welovedev.sync.js';
import { syncLocalJSON } from './services/API_local/local.sync.js';
import { startSync, endSync } from './services/syncLock.js';

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

const parseCooldown = (value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
};

const envCooldown = parseCooldown(process.env.SYNC_COOLDOWN_MS);
const disableCooldown = String(process.env.DISABLE_SYNC_COOLDOWN).toLowerCase() === 'true';
const SYNC_COOLDOWN_MS = disableCooldown
      ? 0
      : (envCooldown ?? (process.env.NODE_ENV === 'development' ? 0 : 10 * 60 * 1000));
// 10 minutes entre deux syncs manuelles (par défaut en production)
let lastSyncAt = null;

// Ingest endpoint (WeLoveDevs)
app.post('/api/ingest', async (req, res) => {
      if (!startSync()) {
            return res.status(202).json({ success: false, message: 'Une synchronisation est déjà en cours.' });
      }

      if (lastSyncAt && Date.now() - lastSyncAt < SYNC_COOLDOWN_MS) {
            const remainingSec = Math.ceil((SYNC_COOLDOWN_MS - (Date.now() - lastSyncAt)) / 1000);
            endSync();
            return res.status(202).json({ success: false, message: `Cooldown actif. Réessayez dans ${remainingSec}s.` });
      }

      lastSyncAt = Date.now();
      try {
            const result = await syncWeLoveDevs();
            res.json({ success: true, ...result });
      } catch (err) {
            sendSyncError(res, err);
      } finally {
            endSync();
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
