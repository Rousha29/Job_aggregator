import cron from "node-cron";
import { syncWeLoveDevs } from "../services/API_welovedevs/welovedev.sync.js";
import { startSync, endSync } from "../services/syncLock.js";

const cronEnabled =
      process.env.ENABLE_WELOVEDEVS_CRON === "true" || process.env.NODE_ENV === "production";
const cronSchedule = process.env.WELOVEDEVS_CRON_SCHEDULE || "* * * * *";

if (process.env.NODE_ENV !== "test" && cronEnabled) {
      cron.schedule(cronSchedule, async () => {
            if (!startSync()) {
                  console.log("Sync ignorée: une exécution est déjà en cours.");
                  return;
            }
            console.log(`Sync WeLoveDevs (schedule: ${cronSchedule})...`);

            try {
                  await syncWeLoveDevs();
                  console.log("Sync WeLoveDevs terminée");
            } catch (error) {
                  console.error("Erreur sync WeLoveDevs:", error.message);
            } finally {
                  endSync();
            }
      });

      console.log("Cron jobs démarrés (WeLoveDevs uniquement)");
} else {
      console.log("Cron jobs WeLoveDevs désactivés");
}

