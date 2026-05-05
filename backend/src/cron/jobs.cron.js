import cron from "node-cron";
import { ingestJobs } from "../services/ingestionService.js";

let isRunning = false;
let authDisabled = false;

// toutes les 2 heures
cron.schedule("*/1 * * * *", async () => {
      if (authDisabled) {
            return;
      }

      if (isRunning) {
            console.log("Sync déjà en cours, on skip...");
            return;
      }

      isRunning = true;
      console.log("Lancement du sync WeLoveDevs...");

      try {
            await ingestJobs();
            console.log("Sync terminé");
      } catch (error) {
            if (error.status === 403) {
                  authDisabled = true;
                  console.error("WeLoveDevs sync disabled: invalid API key. Update WELOVEDEVS_API_KEY to resume syncing.");
                  return;
            }

            console.error("Erreur sync:", error.message);
      } finally {
            isRunning = false;
      }
});