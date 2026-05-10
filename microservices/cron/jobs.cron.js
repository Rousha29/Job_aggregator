import cron from "node-cron";
import { syncWeLoveDevs } from "../services/API_welovedevs/welovedev.sync.js";

let syncRunning = false;

if (process.env.NODE_ENV !== "test") {
      cron.schedule("* * * * *", async () => {
            if (syncRunning) {
                  console.log("Sync ignorée: une exécution est déjà en cours.");
                  return;
            }

            syncRunning = true;
            console.log("Sync WeLoveDevs (toutes les 1 min pour test)...");

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
}