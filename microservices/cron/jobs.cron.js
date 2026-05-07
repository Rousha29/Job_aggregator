import cron from "node-cron";
import { syncWeLoveDevs } from "../services/API_welovedevs/welovedev.sync.js";

if (process.env.NODE_ENV !== "test") {
      cron.schedule("* * * * *", async () => {
            console.log("Sync global (toutes les 1 min pour test)...");

            try {
                  await syncWeLoveDevs();

                  console.log("Tous les jobs sync");
            } catch (error) {
                  console.error("Erreur globale:", error.message);
            }
      });
}