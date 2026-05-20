import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { ensureDefaultAdminAccount } from './bootstrap/defaultAdmin.js';
import { ingestJobs } from './services/ingestionService.js';
import cron from 'node-cron';

const startServer = async () => {
  try {
    await ensureDefaultAdminAccount();

    // Lancer l'ingestion des offres en arrière-plan
    console.log('Démarrage de l\'ingestion automatique au lancement...');
    ingestJobs().then(result => {
      console.log(`Ingestion automatique terminée: ${result.ingested} offres ingérées`);
    }).catch(error => {
      console.error('Erreur lors de l\'ingestion automatique:', error);
    });

    // Programmer l'ingestion toutes les 10 minutes
    cron.schedule('*/10 * * * *', async () => {
      console.log('Début de l\'ingestion programmée...');
      try {
        const result = await ingestJobs();
        console.log(`Ingestion programmée terminée: ${result.ingested} offres ingérées`);
      } catch (error) {
        console.error('Erreur lors de l\'ingestion programmée:', error);
      }
    });

    const server = app.listen(4000, () => {
      console.log('Server running on port 4000');
      console.log('Ingestion automatique activée (au démarrage et toutes les 10 minutes)');
    });

    server.on('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    });
  } catch (error) {
    console.error('Startup error:', error);
    process.exit(1);
  }
};

startServer();