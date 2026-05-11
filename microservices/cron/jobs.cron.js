import cron from "node-cron";
import { syncWeLoveDevs } from "../services/API_welovedevs/welovedev.sync.js";

let syncRunning = false;

const cronEnabled =
      process.env.ENABLE_WELOVEDEVS_CRON === "true" || process.env.NODE_ENV === "production";
const cronSchedule = process.env.WELOVEDEVS_CRON_SCHEDULE || "*/10 * * * *";

if (process.env.NODE_ENV !== "test" && cronEnabled) {
      cron.schedule(cronSchedule, async () => {
            if (syncRunning) {
                  console.log("Sync ignorée: une exécution est déjà en cours.");
                  return;
            }

            syncRunning = true;
            console.log(`Sync WeLoveDevs (schedule: ${cronSchedule})...`);

            try {
                  await syncWeLoveDevs();
                  console.log("Sync WeLoveDevs terminée");
            } catch (error) {
                  console.error("Erreur sync WeLoveDevs:", error.message);
            } finally {
                  syncRunning = false;
            }
      });

      console.log("Cron jobs démarrés (WeLoveDevs uniquement)");
} else {
      console.log("Cron jobs WeLoveDevs désactivés");
}

