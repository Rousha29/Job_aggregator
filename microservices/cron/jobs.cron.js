import cron from "node-cron";
import { syncWeLoveDevs } from "../services/API_welovedevs/welovedev.sync.js";
import { syncLocalJSON } from "../services/API_local/local.sync.js";

let syncRunning = false;

if (process.env.NODE_ENV !== "test") {
      cron.schedule("* * * * *", async () => {
            if (syncRunning) {
                  console.log("Sync global ignoré: une exécution est déjà en cours.");
                  return;
            }

            syncRunning = true;
            console.log("Sync global (toutes les 1 min pour test)...");

            try {
                  await Promise.all([
                        syncWeLoveDevs(),
                        syncLocalJSON(),
                  ]);
                  console.log("Tous les syncs terminés");
            } catch (error) {
                  console.error("Erreur globale:", error.message);
            } finally {
                  syncRunning = false;
            }
      });

      console.log("Cron jobs démarrés");
}